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
  isUserSubscribed: (agentId: string) => Promise<boolean>;

  // Signal state
  signals: Signal[];
  createSignal: (
    signalData: Omit<Signal, "id" | "timestamp">,
  ) => Promise<Signal | null>;

  // Portfolio state
  getPortfolioHistory: (
    userId: string,
    days?: number,
  ) => Promise<PortfolioHistory[]>;

  // Dashboard state
  dashboardData: any;
  refreshDashboardData: () => void;

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
    const loadUser = async () => {
      const savedLoginState = localStorage.getItem("finlake-login");
      if (savedLoginState) {
        const { isLoggedIn: savedIsLoggedIn, userId: savedUserId } =
          JSON.parse(savedLoginState);
        if (savedIsLoggedIn && savedUserId) {
          const user = await db.getUserById(savedUserId);
          if (user) {
            setCurrentUser(user);
            setIsLoggedIn(true);
            loadUserData(user.id);
          }
        }
      }
    };
    loadUser();
  }, []);

  const loadUserData = async (userId: string) => {
    console.log("Loading data for user ID:", userId);
    const agents = await db.getAgentsByUserId(userId);
    const signals = await db.getSignalsByUserId(userId);
    const allAgents = await db.getAgents();
    const publicAgents = allAgents.filter(
      (agent) => agent.visibility === "public",
    );
    const dashboardData = await db.getDashboardData(userId);

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

      // Add a 2-3 second delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const user = await db.authenticateUser(email, password);
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
      // First, create user in local database
      const user = await db.registerUser(userData);

      if (user) {
        // Then, create user in Supabase
        try {
          console.log("Creating user in Supabase...");
          const supabaseResponse = await fetch("/api/create-user-on-register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: userData.email,
              username: userData.username,
              // Removed name field since it doesn't exist in the table
            }),
          });

          if (supabaseResponse.ok) {
            const supabaseData = await supabaseResponse.json();
            console.log("User created in Supabase:", supabaseData);
          } else {
            const errorText = await supabaseResponse.text();
            console.error("Failed to create user in Supabase:", errorText);
            // Don't fail registration if Supabase creation fails
          }
        } catch (supabaseError) {
          console.error("Supabase user creation error:", supabaseError);
          // Don't fail registration if Supabase creation fails
        }

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
      // Note: updateUser method doesn't exist in database, so we'll skip this for now
      // const updatedUser = db.updateUser(currentUser.id, updates);
      // if (updatedUser) {
      //   setCurrentUser(updatedUser);
      //   return true;
      // }
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

      const agent = await db.createAgent({
        ...agentData,
        userId: currentUser.id,
      });

      console.log("Created agent:", agent);

      if (agent) {
        setUserAgents((prev) => [...prev, agent]);
        refreshDashboardData();
      }

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
      const success = await db.updateAgent(id, updates);
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
      const success = await db.deleteAgent(id);
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
      const signal = await db.createSignal(signalData);
      if (signal) {
        setUserSignals((prev) => [...prev, signal]);
        refreshDashboardData();
      }
      return signal;
    } catch (error) {
      console.error("Create signal error:", error);
      return null;
    }
  };

  const refreshDashboardData = async () => {
    if (currentUser) {
      const data = await db.getDashboardData(currentUser.id);
      setDashboardData(data);
    }
  };

  const subscribeToAgent = async (agentId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const success = await db.subscribeToAgent(currentUser.id, agentId);
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

  const isUserSubscribed = async (agentId: string): Promise<boolean> => {
    if (!currentUser) return false;
    return await db.isUserSubscribed(currentUser.id, agentId);
  };

  const getPortfolioHistory = async (
    userId: string,
    days: number = 30,
  ): Promise<PortfolioHistory[]> => {
    return await db.getPortfolioHistory(userId, days);
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
