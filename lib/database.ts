// Simple in-memory database with localStorage persistence
// This can be easily replaced with a real database like PostgreSQL, MongoDB, etc.

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  name: string;
  phone?: string;
  bio?: string;
  timezone: string;
  createdAt: string;
  lastLogin: string;
  authProvider: "email" | "google" | "github" | "discord";
  isEmailVerified: boolean;
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
  tradingLogicPrompt: string;
  parameters: any;
  riskSettings: any;
  pricing?: AgentPricing;
}

export interface Signal {
  id: string;
  agentId: string;
  userId: string;
  entity: string;
  action: "buy" | "sell";
  price: number;
  quantity: number;
  notional: number;
  confidence: number;
  return: number;
  timestamp: string;
  status: "executed" | "pending" | "cancelled";
  metadata?: any;
}

export interface AgentPricing {
  subscriptionFee: number;
  setupFee?: number;
  currency: string;
  billingCycle: "monthly" | "yearly" | "one-time";
  trialDays?: number;
}

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
  pricing?: AgentPricing;
}

export interface PortfolioHistory {
  userId: string;
  date: string;
  value: number;
  dailyReturn: number;
  cumulativeReturn: number;
}

class Database {
  private users: User[] = [];
  private agents: Agent[] = [];
  private signals: Signal[] = [];
  private subscriptions: UserSubscription[] = [];
  private portfolioHistory: PortfolioHistory[] = [];

  constructor() {
    // Only initialize on client side
    if (typeof window !== "undefined") {
      this.loadFromStorage();
      this.ensureSampleData();
    } else {
      // On server side, just initialize with empty data
      this.initializeSampleData();
    }
  }

  private loadFromStorage() {
    try {
      const usersData = localStorage.getItem("finlake-users");
      const agentsData = localStorage.getItem("finlake-agents");
      const signalsData = localStorage.getItem("finlake-signals");
      const subscriptionsData = localStorage.getItem("finlake-subscriptions");
      const portfolioData = localStorage.getItem("finlake-portfolio");

      if (usersData) this.users = JSON.parse(usersData);
      if (agentsData) this.agents = JSON.parse(agentsData);
      if (signalsData) this.signals = JSON.parse(signalsData);
      if (subscriptionsData) this.subscriptions = JSON.parse(subscriptionsData);
      if (portfolioData) this.portfolioHistory = JSON.parse(portfolioData);
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
      localStorage.setItem(
        "finlake-portfolio",
        JSON.stringify(this.portfolioHistory),
      );
    } catch (error) {
      console.error("Error saving data to storage:", error);
    }
  }

  private ensureSampleData() {
    console.log("Ensuring sample data exists...");
    console.log("Current users count:", this.users.length);

    if (this.users.length === 0) {
      console.log("Clearing all data and reinitializing...");
      this.clearAllDataAndReinitialize();
    }
  }

