import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobId, action } = await request.json();
    if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

    if (action === "unsave") {
      await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId);
      return NextResponse.json({ saved: false });
    }

    const { error } = await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: jobId });
    if (error && error.code !== "23505") throw error;
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
  }
}
