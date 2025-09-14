// Simple in-memory database with localStorage persistence
// This can be easily replaced with a real database like PostgreSQL, MongoDB, etc.

export interface User {
  id: string;
  email: string;
  username: string; // Add username field
  password: string; // Add password field (hashed)
  name: string;
  phone?: string;
  bio?: string;
  timezone: string;
  createdAt: string;
  lastLogin: string;
  authProvider: "email" | "google" | "github" | "discord"; // Add auth provider
  isEmailVerified: boolean; // Add email verification status
}

export interface Agent {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: "burst_rule" | "sentiment_rule";
  status: "active" | "paused";
  visibility: "private" | "public";
  createdAt: string;
  lastActive: string;
  performance: {
    totalSignals: number;
    successRate: number;
    avgReturn: number;
    totalSubscribers: number;
  };
  tags: string[];
  strategyPrompt: string;
  tradingLogicPrompt: string; // Add this new field
  parameters: any;
  riskSettings: any;
  pricing?: AgentPricing;
}

export interface Signal {
  id: string;
  agentId: string;
  userId: string;
  entity: string; // Changed from symbol to entity
  action: "buy" | "sell"; // Changed from side to action
  price: number;
  quantity: number;
  notional: number; // Added notional
  confidence: number; // Added confidence
  return: number; // Changed from pnl to return
  timestamp: string;
  status: "executed" | "pending" | "cancelled"; // Updated status values
  metadata?: any;
}

export interface Subscription {
  id: string;
  userId: string;
  agentId: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface PortfolioHistory {
  userId: string;
  date: string;
  value: number;
  dailyReturn: number;
  cumulativeReturn: number;
}

// Add pricing interface
export interface AgentPricing {
  subscriptionFee: number; // Monthly subscription fee in USD
  setupFee?: number; // One-time setup fee
  currency: string; // USD, EUR, etc.
  billingCycle: "monthly" | "yearly" | "one-time";
  trialDays?: number; // Free trial period
}

// Add subscription interface
export interface UserSubscription {
  id: string;
  userId: string;
  agentId: string;
  subscribedAt: string;
  expiresAt: string;
  status: "active" | "expired" | "cancelled";
  amountPaid: number;
  billingCycle: "monthly" | "yearly" | "one-time";
  nextBillingDate?: string;
  pricing?: AgentPricing; // Added pricing field
}

class Database {
  private users: User[] = [];
  private agents: Agent[] = [];
  private signals: Signal[] = [];
  private subscriptions: UserSubscription[] = [];
  private portfolioHistory: PortfolioHistory[] = [];

  constructor() {
    this.loadFromStorage();
    // Always ensure sample data exists for demo purposes
    this.ensureSampleData();
  }

  private loadFromStorage() {
    try {
      const usersData = localStorage.getItem("finlake-users");
      const agentsData = localStorage.getItem("finlake-agents");
      const signalsData = localStorage.getItem("finlake-signals");
      const subscriptionsData = localStorage.getItem("finlake-subscriptions");

      if (usersData) this.users = JSON.parse(usersData);
      if (agentsData) this.agents = JSON.parse(agentsData);
      if (signalsData) this.signals = JSON.parse(signalsData);
      if (subscriptionsData) this.subscriptions = JSON.parse(subscriptionsData);
    } catch (error) {
      console.error("Error loading data from storage:", error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem("finlake-users", JSON.stringify(this.users));
      localStorage.setItem("finlake-agents", JSON.stringify(this.agents));
      localStorage.setItem("finlake-signals", JSON.stringify(this.signals));
      localStorage.setItem(
        "finlake-subscriptions",
        JSON.stringify(this.subscriptions),
      );
    } catch (error) {
      console.error("Error saving data to storage:", error);
    }
  }

  // Add method to hash passwords
  private hashPassword(password: string): string {
    // In a real app, use bcrypt or similar
    // For demo purposes, we'll use a simple hash
    return btoa(password + "salt"); // Base64 encode with salt
  }

  // Add method to verify passwords
  private verifyPassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword;
  }

  // Add method to register new user
  registerUser(userData: {
    email: string;
    username: string;
    password: string;
    name: string;
    timezone: string;
  }): User | null {
    // Check if user already exists by email OR username
    const existingUser = this.users.find(
      (u) => u.email === userData.email || u.username === userData.username,
    );

    if (existingUser) {
      console.log("User already exists with email or username");
      return null;
    }

    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      username: userData.username,
      password: this.hashPassword(userData.password),
      name: userData.name,
      timezone: userData.timezone,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      authProvider: "email",
      isEmailVerified: false,
    };

