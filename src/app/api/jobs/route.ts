import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MOCK_JOBS } from "@/lib/mocks/jobs";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    
    const cookieStore = await cookies();
    const isDevBypass = process.env.NODE_ENV === "development" && cookieStore.has("dev_bypass");

    if (!user && !isDevBypass) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const queryTerm = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const tab = (searchParams.get("tab") || "feed").toLowerCase();
    const filtersRaw = searchParams.get("filters");
    const filters = filtersRaw ? JSON.parse(decodeURIComponent(filtersRaw)) : null;
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // RULE 1: Feed tab is empty by default unless searching
    if (tab === "feed" && !queryTerm) {
      return NextResponse.json({ jobs: [] });
    }

    let finalJobs: any[] = [];

    // Attempt database fetch if client is functional
    if (supabase && typeof supabase.from === 'function') {
      try {
        let dbQuery: any;
        if (tab === "saved") {
          dbQuery = supabase.from("saved_jobs").select("job_id, saved_at, jobs(*), job_matches(fit_score, summary, skill_gaps, match_reasons)").eq("user_id", user?.id || "");
        } else if (tab === "applied") {
          dbQuery = supabase.from("applied_jobs").select("job_id, applied_at, notes, jobs(*)").eq("user_id", user?.id || "");
        } else if (tab === "recommended") {
          dbQuery = supabase.from("job_matches").select("fit_score, summary, skill_gaps, match_reasons, jobs(*)").eq("user_id", user?.id || "").gte("fit_score", 80);
        } else {
          dbQuery = supabase.from("jobs").select("*, job_matches(fit_score, summary, skill_gaps, match_reasons), saved_jobs(id)");
        }

        if (queryTerm && (tab === "feed" || tab === "recommended")) {
          dbQuery = dbQuery.or(`title.ilike.%${queryTerm}%,company.ilike.%${queryTerm}%`);
        }

        // Apply filters to DB query if present
        if (filters) {
          if (filters.jobTypes?.length > 0) {
            dbQuery = dbQuery.in("job_type", filters.jobTypes);
          }
          if (filters.salaryRange) {
            dbQuery = dbQuery.gte("salary_max", filters.salaryRange[0]);
          }
        }

        const { data, error } = await dbQuery.order("fetched_at", { ascending: false }).range(from, to).catch(() => ({ data: null, error: null }));
        
        if (!error && data && data.length > 0) {
          finalJobs = data.map((d: any) => {
            const job = d.jobs || d;
            return {
              ...job,
              match: d.job_matches?.[0] || (d.fit_score ? { fit_score: d.fit_score, summary: d.summary, skill_gaps: d.skill_gaps, match_reasons: d.match_reasons } : null),
              saved: (d.saved_jobs?.length || 0) > 0 || tab === "saved",
              applied: tab === "applied"
            };
          });
        }
      } catch (err) {
        console.error("Database query failed:", err);
      }
    }

    // FALLBACK for development/mocking
    if (finalJobs.length === 0) {
      const searchLower = queryTerm.toLowerCase();
      const searchWords = searchLower.split(/\s+/).filter(w => w.length > 0);
      
      // Filter mocks for current tab
      let mockPool = MOCK_JOBS;
      
      if (tab === "recommended") {
        mockPool = MOCK_JOBS.slice(0, 5); 
      } else if (tab === "saved" || tab === "applied") {
        mockPool = []; 
      }

      finalJobs = mockPool
        .filter(job => {
          // Keyword Match: Be more lenient, check if ANY word matches title, company, or tags
          const matchesKeywords = searchWords.length === 0 || searchWords.some(word => 
            job.title.toLowerCase().includes(word) || 
            job.company.toLowerCase().includes(word) ||
            job.tags.some(t => t.toLowerCase().includes(word)) ||
            (job.location && job.location.toLowerCase().includes(word))
          );

          if (!matchesKeywords) return false;

          // Advanced Filters Match
          if (filters) {
            // Job Type
            if (filters.jobTypes?.length > 0 && !filters.jobTypes.map((t: string) => t.toLowerCase()).includes((job.job_type || "").toLowerCase())) {
              return false;
            }
            // Salary
            if (filters.salaryRange && (job.salary_max || 0) < filters.salaryRange[0]) {
              return false;
            }
            // Date Posted
            if (filters.datePosted && filters.datePosted !== "any") {
              const postedDate = new Date(job.posted_at || 0);
              const now = new Date();
              const diffHours = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60);
              if (filters.datePosted === "24h" && diffHours > 24) return false;
              if (filters.datePosted === "7d" && diffHours > 24 * 7) return false;
              if (filters.datePosted === "30d" && diffHours > 24 * 30) return false;
            }
          }

          return true;
        })
        .map(job => ({
          ...job,
          id: job.url_hash,
          match: {
            fit_score: 85 + Math.floor(Math.random() * 10),
            summary: "Excellent match for your profile based on our simulated AI analysis.",
            skill_gaps: [],
            match_reasons: ["Strong skill alignment", "Remote-friendly environment"]
          } as any
        }))
        .sort((a, b) => new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime());
    }

    return NextResponse.json({ jobs: finalJobs });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ jobs: [] }); 
  }
}
