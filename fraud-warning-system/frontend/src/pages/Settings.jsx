import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Database,
  Brain,
  Save,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const [settings, setSettings] = useState({
    alertThreshold: 70,
    enableRealTimeAlerts: true,
    mlModel: "isolation_forest",
    monitoredSystems: ["Core Banking", "CRM", "Admin Console"],
    alertRecipients: "fraud-team@bank.com",
    retentionDays: 90,
    sensitivity: "high",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Settings saved successfully");
    setSaving(false);
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-400" />
        </div>
        <h2 className="text-white font-semibold">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-blue-500" : ""}`}
        style={{ background: value ? "#3b82f6" : "rgba(26,37,64,0.9)" }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value ? "translate-x-5" : ""}`}
        />
      </button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure FraudWatch AI detection parameters
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Save size={14} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid gap-6">
        {/* Detection Settings */}
        <Section icon={Brain} title="ML Detection Settings">
          <div>
            <label className="text-slate-400 text-sm mb-2 block">
              Alert Risk Threshold:{" "}
              <span className="text-blue-400 font-bold">
                {settings.alertThreshold}%
              </span>
            </label>
            <input
              type="range"
              min={20}
              max={95}
              step={5}
              value={settings.alertThreshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  alertThreshold: Number(e.target.value),
                })
              }
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>20% (More Alerts)</span>
              <span>95% (Fewer Alerts)</span>
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-sm mb-2 block">
              Detection Sensitivity
            </label>
            <div className="flex gap-2">
              {["low", "medium", "high"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSettings({ ...settings, sensitivity: s })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border capitalize transition-colors ${
                    settings.sensitivity === s
                      ? "bg-blue-500/30 text-blue-300 border-blue-500/40"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-sm mb-2 block">
              ML Algorithm
            </label>
            <select
              value={settings.mlModel}
              onChange={(e) =>
                setSettings({ ...settings, mlModel: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 text-sm"
            >
              <option value="isolation_forest">
                Isolation Forest (Recommended)
              </option>
              <option value="autoencoder">Autoencoder Neural Network</option>
              <option value="one_class_svm">One-Class SVM</option>
              <option value="lof">Local Outlier Factor (LOF)</option>
            </select>
          </div>
        </Section>

        {/* Alert Settings */}
        <Section icon={Bell} title="Alert & Notification Settings">
          <Toggle
            label="Real-Time Alerts"
            desc="Push alerts immediately when anomaly is detected"
            value={settings.enableRealTimeAlerts}
            onChange={(v) =>
              setSettings({ ...settings, enableRealTimeAlerts: v })
            }
          />
          <Toggle
            label="Email Notifications"
            desc="Send email alerts to fraud team"
            value={true}
            onChange={() => {}}
          />
          <Toggle
            label="SMS Alerts for Critical Events"
            desc="Send SMS for risk scores above 90%"
            value={false}
            onChange={() => {}}
          />
          <div>
            <label className="text-slate-400 text-sm mb-2 block">
              Alert Recipients
            </label>
            <input
              type="email"
              value={settings.alertRecipients}
              onChange={(e) =>
                setSettings({ ...settings, alertRecipients: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 text-sm"
            />
          </div>
        </Section>

        {/* Data Retention */}
        <Section icon={Database} title="Data & Compliance">
          <div>
            <label className="text-slate-400 text-sm mb-2 block">
              Data Retention Period:{" "}
              <span className="text-blue-400 font-bold">
                {settings.retentionDays} days
              </span>
            </label>
            <input
              type="range"
              min={30}
              max={365}
              step={30}
              value={settings.retentionDays}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  retentionDays: Number(e.target.value),
                })
              }
              className="w-full accent-blue-500"
            />
          </div>
          <Toggle
            label="Audit Log"
            desc="Enable comprehensive audit trail for all analyst actions"
            value={true}
            onChange={() => {}}
          />
          <Toggle
            label="GDPR Compliance Mode"
            desc="Anonymize PII data after investigation closure"
            value={false}
            onChange={() => {}}
          />
        </Section>

        {/* System Info */}
        <Section icon={Shield} title="System Information">
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "ML Service",
                value: "Isolation Forest v1.3",
                status: "active",
              },
              { label: "Database", value: "MongoDB 7.0", status: "active" },
              { label: "Socket.io", value: "Real-Time v4.6", status: "active" },
              {
                label: "API Server",
                value: "Express.js v4.18",
                status: "active",
              },
            ].map(({ label, value, status }) => (
              <div
                key={label}
                className="p-3 rounded-xl bg-white/5 flex items-center justify-between"
              >
                <div>
                  <p className="text-slate-500 text-xs">{label}</p>
                  <p className="text-white text-sm font-medium">{value}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
                  <span className="text-green-400 text-xs">Active</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </motion.div>
  );
}
