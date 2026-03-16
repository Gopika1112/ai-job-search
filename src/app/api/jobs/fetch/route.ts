import { createClient, createAdminClient } from "@/lib/supabase/server";
import { fetchJobsFromAllSources } from "@/lib/crawlers/firecrawl";
import { matchJobToProfile } from "@/lib/ai/match";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { Job, Profile } from "@/lib/types/database";
import { MOCK_JOBS } from "@/lib/mocks/jobs";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();
    const { query: searchQuery } = await request.json().catch(() => ({}));

    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    const cookieStore = await cookies();
    const isDevBypass = process.env.NODE_ENV === "development" && cookieStore.has("dev_bypass");

    if (!user && !isDevBypass) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile (skip if in bypass and no user)
    const { data: profile } = user 
      ? await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      : { data: null };

    if (!profile && !isDevBypass) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch jobs from multiple sources
    // If search query exists, prioritize it. Otherwise use profile data.
    const searchSkills = searchQuery ? [searchQuery] : (profile?.skills || ["Software"]);
    const searchRoles = searchQuery ? [searchQuery] : (profile?.preferred_roles || ["Developer"]);

    let fetchedJobs = await fetchJobsFromAllSources(
      searchSkills,
      searchRoles
    );

    // Development fallback if no jobs found from live sources
    if (fetchedJobs.length === 0) {
      console.log("No live jobs found, falling back to mock data");
      // Filter mock jobs by query if provided
      fetchedJobs = searchQuery 
        ? MOCK_JOBS.filter(j => 
            j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            j.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : MOCK_JOBS;
    }

    const savedJobs: Job[] = [];
    const matchPromises: Promise<void>[] = [];

    for (const job of fetchedJobs) {
      // Upsert job (deduplicate by url_hash)
      const { data: savedJob, error } = await adminSupabase
        .from("jobs")
        .upsert(
          {
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            url: job.url,
            source: job.source,
            tags: job.tags,
            is_remote: job.is_remote,
            job_type: job.job_type,
            posted_at: job.posted_at,
            fetched_at: new Date().toISOString(),
            url_hash: job.url_hash,
          },
          { onConflict: "url_hash" }
        )
        .select()
        .single();

      if (!error && savedJob) {
        savedJobs.push(savedJob);

        // Queue AI matching for each job
        matchPromises.push(
          (async () => {
            try {
              // Check if we already have a match for this user+job
              const { data: existing } = await supabase
                .from("job_matches")
                .select("id")
                .eq("user_id", user.id)
                .eq("job_id", savedJob.id)
                .single();

              if (existing) return;

              const matchResult = await matchJobToProfile(profile as Profile, savedJob as Job);

              await adminSupabase.from("job_matches").insert({
                user_id: user.id,
                job_id: savedJob.id,
                fit_score: matchResult.fit_score,
                summary: matchResult.summary,
                skill_gaps: matchResult.skill_gaps,
                match_reasons: matchResult.match_reasons,
              });

              // Create notification for high-fit jobs
              if (matchResult.fit_score >= 80) {
                await adminSupabase.from("notifications").insert({
                  user_id: user.id,
                  type: "high_match",
                  title: "🎯 Excellent Job Match Found!",
                  message: `${savedJob.title} at ${savedJob.company} — ${matchResult.fit_score}% match`,
                  read: false,
                });
              }
            } catch (matchErr) {
              console.error("Match error for job", savedJob.id, matchErr);
            }
          })()
        );
      }
    }

    // Run AI matching in background (limit concurrency to 5)
    await Promise.allSettled(matchPromises.slice(0, 5));

    return NextResponse.json({
      success: true,
      jobsFetched: fetchedJobs.length,
      jobsSaved: savedJobs.length,
    });
  } catch (error) {
    console.error("Job fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
