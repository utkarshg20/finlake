import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required",
        },
        { status: 400 },
      );
    }

    console.log("Looking up user with email:", email);

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

    // Query the users table to get the id by email
    const { data, error } = await supabase
      .from("users")
      .select("id, email, user_auth_id")
      .eq("email", email);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Query result for email:", email, ":", data);

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error: `User not found with email: ${email}`,
        },
        { status: 404 },
      );
    }

    const userId = data[0].id;
    console.log("Found user id:", userId);

    if (!userId) {
      return NextResponse.json(
        {
          error: `User found but id is null for email: ${email}`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ user_id: userId });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to get user by email" },
      { status: 500 },
    );
  }
}
