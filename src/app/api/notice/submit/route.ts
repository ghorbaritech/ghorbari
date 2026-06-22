import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { formData } = await req.json();

    if (!formData || typeof formData !== "object" || Object.keys(formData).length === 0) {
      return NextResponse.json(
        { error: "Invalid form data provided." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert into notice_submissions
    const { data, error } = await supabase
      .from("notice_submissions")
      .insert({
        form_data: formData,
        created_at: new Date()
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error during notice submit:", error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, submission: data });
  } catch (err: any) {
    console.error("Server error during notice submit:", err.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
