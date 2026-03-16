import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobId, notes } = await request.json();
    if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

    const { error } = await supabase.from("applied_jobs").upsert(
      { user_id: user.id, job_id: jobId, notes: notes || null },
      { onConflict: "user_id,job_id" }
    );
    if (error) throw error;
    return NextResponse.json({ applied: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to mark as applied" }, { status: 500 });
  }
}
