import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  Activity,
  RefreshCw,
} from "lucide-react";
import StatCard from "../components/StatCard";
import {
  RiskDistributionChart,
  DepartmentChart,
} from "../components/RiskChart";
import FraudGraph from "../components/FraudGraph";
import Timeline from "../components/Timeline";
import LiveDemoMode from "../components/LiveDemoMode";
import api from "../services/api";

const FRAUD_NAMES = ["Marcus Thompson", "David Chen", "Lisa Rodriguez"];

const EMPTY_STATS = {
  totalEmployees: 0,
  totalAlerts: 0,
  highRiskUsers: 0,
  anomaliesToday: 0,
};

export default function Dashboard() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [deptStats, setDeptStats] = useState([]);
  const [riskDist, setRiskDist] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [liveAlert, setLiveAlert] = useState(null);
  const [usingLive, setUsingLive] = useState(false);

  const [backendError, setBackendError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = () => {
    setBackendError(null);
    setRefreshing(true);
    api
      .get("/api/activities/stats")
      .then(({ data }) => {
        if (data.success) {
          setStats(data.stats);
          setDeptStats(data.departmentStats);
          setRiskDist(data.riskDistribution);
          setTimeline(data.recentTimeline || []);
          setUsingLive(true);
        }
      })
      .catch((err) => {
        const status = err.response?.status;
        const msg =
          status === 401
            ? "Log in to see live data from the database."
            : "Start the backend (and MongoDB) to see live data.";
        setBackendError(msg);
      })
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const simulateFraud = () => {
    setSimulating(true);
    setTimeout(() => {
      const name = FRAUD_NAMES[Math.floor(Math.random() * FRAUD_NAMES.length)];
      const risk = Math.floor(Math.random() * 20) + 78;
      setSimulating(false);
      setLiveAlert({ name, risk, type: "Anomalous Bulk Download" });
      setTimeout(() => setLiveAlert(null), 5000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* Demo mode / connection notice */}
      {!usingLive && backendError && (
        <div
          style={{
            background: "rgba(251, 191, 36, 0.12)",
            border: "1px solid rgba(251, 191, 36, 0.4)",
            borderRadius: 12,
            padding: "12px 16px",
            color: "#fbbf24",
            fontSize: 13,
          }}
        >
          Log in and ensure the backend and MongoDB are running to see data. {backendError}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>
            Security Dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            {usingLive
              ? "Live data from MongoDB"
              : "Start backend and log in for live data"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={fetchStats}
              disabled={refreshing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 20px",
                borderRadius: 12,
                border: "1px solid rgba(96, 165, 250, 0.4)",
                background: "rgba(96, 165, 250, 0.12)",
                color: "#60a5fa",
                fontSize: 13,
                fontWeight: 600,
                cursor: refreshing ? "wait" : "pointer",
              }}
            >
              <RefreshCw size={14} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
              {refreshing ? "Refreshing..." : "Refresh data"}
            </button>
          <LiveDemoMode />
          <button
            onClick={simulateFraud}
            disabled={simulating}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 20px",
              borderRadius: 12,
              border: "1px solid rgba(239,68,68,0.3)",
              background: simulating
                ? "rgba(239,68,68,0.1)"
                : "rgba(239,68,68,0.15)",
              color: "#f87171",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                display: "inline-block",
                animation: simulating ? "spin 1s linear infinite" : "none",
              }}
            >
              <RefreshCw size={14} />
            </span>
            {simulating ? "Simulating..." : "Simulate Fraud"}
          </button>
        </div>
      </div>

      {/* Live Alert Banner */}
      <AnimatePresence>
        {liveAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 14,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <AlertTriangle size={18} style={{ color: "#ef4444" }} />
            <div style={{ flex: 1 }}>
              <span style={{ color: "#fff", fontWeight: 600 }}>
                🚨 LIVE ALERT —{" "}
              </span>
              <span style={{ color: "#fca5a5" }}>
                {liveAlert.name} • {liveAlert.type} • Risk: {liveAlert.risk}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        <StatCard
          title="Employees Monitored"
          value={stats.totalEmployees}
          icon={Users}
          color="blue"
          change={2}
          delay={0}
        />
        <StatCard
          title="Total Alerts"
          value={stats.totalAlerts}
          icon={AlertTriangle}
          color="red"
          change={12}
          delay={0.1}
        />
        <StatCard
          title="High Risk Users"
          value={stats.highRiskUsers}
          icon={ShieldAlert}
          color="orange"
          change={5}
          delay={0.2}
        />
        <StatCard
          title="Anomalies Today"
          value={stats.anomaliesToday}
          icon={Activity}
          color="purple"
          change={-8}
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <RiskDistributionChart data={riskDist} />
        <DepartmentChart data={deptStats} />
      </div>

      {/* Timeline + Graph Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}>
            Anomaly Timeline
          </h3>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}>
            Recent suspicious events
          </p>
          {usingLive && (
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 16 }}>
              Added data in MongoDB? Click &quot;Refresh data&quot; above to see it here.
            </p>
          )}
          <Timeline events={timeline} />
        </div>
        <FraudGraph />
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
