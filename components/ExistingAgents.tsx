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
  const router = useRouter();
  const {
    userAgents,
    publicAgents,
    currentUser,
    subscribeToAgent,
    isUserSubscribed,
  } = useApp();

  const handleUseAgent = (agent: any) => {
    if (agent.userId === currentUser?.id) {
      // This is the user's own agent, navigate to dashboard using Next.js router
      router.push("/dashboard");
    } else {
      // This is someone else's agent, check if subscribed
      if (isUserSubscribed(agent.id)) {
        alert(`You are already subscribed to ${agent.name}!`);
      } else {
        setSelectedAgent(agent);
        setShowPaymentModal(true);
      }
    }
  };

  const handlePayment = async () => {
    if (!selectedAgent || !paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    try {
      const success = await subscribeToAgent(selectedAgent.id);
      if (success) {
        alert(
          `Successfully subscribed to ${selectedAgent.name}! You'll start receiving signals from this agent.`,
        );
        setShowPaymentModal(false);
        setSelectedAgent(null);
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

    const setupFee = pricing.setupFee ? ` + $${pricing.setupFee} setup` : "";
    return `$${pricing.amount}/${pricing.type}${setupFee}`;
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

        {/* Pricing Information for Public Agents */}
        {agent.visibility === "public" && agent.pricing && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiDollarSign className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  Subscription
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {formatPrice(agent.pricing)}
                </div>
                {agent.pricing.trialDays && (
                  <div className="text-xs text-green-400">
                    Free trial available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                : isUserSubscribed(agent.id)
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {isOwned ? (
              <>
                <FiEye className="w-4 h-4 mr-2" />
                View Details
              </>
            ) : isUserSubscribed(agent.id) ? (
              <>
                <FiCheck className="w-4 h-4 mr-2" />
                Subscribed
              </>
            ) : (
              <>
                <FiCreditCard className="w-4 h-4 mr-2" />
                Subscribe
              </>
            )}
          </Button>

          <Button
            onClick={() => setSelectedAgent(agent)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            <FiEye className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  const renderPaymentModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCreditCard className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Subscribe to Agent
          </h3>
          <p className="text-gray-400">
            Subscribe to <strong>{selectedAgent?.name}</strong> and start
            receiving trading signals.
          </p>
        </div>

        {selectedAgent?.pricing && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium text-white mb-2">
              Pricing Details
            </h4>
            <div className="space-y-1 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Subscription:</span>
                <span>
                  ${selectedAgent.pricing.amount}/{selectedAgent.pricing.type}
                </span>
              </div>
              {selectedAgent.pricing.setupFee && (
                <div className="flex justify-between">
                  <span>Setup Fee:</span>
                  <span>${selectedAgent.pricing.setupFee}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-white">
                <span>Total:</span>
                <span>
                  $
                  {selectedAgent.pricing.amount +
                    (selectedAgent.pricing.setupFee || 0)}
                </span>
              </div>
              {selectedAgent.pricing.trialDays && (
                <div className="text-green-400 text-xs">
                  {selectedAgent.pricing.trialDays}-day free trial included
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Payment Method
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-3 bg-gray-800 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <FiCreditCard className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-white">Credit Card</span>
            </label>
            <label className="flex items-center p-3 bg-gray-800 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="crypto"
                checked={paymentMethod === "crypto"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <FiDollarSign className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-white">Cryptocurrency</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setShowPaymentModal(false)}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            className="flex-1 bg-white text-black hover:bg-gray-100"
          >
            <FiCreditCard className="w-4 h-4 mr-2" />
            Subscribe Now
          </Button>
        </div>
      </motion.div>
    </div>
  );

  const currentAgents = activeTab === "personal" ? userAgents : publicAgents;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Existing Agents</h1>
            <p className="text-gray-400">
              Discover and subscribe to AI trading agents
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-gray-900 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("personal")}
            className={`px-6 py-3 rounded-md flex items-center gap-2 transition-all duration-200 ${
              activeTab === "personal"
                ? "bg-white text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FiUsers className="w-4 h-4" />
            Personal Agents
          </button>
          <button
            onClick={() => setActiveTab("public")}
            className={`px-6 py-3 rounded-md flex items-center gap-2 transition-all duration-200 ${
              activeTab === "public"
                ? "bg-white text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FiGlobe className="w-4 h-4" />
            Public Agents
          </button>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {currentAgents.map((agent) =>
              renderAgentCard(agent, agent.userId === currentUser?.id),
            )}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {activeTab === "personal" && userAgents.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No Personal Agents
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't created any agents yet.
            </p>
            <Button
              onClick={() => router.push("/create-agent")}
              className="bg-white text-black hover:bg-gray-100"
            >
              Create Your First Agent
            </Button>
          </div>
        )}

        {activeTab === "public" && publicAgents.length === 0 && (
          <div className="text-center py-12">
            <FiGlobe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No Public Agents
            </h3>
            <p className="text-gray-500 mb-6">
              No public agents available at the moment.
            </p>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && renderPaymentModal()}
      </div>
    </div>
  );
};

export default ExistingAgents;
