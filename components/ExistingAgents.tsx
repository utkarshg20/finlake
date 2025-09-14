"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiGlobe,
  FiPlay,
  FiClock,
  FiTrendingUp,
  FiShield,
  FiStar,
  FiArrowLeft,
  FiEye,
  FiCopy,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";

const ExistingAgents = () => {
  const [activeTab, setActiveTab] = useState<"personal" | "public">("personal");
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const router = useRouter();
  const { userAgents, publicAgents, currentUser, subscribeToAgent } = useApp();

  const handleUseAgent = async (agent: any) => {
    if (agent.userId === currentUser?.id) {
      // This is the user's own agent, navigate to edit or view details
      console.log("View your own agent:", agent.id);
    } else {
      // This is someone else's agent, subscribe to it
      try {
        await subscribeToAgent(agent.id);
        alert(`Successfully subscribed to ${agent.name}!`);
      } catch (error) {
        console.error("Error subscribing to agent:", error);
        alert("Failed to subscribe to agent. Please try again.");
      }
    }
  };

  const renderAgentCard = (agent: any, isOwned: boolean = false) => (
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
            <p className="text-xs text-gray-500 mt-1">
              by {isOwned ? "You" : `User ${agent.userId.slice(-4)}`}
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {agent.visibility === "public" ? (
              <FiGlobe className="w-4 h-4 text-blue-400" />
            ) : (
              <FiShield className="w-4 h-4 text-gray-400" />
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

        {/* Tags */}
        {agent.tags && agent.tags.length > 0 && (
          <div className="mb-4 flex-1">
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
            onClick={() => handleUseAgent(agent)}
            className={`flex-1 ${
              isOwned
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isOwned ? (
              <>
                <FiEye className="w-4 h-4 mr-2" />
                View Details
              </>
            ) : (
              <>
                <FiStar className="w-4 h-4 mr-2" />
                Subscribe
              </>
            )}
          </Button>

          <Button
            onClick={() => setSelectedAgent(agent)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            <FiCopy className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  const currentAgents = activeTab === "personal" ? userAgents : publicAgents;

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
              <h1 className="text-3xl font-bold text-white">Existing Agents</h1>
              <p className="text-gray-400">
                Discover and use AI trading agents
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-900 p-1 rounded-lg w-fit">
          <Button
            onClick={() => setActiveTab("personal")}
            className={`px-6 py-2 rounded-md transition-all ${
              activeTab === "personal"
                ? "bg-white text-black"
                : "bg-transparent text-gray-400 hover:text-white"
            }`}
          >
            <FiUsers className="w-4 h-4 mr-2" />
            Personal Agents
          </Button>
          <Button
            onClick={() => setActiveTab("public")}
            className={`px-6 py-2 rounded-md transition-all ${
              activeTab === "public"
                ? "bg-white text-black"
                : "bg-transparent text-gray-400 hover:text-white"
            }`}
          >
            <FiGlobe className="w-4 h-4 mr-2" />
            Public Agents
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center">
              <FiTrendingUp className="w-8 h-8 text-green-400 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Total Agents</p>
                <p className="text-2xl font-bold text-white">
                  {currentAgents.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center">
              <FiPlay className="w-8 h-8 text-blue-400 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Active</p>
                <p className="text-2xl font-bold text-white">
                  {currentAgents.filter((a) => a.status === "active").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center">
              <FiStar className="w-8 h-8 text-yellow-400 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Avg Success</p>
                <p className="text-2xl font-bold text-white">
                  {currentAgents.length > 0
                    ? Math.round(
                        currentAgents.reduce(
                          (sum, agent) =>
                            sum + (agent.performance?.successRate || 0),
                          0,
                        ) / currentAgents.length,
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Agents Grid */}
        {currentAgents.length === 0 ? (
          <Card className="bg-gray-900 border-gray-700 p-12 text-center">
            <FiUsers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab === "personal"
                ? "No Personal Agents"
                : "No Public Agents"}
            </h3>
            <p className="text-gray-400 mb-6">
              {activeTab === "personal"
                ? "Create your first AI trading agent to get started"
                : "No public agents available at the moment"}
            </p>
            {activeTab === "personal" && (
              <Button
                onClick={() => router.push("/create-agent")}
                className="bg-white text-black hover:bg-gray-100"
              >
                Create Your First Agent
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentAgents.map((agent) =>
              renderAgentCard(agent, agent.userId === currentUser?.id),
            )}
          </div>
        )}

        {/* Agent Details Modal */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedAgent(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedAgent.name}
                  </h2>
                  <Button
                    onClick={() => setSelectedAgent(null)}
                    className="bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    ×
                  </Button>
                </div>

                <p className="text-gray-400 mb-6">
                  {selectedAgent.description}
                </p>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Strategy Prompt
                    </h3>
                    <p className="text-gray-300 bg-gray-800 p-3 rounded">
                      {selectedAgent.strategyPrompt}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Performance
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-sm text-gray-400">Total Signals</p>
                        <p className="text-xl font-bold text-white">
                          {selectedAgent.performance?.totalSignals || 0}
                        </p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-sm text-gray-400">Success Rate</p>
                        <p className="text-xl font-bold text-white">
                          {selectedAgent.performance?.successRate || 0}%
                        </p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-sm text-gray-400">Avg Return</p>
                        <p className="text-xl font-bold text-white">
                          ${selectedAgent.performance?.avgReturn || 0}
                        </p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-sm text-gray-400">Subscribers</p>
                        <p className="text-xl font-bold text-white">
                          {selectedAgent.performance?.totalSubscribers || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={() => handleUseAgent(selectedAgent)}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      {selectedAgent.userId === currentUser?.id
                        ? "View Details"
                        : "Subscribe"}
                    </Button>
                    <Button
                      onClick={() => setSelectedAgent(null)}
                      className="bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExistingAgents;
