import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("Looking up user with email:", email);

    // First, let's see what users exist in the table
    const { data: allUsers, error: allUsersError } = await supabase
      .from("users")
      .select("email, user_auth_id")
      .limit(10);

    console.log("All users in table:", allUsers);
    if (allUsersError) {
      console.error("Error fetching all users:", allUsersError);
    }

    // Query the users table to get the user_auth_id by email
    const { data, error } = await supabase
      .from("users")
      .select("user_auth_id")
      .eq("email", email);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Query result for email:", email, ":", data);

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error: `User not found with email: ${email}. Available emails: ${allUsers?.map((u) => u.email).join(", ")}`,
        },
        { status: 404 },
      );
    }

    if (data.length > 1) {
      console.warn("Multiple users found with same email, using first one");
    }

    const userAuthId = data[0].user_auth_id;
    console.log("Found user_auth_id:", userAuthId);

    return NextResponse.json({ user_auth_id: userAuthId });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to get user auth ID" },
      { status: 500 },
    );
  }
}
