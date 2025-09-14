import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // Use service role key to bypass RLS - HARDCODED FOR NOW
    const supabaseUrl = "https://hhuxrpprjqafxtpedkgo.supabase.co";
    const supabaseServiceKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodXhycHByanFhZnh0cGVka2dvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgzMzg2NiwiZXhwIjoyMDczNDA5ODY2fQ.aBp3us9P6zKUVN6BaQwCXwmctU4vXANhWkgB33wfI1I";

    console.log(
      "Using hardcoded service key, length:",
      supabaseServiceKey.length,
    );

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const agentData = await request.json();

    console.log("Creating agent with data:", agentData);

    const { data, error } = await supabase
      .from("agents")
      .insert([agentData])
      .select();

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        {
          error: `Supabase error: ${error.message}`,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 },
      );
    }

    console.log("Agent created successfully:", data);
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("API error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      {
        error: `API error: ${error.message}`,
        stack: error.stack,
        name: error.name,
      },
      { status: 500 },
    );
  }
}
