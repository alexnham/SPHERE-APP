import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/sphere/Header";
import { FloatingActionButton } from "@/components/sphere/FloatingActionButton";
import { LayoutDashboard, PieChart, Landmark, Wallet, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransferNotifications } from "@/hooks/useTransferNotifications";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/overview" },
  { icon: PieChart, label: "Spending", path: "/spending" },
  { icon: Landmark, label: "Debts", path: "/debts" },
  { icon: Wallet, label: "Accounts", path: "/accounts" },
  { icon: TrendingUp, label: "Invest", path: "/investments" },
];

const DashboardLayout = () => {
  // Subscribe to real-time transfer status updates
  useTransferNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col w-full bg-background overflow-x-hidden">
      {/* Header at top */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="flex items-center px-4 sm:px-6 h-14">
          <Header />
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-5 lg:px-8 pb-24 pt-4 overflow-x-hidden">
        <Outlet />

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Your data stays private • No judgment, just clarity •{" "}
            <button className="text-primary hover:underline">Why am I seeing this?</button>
          </p>
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border-t border-border/40">
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[48px]",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                <span className={cn("text-[10px] font-medium truncate", isActive && "font-semibold")}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;
