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
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";

const Dashboard = () => {
  const { currentUser, userAgents, signals, getPortfolioHistory } = useApp();
  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      // Get portfolio history for the last 30 days
      const history = getPortfolioHistory(currentUser.id, 30);
      setPortfolioData(history);
      setIsLoading(false);
    }
  }, [currentUser, getPortfolioHistory]);

  // Calculate portfolio metrics with null checks
  const currentValue =
    portfolioData.length > 0
      ? portfolioData[portfolioData.length - 1]?.value
      : 0;
  const initialValue = portfolioData.length > 0 ? portfolioData[0]?.value : 0;
  const totalReturn =
    initialValue > 0 ? ((currentValue - initialValue) / initialValue) * 100 : 0;
  const todayReturn =
    portfolioData.length > 0
      ? portfolioData[portfolioData.length - 1]?.dailyReturn
      : 0;

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

  const renderPortfolioChart = () => {
    if (portfolioData.length === 0) return null;

    const maxValue = Math.max(...portfolioData.map((d) => d.value));
    const minValue = Math.min(...portfolioData.map((d) => d.value));
    const range = maxValue - minValue;

    return (
      <div className="h-64 relative">
        <svg width="100%" height="100%" className="overflow-visible">
          <defs>
            <linearGradient
              id="portfolioGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1="0"
              y1={`${ratio * 100}%`}
              x2="100%"
              y2={`${ratio * 100}%`}
              stroke="#374151"
              strokeWidth="1"
            />
          ))}

          {/* Area chart */}
          <path
            d={`M 0,${100 - ((portfolioData[0]?.value - minValue) / range) * 100} ${portfolioData
              .map(
                (point, i) =>
                  `L ${(i / (portfolioData.length - 1)) * 100},${100 - ((point.value - minValue) / range) * 100}`,
              )
              .join(" ")} L 100,100 L 0,100 Z`}
            fill="url(#portfolioGradient)"
          />

          {/* Line chart */}
          <path
            d={`M 0,${100 - ((portfolioData[0]?.value - minValue) / range) * 100} ${portfolioData
              .map(
                (point, i) =>
                  `L ${(i / (portfolioData.length - 1)) * 100},${100 - ((point.value - minValue) / range) * 100}`,
              )
              .join(" ")}`}
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
          />

          {/* Data points */}
          {portfolioData.map((point, i) => (
            <circle
              key={i}
              cx={`${(i / (portfolioData.length - 1)) * 100}`}
              cy={`${100 - ((point.value - minValue) / range) * 100}`}
              r="3"
              fill="#3B82F6"
              className="hover:r-4 transition-all"
            />
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
          <span>${Math.round(maxValue).toLocaleString()}</span>
          <span>${Math.round((maxValue + minValue) / 2).toLocaleString()}</span>
          <span>${Math.round(minValue).toLocaleString()}</span>
        </div>
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
            onClick={() => window.location.reload()}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Portfolio Value
              </h3>
              <FiDollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              ${currentValue.toLocaleString()}
            </div>
            <div
              className={`flex items-center text-sm ${
                totalReturn >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {totalReturn >= 0 ? (
                <FiArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <FiArrowDown className="w-4 h-4 mr-1" />
              )}
              {totalReturn >= 0 ? "+" : ""}
              {totalReturn.toFixed(2)}% total return
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Today's Return
              </h3>
              <FiActivity className="w-6 h-6 text-blue-400" />
            </div>
            <div
              className={`text-3xl font-bold mb-2 ${
                todayReturn >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {todayReturn >= 0 ? "+" : ""}
              {todayReturn.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString()}
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Active Agents
              </h3>
              <FiZap className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {activeAgents}
            </div>
            <div className="text-sm text-gray-400">
              of {userAgents?.length || 0} total agents
            </div>
          </Card>
        </div>

        {/* Portfolio Chart */}
        <Card className="bg-gray-900 border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Portfolio Performance (30 Days)
            </h3>
            <div className="flex space-x-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                30D
              </Button>
              <Button className="bg-gray-700 hover:bg-gray-600 text-white text-sm">
                90D
              </Button>
              <Button className="bg-gray-700 hover:bg-gray-600 text-white text-sm">
                1Y
              </Button>
            </div>
          </div>
          {renderPortfolioChart()}
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center">
              <FiBarChart className="w-8 h-8 text-blue-400 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Total Signals</p>
                <p className="text-2xl font-bold text-white">{totalSignals}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center">
              <FiCheckCircle className="w-8 h-8 text-green-400 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-white">
                  {avgSuccessRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center">
              <FiUsers className="w-8 h-8 text-purple-400 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Subscribers</p>
                <p className="text-2xl font-bold text-white">
                  {userAgents
                    ? userAgents.reduce(
                        (sum, agent) =>
                          sum + (agent.performance?.totalSubscribers || 0),
                        0,
                      )
                    : 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center">
              <FiGlobe className="w-8 h-8 text-orange-400 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Public Agents</p>
                <p className="text-2xl font-bold text-white">
                  {userAgents
                    ? userAgents.filter((a) => a.visibility === "public").length
                    : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-900 border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {signals && signals.length > 0 ? (
              signals.slice(0, 5).map((signal, index) => (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        signal.side === "buy" ? "bg-green-400" : "bg-red-400"
                      }`}
                    />
                    <div>
                      <p className="text-white font-medium">
                        {signal.side.toUpperCase()} {signal.symbol}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {signal.rationale}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      ${signal.notional.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(signal.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <FiActivity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
