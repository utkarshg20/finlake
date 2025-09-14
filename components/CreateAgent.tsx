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
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";

interface AgentData {
  // Step 1: Basic Info
  name: string;
  description: string;
  owner: string;
  strategyPrompt: string;
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

  // Step 4: Visibility
  visibility: "private" | "public";
  tags: string[];
}

const CreateAgent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [agentId, setAgentId] = useState<string>("");
  const router = useRouter();
  const { createAgent, currentUser } = useApp();

  const [agentData, setAgentData] = useState<AgentData>({
    name: "",
    description: "",
    owner: "user@example.com", // This would come from auth
    strategyPrompt: "",
    strategyType: "burst_rule",
    entityScope: "publisher",
    windowMinutes: 30,
    minBurst: 3.0,
    minAvgSentiment: 0.2,
    side: "buy",
    minMessages: 3,
    lookbackMinutes: 60,
    minHeadlines: 3,
    credibilityWeight: 0.5,
    dedupCooldown: 30,
    maxCandidates: 20,
    perSignalNotional: 100,
    maxSignalsPerHour: 5,
    cooldownPerEntity: 30,
    activeHours: "09:30-16:00",
    tradingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    status: "active",
    visibility: "private",
    tags: [],
  });

  const [parseConfidence, setParseConfidence] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [testResults, setTestResults] = useState<any>(null);

  const steps = [
    {
      id: 1,
      title: "Basic Info",
      description: "Agent details & strategy prompt",
    },
    { id: 2, title: "Configure Logic", description: "Rule parameters" },
    { id: 3, title: "Risk & Schedule", description: "Trading controls" },
    { id: 4, title: "Preview & Test", description: "Validate before publish" },
    { id: 5, title: "Publish", description: "Make it live" },
  ];

  const parseStrategyPrompt = (prompt: string) => {
    // Simple parsing logic - in real app this would be more sophisticated
    const burstKeywords = ["burst", "spike", "surge", "3x", "multiple"];
    const sentimentKeywords = [
      "sentiment",
      "positive",
      "negative",
      "bullish",
      "bearish",
    ];

    const hasBurst = burstKeywords.some((keyword) =>
      prompt.toLowerCase().includes(keyword),
    );
    const hasSentiment = sentimentKeywords.some((keyword) =>
      prompt.toLowerCase().includes(keyword),
    );

    if (hasBurst && hasSentiment) {
      setAgentData((prev) => ({ ...prev, strategyType: "burst_rule" }));
      setParseConfidence("high");
    } else if (hasBurst) {
      setAgentData((prev) => ({ ...prev, strategyType: "burst_rule" }));
      setParseConfidence("medium");
    } else if (hasSentiment) {
      setAgentData((prev) => ({ ...prev, strategyType: "sentiment_rule" }));
      setParseConfidence("medium");
    } else {
      setAgentData((prev) => ({ ...prev, strategyType: "manual" }));
      setParseConfidence("low");
    }
  };

  const generateRuleJson = () => {
    return {
      type: agentData.strategyType,
      entity_kind: agentData.entityScope,
      window_minutes: agentData.windowMinutes,
      min_burst_z: agentData.minBurst,
      min_avg_sent: agentData.minAvgSentiment,
      side: agentData.side,
      size: { usd: agentData.perSignalNotional },
      cooldown_minutes: agentData.cooldownPerEntity,
      max_per_hour: agentData.maxSignalsPerHour,
      active_hours: [agentData.activeHours],
      days: agentData.tradingDays,
    };
  };

  const runQuickTest = () => {
    // Mock test results
    setTestResults({
      signalsFound: 9,
      entities: [
        {
          entity: "Reuters",
          burst_z: 3.2,
          avg_sent: 0.4,
          count: 4,
          lastSeen: "2h ago",
        },
        {
          entity: "Bloomberg",
          burst_z: 2.8,
          avg_sent: 0.3,
          count: 3,
          lastSeen: "1h ago",
        },
        {
          entity: "CNBC",
          burst_z: 3.5,
          avg_sent: 0.5,
          count: 2,
          lastSeen: "30m ago",
        },
      ],
      recommendations: [
        {
          side: "buy",
          entity: "Reuters",
          notional: 100,
          rationale: "Burst detected with positive sentiment",
        },
        {
          side: "buy",
          entity: "Bloomberg",
          notional: 100,
          rationale: "High activity spike",
        },
        {
          side: "buy",
          entity: "CNBC",
          notional: 100,
          rationale: "Strong bullish signals",
        },
      ],
    });
  };

  const handlePublish = async () => {
    try {
      if (!currentUser) {
        alert("Please log in to create an agent");
        return;
      }

      const newAgent = await createAgent({
        userId: currentUser.id,
        name: agentData.name,
        description: agentData.description,
        type: agentData.strategyType,
        status: agentData.status,
        visibility: agentData.visibility,
        strategyPrompt: agentData.strategyPrompt,
        parameters: {
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
        },
        riskSettings: {
          perSignalNotional: agentData.perSignalNotional,
          maxSignalsPerHour: agentData.maxSignalsPerHour,
          cooldownPerEntity: agentData.cooldownPerEntity,
          activeHours: agentData.activeHours,
          tradingDays: agentData.tradingDays,
        },
        tags: agentData.tags,
        performance: {
          totalSignals: 0,
          successRate: 0,
          avgReturn: 0,
          totalSubscribers: 0,
        },
      });

      if (newAgent) {
        setAgentId(newAgent.id);
        setIsPublished(true);
      } else {
        alert("Failed to create agent. Please try again.");
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      alert("Failed to create agent. Please try again.");
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
          Short Description
        </label>
        <Textarea
          placeholder="Goes long when reputable publishers spike with positive sentiment."
          value={agentData.description}
          onChange={(e) =>
            setAgentData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Owner
        </label>
        <Input
          value={agentData.owner}
          disabled
          className="bg-gray-700 border-gray-600 text-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Strategy Prompt *
        </label>
        <Textarea
          placeholder="Describe when the agent should act. Ex: Buy when publisher activity bursts (≥3x) and average sentiment is positive for the last 30–60 minutes."
          value={agentData.strategyPrompt}
          onChange={(e) => {
            setAgentData((prev) => ({
              ...prev,
              strategyPrompt: e.target.value,
            }));
            parseStrategyPrompt(e.target.value);
          }}
          className="bg-gray-800 border-gray-600 text-white h-32"
        />
        <p className="text-xs text-gray-400 mt-1">
          Describe when the agent should act. Ex: Buy when publisher activity
          bursts (≥3x) and average sentiment is positive for the last 30–60
          minutes.
        </p>
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
        <Button
          variant="outline"
          size="sm"
          className="mt-2 text-xs"
          onClick={() =>
            setAgentData((prev) => ({
              ...prev,
              strategyType:
                prev.strategyType === "manual" ? "burst_rule" : "manual",
            }))
          }
        >
          {agentData.strategyType === "manual"
            ? "Switch to Basic"
            : "Switch to Advanced"}
        </Button>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Live Extraction</h4>
        <div className="space-y-1 text-sm text-gray-300">
          <div>
            Type:{" "}
            {agentData.strategyType === "burst_rule"
              ? "Burst rule"
              : "Sentiment rule"}
          </div>
          <div>Window: {agentData.windowMinutes} min</div>
          <div>Min burst: {agentData.minBurst}</div>
          <div>Min avg sentiment: {agentData.minAvgSentiment}</div>
          <div>Side: {agentData.side}</div>
          <div>Size: ${agentData.perSignalNotional} per signal</div>
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
    if (isPublished) {
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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        {!isPublished && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create AI Agent</h1>
            <p className="text-gray-400">
              Build your custom trading agent with intelligent automation
            </p>
          </div>
        )}

        {/* Progress Steps - Hide when published */}
        {!isPublished && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= step.id
                        ? "bg-white text-black"
                        : "bg-gray-600 text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <FiCheck className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3">
                    <div
                      className={`text-sm font-medium ${
                        currentStep >= step.id ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-4 ${
                        currentStep > step.id ? "bg-white" : "bg-gray-600"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step Content */}
        <Card className="bg-gray-900 border-gray-700 p-6 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={isPublished ? "success" : currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Navigation */}
        {!isPublished && (
          <div className="flex justify-between">
            <Button
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              <FiChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < 5 ? (
                <Button
                  onClick={() =>
                    setCurrentStep((prev) => Math.min(5, prev + 1))
                  }
                  disabled={!agentData.name || !agentData.strategyPrompt}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  Next
                  <FiChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  Publish Agent
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAgent;
