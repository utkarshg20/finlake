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
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: {
    email: string;
    username: string;
    password: string;
    name: string;
    timezone: string;
  }) => Promise<User | null>;
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
  isUserSubscribed: (agentId: string) => boolean;

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
      const { isLoggedIn: savedIsLoggedIn, userId: savedUserId } =
        JSON.parse(savedLoginState);
      if (savedIsLoggedIn && savedUserId) {
        const user = db.getUserById(savedUserId);
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
    console.log("Dashboard data:", dashboardData);

    setUserAgents(agents);
    setPublicAgents(publicAgents);
    setUserSignals(signals);
    setDashboardData(dashboardData);
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<User | null> => {
    setIsLoading(true);

    try {
      console.log("Attempting login for email:", email);
      const user = db.authenticateUser(email, password);
      console.log("Login result:", user);

      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        loadUserData(user.id);

        // Save login state
        localStorage.setItem(
          "finlake-login",
          JSON.stringify({
            isLoggedIn: true,
            userId: user.id,
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

  const register = async (userData: {
    email: string;
    username: string;
    password: string;
    name: string;
    timezone: string;
  }): Promise<User | null> => {
    setIsLoading(true);

    try {
      const user = db.registerUser(userData);

      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        loadUserData(user.id);

        // Save login state
        localStorage.setItem(
          "finlake-login",
          JSON.stringify({
            isLoggedIn: true,
            userId: user.id,
          }),
        );
      }

      setIsLoading(false);
      return user;
    } catch (error) {
      console.error("Registration error:", error);
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
    if (!currentUser) {
      console.error("No current user found");
      return null;
    }

    try {
      console.log("Creating agent with data:", agentData);
      console.log("Current user ID:", currentUser.id);

      const agent = db.createAgent({
        ...agentData,
        userId: currentUser.id,
      });

      console.log("Created agent:", agent);

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

  // Add the isUserSubscribed function
  const isUserSubscribed = (agentId: string): boolean => {
    if (!currentUser) return false;
    return db.isUserSubscribed(currentUser.id, agentId);
  };

  const getPortfolioHistory = (userId: string, days: number = 30) => {
    return db.getPortfolioHistory(userId, days);
  };

  const value: AppContextType = {
    currentUser,
    isLoggedIn,
    login,
    register,
    logout,
    updateUser,
    userAgents,
    publicAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    subscribeToAgent,
    isUserSubscribed,
    signals: userSignals,
    createSignal,
    dashboardData,
    refreshDashboardData,
    isLoading,
    getPortfolioHistory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
