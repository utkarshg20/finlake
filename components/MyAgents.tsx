"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiPlus,
  FiPlay,
  FiPause,
  FiEdit,
  FiTrash2,
  FiGlobe,
  FiLock,
  FiBarChart,
  FiUsers,
  FiSettings,
  FiEye,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";

const MyAgents = () => {
  const { userAgents, updateAgent, deleteAgent, isLoading } = useApp();
  const router = useRouter();

  const toggleAgentStatus = async (agentId: string) => {
    const agent = userAgents.find((a) => a.id === agentId);
    if (agent) {
      const newStatus = agent.status === "active" ? "paused" : "active";
      await updateAgent(agentId, { status: newStatus });
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this agent? This action cannot be undone.",
      )
    ) {
      await deleteAgent(agentId);
    }
  };

  const editAgent = (agentId: string) => {
    // This would navigate to edit page or open edit modal
    console.log("Edit agent:", agentId);
  };

  const viewAgentDetails = (agentId: string) => {
    // This would navigate to agent details page
    console.log("View agent details:", agentId);
  };

  const renderAgentCard = (agent: any) => (
    <motion.div
      key={agent.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="bg-gray-900 border-gray-700 p-6 hover:border-gray-500 transition-all duration-300 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 min-h-0">
          <div className="flex-1 min-w-0 mr-3">
            <h3 className="text-lg font-semibold text-white truncate">
              {agent.name}
            </h3>
            <p className="text-sm text-gray-400 truncate mt-1">
              {agent.description}
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {agent.visibility === "public" ? (
              <FiGlobe className="w-4 h-4 text-blue-400" />
            ) : (
              <FiLock className="w-4 h-4 text-gray-400" />
            )}
            <span
              className={`px-2 py-1 rounded text-xs ${
                agent.status === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              {agent.status}
            </span>
          </div>
        </div>

        {/* Type and Performance */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              {agent.type === "burst_rule" ? "Burst Rule" : "Sentiment Rule"}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(agent.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Signals:</span>
              <span className="text-white ml-1">
                {agent.performance?.totalSignals || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Success:</span>
              <span className="text-white ml-1">
                {agent.performance?.successRate || 0}%
              </span>
            </div>
            <div>
              <span className="text-gray-400">P&L:</span>
              <span
                className={`ml-1 ${(agent.performance?.avgReturn || 0) >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                ${agent.performance?.avgReturn || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Subscribers:</span>
              <span className="text-white ml-1">
                {agent.performance?.totalSubscribers || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="mb-4 flex-1">
          <h4 className="text-sm font-medium text-white mb-2">Configuration</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
            <div className="truncate">
              Size: ${agent.riskSettings?.perSignalNotional || 0}
            </div>
            <div className="truncate">
              Max/Hour: {agent.riskSettings?.maxSignalsPerHour || 0}
            </div>
            <div className="truncate">
              Hours: {agent.riskSettings?.activeHours || "24/7"}
            </div>
            <div className="truncate">
              Days: {agent.riskSettings?.tradingDays?.length || 0} days
            </div>
          </div>
        </div>

        {/* Tags */}
        {agent.tags && agent.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {agent.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t border-gray-700">
          <Button
            onClick={() => toggleAgentStatus(agent.id)}
            className={`flex-1 ${
              agent.status === "active"
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {agent.status === "active" ? (
              <>
                <FiPause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <FiPlay className="w-4 h-4 mr-2" />
                Activate
              </>
            )}
          </Button>

          <Button
            onClick={() => viewAgentDetails(agent.id)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            <FiEye className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => editAgent(agent.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FiEdit className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => handleDeleteAgent(agent.id)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push("/")}
              className="bg-gray-800 hover:bg-gray-700 text-white"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">My Agents</h1>
              <p className="text-gray-400">Manage your AI trading agents</p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/create-agent")}
            className="bg-white text-black hover:bg-gray-100 flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create Agent</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center">
              <FiBarChart className="w-8 h-8 text-blue-400 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Total Agents</p>
                <p className="text-2xl font-bold text-white">
                  {userAgents.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center">
              <FiPlay className="w-8 h-8 text-green-400 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Active</p>
                <p className="text-2xl font-bold text-white">
                  {userAgents.filter((a) => a.status === "active").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center">
              <FiUsers className="w-8 h-8 text-purple-400 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Total Signals</p>
                <p className="text-2xl font-bold text-white">
                  {userAgents.reduce(
                    (sum, agent) =>
                      sum + (agent.performance?.totalSignals || 0),
                    0,
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center">
              <FiSettings className="w-8 h-8 text-orange-400 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Avg Success</p>
                <p className="text-2xl font-bold text-white">
                  {userAgents.length > 0
                    ? Math.round(
                        userAgents.reduce(
                          (sum, agent) =>
                            sum + (agent.performance?.successRate || 0),
                          0,
                        ) / userAgents.length,
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Agents Grid */}
        {userAgents.length === 0 ? (
          <Card className="bg-gray-900 border-gray-700 p-12 text-center">
            <FiBarChart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Agents Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first AI trading agent to get started
            </p>
            <Button
              onClick={() => router.push("/create-agent")}
              className="bg-white text-black hover:bg-gray-100"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Create Your First Agent
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userAgents.map(renderAgentCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAgents;
