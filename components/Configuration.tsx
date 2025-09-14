"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiSave,
  FiUser,
  FiShield,
  FiBell,
  FiTrendingUp,
  FiGlobe,
  FiCreditCard,
  FiDownload,
  FiEye,
  FiEyeOff,
  FiCheck,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

const Configuration = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Form states
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Professional algorithmic trader with 5+ years experience",
    timezone: "America/New_York",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    apiKey: "sk-1234567890abcdef",
    showApiKey: false,
  });

  const [tradingData, setTradingData] = useState({
    defaultPositionSize: 1000,
    maxDailyLoss: 5000,
    riskTolerance: "medium",
    tradingHours: "09:30-16:00",
    timezone: "America/New_York",
    broker: "interactive_brokers",
    accountType: "paper",
  });

  const [notificationData, setNotificationData] = useState({
    emailAlerts: true,
    pushNotifications: true,
    signalAlerts: true,
    errorAlerts: true,
    dailyReports: true,
    weeklyReports: false,
    alertFrequency: "immediate",
  });

  const [agentData, setAgentData] = useState({
    defaultVisibility: "private",
    autoBacktest: true,
    maxConcurrentAgents: 10,
    dataRetentionDays: 365,
    riskManagement: "strict",
  });

  const [platformData, setPlatformData] = useState({
    theme: "dark",
    language: "en",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    autoRefresh: true,
    refreshInterval: 30,
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "security", label: "Security", icon: FiShield },
    { id: "trading", label: "Trading", icon: FiTrendingUp },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "agents", label: "Agents", icon: FiGlobe },
    { id: "platform", label: "Platform", icon: FiGlobe },
  ];

  const handleSave = () => {
    setIsLoading(true);
    // Simulate save operation
    setTimeout(() => {
      setIsLoading(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  const generateNewApiKey = () => {
    const newKey =
      "sk-" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    setSecurityData((prev) => ({ ...prev, apiKey: newKey }));
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <Input
              value={profileData.name}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <Input
              value={profileData.email}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone
            </label>
            <Input
              value={profileData.phone}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={profileData.timezone}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  timezone: e.target.value,
                }))
              }
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bio
          </label>
          <Textarea
            value={profileData.bio}
            onChange={(e) =>
              setProfileData((prev) => ({ ...prev, bio: e.target.value }))
            }
            className="bg-gray-800 border-gray-600 text-white"
            rows={3}
          />
        </div>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Password & Security
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={securityData.currentPassword}
                onChange={(e) =>
                  setSecurityData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="bg-gray-800 border-gray-600 text-white pr-10"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <Input
              type="password"
              value={securityData.newPassword}
              onChange={(e) =>
                setSecurityData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={securityData.confirmPassword}
              onChange={(e) =>
                setSecurityData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="twoFactor"
              checked={securityData.twoFactorEnabled}
              onChange={(e) =>
                setSecurityData((prev) => ({
                  ...prev,
                  twoFactorEnabled: e.target.checked,
                }))
              }
              className="mr-2"
            />
            <label htmlFor="twoFactor" className="text-sm text-gray-300">
              Enable Two-Factor Authentication
            </label>
          </div>
        </div>
      </Card>

      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Key</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your API Key
            </label>
            <div className="flex items-center gap-2">
              <Input
                type={securityData.showApiKey ? "text" : "password"}
                value={securityData.apiKey}
                readOnly
                className="bg-gray-800 border-gray-600 text-white font-mono"
              />
              <Button
                onClick={() =>
                  setSecurityData((prev) => ({
                    ...prev,
                    showApiKey: !prev.showApiKey,
                  }))
                }
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300"
              >
                {securityData.showApiKey ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={generateNewApiKey}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300"
              >
                Generate New
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Keep your API key secure. Don't share it publicly.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTradingTab = () => (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Trading Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Default Position Size ($)
            </label>
            <Input
              type="number"
              value={tradingData.defaultPositionSize}
              onChange={(e) =>
                setTradingData((prev) => ({
                  ...prev,
                  defaultPositionSize: parseInt(e.target.value),
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Daily Loss ($)
            </label>
            <Input
              type="number"
              value={tradingData.maxDailyLoss}
              onChange={(e) =>
                setTradingData((prev) => ({
                  ...prev,
                  maxDailyLoss: parseInt(e.target.value),
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Risk Tolerance
            </label>
            <select
              value={tradingData.riskTolerance}
              onChange={(e) =>
                setTradingData((prev) => ({
                  ...prev,
                  riskTolerance: e.target.value,
                }))
              }
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
            >
              <option value="conservative">Conservative</option>
              <option value="medium">Medium</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trading Hours
            </label>
            <Input
              value={tradingData.tradingHours}
              onChange={(e) =>
                setTradingData((prev) => ({
                  ...prev,
                  tradingHours: e.target.value,
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Broker
            </label>
            <select
              value={tradingData.broker}
              onChange={(e) =>
                setTradingData((prev) => ({ ...prev, broker: e.target.value }))
              }
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
            >
              <option value="interactive_brokers">Interactive Brokers</option>
              <option value="td_ameritrade">TD Ameritrade</option>
              <option value="etrade">E*TRADE</option>
              <option value="fidelity">Fidelity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Account Type
            </label>
            <select
              value={tradingData.accountType}
              onChange={(e) =>
                setTradingData((prev) => ({
                  ...prev,
                  accountType: e.target.value,
                }))
              }
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
            >
              <option value="paper">Paper Trading</option>
              <option value="live">Live Trading</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Email Alerts</div>
              <div className="text-xs text-gray-400">
                Receive notifications via email
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationData.emailAlerts}
              onChange={(e) =>
                setNotificationData((prev) => ({
                  ...prev,
                  emailAlerts: e.target.checked,
                }))
              }
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">
                Push Notifications
              </div>
              <div className="text-xs text-gray-400">
                Browser push notifications
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationData.pushNotifications}
              onChange={(e) =>
                setNotificationData((prev) => ({
                  ...prev,
                  pushNotifications: e.target.checked,
                }))
              }
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">
                Signal Alerts
              </div>
              <div className="text-xs text-gray-400">
                Notifications when agents generate signals
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationData.signalAlerts}
              onChange={(e) =>
                setNotificationData((prev) => ({
                  ...prev,
                  signalAlerts: e.target.checked,
                }))
              }
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Error Alerts</div>
              <div className="text-xs text-gray-400">
                Notifications for agent errors
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationData.errorAlerts}
              onChange={(e) =>
                setNotificationData((prev) => ({
                  ...prev,
                  errorAlerts: e.target.checked,
                }))
              }
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">
                Daily Reports
              </div>
              <div className="text-xs text-gray-400">
                Daily performance summaries
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationData.dailyReports}
              onChange={(e) =>
                setNotificationData((prev) => ({
                  ...prev,
                  dailyReports: e.target.checked,
                }))
              }
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">
                Weekly Reports
              </div>
              <div className="text-xs text-gray-400">
                Weekly performance summaries
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationData.weeklyReports}
              onChange={(e) =>
                setNotificationData((prev) => ({
                  ...prev,
                  weeklyReports: e.target.checked,
                }))
              }
              className="w-4 h-4"
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAgentsTab = () => (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Agent Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Default Visibility
            </label>
            <select
              value={agentData.defaultVisibility}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  defaultVisibility: e.target.value,
                }))
              }
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Concurrent Agents
            </label>
            <Input
              type="number"
              value={agentData.maxConcurrentAgents}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  maxConcurrentAgents: parseInt(e.target.value),
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Retention (Days)
            </label>
            <Input
              type="number"
              value={agentData.dataRetentionDays}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  dataRetentionDays: parseInt(e.target.value),
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Risk Management
            </label>
            <select
              value={agentData.riskManagement}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  riskManagement: e.target.value,
                }))
              }
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
            >
              <option value="strict">Strict</option>
              <option value="moderate">Moderate</option>
              <option value="loose">Loose</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoBacktest"
              checked={agentData.autoBacktest}
              onChange={(e) =>
                setAgentData((prev) => ({
                  ...prev,
                  autoBacktest: e.target.checked,
                }))
              }
              className="mr-2"
            />
            <label htmlFor="autoBacktest" className="text-sm text-gray-300">
              Auto-backtest new agents before activation
            </label>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPlatformTab = () => (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Platform Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={platformData.theme}
              onChange={(e) =>
                setPlatformData((prev) => ({ ...prev, theme: e.target.value }))
              }
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              value={platformData.language}
              onChange={(e) =>
                setPlatformData((prev) => ({
                  ...prev,
                  language: e.target.value,
                }))
              }
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={platformData.currency}
              onChange={(e) =>
                setPlatformData((prev) => ({
                  ...prev,
                  currency: e.target.value,
                }))
              }
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date Format
            </label>
            <select
              value={platformData.dateFormat}
              onChange={(e) =>
                setPlatformData((prev) => ({
                  ...prev,
                  dateFormat: e.target.value,
                }))
              }
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Refresh Interval (seconds)
            </label>
            <Input
              type="number"
              value={platformData.refreshInterval}
              onChange={(e) =>
                setPlatformData((prev) => ({
                  ...prev,
                  refreshInterval: parseInt(e.target.value),
                }))
              }
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={platformData.autoRefresh}
              onChange={(e) =>
                setPlatformData((prev) => ({
                  ...prev,
                  autoRefresh: e.target.checked,
                }))
              }
              className="mr-2"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-300">
              Enable auto-refresh
            </label>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderCurrentTab = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileTab();
      case "security":
        return renderSecurityTab();
      case "trading":
        return renderTradingTab();
      case "notifications":
        return renderNotificationsTab();
      case "agents":
        return renderAgentsTab();
      case "platform":
        return renderPlatformTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">Configuration</h1>
              <p className="text-gray-400">
                Manage your account and platform settings
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-white text-black hover:bg-gray-100"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-700 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                        activeTab === tab.id
                          ? "bg-white text-black"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentTab()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
