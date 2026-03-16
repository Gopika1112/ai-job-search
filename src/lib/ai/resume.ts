import OpenAI from "openai";

// Groq is OpenAI-compatible
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export interface ResumeAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  topJobTypes: string[];
  suggestions: string[];
  keywords: string[];
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const prompt = `You are an expert career coach and ATS resume specialist. Analyze this resume and provide actionable feedback.

RESUME CONTENT:
${resumeText.slice(0, 8000)}

Respond strictly with a JSON object (no markdown, no backticks):
{
  "overallScore": <number 0-100, honest assessment>,
  "strengths": [<3-5 genuine strengths>],
  "weaknesses": [<3-5 areas for improvement>],
  "topJobTypes": [<top 4 suitable job roles>],
  "suggestions": [<4-5 specific actionable improvements>],
  "keywords": [<8-10 industry keywords for ATS>]
}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content || "{}";
  return JSON.parse(content) as ResumeAnalysis;
}
