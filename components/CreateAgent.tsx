"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronRight,
  FiChevronLeft,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiShield,
  FiZap,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";

interface AgentData {
  // Step 1: Basic Info
  name: string;
  description: string;
  owner: string;
  strategyPrompt: string;
  tradingLogicPrompt: string;
  strategyType: "burst_rule" | "sentiment_rule" | "manual";

  // Step 2: Parameters
  entityScope: "publisher" | "ticker";
  windowMinutes: number;
  minBurst: number;
  minAvgSentiment: number;
  side: "buy" | "sell";
  minMessages: number;
  lookbackMinutes: number;
  minHeadlines: number;
  credibilityWeight: number;
  dedupCooldown: number;
  maxCandidates: number;

  // Step 3: Risk & Schedule
  perSignalNotional: number;
  maxSignalsPerHour: number;
  cooldownPerEntity: number;
  activeHours: string;
  tradingDays: string[];
  status: "active" | "paused";

  // Step 4: Visibility & Publish
  visibility: "private" | "public";
  tags: string[];
  termsAccepted: boolean;

  // Additional fields for compatibility
  parameters: any;
  riskSettings: any;
  pricing?: {
    subscriptionFee: number;
    currency: string;
    billingCycle: string;
    trialDays: number;
  };
}

export default function CreateAgent() {
  const router = useRouter();
  const { createAgent, currentUser } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const [agentData, setAgentData] = useState<AgentData>({
    // Step 1: Basic Info
    name: "",
    description: "",
    owner: currentUser?.name || "",
    strategyPrompt: "",
    tradingLogicPrompt: "",
    strategyType: "burst_rule",

    // Step 2: Parameters
    entityScope: "ticker",
    windowMinutes: 15,
    minBurst: 0.8,
    minAvgSentiment: 0.6,
    side: "buy",
    minMessages: 10,
    lookbackMinutes: 30,
    minHeadlines: 5,
    credibilityWeight: 0.7,
    dedupCooldown: 60,
    maxCandidates: 5,

    // Step 3: Risk & Schedule
    perSignalNotional: 1000,
    maxSignalsPerHour: 4,
    cooldownPerEntity: 60,
    activeHours: "09:00-16:00",
    tradingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    status: "active",

    // Step 4: Visibility & Publish
    visibility: "private",
    tags: [],
    termsAccepted: false,

    // Additional fields
    parameters: {},
    riskSettings: {},
  });

  // AI Analysis function
  const analyzePromptWithAI = async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-agent-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze prompt");
      }

      const analysis = await response.json();
      setAiAnalysis(analysis);

      // Only update the trading logic prompt, don't touch other fields
      setAgentData((prev) => ({
        ...prev,
        tradingLogicPrompt: analysis.general_prompt,
      }));
    } catch (error) {
      console.error("Error analyzing prompt:", error);
      alert(
        "Failed to analyze prompt with AI. Please fill out the form manually.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get default tags based on strategy type
  const getDefaultTags = (strategyType: string) => {
    switch (strategyType) {
      case "burst_rule":
        return ["equities", "momentum", "high-frequency"];
      case "sentiment_rule":
        return ["sentiment", "news", "AI"];
      default:
        return ["equities", "trading"];
    }
  };

  // Parse confidence level
  const parseConfidence = "high";

  const generateRuleJson = () => {
    return {
      type: agentData.strategyType,
      entityScope: agentData.entityScope,
      windowMinutes: agentData.windowMinutes,
      minBurst: agentData.minBurst,
      minAvgSentiment: agentData.minAvgSentiment,
      side: agentData.side,
      minMessages: agentData.minMessages,
      lookbackMinutes: agentData.lookbackMinutes,
      minHeadlines: agentData.minHeadlines,
      credibilityWeight: agentData.credibilityWeight,
      dedupCooldown: agentData.dedupCooldown,
      maxCandidates: agentData.maxCandidates,
    };
  };

  const runQuickTest = () => {
    setTestResults({
      signalsFound: 9,
      entities: [
        {
          entity: "AAPL",
          burst_z: 2.1,
          avg_sent: 0.8,
          count: 15,
          lastSeen: "2m ago",
        },
        {
          entity: "TSLA",
          burst_z: 1.8,
          avg_sent: 0.6,
          count: 12,
          lastSeen: "5m ago",
        },
      ],
      recommendations: [
        {
          side: "buy",
          entity: "AAPL",
          notional: 1000,
          rationale: "Strong bullish sentiment detected",
        },
      ],
    });
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Update the handlePublish function with better debugging:
  const handlePublish = async () => {
    if (!currentUser) {
      alert("Please log in to create an agent");
      return;
    }

    console.log("Starting agent creation process...");
    console.log("Agent data:", agentData);
    console.log("Current user email:", currentUser.email);

    try {
      // Look up the user id by email
      console.log("Looking up user id for email:", currentUser.email);
      const userResponse = await fetch("/api/get-user-by-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: currentUser.email }),
      });

      console.log("User lookup response status:", userResponse.status);

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error("Failed to get user id:", errorText);
        throw new Error(`Failed to get user ID: ${errorText}`);
      }

      const userData = await userResponse.json();
      console.log("User lookup response data:", userData);

      const userId = userData.user_id;
      console.log("Retrieved user id:", userId);

      if (!userId) {
        throw new Error("No user id found for the current user");
      }

      // Then, analyze the prompt with AI
      let analysis = null;
      if (agentData.tradingLogicPrompt.trim()) {
        console.log("Analyzing prompt with AI...");
        const response = await fetch("/api/analyze-agent-prompt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: agentData.tradingLogicPrompt }),
        });

        if (response.ok) {
          analysis = await response.json();
          console.log("AI analysis result:", analysis);
        } else {
          console.log("AI analysis failed, using defaults");
        }
      }

      // Prepare data for Supabase - ONLY the exact schema fields
      const supabaseAgentData = {
        owner_user_id: userId, // Use the looked up user id
        agent_id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        general_prompt: agentData.tradingLogicPrompt,
        type_of_equity_to_trade:
          analysis?.type_of_equity_to_trade || "equities",
        frequency_of_running: mapFrequencyToEnum(
          analysis?.frequency_of_running || "medium",
        ),
        next_run_time:
          analysis?.next_run_time ||
          new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      console.log("Supabase data:", supabaseAgentData);

      // Create agent in Supabase
      console.log("Creating agent in Supabase...");
      const supabaseResponse = await fetch("/api/create-agent-supabase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supabaseAgentData),
      });

      if (!supabaseResponse.ok) {
        const errorText = await supabaseResponse.text();
        console.error("Supabase error:", errorText);
        throw new Error(`Failed to create agent in Supabase: ${errorText}`);
      }

      console.log("Supabase agent created successfully");

      // Also create in local database for compatibility
      const agentDataToCreate = {
        userId: currentUser.id,
        name: agentData.name,
        description: agentData.description,
        type:
          agentData.strategyType === "manual"
            ? "burst_rule"
            : agentData.strategyType,
        status: agentData.status,
        visibility: agentData.visibility,
        strategyPrompt: agentData.tradingLogicPrompt,
        tradingLogicPrompt: agentData.tradingLogicPrompt,
        parameters: agentData.parameters,
        riskSettings: agentData.riskSettings,
        tags:
          agentData.tags.length > 0
            ? agentData.tags
            : getDefaultTags(agentData.strategyType),
        pricing:
          agentData.visibility === "public"
            ? {
                subscriptionFee: agentData.pricing?.subscriptionFee || 0,
                currency: "USD",
                billingCycle: "monthly" as const,
                trialDays: 7,
              }
            : undefined,
      };

      console.log("Creating agent in local database...");
      const newAgent = await createAgent(agentDataToCreate);

      if (newAgent) {
        console.log("Local agent created successfully:", newAgent);
        setAgentId(newAgent.id);
        setCurrentStep(6); // Move to success step
      } else {
        console.error("Failed to create local agent");
        alert("Failed to create agent in local database");
      }
    } catch (error: any) {
      console.error("Error creating agent:", error);
      alert(`Failed to create agent: ${error.message}`);
    }
  };

  const handleDone = () => {
    router.push("/");
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Agent Name *
        </label>
        <Input
          placeholder="Burst-on-news (bullish)"
          value={agentData.name}
          onChange={(e) =>
            setAgentData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Short Description *
        </label>
        <Input
          placeholder="Detects bullish news bursts and executes buy signals"
          value={agentData.description}
          onChange={(e) =>
            setAgentData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Owner *
        </label>
        <Input
          placeholder="Your Name"
          value={agentData.owner}
          onChange={(e) =>
            setAgentData((prev) => ({ ...prev, owner: e.target.value }))
          }
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Strategy Prompt *
        </label>
        <Textarea
          placeholder="Describe what this agent should do..."
          value={agentData.strategyPrompt}
          onChange={(e) =>
            setAgentData((prev) => ({
              ...prev,
              strategyPrompt: e.target.value,
            }))
          }
          className="bg-gray-800 border-gray-600 text-white h-32"
        />
      </div>

      {/* Trading Logic Prompt Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Trading Logic Prompt *
        </label>
        <Textarea
          placeholder="Describe your trading strategy in detail..."
          value={agentData.tradingLogicPrompt}
          onChange={(e) =>
            setAgentData((prev) => ({
              ...prev,
              tradingLogicPrompt: e.target.value,
            }))
          }
          className="bg-gray-800 border-gray-600 text-white h-40"
        />
        <div className="flex items-start gap-2 mt-2">
          <FiShield className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-400">
            <strong>Private Field:</strong> This trading logic will be encrypted
            and never shared with other users. It's your proprietary algorithm
            that powers the agent's decision-making process.
          </p>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">
          Auto-detected Strategy Type
        </h4>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-2 py-1 rounded text-xs ${
              agentData.strategyType === "burst_rule"
                ? "bg-blue-600 text-white"
                : "bg-gray-600 text-gray-300"
            }`}
          >
            Burst rule
          </span>
          <span
            className={`px-2 py-1 rounded text-xs ${
              agentData.strategyType === "sentiment_rule"
                ? "bg-blue-600 text-white"
                : "bg-gray-600 text-gray-300"
            }`}
          >
            Sentiment rule
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Confidence:</span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              parseConfidence === "high"
                ? "bg-green-600 text-white"
                : parseConfidence === "medium"
                  ? "bg-yellow-600 text-white"
                  : "bg-red-600 text-white"
            }`}
          >
            {parseConfidence}
          </span>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {agentData.strategyType === "burst_rule" ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Entity Scope
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="entityScope"
                  value="publisher"
                  checked={agentData.entityScope === "publisher"}
                  onChange={(e) =>
                    setAgentData((prev) => ({
                      ...prev,
                      entityScope: e.target.value as "publisher" | "ticker",
                    }))
                  }
                  className="mr-2"
                />
                Publisher (default)
              </label>
              <label className="flex items-center text-gray-400">
                <input
                  type="radio"
                  name="entityScope"
                  value="ticker"
                  disabled
                  className="mr-2"
                />
                Ticker (coming soon)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Window (minutes)
            </label>
            <Input
              type="number"
              value={agentData.windowMinutes}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  windowMinutes: parseInt(e.target.value),
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Time window to analyze for burst detection
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Min Burst (z-score)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={agentData.minBurst}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  minBurst: parseFloat(e.target.value),
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Burst z-score compares the last 10-min message count vs typical
              baseline
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Min Avg Sentiment: {agentData.minAvgSentiment}
            </label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={agentData.minAvgSentiment}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  minAvgSentiment: parseFloat(e.target.value),
                }))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>-1.0 (Bearish)</span>
              <span>+1.0 (Bullish)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Side
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="side"
                  value="buy"
                  checked={agentData.side === "buy"}
                  onChange={(e) =>
                    setAgentData((prev) => ({
                      ...prev,
                      side: e.target.value as "buy" | "sell",
                    }))
                  }
                  className="mr-2"
                />
                Buy
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="side"
                  value="sell"
                  checked={agentData.side === "sell"}
                  onChange={(e) =>
                    setAgentData((prev) => ({
                      ...prev,
                      side: e.target.value as "buy" | "sell",
                    }))
                  }
                  className="mr-2"
                />
                Sell
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum Messages in Window
            </label>
            <Input
              type="number"
              value={agentData.minMessages}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  minMessages: parseInt(e.target.value),
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lookback (minutes)
            </label>
            <Input
              type="number"
              value={agentData.lookbackMinutes}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  lookbackMinutes: parseInt(e.target.value),
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum Headlines
            </label>
            <Input
              type="number"
              value={agentData.minHeadlines}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  minHeadlines: parseInt(e.target.value),
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Min Avg Sentiment: {agentData.minAvgSentiment}
            </label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={agentData.minAvgSentiment}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  minAvgSentiment: parseFloat(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Side
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="side"
                  value="buy"
                  checked={agentData.side === "buy"}
                  onChange={(e) =>
                    setAgentData((prev) => ({
                      ...prev,
                      side: e.target.value as "buy" | "sell",
                    }))
                  }
                  className="mr-2"
                />
                Buy
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="side"
                  value="sell"
                  checked={agentData.side === "sell"}
                  onChange={(e) =>
                    setAgentData((prev) => ({
                      ...prev,
                      side: e.target.value as "buy" | "sell",
                    }))
                  }
                  className="mr-2"
                />
                Sell
              </label>
            </div>
          </div>
        </>
      )}

      <details className="bg-gray-800 p-4 rounded-lg">
        <summary className="text-sm font-medium text-white cursor-pointer">
          Advanced Settings
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Credibility Weight Floor: {agentData.credibilityWeight}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={agentData.credibilityWeight}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  credibilityWeight: parseFloat(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Ignore same entity if seen in last {agentData.dedupCooldown} min
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Candidates per Run
            </label>
            <Input
              type="number"
              value={agentData.maxCandidates}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  maxCandidates: parseInt(e.target.value),
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>
      </details>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Per-signal Notional (USD) *
        </label>
        <Input
          type="number"
          value={agentData.perSignalNotional}
          onChange={(e) =>
            setAgentData((prev) => ({
              ...prev,
              perSignalNotional: parseInt(e.target.value),
            }))
          }
          className="bg-gray-800 border-gray-600 text-white"
        />
        <p className="text-xs text-gray-400 mt-1">
          Your backend will translate this to quantity
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Max Signals per Hour
        </label>
        <Input
          type="number"
          value={agentData.maxSignalsPerHour}
          onChange={(e) =>
            setAgentData((prev) => ({
              ...prev,
              maxSignalsPerHour: parseInt(e.target.value),
            }))
          }
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Cooldown per Entity (minutes)
        </label>
        <Input
          type="number"
          value={agentData.cooldownPerEntity}
          onChange={(e) =>
            setAgentData((prev) => ({
              ...prev,
              cooldownPerEntity: parseInt(e.target.value),
            }))
          }
          className="bg-gray-800 border-gray-600 text-white"
        />
        <p className="text-xs text-gray-400 mt-1">
          Prevents repeated recos on the same publisher/ticker too quickly
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Active Trading Hours
        </label>
        <Input
          value={agentData.activeHours}
          onChange={(e) =>
            setAgentData((prev) => ({ ...prev, activeHours: e.target.value }))
          }
          className="bg-gray-800 border-gray-600 text-white"
        />
        <p className="text-xs text-gray-400 mt-1">
          Timezone: America/Toronto (detected)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Trading Days
        </label>
        <div className="flex flex-wrap gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <label key={day} className="flex items-center">
              <input
                type="checkbox"
                checked={agentData.tradingDays.includes(day)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAgentData((prev) => ({
                      ...prev,
                      tradingDays: [...prev.tradingDays, day],
                    }));
                  } else {
                    setAgentData((prev) => ({
                      ...prev,
                      tradingDays: prev.tradingDays.filter((d) => d !== day),
                    }));
                  }
                }}
                className="mr-1"
              />
              {day}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Status on Create
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="active"
              checked={agentData.status === "active"}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  status: e.target.value as "active" | "paused",
                }))
              }
              className="mr-2"
            />
            Active
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="paused"
              checked={agentData.status === "paused"}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  status: e.target.value as "active" | "paused",
                }))
              }
              className="mr-2"
            />
            Paused
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">
          Rule JSON Preview
        </h4>
        <pre className="text-xs text-gray-300 overflow-x-auto">
          {JSON.stringify(generateRuleJson(), null, 2)}
        </pre>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">
          Generated SQL Preview
        </h4>
        <code className="text-xs text-gray-300">
          {`SELECT * FROM messages WHERE created_at >= NOW() - INTERVAL ${agentData.windowMinutes} MINUTE
          AND entity = '${agentData.entityScope}' AND sentiment >= ${agentData.minAvgSentiment}`}
        </code>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">
          Quick Lookback Test
        </h4>
        <div className="flex gap-2 mb-4">
          <select className="bg-gray-700 border-gray-600 text-white px-3 py-1 rounded text-sm">
            <option>2h</option>
            <option>6h</option>
            <option>24h</option>
          </select>
          <Button
            onClick={runQuickTest}
            size="sm"
            className="bg-white text-black hover:bg-gray-100"
          >
            Run Quick Test
          </Button>
        </div>

        {testResults && (
          <div className="space-y-4">
            <div className="text-sm text-gray-300">
              Signals found: {testResults.signalsFound} (e.g., "9 recos across 3
              entities")
            </div>

            <div>
              <h5 className="text-sm font-medium text-white mb-2">
                Top Entities
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-1">Entity</th>
                      <th className="text-left py-1">Burst Z</th>
                      <th className="text-left py-1">Avg Sent</th>
                      <th className="text-left py-1">Count</th>
                      <th className="text-left py-1">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.entities.map((entity: any, index: number) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="py-1">{entity.entity}</td>
                        <td className="py-1">{entity.burst_z}</td>
                        <td className="py-1">{entity.avg_sent}</td>
                        <td className="py-1">{entity.count}</td>
                        <td className="py-1">{entity.lastSeen}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-white mb-2">
                Sample Recommendations
              </h5>
              <div className="space-y-2">
                {testResults.recommendations.map((rec: any, index: number) => (
                  <div key={index} className="bg-gray-700 p-2 rounded text-xs">
                    <div className="flex justify-between">
                      <span className="text-white">
                        {rec.side.toUpperCase()}
                      </span>
                      <span className="text-gray-300">{rec.entity}</span>
                      <span className="text-gray-300">${rec.notional}</span>
                    </div>
                    <div className="text-gray-400 mt-1">{rec.rationale}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Visibility
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={agentData.visibility === "private"}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  visibility: e.target.value as "private" | "public",
                }))
              }
              className="mr-2"
            />
            Private (only you)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={agentData.visibility === "public"}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  visibility: e.target.value as "private" | "public",
                }))
              }
              className="mr-2"
            />
            Public (discoverable)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags
        </label>
        <Input
          placeholder="news, burst, sentiment, equities"
          className="bg-gray-800 border-gray-600 text-white"
        />
        <p className="text-xs text-gray-400 mt-1">
          Add tags to help others discover your agent
        </p>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <label className="flex items-start">
          <input type="checkbox" className="mr-2 mt-1" />
          <span className="text-sm text-gray-300">
            I acknowledge this is not financial advice; all trades are at my own
            risk.
          </span>
        </label>
      </div>
    </div>
  );

  const renderSuccessScreen = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
          <FiCheck className="w-8 h-8 text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Agent Created Successfully!
        </h2>
        <p className="text-gray-400">
          Your AI trading agent is now live and ready to trade.
        </p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg text-left max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-white mb-4">Agent Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Agent ID:</span>
            <span className="text-white font-mono">{agentId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Name:</span>
            <span className="text-white">{agentData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className="text-green-400 capitalize">
              {agentData.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Visibility:</span>
            <span className="text-white capitalize">
              {agentData.visibility}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg text-left max-w-md mx-auto">
        <h4 className="text-sm font-medium text-white mb-2">Quick Actions</h4>
        <div className="space-y-2 text-sm">
          <button className="block w-full text-left text-blue-400 hover:text-blue-300">
            View Signals
          </button>
          <button className="block w-full text-left text-blue-400 hover:text-blue-300">
            Copy Subscription Link
          </button>
          <button className="block w-full text-left text-blue-400 hover:text-blue-300">
            Open Marketplace
          </button>
        </div>
      </div>

      <Button
        onClick={handleDone}
        className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-lg"
      >
        Done
      </Button>
    </div>
  );

  const renderCurrentStep = () => {
    if (agentId) {
      return renderSuccessScreen();
    }

    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create AI Agent</h1>
          <p className="text-gray-400">
            {currentStep === 6
              ? "Success"
              : `Step ${currentStep} of 5: ${getStepTitle(currentStep)}`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded ${
                  step <= (currentStep === 6 ? 5 : currentStep)
                    ? "bg-white"
                    : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-gray-900 border-gray-700 p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}
              {currentStep === 6 && renderSuccessScreen()}
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Navigation */}
        {!agentId && (
          <div className="flex justify-between">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50"
            >
              <FiChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                className="bg-white text-black hover:bg-gray-100"
              >
                Next
                <FiChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : currentStep === 5 ? (
              <Button
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FiCheck className="w-4 h-4 mr-2" />
                Publish Agent
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for step titles
const getStepTitle = (step: number) => {
  const titles = {
    1: "Basic Information",
    2: "Parameters",
    3: "Risk & Schedule",
    4: "Preview & Test",
    5: "Publish Agent",
    6: "Success",
  };
  return titles[step as keyof typeof titles] || "";
};

const mapFrequencyToEnum = (frequency: string) => {
  switch (frequency.toLowerCase()) {
    case "high":
    case "every few minutes":
    case "every 5 minutes":
    case "every 10 minutes":
    case "every 15 minutes":
      return "HOURLY"; // High frequency maps to HOURLY
    case "medium":
    case "hourly":
    case "every hour":
      return "HOURLY";
    case "low":
    case "daily":
    case "every day":
      return "DAILY";
    default:
      return "HOURLY"; // default fallback
  }
};
