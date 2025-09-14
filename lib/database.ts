// Simple in-memory database with localStorage persistence
// This can be easily replaced with a real database like PostgreSQL, MongoDB, etc.

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  bio?: string;
  timezone: string;
  createdAt: string;
  lastLogin: string;
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
  configuration: {
    perSignalNotional: number;
    maxSignalsPerHour: number;
    cooldownPerEntity: number;
    activeHours: string;
    tradingDays: string[];
    // Burst rule specific
    entityScope?: "publisher" | "ticker";
    windowMinutes?: number;
    minBurst?: number;
    minAvgSentiment?: number;
    side?: "buy" | "sell";
    minMessages?: number;
    // Sentiment rule specific
    lookbackMinutes?: number;
    minHeadlines?: number;
    // Advanced settings
    credibilityWeight?: number;
    dedupCooldown?: number;
    maxCandidates?: number;
  };
  strategyPrompt: string;
  ruleJson: any;
}

export interface Signal {
  id: string;
  agentId: string;
  userId: string;
  symbol: string;
  side: "buy" | "sell";
  price: number;
  quantity: number;
  pnl: number;
  timestamp: string;
  status: "open" | "closed" | "pending";
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

class Database {
  private users: User[] = [];
  private agents: Agent[] = [];
  private signals: Signal[] = [];
  private subscriptions: Subscription[] = [];
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

