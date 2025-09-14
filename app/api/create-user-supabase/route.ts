import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { email, user_auth_id } = await request.json();

    if (!email || !user_auth_id) {
      return NextResponse.json(
        {
          error: "Email and user_auth_id are required",
        },
        { status: 400 },
      );
    }

    console.log("Creating user in Supabase:", { email, user_auth_id });

    // Use service role key to bypass RLS
    const supabaseUrl = "https://hhuxrpprjqafxtpedkgo.supabase.co";
    const supabaseServiceKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodXhycHByanFhZnh0cGVka2dvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgzMzg2NiwiZXhwIjoyMDczNDA5ODY2fQ.aBp3us9P6zKUVN6BaQwCXwmctU4vXANhWkgB33wfI1I";

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create the specific user for aryan@gmail.com
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: "aryan@gmail.com",
          user_auth_id: user_auth_id,
          username: "aryanp",
          password_hash: "aryan", // Simple password hash for now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("User created in Supabase:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to create user in Supabase" },
      { status: 500 },
    );
  }
}
