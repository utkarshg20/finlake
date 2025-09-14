import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { email, username } = await request.json();

    if (!email || !username) {
      return NextResponse.json(
        {
          error: "Email and username are required",
        },
        { status: 400 },
      );
    }

    console.log("Creating user in Supabase on register:", { email, username });

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

    // Generate a UUID for the user
    const generateUUID = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        },
      );
    };

    const userId = generateUUID();

    // Insert user into Supabase users table - only use columns that exist and don't have foreign key constraints
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          email,
          username,
          password_hash: "dummy_hash", // You might want to hash this properly
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Removed user_auth_id since it has a foreign key constraint
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("User created in Supabase:", data);
    return NextResponse.json({
      data,
      user_id: userId,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to create user in Supabase" },
      { status: 500 },
    );
  }
}