  private initializeSampleData() {
    // Only initialize if no data exists
    if (this.users.length === 0) {
      // Create sample users
      const sampleUsers = [
        {
          id: "user_sample_001",
          email: "john.doe@example.com",
          name: "John Doe",
          phone: "+1 (555) 123-4567",
          bio: "Professional algorithmic trader with 5+ years experience",
          timezone: "America/New_York",
          createdAt: "2024-01-01T00:00:00.000Z",
          lastLogin: new Date().toISOString(),
        },
        {
          id: "user_sample_002",
          email: "jane.smith@example.com",
          name: "Jane Smith",
          phone: "+1 (555) 987-6543",
          bio: "Quantitative analyst specializing in crypto markets",
          timezone: "America/Los_Angeles",
          createdAt: "2024-01-02T00:00:00.000Z",
          lastLogin: new Date().toISOString(),
        },
        {
          id: "user_sample_003",
          email: "alex.trader@example.com",
          name: "Alex Trader",
          phone: "+1 (555) 456-7890",
          bio: "Day trader focused on momentum strategies",
          timezone: "America/Chicago",
          createdAt: "2024-01-03T00:00:00.000Z",
          lastLogin: new Date().toISOString(),
        },
        {
          id: "user_sample_004",
          email: "sarah.investor@example.com",
          name: "Sarah Investor",
          phone: "+1 (555) 321-0987",
          bio: "Institutional investor with focus on ESG trading",
          timezone: "America/New_York",
          createdAt: "2024-01-04T00:00:00.000Z",
          lastLogin: new Date().toISOString(),
        },
        {
          id: "user_sample_005",
          email: "mike.quant@example.com",
          name: "Mike Quant",
          phone: "+1 (555) 654-3210",
          bio: "Quantitative researcher and hedge fund manager",
          timezone: "America/New_York",
          createdAt: "2024-01-05T00:00:00.000Z",
          lastLogin: new Date().toISOString(),
        },
      ];

      this.users = sampleUsers;

      // Create comprehensive sample agents
      const sampleAgents = [
        // Private agent owned by user_sample_001 (John Doe) - Current User
        {
          id: "agent_user_private_001",
          userId: "user_sample_001",
          name: "Personal Momentum Scanner",
          description:
            "Private momentum scanner for personal trading strategies",
          type: "burst_rule" as const,
          status: "active" as const,
          visibility: "private" as const,
          createdAt: "2024-01-15T00:00:00.000Z",
          lastActive: new Date().toISOString(),
          performance: {
            totalSignals: 89,
            successRate: 82.1,
            avgReturn: 18.7,
            totalSubscribers: 0,
          },
          tags: ["momentum", "personal", "private", "equities"],
          strategyPrompt:
            "Buy when personal watchlist stocks show momentum with volume confirmation",
          parameters: {
            entityScope: "ticker" as const,
            windowMinutes: 20,
            minBurst: 2.5,
            minAvgSentiment: 0.4,
            side: "buy" as const,
            minMessages: 5,
            lookbackMinutes: 40,
            minHeadlines: 3,
            credibilityWeight: 0.8,
            dedupCooldown: 30,
            maxCandidates: 15,
          },
          riskSettings: {
            perSignalNotional: 2500,
            maxSignalsPerHour: 2,
            cooldownPerEntity: 60,
            activeHours: "09:30-16:00",
            tradingDays: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ],
          },
        },

        // Public agent owned by user_sample_001 (John Doe) - Current User
        {
          id: "agent_user_public_001",
          userId: "user_sample_001",
          name: "News Burst Pro",
          description:
            "Advanced news burst detection with sentiment analysis and risk management",
          type: "burst_rule" as const,
          status: "active" as const,
          visibility: "public" as const,
          createdAt: "2024-01-10T00:00:00.000Z",
          lastActive: new Date().toISOString(),
          performance: {
            totalSignals: 156,
            successRate: 85.3,
            avgReturn: 22.4,
            totalSubscribers: 34,
          },
          tags: ["news", "burst", "sentiment", "advanced", "pro"],
          strategyPrompt:
            "Buy when reputable publishers spike with positive sentiment for the last 30-60 minutes with risk-adjusted position sizing",
          parameters: {
            entityScope: "publisher" as const,
            windowMinutes: 30,
            minBurst: 3.0,
            minAvgSentiment: 0.2,
            side: "buy" as const,
            minMessages: 3,
            lookbackMinutes: 60,
            minHeadlines: 3,
            credibilityWeight: 0.7,
            dedupCooldown: 30,
            maxCandidates: 20,
          },
          riskSettings: {
            perSignalNotional: 1000,
            maxSignalsPerHour: 3,
            cooldownPerEntity: 60,
            activeHours: "09:30-16:00",
            tradingDays: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ],
          },
        },

        // Public agents owned by other users (existing ones)
        {
          id: "agent_sample_003",
          userId: "user_sample_002",
          name: "Crypto Sentiment Scanner",
          description:
            "Advanced sentiment analysis for cryptocurrency markets with social media integration",
          type: "sentiment_rule" as const,
          status: "active" as const,
          visibility: "public" as const,
          createdAt: "2024-01-10T00:00:00.000Z",
          lastActive: new Date().toISOString(),
          performance: {
            totalSignals: 156,
            successRate: 82.1,
            avgReturn: 15.6,
            totalSubscribers: 23,
          },
          tags: ["crypto", "sentiment", "social-media", "bitcoin"],
          strategyPrompt:
            "Buy when crypto sentiment from social media and news sources turns positive with high confidence",
          parameters: {
            entityScope: "ticker" as const,
            windowMinutes: 45,
            minBurst: 2.5,
            minAvgSentiment: 0.6,
            side: "buy" as const,
            minMessages: 10,
            lookbackMinutes: 90,
            minHeadlines: 8,
            credibilityWeight: 0.9,
            dedupCooldown: 45,
            maxCandidates: 25,
          },
          riskSettings: {
            perSignalNotional: 500,
            maxSignalsPerHour: 5,
            cooldownPerEntity: 30,
            activeHours: "00:00-23:59",
            tradingDays: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
          },
        },
        {
          id: "agent_sample_004",
          userId: "user_sample_002",
          name: "DeFi Yield Hunter",
          description:
            "Identifies high-yield DeFi opportunities with risk assessment",
          type: "burst_rule" as const,
          status: "active" as const,
          visibility: "public" as const,
          createdAt: "2024-01-12T00:00:00.000Z",
          lastActive: new Date().toISOString(),
          performance: {
            totalSignals: 89,
            successRate: 74.2,
            avgReturn: 22.3,
            totalSubscribers: 45,
          },
          tags: ["defi", "yield", "liquidity", "staking"],
          strategyPrompt:
            "Buy when new DeFi protocols launch with high APY and low risk scores",
          parameters: {
            entityScope: "ticker" as const,
            windowMinutes: 20,
            minBurst: 4.0,
            minAvgSentiment: 0.8,
            side: "buy" as const,
            minMessages: 5,
            lookbackMinutes: 40,
            minHeadlines: 3,
            credibilityWeight: 0.95,
            dedupCooldown: 15,
            maxCandidates: 10,
          },
          riskSettings: {
            perSignalNotional: 300,
            maxSignalsPerHour: 8,
            cooldownPerEntity: 20,
            activeHours: "00:00-23:59",
            tradingDays: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
          },
        },
      ];

      this.agents = sampleAgents;

      // Create historical portfolio data for user_sample_001 (John Doe)
      const portfolioHistory = this.generatePortfolioHistory(
        "user_sample_001",
        100000,
        30,
      );
      this.portfolioHistory = portfolioHistory;

