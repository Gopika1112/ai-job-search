import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeResume } from "@/lib/ai/resume";
import { PDFParse } from "pdf-parse";

// Force absolute latest version of the route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log(">>> NEWEST VERSION: Resume upload started...");
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log("Upload failed: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`Processing upload for user: ${user.id}`);
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("Upload failed: No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log(`File received: ${file.name}, size: ${file.size} bytes`);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("Extracting text from PDF (v2 static import)...");
    
    // Standard v2 API usage
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy(); 

    if (!text || text.trim().length < 50) {
      console.log("Upload failed: Insufficient text extracted");
      return NextResponse.json({ 
        error: "Text Extraction Failed", 
        details: "Could not extract sufficient text from the PDF. Is it an image-based PDF or encrypted?" 
      }, { status: 400 });
    }

    console.log(`Extracted ${text.length} characters. Starting Groq AI analysis...`);
    
    // API KEY CHECK
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key' || apiKey.length < 10) {
      console.log("Upload failed: Groq API Key is missing or placeholder");
      return NextResponse.json({ 
        error: "Configuration Error", 
        details: "Groq API Key is missing or not configured properly in .env.local." 
      }, { status: 500 });
    }

    const analysis = await analyzeResume(text);
    console.log("AI analysis complete.");

    // Permanent Storage: Upload PDF to Supabase Storage
    console.log("Uploading PDF to Supabase Storage...");
    const fileName = `${user.id}-${Date.now()}.pdf`;
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from("resumes")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: true
      });

    if (storageError) {
      console.error("Storage error:", storageError);
      // We continue but log the error - analysis is more important than the file for some features
    }

    const resumeUrl = storageData 
      ? supabase.storage.from("resumes").getPublicUrl(fileName).data.publicUrl 
      : null;

    // Update Profile
    console.log("Updating user profile in database...");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        skills: analysis.keywords.slice(0, 15),
        experience_years: analysis.overallScore > 70 ? 5 : 2,
        resume_text: text,
        resume_analysis: analysis,
        resume_url: resumeUrl, // SAVING THE PERMANENT URL
        onboarded: true
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Database error:", updateError);
      return NextResponse.json({ 
        error: "Database update failed", 
        details: updateError.message 
      }, { status: 500 });
    }

    console.log("Upload successful!");
    return NextResponse.json({ 
      success: true, 
      analysis,
      resumeUrl
    });

  } catch (error: any) {
    console.error("CRITICAL ERROR in resume upload route:");
    console.error(error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message || "Unknown error"
    }, { status: 500 });
  }
}
