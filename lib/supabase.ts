import { createClient } from "@supabase/supabase-js";
import { Agent, User } from "./database";

const supabaseUrl = "https://hhuxrpprjqafxtpedkgo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodXhycHByanFhZnh0cGVka2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MzM4NjYsImV4cCI6MjA3MzQwOTg2Nn0.PRIxM09gEmcMwZTF8KHHem2FoeTZ1uz_ycZ9e-NrUUE";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types based on your schema
export interface SupabaseAgent {
  uuid: string;
  agent_id: string;
  general_prompt: string;
  type_of_equity_to_trade: string;
  frequency_of_running: string;
  next_run_time: string;
}

export interface SupabaseUser {
  uuid: string;
  email: string;
  password: string;
  username: string;
  positions: string[];
  trades: Trade[];
  cash: number;
  balance: number;
}

export interface Trade {
  trade: string;
  date: string;
  agent_id: string;
}

// Convert between your app's types and Supabase types
export const convertSupabaseAgentToAgent = (
  supabaseAgent: SupabaseAgent,
): Agent => ({
  id: supabaseAgent.agent_id,
  userId: supabaseAgent.uuid, // Assuming this maps to the user who created it
  name: `Agent ${supabaseAgent.agent_id}`,
  description: supabaseAgent.general_prompt,
  type: "burst_rule", // Default type
  status: "active",
  visibility: "private",
  createdAt: new Date().toISOString(),
  lastActive: supabaseAgent.next_run_time,
  performance: {
    totalSignals: 0,
    successRate: 0,
    avgReturn: 0,
    totalSubscribers: 0,
  },
  tags: [supabaseAgent.type_of_equity_to_trade],
  strategyPrompt: supabaseAgent.general_prompt,
  tradingLogicPrompt: supabaseAgent.general_prompt,
  parameters: {
    frequency: supabaseAgent.frequency_of_running,
    equityType: supabaseAgent.type_of_equity_to_trade,
  },
  riskSettings: {},
  pricing: undefined,
});

export const convertSupabaseUserToUser = (
  supabaseUser: SupabaseUser,
): User => ({
  id: supabaseUser.uuid,
  email: supabaseUser.email,
  username: supabaseUser.username,
  password: supabaseUser.password,
  name: supabaseUser.username,
  phone: "",
  bio: "",
  timezone: "UTC",
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  authProvider: "email",
  isEmailVerified: true,
});
