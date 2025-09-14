"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiUsers,
  FiZap,
  FiTool,
  FiUser,
  FiLogIn,
  FiUserPlus,
  FiChevronDown,
  FiSettings,
  FiBarChart,
  FiShield,
  FiLogOut,
} from "react-icons/fi";
import { BoxesCore } from "@/components/Boxes";
import { JoinRoomDialog } from "@/components/JoinRoom";
import { LoadingScreen } from "@/components/LoadingScreen";
import Image from "next/image";
import { useApp } from "@/contexts/AppContext";

const Home = () => {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const { currentUser, isLoggedIn, login, logout } = useApp();

  // Check for existing login on component mount
  useEffect(() => {
    // The login state is now managed by useApp, so we don't need to check localStorage here
    // unless we want to persist the login state across page refreshes for the main app flow.
    // For now, we'll rely on useApp's isLoggedIn.
  }, []);

  const createNewAgent = () => {
    setIsLoading(true);
    router.push("/create-agent");
  };

  const viewExistingAgents = () => {
    router.push("/existing-agents");
  };

  const handleLogin = async () => {
    // Auto login with a sample account that has pre-existing agents
    const sampleEmails = [
      "john.doe@example.com", // This should have pre-existing agents
      "jane.smith@example.com",
      "alex.trader@example.com",
      "sarah.investor@example.com",
      "mike.quant@example.com",
    ];
    const randomEmail =
      sampleEmails[Math.floor(Math.random() * sampleEmails.length)];

    const user = await login(randomEmail);
    if (user) {
      // Successfully logged in
    }
  };

  const handleSignUp = () => {
    // This would open signup modal or redirect to signup page
    console.log("Sign up clicked");
  };

  const handleLogout = () => {
    logout();
  };

  const handleMenuAction = (action: string) => {
    setIsUserMenuOpen(false);
    switch (action) {
      case "my-agents":
        router.push("/my-agents");
        break;
      case "dashboard":
        router.push("/dashboard");
        break;
      case "configuration":
        router.push("/configuration");
        break;
      case "billing":
        router.push("/billing");
        break;
      case "support":
        router.push("/support");
        break;
      default:
        break;
    }
  };

  const features = [
    {
      icon: <FiZap className="w-6 h-6" />,
      text: "Lightning-fast AI processing",
    },
    { icon: <FiUsers className="w-6 h-6" />, text: "Leverage existing agents" },
    {
      icon: <FiTool className="w-6 h-6" />,
      text: "Create your custom AI agent",
    },
  ];

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
      {isLoading && <LoadingScreen />}
      <BoxesCore />

      {/* Header with Auth Section */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="FinLake Logo" width={40} height={46} />
            <span className="text-2xl font-bold text-white">FinLake</span>
          </div>

          {/* Auth Section */}
          <div className="relative">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-all duration-200 border border-gray-600"
                >
                  <FiUser className="w-4 h-4" />
                  <span className="text-white">{currentUser?.email}</span>
                  <FiChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-30"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-gray-400 border-b border-gray-700 mb-2">
                        {currentUser?.email}
                      </div>

                      <button
                        onClick={() => handleMenuAction("my-agents")}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                      >
                        <FiUsers className="w-4 h-4" />
                        My Agents
                      </button>

                      <button
                        onClick={() => handleMenuAction("dashboard")}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                      >
                        <FiBarChart className="w-4 h-4" />
                        Dashboard
                      </button>

                      <button
                        onClick={() => handleMenuAction("configuration")}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                      >
                        <FiSettings className="w-4 h-4" />
                        Configuration
                      </button>

                      <button
                        onClick={() => handleMenuAction("billing")}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                      >
                        <FiShield className="w-4 h-4" />
                        Billing & Security
                      </button>

                      <button
                        onClick={() => handleMenuAction("support")}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                      >
                        <FiTool className="w-4 h-4" />
                        Support
                      </button>

                      <div className="border-t border-gray-700 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-md transition-colors"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <FiLogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button
                  onClick={handleSignUp}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <FiUserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center space-y-8 max-w-4xl mx-auto relative z-10 pointer-events-none">
        <motion.div
          className="flex flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Image src="/logo.png" alt="FinLake Logo" width={80} height={92} />
          <h1 className="text-6xl font-extrabold text-white">FinLake</h1>
        </motion.div>

        <motion.p
          className="text-gray-400 text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Create your own Agentic AI to automate trading!
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button
            onClick={createNewAgent}
            className="bg-white hover:bg-gray-100 text-black px-8 py-6 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-white/20 flex items-center space-x-2 pointer-events-auto font-semibold"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create Agent</span>
          </Button>
          <Button
            onClick={viewExistingAgents}
            className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-6 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-gray-600/20 flex items-center space-x-2 pointer-events-auto border border-gray-600"
          >
            <FiUsers className="w-5 h-5" />
            <span>Existing Agents</span>
          </Button>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-900 bg-opacity-60 p-6 rounded-lg backdrop-blur-sm flex flex-col items-start justify-center border border-gray-700 hover:border-gray-500 transition-all duration-300 pointer-events-auto"
            >
              <div className="text-white mb-4">{feature.icon}</div>
              <p className="text-gray-300">{feature.text}</p>
            </div>
          ))}
        </motion.div>

        <motion.p
          className="text-gray-500 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          Start trading by building your AI agent or simply using existing ones
        </motion.p>
      </div>
      <JoinRoomDialog
        isOpen={isJoinDialogOpen}
        onClose={() => setIsJoinDialogOpen(false)}
      />
    </div>
  );
};

export default Home;
