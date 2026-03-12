import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, AlertCircle, Zap } from "lucide-react";

const QUICK_LOGINS = [
  { label: "Admin", user: "admin", pass: "admin123", color: "#3b82f6", desc: "Full access + Settings" },
  { label: "Analyst", user: "analyst", pass: "analyst123", color: "#8b5cf6", desc: "Alerts + Investigations" },
  { label: "Investigator", user: "investigator", pass: "invest123", color: "#22c55e", desc: "Cases only" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "admin", password: "admin123" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const u = await login(form.username, form.password);
      navigate(u.role === "investigator" ? "/investigation" : "/");
    } catch {
      setError("Invalid credentials. Try admin/admin123");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (user, pass) => {
    setLoading(true);
    try {
      const u = await login(user, pass);
      navigate(u.role === "investigator" ? "/investigation" : "/");
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Shield size={32} style={{ color: "#60a5fa" }} />
          </div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 700 }}>FraudWatch AI</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>Internal Fraud Detection</p>
        </div>
        <div className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Sign In</h2>
          {error && <div style={{ marginBottom: 16, padding: 12, borderRadius: 12, background: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: 13, display: "flex", gap: 8 }}><AlertCircle size={16} />{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ color: "#94a3b8", fontSize: 13, marginBottom: 6, display: "block" }}>Username</label>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ color: "#94a3b8", fontSize: 13, marginBottom: 6, display: "block" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 48px 12px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", background: "#3b82f6", border: "none", borderRadius: 12, padding: 14, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{loading ? "Authenticating..." : <><Zap size={16} /> Sign In</>}</button>
          </form>
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ color: "#475569", fontSize: 12, textAlign: "center", marginBottom: 12 }}>Quick Demo Login</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {QUICK_LOGINS.map(({ label, user, pass, color, desc }) => (
                <button key={user} onClick={() => quickLogin(user, pass)} style={{ padding: "10px 8px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: color + "30", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color }}>{label.charAt(0)}</div>
                  <p style={{ color: "#fff", fontSize: 11, fontWeight: 500 }}>{label}</p>
                  <p style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>{desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
