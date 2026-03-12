import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Activities from "./pages/Activities";
import Investigation from "./pages/Investigation";
import Settings from "./pages/Settings";
import LandingPage from "./pages/LandingPage";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Chatbot from "./components/Chatbot";

const ROUTE_ROLES = {
  "/": ["admin", "analyst"],
  "/alerts": ["admin", "analyst", "investigator"],
  "/activities": ["admin", "analyst"],
  "/investigation": ["admin", "analyst", "investigator"],
  "/settings": ["admin"],
};

const AppShell = ({ children }) => (
  <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#0a0e1a" }}>
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Topbar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
    <Chatbot />
  </div>
);

const ProtectedLayout = ({ children, path }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const allowed = ROUTE_ROLES[path] || [];
  if (!allowed.includes(user.role)) {
    return <Navigate to={user.role === "investigator" ? "/investigation" : "/"} replace />;
  }
  return <AppShell>{children}</AppShell>;
};

const HomeRoute = () => {
  const { user } = useAuth();
  if (!user) return <LandingPage />;
  if (user.role === "investigator") return <Navigate to="/investigation" replace />;
  return <AppShell><Dashboard /></AppShell>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ style: { background: "#1a2540", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }} />
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/alerts" element={<ProtectedLayout path="/alerts"><Alerts /></ProtectedLayout>} />
          <Route path="/activities" element={<ProtectedLayout path="/activities"><Activities /></ProtectedLayout>} />
          <Route path="/investigation" element={<ProtectedLayout path="/investigation"><Investigation /></ProtectedLayout>} />
          <Route path="/settings" element={<ProtectedLayout path="/settings"><Settings /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