    this.users.push(user);
    this.saveToStorage();
    return user;
  }

  // Add method to authenticate user
  authenticateUser(email: string, password: string): User | null {
    console.log("Attempting to authenticate:", email);
    console.log(
      "Current users in DB:",
      this.users.map((u) => ({ email: u.email, username: u.username })),
    );

    const user = this.users.find((u) => u.email === email);
    console.log("Found user:", user);

    if (
      user &&
      user.authProvider === "email" &&
      this.verifyPassword(password, user.password)
    ) {
      // Update last login
      user.lastLogin = new Date().toISOString();
      this.saveToStorage();
      console.log("Authentication successful for:", user.email);
      return user;
    }

    console.log("Authentication failed");
    return null;
  }

  // Add method to find user by username
  getUserByUsername(username: string): User | null {
    return this.users.find((user) => user.username === username) || null;
  }

  // Update sample data to include Aryan's account
  private initializeSampleData() {
    // Only initialize if no data exists
    if (this.users.length === 0) {
      // Create Aryan's account first
      const aryanUser: User = {
        id: "user_aryan_001",
        email: "aryan@gmail.com",
        username: "aryanp",
        password: this.hashPassword("aryan"),
        name: "Aryan",
        phone: "+1 (555) 123-4567",
        bio: "Professional algorithmic trader with 3+ years experience",
        timezone: "America/New_York",
        createdAt: "2024-01-01T00:00:00.000Z",
        lastLogin: new Date().toISOString(),
        authProvider: "email" as const,
        isEmailVerified: true,
      };

      // Create other sample users
      const sampleUsers = [
        aryanUser,
        {
          id: "user_sample_002",
          email: "jane.smith@example.com",
          username: "janesmith",
          password: this.hashPassword("password123"),
          name: "Jane Smith",
          phone: "+1 (555) 987-6543",
          bio: "Quantitative analyst specializing in crypto markets",
          timezone: "America/Los_Angeles",
          createdAt: "2024-01-02T00:00:00.000Z",
          lastLogin: new Date().toISOString(),
          authProvider: "email" as const,
          isEmailVerified: true,
        },
        {
          id: "user_sample_003",
          email: "alex.trader@example.com",
          username: "alextrader",
          password: this.hashPassword("password123"),
          name: "Alex Trader",
          phone: "+1 (555) 456-7890",
          bio: "Day trader focused on momentum strategies",
          timezone: "America/Chicago",
          createdAt: "2024-01-03T00:00:00.000Z",
          lastLogin: new Date().toISOString(),
          authProvider: "email" as const,
          isEmailVerified: true,
        },
        {
          id: "user_sample_004",
          email: "sarah.investor@example.com",
          username: "sarahinvestor",
          password: this.hashPassword("password123"),
          name: "Sarah Investor",
          phone: "+1 (555) 321-0987",
          bio: "Institutional investor with focus on ESG trading",
          timezone: "America/New_York",
          createdAt: "2024-01-04T00:00:00.000Z",
          lastLogin: new Date().toISOString(),
          authProvider: "email" as const,
          isEmailVerified: true,
        },
        {
          id: "user_sample_005",
          email: "mike.quant@example.com",
          username: "mikequant",
          password: this.hashPassword("password123"),
          name: "Mike Quant",
          phone: "+1 (555) 654-3210",
          bio: "Quantitative researcher and hedge fund manager",
          timezone: "America/New_York",
          createdAt: "2024-01-05T00:00:00.000Z",
          lastLogin: new Date().toISOString(),
          authProvider: "email" as const,
          isEmailVerified: true,
        },
      ];

      this.users = sampleUsers;

      // Create Aryan's private agents (2-3 months old)
      const aryanAgents: Agent[] = [
        {
          id: "agent_aryan_001",
          userId: "user_aryan_001",
          name: "Momentum Tracker Pro",
          description:
            "Advanced momentum-based trading strategy for equity markets",
          type: "burst_rule",
          status: "active",
          visibility: "private",
          createdAt: new Date(
            Date.now() - 90 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 3 months ago
          lastActive: new Date().toISOString(),
          tradingLogicPrompt:
            "Monitor equity market momentum using RSI and MACD indicators. Execute trades when momentum shifts align with volume spikes and market sentiment.",
          parameters: {
            entityScope: "equities",
            windowMinutes: 15,
            minBurstThreshold: 0.8,
            maxBurstThreshold: 1.2,
            cooldownMinutes: 30,
          },
          riskSettings: {
            perSignalNotional: 1000,
            maxSignalsPerHour: 4,
            cooldownPerEntity: 60,
            activeTradingHours: { start: "09:00", end: "16:00" },
            tradingDays: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
            ],
            statusOnCreate: "active",
          },
          performance: {
            totalSignals: 156,
            successRate: 78.2,
            avgReturn: 2.4,
            totalSubscribers: 0,
          },
          tags: ["equities", "momentum", "RSI", "MACD", "high-frequency"],
          pricing: null,
        },
        {
          id: "agent_aryan_002",
          userId: "user_aryan_001",
          name: "Sentiment Analyzer",
          description:
            "AI-powered sentiment analysis for news and social media trading signals",
          type: "sentiment_rule",
          status: "active",
          visibility: "private",
          createdAt: new Date(
            Date.now() - 60 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 2 months ago
          lastActive: new Date().toISOString(),
          tradingLogicPrompt:
            "Analyze news sentiment and social media buzz for major stocks. Execute trades based on sentiment shifts and volume confirmation.",
          parameters: {
            entityScope: "stocks",
            windowMinutes: 30,
            minAvgSentiment: 0.6,
            maxAvgSentiment: 0.9,
            cooldownMinutes: 45,
          },
          riskSettings: {
            perSignalNotional: 2000,
            maxSignalsPerHour: 2,
            cooldownPerEntity: 90,
            activeTradingHours: { start: "08:00", end: "18:00" },
            tradingDays: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
            ],
            statusOnCreate: "active",
          },
          performance: {
            totalSignals: 89,
            successRate: 71.9,
            avgReturn: 1.8,
            totalSubscribers: 0,
          },
          tags: ["sentiment", "news", "social-media", "AI", "stocks"],
          pricing: null,
        },
      ];

      // Create other sample agents
      const sampleAgents: Agent[] = [
        ...aryanAgents,
        {
          id: "agent_sample_001",
          userId: "user_sample_002",
          name: "Equity Arbitrage Bot",
          description:
            "Automated arbitrage trading across multiple equity exchanges",
          type: "burst_rule",
          status: "active",
          visibility: "public",
          createdAt: "2024-01-15T00:00:00.000Z",
          lastActive: new Date().toISOString(),
          tradingLogicPrompt:
            "Monitor price differences across exchanges and execute arbitrage trades when spreads exceed threshold.",
          parameters: {
            entityScope: "equities",
            windowMinutes: 5,
            minBurstThreshold: 0.5,
            maxBurstThreshold: 2.0,
            cooldownMinutes: 15,
          },
          riskSettings: {
            perSignalNotional: 500,
            maxSignalsPerHour: 8,
            cooldownPerEntity: 30,
            activeTradingHours: { start: "00:00", end: "23:59" },
            tradingDays: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
            statusOnCreate: "active",
          },
          performance: {
            totalSignals: 234,
            successRate: 85.5,
            avgReturn: 0.8,
            totalSubscribers: 12,
          },
          tags: ["arbitrage", "equities", "high-frequency", "automated"],
          pricing: {
            type: "monthly",
            amount: 5.0,
            currency: "USD",
            trialDays: 7,
          },
        },
        {
          id: "agent_sample_002",
          userId: "user_sample_003",
          name: "Momentum Master",
          description:
            "Advanced momentum trading strategy for volatile markets",
          type: "burst_rule",
          status: "active",
          visibility: "public",
          createdAt: "2024-02-01T00:00:00.000Z",
          lastActive: new Date().toISOString(),
          tradingLogicPrompt:
            "Identify momentum shifts in volatile markets using technical indicators and volume analysis.",
          parameters: {
            entityScope: "stocks",
            windowMinutes: 20,
            minBurstThreshold: 0.7,
            maxBurstThreshold: 1.5,
            cooldownMinutes: 40,
          },
          riskSettings: {
            perSignalNotional: 1500,
            maxSignalsPerHour: 3,
            cooldownPerEntity: 60,
            activeTradingHours: { start: "09:30", end: "16:00" },
            tradingDays: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
            ],
            statusOnCreate: "active",
          },
          performance: {
            totalSignals: 178,
            successRate: 72.5,
            avgReturn: 2.1,
            totalSubscribers: 8,
          },
          tags: ["momentum", "volatility", "technical-analysis", "stocks"],
          pricing: {
            type: "monthly",
            amount: 10.0,
            currency: "USD",
            trialDays: 14,
          },
        },
      ];

      this.agents = sampleAgents;

      // Create sample signals for Aryan's agents
      const aryanSignals: Signal[] = [
        // Signals for Momentum Tracker Pro (last 3 months)
        {
          id: "signal_aryan_001",
          agentId: "agent_aryan_001",
          userId: "user_aryan_001",
          entity: "AAPL",
          action: "buy",
          confidence: 0.85,
          price: 185.25,
          quantity: 5.4,
          notional: 1000,
          status: "executed",
          return: 2.3,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          metadata: {
            rsi: 35.2,
            macd: 0.8,
            volume: 1250000,
            momentum: 0.92,
          },
        },
        {
          id: "signal_aryan_002",
          agentId: "agent_aryan_001",
          userId: "user_aryan_001",
          entity: "MSFT",
          action: "sell",
          confidence: 0.78,
          price: 365.8,
          quantity: 2.73,
          notional: 1000,
          status: "executed",
          return: -1.2,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          metadata: {
            rsi: 68.5,
            macd: -0.3,
            volume: 890000,
            momentum: 0.65,
          },
        },
        {
          id: "signal_aryan_003",
          agentId: "agent_aryan_001",
          userId: "user_aryan_001",
          entity: "GOOGL",
          action: "buy",
          confidence: 0.82,
          price: 142.5,
          quantity: 7.02,
          notional: 1000,
          status: "executed",
          return: 3.1,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          metadata: {
            rsi: 28.9,
            macd: 1.2,
            volume: 2100000,
            momentum: 0.88,
          },
        },
        // Signals for Sentiment Analyzer (last 2 months)
        {
          id: "signal_aryan_004",
          agentId: "agent_aryan_002",
          userId: "user_aryan_001",
          entity: "AAPL",
          action: "buy",
          confidence: 0.76,
          price: 185.25,
          quantity: 5.4,
          notional: 2000,
          status: "executed",
          return: 1.8,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          metadata: {
            sentiment: 0.72,
            newsCount: 15,
            socialBuzz: 0.68,
            volume: 45000000,
          },
        },
        {
          id: "signal_aryan_005",
          agentId: "agent_aryan_002",
          userId: "user_aryan_001",
          entity: "TSLA",
          action: "sell",
          confidence: 0.71,
          price: 245.8,
          quantity: 8.14,
          notional: 2000,
          status: "executed",
          return: -0.9,
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          metadata: {
            sentiment: 0.45,
            newsCount: 8,
            socialBuzz: 0.52,
            volume: 32000000,
          },
        },
      ];

      this.signals = aryanSignals;

      // Create portfolio history for Aryan (last 3 months)
      const aryanPortfolioHistory = this.generatePortfolioHistory(
        "user_aryan_001",
        90,
      );
      this.portfolioHistory = aryanPortfolioHistory;

      // Create sample subscriptions
      const sampleSubscriptions: Subscription[] = [
        {
          id: "sub_001",
          userId: "user_sample_002",
          agentId: "agent_sample_001",
          status: "active",
          startDate: "2024-02-01T00:00:00.000Z",
          endDate: "2024-03-01T00:00:00.000Z",
          price: 99.99,
          currency: "USD",
        },
        {
          id: "sub_002",
          userId: "user_sample_003",
          agentId: "agent_sample_002",
          status: "active",
          startDate: "2024-02-15T00:00:00.000Z",
          endDate: "2024-03-15T00:00:00.000Z",
          price: 149.99,
          currency: "USD",
        },
      ];

      this.subscriptions = sampleSubscriptions;

      this.saveToStorage();
    }
  }

  // Update ensureSampleData to always reinitialize for now
  private ensureSampleData() {
    console.log("Ensuring sample data exists...");
    console.log("Current users count:", this.users.length);

    // For now, always reinitialize to ensure clean data
    this.clearAllDataAndReinitialize();
  }

  // Add method to clear all data and reinitialize
  clearAllDataAndReinitialize() {
    console.log("Clearing all data and reinitializing...");
    this.users = [];
    this.agents = [];
    this.signals = [];
    this.subscriptions = [];
    this.portfolioHistory = [];
    localStorage.clear();
    this.initializeSampleData();
    console.log("Data cleared and reinitialized");
  }

  // Generate portfolio history for Aryan with realistic data
  private generatePortfolioHistory(
    userId: string,
    days: number,
  ): PortfolioHistory[] {
    const history: PortfolioHistory[] = [];
    const startValue = 10000; // Starting with $10,000
    let currentValue = startValue;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Generate realistic daily returns with some volatility
      const baseReturn = 0.001; // 0.1% base daily return
      const volatility = 0.02; // 2% daily volatility
      const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
      const dailyReturn = baseReturn + volatility * randomFactor;

      currentValue = currentValue * (1 + dailyReturn);

      history.push({
        userId,
        date: date.toISOString().split("T")[0],
        value: Math.round(currentValue * 100) / 100,
        dailyReturn: Math.round(dailyReturn * 10000) / 100, // Convert to percentage
        cumulativeReturn:
          Math.round(((currentValue - startValue) / startValue) * 10000) / 100,
      });
    }

    return history;
  }

  // Add method to get portfolio history
  getPortfolioHistory(userId: string, days: number = 30) {
    return this.portfolioHistory
      .filter((h) => h.userId === userId)
      .slice(-days);
  }

  // User operations
  createUser(userData: Omit<User, "id" | "createdAt" | "lastLogin">): User {
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    this.users.push(user);
    this.saveToStorage();
    return user;
  }

  getUserByEmail(email: string): User | null {
    return this.users.find((user) => user.email === email) || null;
  }

  getUserById(id: string): User | null {
    return this.users.find((user) => user.id === id) || null;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.saveToStorage();
    return this.users[userIndex];
  }

  // Agent operations
  createAgent(
    agentData: Omit<Agent, "id" | "createdAt" | "lastActive" | "performance">,
  ): Agent {
    const agent: Agent = {
      ...agentData,
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      performance: {
        totalSignals: 0,
        successRate: 0,
        avgReturn: 0,
        totalSubscribers: 0,
      },
    };
    this.agents.push(agent);
    this.saveToStorage();
    return agent;
  }

  getAgentsByUserId(userId: string): Agent[] {
    return this.agents.filter((agent) => agent.userId === userId);
  }

  getPublicAgents(): Agent[] {
    return this.agents.filter((agent) => agent.visibility === "public");
  }

  getAgentById(id: string): Agent | null {
    return this.agents.find((agent) => agent.id === id) || null;
  }

  updateAgent(id: string, updates: Partial<Agent>): Agent | null {
    const agentIndex = this.agents.findIndex((agent) => agent.id === id);
    if (agentIndex === -1) return null;

    this.agents[agentIndex] = { ...this.agents[agentIndex], ...updates };
    this.saveToStorage();
    return this.agents[agentIndex];
  }

  deleteAgent(id: string): boolean {
    const agentIndex = this.agents.findIndex((agent) => agent.id === id);
    if (agentIndex === -1) return false;

    this.agents.splice(agentIndex, 1);
    // Also delete related signals and subscriptions
    this.signals = this.signals.filter((signal) => signal.agentId !== id);
    this.subscriptions = this.subscriptions.filter((sub) => sub.agentId !== id);
    this.saveToStorage();
    return true;
  }

  // Signal operations
  createSignal(signalData: Omit<Signal, "id" | "timestamp">): Signal {
    const signal: Signal = {
      ...signalData,
      id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    this.signals.push(signal);

    // Update agent performance
    this.updateAgentPerformance(signalData.agentId);

    this.saveToStorage();
    return signal;
  }

  getSignalsByUserId(userId: string): Signal[] {
    return this.signals.filter((signal) => signal.userId === userId);
  }

  getSignalsByAgentId(agentId: string): Signal[] {
    return this.signals.filter((signal) => signal.agentId === agentId);
  }

  updateSignal(id: string, updates: Partial<Signal>): Signal | null {
    const signalIndex = this.signals.findIndex((signal) => signal.id === id);
    if (signalIndex === -1) return null;

    this.signals[signalIndex] = { ...this.signals[signalIndex], ...updates };
    this.saveToStorage();
    return this.signals[signalIndex];
  }

  // Subscription operations
  createSubscription(userId: string, agentId: string): Subscription {
    const subscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      agentId,
      subscribedAt: new Date().toISOString(),
      isActive: true,
    };
    this.subscriptions.push(subscription);

    // Update agent subscriber count
    const agent = this.getAgentById(agentId);
    if (agent) {
      agent.performance.totalSubscribers++;
      this.updateAgent(agentId, { performance: agent.performance });
    }

    this.saveToStorage();
    return subscription;
  }

  getSubscriptionsByUserId(userId: string): Subscription[] {
    return this.subscriptions.filter(
      (sub) => sub.userId === userId && sub.isActive,
    );
  }

  // Add method to get user subscriptions
  getUserSubscriptions(userId: string): UserSubscription[] {
    return this.subscriptions.filter((sub) => sub.userId === userId);
  }

  // Add method to create subscription
  createSubscription(
    subscriptionData: Omit<UserSubscription, "id" | "subscribedAt">,
  ): UserSubscription | null {
    const subscription: UserSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subscribedAt: new Date().toISOString(),
      ...subscriptionData,
    };

    this.subscriptions.push(subscription);
    this.saveToStorage();
    return subscription;
  }

  // Add method to check if user is subscribed to agent
  isUserSubscribed(userId: string, agentId: string): boolean {
    const subscription = this.subscriptions.find(
      (sub) =>
        sub.userId === userId &&
        sub.agentId === agentId &&
        sub.status === "active",
    );
    return !!subscription;
  }

  // Add subscription method
  subscribeToAgent(userId: string, agentId: string): boolean {
    try {
      const subscriptions = this.getUserSubscriptions(userId);
      const existingSubscription = subscriptions.find(
        (sub) => sub.agentId === agentId,
      );

      if (existingSubscription) {
        console.log("User already subscribed to this agent");
        return true;
      }

      // Create new subscription
      const newSubscription: UserSubscription = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        agentId,
        status: "active",
        subscribedAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 30 days from now
        pricing: {
          subscriptionFee: 0, // Will be set based on agent pricing
          currency: "USD",
          billingCycle: "monthly",
        },
      };

      subscriptions.push(newSubscription);
      this.setUserSubscriptions(userId, subscriptions);

      console.log(`User ${userId} subscribed to agent ${agentId}`);
      return true;
    } catch (error) {
      console.error("Error subscribing to agent:", error);
      return false;
    }
  }

  // Helper methods
  private updateAgentPerformance(agentId: string) {
    const agent = this.getAgentById(agentId);
    if (!agent) return;

    const agentSignals = this.getSignalsByAgentId(agentId);
    const totalSignals = agentSignals.length;
    const successfulSignals = agentSignals.filter((s) => s.return > 0).length;
    const successRate =
      totalSignals > 0 ? (successfulSignals / totalSignals) * 100 : 0;
    const avgReturn =
      totalSignals > 0
        ? agentSignals.reduce((sum, s) => sum + s.return, 0) / totalSignals
        : 0;

    agent.performance = {
      ...agent.performance,
      totalSignals,
      successRate: Math.round(successRate * 10) / 10,
      avgReturn: Math.round(avgReturn * 100) / 100,
    };

    this.updateAgent(agentId, { performance: agent.performance });
  }

  // Analytics methods
  getDashboardData(userId: string) {
    const userAgents = this.getAgentsByUserId(userId);
    const userSignals = this.getSignalsByUserId(userId);

    const totalValue = 100000; // This would come from portfolio data
    const todaySignals = userSignals.filter((s) => {
      const signalDate = new Date(s.timestamp);
      const today = new Date();
      return signalDate.toDateString() === today.toDateString();
    });

    const todayPnL = todaySignals.reduce((sum, s) => sum + s.return, 0);
    const totalPnL = userSignals.reduce((sum, s) => sum + s.return, 0);

    return {
      portfolio: {
        totalValue,
        dailyChange: todayPnL,
        dailyChangePercent: totalValue > 0 ? (todayPnL / totalValue) * 100 : 0,
        totalReturn: totalPnL,
        totalReturnPercent: totalValue > 0 ? (totalPnL / totalValue) * 100 : 0,
      },
      agents: {
        total: userAgents.length,
        active: userAgents.filter((a) => a.status === "active").length,
        paused: userAgents.filter((a) => a.status === "paused").length,
        totalSignals: userSignals.length,
        successRate:
          userSignals.length > 0
            ? Math.round(
                (userSignals.filter((s) => s.return > 0).length /
                  userSignals.length) *
                  100 *
                  10,
              ) / 10
            : 0,
      },
      recentSignals: userSignals
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 10),
      agentPerformance: userAgents.map((agent) => ({
        name: agent.name,
        signals: agent.performance.totalSignals,
        successRate: agent.performance.successRate,
        pnl: agent.performance.avgReturn * agent.performance.totalSignals,
        status: agent.status,
      })),
    };
  }
}

// Export singleton instance
export const db = new Database();

// Expose to window for debugging
if (typeof window !== "undefined") {
  (window as any).db = db;
}