      // Create sample signals for user's agents
      const sampleSignals = [
        // Signals for user's private agent
        {
          id: "signal_user_001",
          agentId: "agent_user_private_001",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          symbol: "AAPL",
          side: "buy" as const,
          notional: 2500,
          price: 175.5,
          rationale: "Momentum breakout with volume confirmation",
          confidence: 0.88,
          status: "executed" as const,
        },
        {
          id: "signal_user_002",
          agentId: "agent_user_private_001",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          symbol: "TSLA",
          side: "buy" as const,
          notional: 2500,
          price: 245.8,
          rationale: "Strong momentum with technical confirmation",
          confidence: 0.92,
          status: "executed" as const,
        },
        {
          id: "signal_user_003",
          agentId: "agent_user_private_001",
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          symbol: "NVDA",
          side: "sell" as const,
          notional: 2500,
          price: 485.2,
          rationale: "Momentum reversal detected",
          confidence: 0.75,
          status: "executed" as const,
        },
        // Signals for user's public agent
        {
          id: "signal_user_004",
          agentId: "agent_user_public_001",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          symbol: "MSFT",
          side: "buy" as const,
          notional: 1000,
          price: 378.9,
          rationale: "News burst with positive sentiment",
          confidence: 0.85,
          status: "executed" as const,
        },
        {
          id: "signal_user_005",
          agentId: "agent_user_public_001",
          timestamp: new Date(Date.now() - 5400000).toISOString(),
          symbol: "GOOGL",
          side: "buy" as const,
          notional: 1000,
          price: 142.3,
          rationale: "Earnings news burst with bullish sentiment",
          confidence: 0.91,
          status: "executed" as const,
        },
      ];

      this.signals = sampleSignals;

      // Save to localStorage
      this.saveToStorage();
    }
  }

  private ensureSampleData() {
    // Check if we have the sample users, if not, initialize sample data
    const hasSampleUsers = this.users.some(
      (user) => user.id === "user_sample_001",
    );
    if (!hasSampleUsers) {
      console.log("Initializing sample data...");
      this.initializeSampleData();
    } else {
      console.log("Sample data already exists");
    }
  }

  // Generate realistic portfolio history
  private generatePortfolioHistory(
    userId: string,
    initialValue: number,
    days: number,
  ) {
    const history = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let currentValue = initialValue;
    const dailyReturns = this.generateDailyReturns(days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Apply daily return with some volatility
      const dailyReturn = dailyReturns[i];
      currentValue = currentValue * (1 + dailyReturn);

      history.push({
        userId,
        date: date.toISOString().split("T")[0],
        value: Math.round(currentValue),
        dailyReturn: Math.round(dailyReturn * 10000) / 100, // Convert to percentage
        cumulativeReturn:
          Math.round(((currentValue - initialValue) / initialValue) * 10000) /
          100,
      });
    }

    return history;
  }

  // Generate realistic daily returns with some correlation
  private generateDailyReturns(days: number) {
    const returns = [];
    let trend = 0.0005; // Slight upward trend

    for (let i = 0; i < days; i++) {
      // Add some trend and mean reversion
      const randomFactor = (Math.random() - 0.5) * 0.04; // ±2% daily volatility
      const trendFactor = trend * (1 + Math.sin(i / 7) * 0.3); // Weekly cycles
      const returnValue = trendFactor + randomFactor;

      returns.push(returnValue);

      // Adjust trend slightly based on recent performance
      if (i > 5) {
        const recentAvg = returns.slice(-5).reduce((a, b) => a + b, 0) / 5;
        trend = trend * 0.95 + recentAvg * 0.05;
      }
    }

    return returns;
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

  // Helper methods
  private updateAgentPerformance(agentId: string) {
    const agent = this.getAgentById(agentId);
    if (!agent) return;

    const agentSignals = this.getSignalsByAgentId(agentId);
    const totalSignals = agentSignals.length;
    const successfulSignals = agentSignals.filter((s) => s.pnl > 0).length;
    const successRate =
      totalSignals > 0 ? (successfulSignals / totalSignals) * 100 : 0;
    const avgReturn =
      totalSignals > 0
        ? agentSignals.reduce((sum, s) => sum + s.pnl, 0) / totalSignals
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

    const todayPnL = todaySignals.reduce((sum, s) => sum + s.pnl, 0);
    const totalPnL = userSignals.reduce((sum, s) => sum + s.pnl, 0);

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
                (userSignals.filter((s) => s.pnl > 0).length /
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
