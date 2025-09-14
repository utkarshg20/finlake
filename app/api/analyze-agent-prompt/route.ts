import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes trading prompts and extracts ONLY the exact fields for the Supabase agent schema.

Return a JSON object with EXACTLY these fields:
{
  "general_prompt": "The original user prompt",
  "type_of_equity_to_trade": "equities" or "stocks" or "crypto" or "forex" etc.",
  "frequency_of_running": "high" or "medium" or "low" or specific frequency like "every 15 minutes",
  "next_run_time": "ISO timestamp for when to run next (default to current time + 1 hour)"
}

Rules:
- ONLY return these 4 fields, nothing else
- type_of_equity_to_trade should be one of: "equities", "stocks", "crypto", "forex", "commodities"
- frequency_of_running should be: "high" (every few minutes), "medium" (hourly), "low" (daily), or a specific frequency
- next_run_time should be a valid ISO timestamp
- Keep the general_prompt as close to the original as possible`,
        },
        {
          role: "user",
          content: `Analyze this trading prompt: "${prompt}"`,
        },
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(response);

    // Return ONLY the exact schema fields
    const validatedResponse = {
      general_prompt: parsedResponse.general_prompt || prompt,
      type_of_equity_to_trade:
        parsedResponse.type_of_equity_to_trade || "equities",
      frequency_of_running: parsedResponse.frequency_of_running || "medium",
      next_run_time:
        parsedResponse.next_run_time ||
        new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze prompt" },
      { status: 500 },
    );
  }
}
