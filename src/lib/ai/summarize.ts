import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface JobSummary {
  bulletPoints: string[];
  keyRequirements: string[];
  perks: string[];
  oneliner: string;
}

export async function summarizeJobDescription(
  jobTitle: string,
  company: string,
  description: string
): Promise<JobSummary> {
  const prompt = `You are a concise job description summarizer. Analyze this job posting and extract the key information.

Job: ${jobTitle} at ${company}
Description: ${description.slice(0, 2000)}

Respond with a JSON object (no markdown):
{
  "bulletPoints": [<3-5 key responsibilities as short bullet points>],
  "keyRequirements": [<3-5 most important skills/requirements>],
  "perks": [<2-4 notable perks/benefits if mentioned, otherwise empty array>],
  "oneliner": "<A single compelling sentence summarizing this role>"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content || "{}";
  return JSON.parse(content) as JobSummary;
}
