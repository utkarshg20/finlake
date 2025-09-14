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
      className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <FiUsers className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
            <p className="text-sm text-gray-400">
              {isPersonal ? "Personal Agent" : "Public Agent"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              agent.status === "active"
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {agent.status}
          </span>
          {agent.visibility === "public" && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
              Public
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-300 mb-4 line-clamp-2">{agent.description}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <FiTrendingUp className="w-4 h-4" />
            <span>{agent.performance?.successRate?.toFixed(1) || 0}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <FiUsers className="w-4 h-4" />
            <span>{agent.performance?.totalSubscribers || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FiClock className="w-4 h-4" />
            <span>{new Date(agent.lastActive).toLocaleDateString()}</span>
          </div>
        </div>
        {!isPersonal && agent.pricing && (
          <div className="text-right">
            <p className="text-lg font-semibold text-white">
              {formatPrice(agent.pricing)}
            </p>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={() => handleUseAgent(agent)}
          className="flex-1 bg-white text-black hover:bg-gray-100"
        >
          <FiEye className="w-4 h-4 mr-2" />
          {isPersonal ? "View Details" : "Use Agent"}
        </Button>
        {!isPersonal && (
          <Button
            onClick={() => handleUseAgent(agent)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FiDollarSign className="w-4 h-4" />
          </Button>
        )}
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