  private clearAllDataAndReinitialize() {
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

  private initializeSampleData() {
    // Create sample users
    const sampleUsers: User[] = [
      {
        id: "user_aryan_001",
        email: "aryan@gmail.com",
        username: "aryanp",
        password: "aryan",
        name: "Aryan Patel",
        phone: "+1-555-0123",
        bio: "Professional trader and AI enthusiast",
        timezone: "America/New_York",
        createdAt: new Date(
          Date.now() - 90 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        lastLogin: new Date().toISOString(),
        authProvider: "email",
        isEmailVerified: true,
      },
      {
        id: "user_sample_002",
        email: "john@example.com",
        username: "johndoe",
        password: "password123",
        name: "John Doe",
        phone: "+1-555-0124",
        bio: "Day trader",
        timezone: "America/Los_Angeles",
        createdAt: "2024-01-01T00:00:00.000Z",
        lastLogin: new Date().toISOString(),
        authProvider: "email",
        isEmailVerified: true,
      },
      {
        id: "user_sample_003",
        email: "jane@example.com",
        username: "janesmith",
        password: "password456",
        name: "Jane Smith",
        phone: "+1-555-0125",
        bio: "Swing trader",
        timezone: "Europe/London",
        createdAt: "2024-01-15T00:00:00.000Z",
        lastLogin: new Date().toISOString(),
        authProvider: "email",
        isEmailVerified: true,
      },
    ];

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
        ).toISOString(),
        lastActive: new Date().toISOString(),
        strategyPrompt:
          "Monitor equity market momentum using RSI and MACD indicators. Execute trades when momentum shifts align with volume spikes and market sentiment.",
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
          tradingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          statusOnCreate: "active",
        },
        performance: {
          totalSignals: 156,
          successRate: 78.2,
          avgReturn: 2.4,
          totalSubscribers: 0,
        },
        tags: ["equities", "momentum", "RSI", "MACD", "high-frequency"],
        pricing: undefined,
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
        ).toISOString(),
        lastActive: new Date().toISOString(),
        strategyPrompt:
          "Analyze news sentiment and social media buzz for major stocks. Execute trades based on sentiment shifts and volume confirmation.",
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
          tradingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          statusOnCreate: "active",
        },
        performance: {
          totalSignals: 89,
          successRate: 71.9,
          avgReturn: 1.8,
          totalSubscribers: 0,
        },
        tags: ["sentiment", "news", "social-media", "AI", "stocks"],
        pricing: undefined,
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
        strategyPrompt:
          "Monitor price differences across exchanges and execute arbitrage trades when spreads exceed threshold.",
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
          subscriptionFee: 5.0,
          currency: "USD",
          billingCycle: "monthly",
          trialDays: 7,
        },
      },
      {
        id: "agent_sample_002",
        userId: "user_sample_003",
        name: "Momentum Master",
        description: "Advanced momentum trading strategy for volatile markets",
        type: "burst_rule",
        status: "active",
        visibility: "public",
        createdAt: "2024-02-01T00:00:00.000Z",
        lastActive: new Date().toISOString(),
        strategyPrompt:
          "Identify momentum shifts in volatile markets using technical indicators and volume analysis.",
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
          tradingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
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
          subscriptionFee: 10.0,
          currency: "USD",
          billingCycle: "monthly",
          trialDays: 14,
        },
      },
    ];

    // Create sample signals for Aryan's agents
    const aryanSignals: Signal[] = [
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
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
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
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
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
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          rsi: 28.9,
          macd: 1.2,
          volume: 2100000,
          momentum: 0.88,
        },
      },
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
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
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
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        metadata: {
          sentiment: 0.45,
          newsCount: 8,
          socialBuzz: 0.52,
          volume: 32000000,
        },
      },
    ];

    // Create sample subscriptions
    const sampleSubscriptions: UserSubscription[] = [
      {
        id: "sub_001",
        userId: "user_sample_002",
        agentId: "agent_sample_001",
        status: "active",
        subscribedAt: "2024-02-01T00:00:00.000Z",
        expiresAt: "2024-03-01T00:00:00.000Z",
        amountPaid: 99.99,
        billingCycle: "monthly",
        nextBillingDate: "2024-03-01T00:00:00.000Z",
      },
      {
        id: "sub_002",
        userId: "user_sample_003",
        agentId: "agent_sample_002",
        status: "active",
        subscribedAt: "2024-01-15T00:00:00.000Z",
        expiresAt: "2024-02-15T00:00:00.000Z",
        amountPaid: 199.99,
        billingCycle: "monthly",
        nextBillingDate: "2024-02-15T00:00:00.000Z",
      },
    ];

    // Generate portfolio history for Aryan (90 days)
    const portfolioHistory: PortfolioHistory[] = [];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    let currentValue = 10000;
    let cumulativeReturn = 0;

    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Simulate daily returns (-2% to +3%)
      const dailyReturn = (Math.random() - 0.4) * 0.05;
      currentValue *= 1 + dailyReturn;
      cumulativeReturn += dailyReturn;

      portfolioHistory.push({
        userId: "user_aryan_001",
        date: date.toISOString(),
        value: Math.round(currentValue * 100) / 100,
        dailyReturn: Math.round(dailyReturn * 10000) / 100,
        cumulativeReturn: Math.round(cumulativeReturn * 10000) / 100,
      });
    }

    // Store all data
    this.users = sampleUsers;
    this.agents = sampleAgents;
    this.signals = aryanSignals;
    this.subscriptions = sampleSubscriptions;
    this.portfolioHistory = portfolioHistory;

    this.saveToStorage();
    console.log("Sample data initialized");
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.users.find((user) => user.username === username) || null;
  }

  async registerUser(userData: {
    email: string;
    username: string;
    password: string;
    name: string;
    timezone: string;
  }): Promise<User | null> {
    try {
      // Check for duplicates
      const existingUser = this.users.find(
        (user) =>
          user.email === userData.email || user.username === userData.username,
      );

      if (existingUser) {
        console.log("User with this email or username already exists");
        return null;
      }

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email,
        username: userData.username,
        password: userData.password,
        name: userData.name,
        phone: "",
        bio: "",
        timezone: userData.timezone,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        authProvider: "email",
        isEmailVerified: false,
      };

      this.users.push(newUser);
      this.saveToStorage();
      return newUser;
    } catch (error) {
      console.error("Error registering user:", error);
      return null;
    }
  }

  async authenticateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = this.users.find(
      (user) => user.email === email && user.password === password,
    );

    if (user) {
      user.lastLogin = new Date().toISOString();
      this.saveToStorage();
    }

    return user || null;
  }

  // Agent operations
  async getAgents(): Promise<Agent[]> {
    return this.agents;
  }

  async getAgentById(id: string): Promise<Agent | null> {
    return this.agents.find((agent) => agent.id === id) || null;
  }

  async getAgentsByUserId(userId: string): Promise<Agent[]> {
    return this.agents.filter((agent) => agent.userId === userId);
  }

  async createAgent(
    agentData: Omit<Agent, "id" | "createdAt" | "lastActive" | "performance">,
  ): Promise<Agent | null> {
    try {
      const newAgent: Agent = {
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

      this.agents.push(newAgent);
      this.saveToStorage();
      return newAgent;
    } catch (error) {
      console.error("Error creating agent:", error);
      return null;
    }
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<boolean> {
    try {
      const agentIndex = this.agents.findIndex((agent) => agent.id === id);
      if (agentIndex === -1) return false;

      this.agents[agentIndex] = { ...this.agents[agentIndex], ...updates };
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error("Error updating agent:", error);
      return false;
    }
  }

  async deleteAgent(id: string): Promise<boolean> {
    try {
      const agentIndex = this.agents.findIndex((agent) => agent.id === id);
      if (agentIndex === -1) return false;

      this.agents.splice(agentIndex, 1);
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error("Error deleting agent:", error);
      return false;
    }
  }

  // Signal operations
  async getSignals(): Promise<Signal[]> {
    return this.signals;
  }

  async getSignalsByUserId(userId: string): Promise<Signal[]> {
    return this.signals.filter((signal) => signal.userId === userId);
  }

  async createSignal(
    signalData: Omit<Signal, "id" | "timestamp">,
  ): Promise<Signal | null> {
    try {
      const newSignal: Signal = {
        ...signalData,
        id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };

      this.signals.push(newSignal);
      this.saveToStorage();
      return newSignal;
    } catch (error) {
      console.error("Error creating signal:", error);
      return null;
    }
  }

  // Subscription operations
  async subscribeToAgent(userId: string, agentId: string): Promise<boolean> {
    try {
      const existingSubscription = this.subscriptions.find(
        (sub) => sub.userId === userId && sub.agentId === agentId,
      );

      if (existingSubscription) {
        console.log("User already subscribed to this agent");
        return true;
      }

      const newSubscription: UserSubscription = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        agentId,
        status: "active",
        subscribedAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        amountPaid: 0,
        billingCycle: "monthly",
        pricing: {
          subscriptionFee: 0,
          currency: "USD",
          billingCycle: "monthly",
        },
      };

      this.subscriptions.push(newSubscription);
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error("Error subscribing to agent:", error);
      return false;
    }
  }

  async isUserSubscribed(userId: string, agentId: string): Promise<boolean> {
    const subscription = this.subscriptions.find(
      (sub) =>
        sub.userId === userId &&
        sub.agentId === agentId &&
        sub.status === "active",
    );
    return !!subscription;
  }

  // Portfolio operations
  async getPortfolioHistory(
    userId: string,
    days: number = 30,
  ): Promise<PortfolioHistory[]> {
    return this.portfolioHistory.filter((entry) => entry.userId === userId);
  }

  // Dashboard data
  async getDashboardData(userId: string): Promise<any> {
    const userAgents = this.agents.filter((agent) => agent.userId === userId);
    const userSignals = this.signals.filter(
      (signal) => signal.userId === userId,
    );
    const portfolioHistory = this.portfolioHistory.filter(
      (entry) => entry.userId === userId,
    );

    return {
      userAgents,
      userSignals,
      portfolioHistory,
      totalSignals: userSignals.length,
      successRate:
        userSignals.length > 0
          ? (userSignals.filter((s) => s.return > 0).length /
              userSignals.length) *
            100
          : 0,
      totalSubscribers: userAgents.reduce(
        (sum, agent) => sum + agent.performance.totalSubscribers,
        0,
      ),
      publicAgents: userAgents.filter((agent) => agent.visibility === "public")
        .length,
    };
  }
}

// Create and export a singleton instance
export const db = new Database();
