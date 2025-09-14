import { supa } from "@/lib/supabase";

async function testSupabaseOperations() {
  try {
    console.log("Testing Supabase operations...");

    // 1. Insert a new agent
    console.log("1. Inserting new agent...");
    const { data: insertData, error: insertError } = await supa
      .from("agents")
      .insert([
        {
          agent_id: "agent_001",
          general_prompt:
            "Monitor gold miners and buy dips on strong sentiment.",
          types_of_equities: ["materials", "mid_cap"],
          frequency: "hourly",
          next_run_date: new Date().toISOString(),
          profit_pct: 3.75,
        },
      ]);

    if (insertError) {
      console.error("Insert error:", insertError);
    } else {
      console.log("Insert successful:", insertData);
    }

    // 2. Get agents due to run now
    console.log("2. Getting agents due to run...");
    const { data: due, error: dueError } = await supa
      .from("agents")
      .select("*")
      .lte("next_run_date", new Date().toISOString())
      .order("next_run_date", { ascending: true })
      .limit(50);

    if (dueError) {
      console.error("Due agents error:", dueError);
    } else {
      console.log("Agents due to run:", due);
    }

    // 3. Update next run + profit
    console.log("3. Updating agent...");
    const { data: updateData, error: updateError } = await supa
      .from("agents")
      .update({
        next_run_date: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        profit_pct: 4.2,
      })
      .eq("agent_id", "agent_001");

    if (updateError) {
      console.error("Update error:", updateError);
    } else {
      console.log("Update successful:", updateData);
    }

    // 4. Change frequency safely
    console.log("4. Changing frequency...");
    const { data: freqData, error: freqError } = await supa
      .from("agents")
      .update({ frequency: "daily" })
      .eq("agent_id", "agent_001");

    if (freqError) {
      console.error("Frequency change error:", freqError);
    } else {
      console.log("Frequency change successful:", freqData);
    }

    console.log("All tests completed!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testSupabaseOperations();
