import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Map, Brain, Bell, BarChart3, Cpu, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/", label: "Home", icon: Activity },
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/map", label: "Lake Map", icon: Map },
  { path: "/predictions", label: "AI Predictions", icon: Brain },
  { path: "/alerts", label: "Alerts", icon: Bell },
  { path: "/devices", label: "Devices", icon: Cpu },
];

export default function AppNavbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel rounded-none border-x-0 border-t-0">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-foreground tracking-tight">AQUA-SENTINEL</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}

          <div className="ml-2 pl-2 border-l border-border flex items-center gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    ADMIN
                  </span>
                )}
                <span className="text-xs text-muted-foreground hidden lg:block max-w-[120px] truncate">
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-panel mx-4 mb-4 rounded-xl p-2"
        >
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {user ? (
            <button
              onClick={() => { signOut(); setMobileOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-primary"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </motion.div>
      )}
    </nav>
  );
}
