import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

export function RiskDistributionChart({ data = [] }) {
  // Handle both formats: { name, value } or { _id, count }
  const chartData = data.length && data[0].name ? data : (data.length ? data.map(d => ({ name: d._id + "-" + (d._id + 24) + "%", value: d.count })) : [
    { name: "Critical", value: 6 }, { name: "High", value: 12 }, { name: "Medium", value: 21 }, { name: "Low", value: 34 }
  ]);
  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}>Risk Score Distribution</h3>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Alert severity breakdown</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={3} strokeWidth={0}>
            {chartData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "#1a2540", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff" }} />
          <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DepartmentChart({ data = [] }) {
  // Handle both formats: { dept, avgRisk } or { _id, avgRisk }
  const chartData = data.length ? data.map(d => ({ dept: d.dept || d._id, avgRisk: d.avgRisk })) : [
    { dept: "Loans", avgRisk: 58 }, { dept: "IT Admin", avgRisk: 52 }, { dept: "Treasury", avgRisk: 49 }, { dept: "Compliance", avgRisk: 44 }, { dept: "Customer Svc", avgRisk: 28 }
  ];
  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}>Risk by Department</h3>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Average risk score per department</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barSize={32} layout="vertical">
          <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="dept" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
          <Tooltip contentStyle={{ background: "#1a2540", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff" }} />
          <Bar dataKey="avgRisk" radius={[0, 6, 6, 0]}>{chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function RiskChart({ data = [] }) { return <RiskDistributionChart data={data} />; }
