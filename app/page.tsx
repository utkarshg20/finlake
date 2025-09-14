"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { motion } from "framer-motion";
import { FiPlus, FiUsers, FiZap, FiTool } from "react-icons/fi";
import { BoxesCore } from "@/components/Boxes";
import { JoinRoomDialog } from "@/components/JoinRoom";
import { LoadingScreen } from "@/components/LoadingScreen";
import Image from "next/image";

const Home = () => {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const createNewRoom = () => {
    setIsLoading(true);
    const roomId = nanoid(10);
    router.push(`/room/${roomId}`);
  };

  const features = [
    {
      icon: <FiZap className="w-6 h-6" />,
      text: "Lightning-fast AI processing",
    },
    { icon: <FiUsers className="w-6 h-6" />, text: "Leverage other's agents" },
    { icon: <FiTool className="w-6 h-6" />, text: "Create your custom AI agent" },
  ];

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
      {isLoading && <LoadingScreen />}
      <BoxesCore />
      <div className="text-center space-y-8 max-w-4xl mx-auto relative z-10 pointer-events-none">
        <motion.div
          className="flex flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Image src="/logo.png" alt="FinLake Logo" width={80} height={92} />
          <h1 className="text-6xl font-extrabold text-white">
            FinLake
          </h1>
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
            onClick={createNewRoom}
            className="bg-white hover:bg-gray-100 text-black px-8 py-6 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-white/20 flex items-center space-x-2 pointer-events-auto font-semibold"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create Agent</span>
          </Button>
          <Button
            onClick={() => setIsJoinDialogOpen(true)}
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
          Start building your AI agent workflow by creating a new room or
          joining an existing one
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
