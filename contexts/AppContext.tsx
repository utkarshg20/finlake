"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { db, User, Agent, Signal } from "@/lib/database";

export interface PortfolioHistory {
  userId: string;
  date: string;
  value: number;
  dailyReturn: number;
  cumulativeReturn: number;
}

interface AppContextType {
  // User state
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (email: string, password?: string) => Promise<User | null>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<boolean>;

  // Agent state
  userAgents: Agent[];
  publicAgents: Agent[];
  createAgent: (
    agentData: Omit<Agent, "id" | "createdAt" | "lastActive" | "performance">,
  ) => Promise<Agent | null>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<boolean>;
  deleteAgent: (id: string) => Promise<boolean>;
  subscribeToAgent: (agentId: string) => Promise<boolean>;

  // Signal state
  signals: Signal[];
  createSignal: (
    signalData: Omit<Signal, "id" | "timestamp">,
  ) => Promise<Signal | null>;

  // Portfolio state
  getPortfolioHistory: (userId: string, days?: number) => PortfolioHistory[];

  // Loading state
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [publicAgents, setPublicAgents] = useState<Agent[]>([]);
  const [userSignals, setUserSignals] = useState<Signal[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedLoginState = localStorage.getItem("finlake-login");
    if (savedLoginState) {
      const { isLoggedIn: savedIsLoggedIn, userEmail: savedUserEmail } =
        JSON.parse(savedLoginState);
      if (savedIsLoggedIn && savedUserEmail) {
        const user = db.getUserByEmail(savedUserEmail);
        if (user) {
          setCurrentUser(user);
          setIsLoggedIn(true);
          loadUserData(user.id);
        }
      }
    }
  }, []);

  const loadUserData = (userId: string) => {
    console.log("Loading data for user ID:", userId);
    const agents = db.getAgentsByUserId(userId);
    const signals = db.getSignalsByUserId(userId);
    const publicAgents = db.getPublicAgents();
    const dashboardData = db.getDashboardData(userId);

    console.log("Found agents:", agents);
    console.log("Found signals:", signals);
    console.log("Found public agents:", publicAgents);

    setUserAgents(agents);
    setPublicAgents(publicAgents);
    setUserSignals(signals);
    setDashboardData(dashboardData);
  };

  const login = async (
    email: string,
    password?: string,
  ): Promise<User | null> => {
    setIsLoading(true);

    try {
      let user = db.getUserByEmail(email);
      console.log("Found user:", user);

      // If user doesn't exist, create a new one (for demo purposes)
      if (!user) {
        const randomNames = [
          "John Doe",
          "Jane Smith",
          "Alex Trader",
          "Sarah Investor",
          "Mike Quant",
          "Emma Analyst",
          "David Broker",
          "Lisa Manager",
          "Tom Strategist",
          "Amy Advisor",
        ];
        const randomName =
          randomNames[Math.floor(Math.random() * randomNames.length)];

        user = db.createUser({
          email,
          name: randomName,
          timezone: "America/New_York",
        });
        console.log("Created new user:", user);
      }

      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        console.log("Loading data for user ID:", user.id);
        loadUserData(user.id);

        // Save login state
        localStorage.setItem(
          "finlake-login",
          JSON.stringify({
            isLoggedIn: true,
            userEmail: email,
          }),
        );
      }

      setIsLoading(false);
      return user;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return null;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserAgents([]);
    setPublicAgents([]);
    setUserSignals([]);
    setDashboardData(null);

    localStorage.removeItem("finlake-login");
  };

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const updatedUser = db.updateUser(currentUser.id, updates);
      if (updatedUser) {
        setCurrentUser(updatedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update user error:", error);
      return false;
    }
  };

  const createAgent = async (
    agentData: Omit<Agent, "id" | "createdAt" | "lastActive" | "performance">,
  ): Promise<Agent | null> => {
    if (!currentUser) return null;

    try {
      const agent = db.createAgent({
        ...agentData,
        userId: currentUser.id,
      });

      setUserAgents((prev) => [...prev, agent]);
      refreshDashboardData();

      return agent;
    } catch (error) {
      console.error("Create agent error:", error);
      return null;
    }
  };

  const updateAgent = async (
    id: string,
    updates: Partial<Agent>,
  ): Promise<boolean> => {
    try {
      const success = db.updateAgent(id, updates);
      if (success) {
        setUserAgents((prev) =>
          prev.map((agent) =>
            agent.id === id ? { ...agent, ...updates } : agent,
          ),
        );
        refreshDashboardData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update agent error:", error);
      return false;
    }
  };

  const deleteAgent = async (id: string): Promise<boolean> => {
    try {
      const success = db.deleteAgent(id);
      if (success) {
        setUserAgents((prev) => prev.filter((agent) => agent.id !== id));
        refreshDashboardData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Delete agent error:", error);
      return false;
    }
  };

  const createSignal = async (
    signalData: Omit<Signal, "id" | "timestamp">,
  ): Promise<Signal | null> => {
    try {
      const signal = db.createSignal(signalData);
      setUserSignals((prev) => [...prev, signal]);
      refreshDashboardData();
      return signal;
    } catch (error) {
      console.error("Create signal error:", error);
      return null;
    }
  };

  const refreshDashboardData = () => {
    if (currentUser) {
      const data = db.getDashboardData(currentUser.id);
      setDashboardData(data);
    }
  };

  const subscribeToAgent = async (agentId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const success = db.subscribeToAgent(currentUser.id, agentId);
      if (success) {
        setUserAgents((prev) =>
          prev.map((agent) =>
            agent.id === agentId
              ? {
                  ...agent,
                  performance: {
                    ...agent.performance,
                    totalSubscribers:
                      (agent.performance?.totalSubscribers || 0) + 1,
                  },
                }
              : agent,
          ),
        );
        refreshDashboardData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Subscribe to agent error:", error);
      return false;
    }
  };

  const getPortfolioHistory = (userId: string, days: number = 30) => {
    return db.getPortfolioHistory(userId, days);
  };

  const value: AppContextType = {
    currentUser,
    isLoggedIn,
    login,
    logout,
    updateUser,
    userAgents,
    publicAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    subscribeToAgent,
    userSignals,
    createSignal,
    dashboardData,
    refreshDashboardData,
    isLoading,
    getPortfolioHistory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
