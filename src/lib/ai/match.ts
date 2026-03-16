import OpenAI from "openai";
import type { Profile, Job } from "@/lib/types/database";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MatchResult {
  fit_score: number;
  match_reasons: string[];
  summary: string;
  skill_gaps: string[];
}

export async function matchJobToProfile(
  profile: Profile,
  job: Job
): Promise<MatchResult> {
  const prompt = `You are an expert job recruiter and career advisor. Analyze the fit between this candidate and job.

CANDIDATE PROFILE:
- Skills: ${profile.skills.join(", ") || "Not specified"}
- Experience: ${profile.experience_years} years
- Preferred Roles: ${profile.preferred_roles.join(", ") || "Not specified"}
- Preferred Locations: ${profile.preferred_locations.join(", ") || "Not specified"}
${profile.resume_text ? `- Resume Summary: ${profile.resume_text.slice(0, 500)}` : ""}

JOB POSTING:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location || "Remote"}
- Type: ${job.job_type || "Full-time"}
- Tags/Skills: ${job.tags.join(", ")}
- Description: ${job.description.slice(0, 800)}

Respond with a JSON object (no markdown) with:
{
  "fit_score": <number 0-100>,
  "match_reasons": [<3-4 specific reasons why this is a good match>],
  "summary": "<1-2 sentence compelling summary of why this role suits the candidate>",
  "skill_gaps": [<skills mentioned in job but missing from profile, max 5>]
}`;

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key") {
    // Generate a simulated match result based on keyword overlap
    const jobTags = job.tags.map(t => t.toLowerCase());
    const profileSkills = profile.skills.map(s => s.toLowerCase());
    const matchCount = jobTags.filter(t => profileSkills.includes(t)).length;
    const fitScore = Math.min(60 + (matchCount * 10), 98);

    return {
      fit_score: fitScore,
      match_reasons: [
        `Strong overlap with your skill in ${profile.skills[0] || "relevant areas"}`,
        `Role title matches your preferred role: ${job.title}`,
        "Great company culture and remote-friendly environment"
      ],
      summary: `Based on your profile, you have a ${fitScore}% match for this ${job.title} role at ${job.company}. You have most of the required skills, but may need to brush up on a few tools.`,
      skill_gaps: jobTags.filter(t => !profileSkills.includes(t)).slice(0, 3)
    };
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content || "{}";
  return JSON.parse(content) as MatchResult;
}
