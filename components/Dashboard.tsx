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

  // Generate portfolio history data for the chart
  const portfolioData = getPortfolioHistory(currentUser?.id || "", 30);

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
  const chartMin = minValue - padding;
  const chartMax = maxValue + padding;
  const chartRange = chartMax - chartMin;

  // Generate SVG path for the line
  const generatePath = () => {
    if (chartData.length < 2) return "";

    const width = 400;
    const height = 200;
    const padding = 20;

    const points = chartData.map((point, index) => {
      const x =
        padding +
        (index / Math.max(chartData.length - 1, 1)) * (width - 2 * padding);
      const y =
        padding +
        height -
        padding -
        ((point.value - chartMin) / chartRange) * (height - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  };

  // Generate area path (same as line but closed at bottom)
  const generateAreaPath = () => {
    if (chartData.length < 2) return "";

    const width = 400;
    const height = 200;
    const padding = 20;

    const points = chartData.map((point, index) => {
      const x =
        padding +
        (index / Math.max(chartData.length - 1, 1)) * (width - 2 * padding);
      const y =
        padding +
        height -
        padding -
        ((point.value - chartMin) / chartRange) * (height - 2 * padding);
      return `${x},${y}`;
    });

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const bottomLeft = `${padding},${height - padding}`;
    const bottomRight = `${width - padding},${height - padding}`;

    return `M ${firstPoint} L ${points.join(" L ")} L ${bottomRight} L ${bottomLeft} Z`;
  };

  // Calculate portfolio metrics with null checks
  const currentValue =
    chartData.length > 0 ? chartData[chartData.length - 1]?.value : 0;
  const initialValue = chartData.length > 0 ? chartData[0]?.value : 0;
  const totalReturn =
    initialValue > 0 ? ((currentValue - initialValue) / initialValue) * 100 : 0;
  const todayReturn =
    chartData.length > 0 ? chartData[chartData.length - 1]?.dailyReturn : 0;

  // Calculate other metrics with null checks
  const totalSignals =
    signals && userAgents
      ? signals.filter((s) => userAgents.some((a) => a.id === s.agentId)).length
      : 0;
  const activeAgents = userAgents
    ? userAgents.filter((a) => a.status === "active").length
    : 0;
  const avgSuccessRate =
    userAgents && userAgents.length > 0
      ? userAgents.reduce(
          (sum, agent) => sum + (agent.performance?.successRate || 0),
          0,
        ) / userAgents.length
      : 0;

  // Updated renderChart function
  const renderChart = () => {
    console.log("Rendering chart with data:", chartData);

    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>No portfolio data available</p>
        </div>
      );
    }

    if (chartData.length < 2) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>Not enough data points for chart</p>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 300"
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor="rgb(59, 130, 246)"
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor="rgb(59, 130, 246)"
                stopOpacity="0.05"
              />
            </linearGradient>
          </defs>

          {/* Y-axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = 20 + ratio * 260;
            const value = chartMin + (1 - ratio) * chartRange;
            return (
              <g key={index}>
                <line
                  x1="20"
                  y1={y}
                  x2="380"
                  y2={y}
                  stroke="rgb(55, 65, 81)"
                  strokeWidth="1"
                />
                <text
                  x="15"
                  y={y + 4}
                  fill="rgb(156, 163, 175)"
                  fontSize="12"
                  textAnchor="end"
                >
                  ${value.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* X-axis grid lines */}
          {chartData.map((_, index) => {
            if (
              chartData.length > 1 &&
              index % Math.ceil(chartData.length / 6) === 0
            ) {
              const x = 20 + (index / Math.max(chartData.length - 1, 1)) * 360;
              const date = new Date(chartData[index].date);
              return (
                <g key={index}>
                  <line
                    x1={x}
                    y1="20"
                    x2={x}
                    y2="280"
                    stroke="rgb(55, 65, 81)"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y="295"
                    fill="rgb(156, 163, 175)"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Area under the curve */}
          <path d={generateAreaPath()} fill="url(#areaGradient)" />

          {/* Line */}
          <path
            d={generatePath()}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  if (isLoading || !currentUser) {
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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {currentUser?.name}</p>
          </div>
          <Button
            onClick={() => (window.location.href = "/create-agent")}
            className="bg-white text-black hover:bg-gray-100"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Side - Chart */}
          <div className="lg:col-span-3">
            {/* Portfolio Performance Chart */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Portfolio Performance
                </h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                    30D
                  </button>
                  <button className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600">
                    90D
                  </button>
                  <button className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600">
                    1Y
                  </button>
                </div>
              </div>

              <div className="h-80">{renderChart()}</div>
            </div>
          </div>

          {/* Right Side - Metrics Stacked */}
          <div className="lg:col-span-2 space-y-4">
            {/* Total Signals */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Signals</p>
                  <p className="text-2xl font-bold text-white">
                    {signals?.length || 0}
                  </p>
                </div>
                <FiBarChart className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-green-400">
                    {signals && signals.length > 0
                      ? Math.round(
                          (signals.filter((s) => s.return > 0).length /
                            signals.length) *
                            100 *
                            10,
                        ) / 10
                      : 0}
                    %
                  </p>
                </div>
                <FiCheck className="w-8 h-8 text-green-400" />
              </div>
            </div>

            {/* Subscribers */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Subscribers</p>
                  <p className="text-2xl font-bold text-white">
                    {userAgents?.reduce(
                      (sum, agent) =>
                        sum + (agent.performance?.totalSubscribers || 0),
                      0,
                    ) || 0}
                  </p>
                </div>
                <FiUsers className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            {/* Public Agents */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Public Agents</p>
                  <p className="text-2xl font-bold text-white">
                    {userAgents?.filter(
                      (agent) => agent.visibility === "public",
                    ).length || 0}
                  </p>
                </div>
                <FiGlobe className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Recent Activity */}
        <div className="mt-6">
          {/* Recent Activity */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {signals && signals.length > 0 ? (
                signals.slice(0, 5).map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {signal.action.toUpperCase()} {signal.entity}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {signal.confidence
                          ? `${Math.round(signal.confidence * 100)}% confidence`
                          : "No confidence data"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${signal.return >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {signal.return >= 0 ? "+" : ""}
                        {signal.return.toFixed(2)}%
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(signal.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
