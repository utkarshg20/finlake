"use client";

import { useState, useEffect } from "react";
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
  FiDollarSign,
  FiCreditCard,
  FiCheck,
  FiEye,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";

const ExistingAgents = () => {
  const [activeTab, setActiveTab] = useState<"personal" | "public">("personal");
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const router = useRouter();
  const {
    userAgents,
    publicAgents,
    currentUser,
    subscribeToAgent,
    isUserSubscribed,
  } = useApp();

  // Load subscription status for all agents
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      const status: { [key: string]: boolean } = {};
      for (const agent of [...userAgents, ...publicAgents]) {
        status[agent.id] = await isUserSubscribed(agent.id);
      }
      setSubscriptionStatus(status);
    };
    loadSubscriptionStatus();
  }, [userAgents, publicAgents, isUserSubscribed]);

  const handleUseAgent = async (agent: any) => {
    if (agent.userId === currentUser?.id) {
      // This is the user's own agent, navigate to dashboard using Next.js router
      router.push("/dashboard");
    } else {
      // This is someone else's agent, check if subscribed
      const isSubscribed = await isUserSubscribed(agent.id);
      if (isSubscribed) {
        alert(`You are already subscribed to ${agent.name}!`);
      } else {
        setSelectedAgent(agent);
        setShowPaymentModal(true);
      }
    }
  };

  const handleSubscribe = async () => {
    if (!selectedAgent) return;

    try {
      const success = await subscribeToAgent(selectedAgent.id);
      if (success) {
        alert(
          `Successfully subscribed to ${selectedAgent.name}! You'll start receiving signals from this agent.`,
        );
        setShowPaymentModal(false);
        setSelectedAgent(null);
        // Update subscription status
        setSubscriptionStatus((prev) => ({
          ...prev,
          [selectedAgent.id]: true,
        }));
        // Refresh the page to update subscription status
        window.location.reload();
      } else {
        alert("Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("An error occurred during subscription. Please try again.");
    }
  };

  const formatPrice = (pricing: any) => {
    if (!pricing) return "Free";
    return `$${pricing.subscriptionFee}/${pricing.billingCycle}`;
  };

  const renderAgentCard = (agent: any, isPersonal: boolean) => (
    <motion.div
      key={agent.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group backdrop-blur-sm h-full flex flex-col"
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-xl group-hover:from-blue-500/30 group-hover:via-purple-500/30 group-hover:to-indigo-500/30 transition-all duration-500">
              <FiUsers className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors duration-300 truncate">
              {agent.name}
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              {isPersonal ? "Personal Agent" : "Public Agent"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              agent.status === "active"
                ? "bg-green-500/20 text-green-400 border border-green-500/40"
                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
            }`}
          >
            {agent.status}
          </span>
          {agent.visibility === "public" && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-500/40">
              <FiGlobe className="w-3 h-3 inline mr-1" />
              Public
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 mb-6 line-clamp-2 leading-relaxed text-sm flex-1">
        {agent.description}
      </p>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 group-hover:border-blue-500/30 transition-all duration-300">
          <div className="text-xl font-bold text-white mb-1">
            {agent.performance?.totalSignals || 0}
          </div>
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
            Signals
          </div>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 group-hover:border-green-500/30 transition-all duration-300">
          <div className="text-xl font-bold text-green-400 mb-1">
            {agent.performance?.successRate?.toFixed(1) || 0}%
          </div>
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
            Success
          </div>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 group-hover:border-purple-500/30 transition-all duration-300">
          <div className="text-xl font-bold text-purple-400 mb-1">
            {agent.performance?.totalSubscribers || 0}
          </div>
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
            Subscribers
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="flex flex-wrap gap-2 mb-6">
        {agent.tags?.slice(0, 3).map((tag: string, index: number) => (
          <span
            key={index}
            className="px-2 py-1 bg-gradient-to-r from-gray-700/80 to-gray-600/80 text-gray-300 rounded-md text-xs font-medium border border-gray-600/50 hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-300 hover:border-blue-500/30 transition-all duration-300"
          >
            {tag}
          </span>
        ))}
        {agent.tags?.length > 3 && (
          <span className="px-2 py-1 bg-gray-700/50 text-gray-400 rounded-md text-xs font-medium border border-gray-600/30">
            +{agent.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50 mt-auto">
        <div className="flex items-center space-x-4">
          {agent.pricing ? (
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-green-500/20 rounded-lg">
                <FiDollarSign className="w-3 h-3 text-green-400" />
              </div>
              <span className="text-green-400 font-bold text-sm">
                {formatPrice(agent.pricing)}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gray-500/20 rounded-lg">
                <FiShield className="w-3 h-3 text-gray-400" />
              </div>
              <span className="text-gray-400 font-semibold text-sm">Free</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1 text-gray-400">
          <FiClock className="w-3 h-3" />
          <span className="text-xs font-medium">
            {new Date(agent.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isPersonal ? (
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105"
            >
              <FiTrendingUp className="w-4 h-4 mr-1" />
              Dashboard
            </Button>
          ) : (
            <Button
              onClick={() => handleUseAgent(agent)}
              disabled={subscriptionStatus[agent.id]}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                subscriptionStatus[agent.id]
                  ? "bg-green-600 text-white cursor-not-allowed shadow-lg shadow-green-500/20"
                  : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105"
              }`}
            >
              {subscriptionStatus[agent.id] ? (
                <>
                  <FiCheck className="w-4 h-4 mr-1" />
                  Subscribed
                </>
              ) : (
                <>
                  <FiPlay className="w-4 h-4 mr-1" />
                  Subscribe
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderPaymentModal = () => {
    if (!selectedAgent) return null;

    const total = selectedAgent.pricing?.subscriptionFee || 0;

    return (
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                Subscribe to {selectedAgent.name}
              </h2>

              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">
                    Pricing Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subscription Fee:</span>
                      <span className="text-white">
                        ${selectedAgent.pricing?.subscriptionFee || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Billing Cycle:</span>
                      <span className="text-white">
                        {selectedAgent.pricing?.billingCycle || "monthly"}
                      </span>
                    </div>
                    <hr className="border-gray-700" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Total:</span>
                      <span className="text-white">${total}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select payment method</option>
                    <option value="credit">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubscribe}
                  disabled={!paymentMethod}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FiCheck className="w-4 h-4 mr-2" />
                  Subscribe
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            onClick={() => router.back()}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Existing Agents</h1>
            <p className="text-gray-400">
              Manage your agents and discover new ones
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <Button
            onClick={() => setActiveTab("personal")}
            className={`px-6 py-3 rounded-lg ${
              activeTab === "personal"
                ? "bg-white text-black"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <FiUsers className="w-4 h-4 mr-2" />
            Personal Agents ({userAgents.length})
          </Button>
          <Button
            onClick={() => setActiveTab("public")}
            className={`px-6 py-3 rounded-lg ${
              activeTab === "public"
                ? "bg-white text-black"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <FiGlobe className="w-4 h-4 mr-2" />
            Public Agents ({publicAgents.length})
          </Button>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {activeTab === "personal" ? (
              userAgents.length > 0 ? (
                userAgents.map((agent) => renderAgentCard(agent, true))
              ) : (
                <motion.div
                  key="no-personal-agents"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12"
                >
                  <FiUsers className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Personal Agents
                  </h3>
                  <p className="text-gray-400 mb-6">
                    You haven't created any agents yet. Start by creating your
                    first AI trading agent.
                  </p>
                  <Button
                    onClick={() => router.push("/create-agent")}
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    <FiUsers className="w-4 h-4 mr-2" />
                    Create Your First Agent
                  </Button>
                </motion.div>
              )
            ) : publicAgents.length > 0 ? (
              publicAgents.map((agent) => renderAgentCard(agent, false))
            ) : (
              <motion.div
                key="no-public-agents"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <FiGlobe className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Public Agents Available
                </h3>
                <p className="text-gray-400">
                  There are no public agents available at the moment. Check back
                  later!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Payment Modal */}
        {renderPaymentModal()}
      </div>
    </div>
  );
};

export default ExistingAgents;
