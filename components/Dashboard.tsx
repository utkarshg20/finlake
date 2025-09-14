"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiUsers,
  FiActivity,
  FiBarChart,
  FiPieChart,
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiGlobe,
  FiZap,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiSettings,
  FiPlus,
  FiCheck,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";

export default function Dashboard() {
  const { currentUser, userAgents, signals, getPortfolioHistory, isLoading } =
    useApp();
  const [selectedTimeframe, setSelectedTimeframe] = useState("30D");
  const [portfolioData, setPortfolioData] = useState<any[]>([]);

  // Load portfolio data on mount
  useEffect(() => {
    const loadPortfolioData = async () => {
      if (currentUser?.id) {
        const data = await getPortfolioHistory(currentUser.id, 30);
        setPortfolioData(data);
      }
    };
    loadPortfolioData();
  }, [currentUser?.id, getPortfolioHistory]);

  // Debug logging
  console.log("Portfolio data:", portfolioData);
  console.log("Signals:", signals);
  console.log("Current user:", currentUser);

  // Use portfolio data directly without filtering for now
  const chartData = portfolioData.length > 0 ? portfolioData : [];

  // Calculate proper scaling for the chart
  const values = chartData.map((d) => d.value);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 10000;
  const range = maxValue - minValue;
  const padding = range * 0.1; // 10% padding
  const yMin = Math.max(0, minValue - padding);
  const yMax = maxValue + padding;

  // Chart dimensions - use actual container dimensions
  const chartWidth = 600;
  const chartHeight = 300;
  const margin = { top: 20, right: 20, bottom: 40, left: 80 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // Scale functions
  const xScale = (index: number) =>
    (index / Math.max(1, chartData.length - 1)) * innerWidth;
  const yScale = (value: number) =>
    innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight;

  // Generate SVG path for the line
  const generatePath = () => {
    if (chartData.length === 0) return "";

    const points = chartData
      .map((d, index) => {
        const x = xScale(index);
        const y = yScale(d.value);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

    return points;
  };

  // Generate area path for gradient fill
  const generateAreaPath = () => {
    if (chartData.length === 0) return "";

    const points = chartData
      .map((d, index) => {
        const x = xScale(index);
        const y = yScale(d.value);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

    return `${points} L ${xScale(chartData.length - 1)} ${innerHeight} L ${xScale(0)} ${innerHeight} Z`;
  };

  // Calculate metrics
  const totalSignals = signals.length;
  const successfulSignals = signals.filter((s) => s.return > 0).length;
  const successRate =
    totalSignals > 0 ? (successfulSignals / totalSignals) * 100 : 0;
  const totalSubscribers = userAgents.reduce(
    (sum, agent) => sum + (agent.performance?.totalSubscribers || 0),
    0,
  );

  // Recent activity (last 5 signals)
  const recentSignals = signals
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">
              Welcome back, {currentUser?.name || "Trader"}
            </p>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={() => window.location.reload()}
              className="bg-gray-800 hover:bg-gray-700 text-white"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => (window.location.href = "/create-agent")}
              className="bg-white text-black hover:bg-gray-100"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-2 mb-6">
          {["7D", "30D", "90D", "1Y"].map((timeframe) => (
            <Button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-lg ${
                selectedTimeframe === timeframe
                  ? "bg-white text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {timeframe}
            </Button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Portfolio Performance Chart - Left Side (3/5 width) */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Portfolio Performance</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <FiActivity className="w-4 h-4" />
                  <span>Live</span>
                </div>
              </div>

              {chartData.length > 0 ? (
                <div className="w-full">
                  <svg
                    width="100%"
                    height="280"
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full"
                  >
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient
                        id="portfolioGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="rgba(34, 197, 94, 0.3)" />
                        <stop
                          offset="100%"
                          stopColor="rgba(34, 197, 94, 0.05)"
                        />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <g className="opacity-20">
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                        const y = margin.top + ratio * innerHeight;
                        const value = yMax - ratio * (yMax - yMin);
                        return (
                          <g key={ratio}>
                            <line
                              x1={margin.left}
                              y1={y}
                              x2={margin.left + innerWidth}
                              y2={y}
                              stroke="currentColor"
                              strokeWidth="1"
                            />
                            <text
                              x={margin.left - 10}
                              y={y + 4}
                              textAnchor="end"
                              className="text-xs fill-gray-400"
                            >
                              ${value.toFixed(0)}
                            </text>
                          </g>
                        );
                      })}
                    </g>

                    {/* Area fill */}
                    <path
                      d={generateAreaPath()}
                      fill="url(#portfolioGradient)"
                      transform={`translate(${margin.left}, ${margin.top})`}
                    />

                    {/* Line */}
                    <path
                      d={generatePath()}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      transform={`translate(${margin.left}, ${margin.top})`}
                    />

                    {/* X-axis labels */}
                    <g
                      transform={`translate(${margin.left}, ${margin.top + innerHeight + 10})`}
                    >
                      {chartData.map((d, index) => {
                        if (index % Math.ceil(chartData.length / 5) === 0) {
                          const date = new Date(d.date);
                          return (
                            <text
                              key={index}
                              x={xScale(index)}
                              y={0}
                              textAnchor="middle"
                              className="text-xs fill-gray-400"
                            >
                              {date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </text>
                          );
                        }
                        return null;
                      })}
                    </g>
                  </svg>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <FiBarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No portfolio data available</p>
                    <p className="text-sm">Create an agent to start trading</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Metrics - Right Side (2/5 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Total Signals */}
            <Card className="bg-gray-900 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Signals</p>
                  <p className="text-2xl font-bold">{totalSignals}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <FiZap className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </Card>

            {/* Success Rate */}
            <Card className="bg-gray-900 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {successRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <FiTrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </Card>

            {/* Subscribers */}
            <Card className="bg-gray-900 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Subscribers</p>
                  <p className="text-2xl font-bold">{totalSubscribers}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <FiUsers className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            {recentSignals.length > 0 ? (
              <div className="space-y-3">
                {recentSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          signal.action === "buy"
                            ? "bg-green-500/20"
                            : "bg-red-500/20"
                        }`}
                      >
                        {signal.action === "buy" ? (
                          <FiArrowUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <FiArrowDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{signal.entity}</p>
                        <p className="text-sm text-gray-400">
                          {signal.action.toUpperCase()} • Confidence:{" "}
                          {(signal.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          signal.return > 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {signal.return > 0 ? "+" : ""}
                        {signal.return.toFixed(2)}%
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(signal.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FiActivity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">
                  Your agents will appear here when they generate signals
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
