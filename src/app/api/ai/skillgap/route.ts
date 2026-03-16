import { createClient } from "@/lib/supabase/server";
import { detectSkillGap } from "@/lib/ai/skillgap";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobId } = await request.json();
    const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single();
    const { data: profile } = await supabase.from("profiles").select("skills").eq("id", user.id).single();

    if (!job || !profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const result = await detectSkillGap(profile.skills || [], job.title, job.tags, job.description);
    return NextResponse.json({ skillGap: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Skill gap detection failed" }, { status: 500 });
  }
}
