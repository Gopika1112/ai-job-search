import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface SkillGapResult {
  missingSkills: Array<{ skill: string; priority: "high" | "medium" | "low"; reason: string }>;
  matchingSkills: string[];
  learningPaths: Array<{ skill: string; resource: string }>;
}

export async function detectSkillGap(
  userSkills: string[],
  jobTitle: string,
  jobTags: string[],
  jobDescription: string
): Promise<SkillGapResult> {
  const prompt = `You are a career development expert. Compare a candidate's skills against a job's requirements.

CANDIDATE SKILLS: ${userSkills.join(", ") || "None listed"}

JOB: ${jobTitle}
JOB SKILLS/TAGS: ${jobTags.join(", ")}
JOB DESCRIPTION EXCERPT: ${jobDescription.slice(0, 600)}

Respond with a JSON object (no markdown):
{
  "missingSkills": [
    { "skill": "<skill name>", "priority": "<high|medium|low>", "reason": "<why this skill matters for this role>" }
  ],
  "matchingSkills": [<skills the candidate already has that match the job>],
  "learningPaths": [
    { "skill": "<skill>", "resource": "<specific course, certification, or learning path recommendation>" }
  ]
}
Keep missingSkills to maximum 6. Only include genuinely missing skills.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content || "{}";
  return JSON.parse(content) as SkillGapResult;
}
