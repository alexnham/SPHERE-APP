import { motion } from "framer-motion";
import { Shield, TrendingDown, Calendar, Wallet, Info } from "lucide-react";
import { calculateSafeToSpend } from "@/lib/mockData";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const SafeToSpendCard = () => {
  const { safeToSpend, breakdown } = calculateSafeToSpend();
  const healthPercent = Math.min(100, (safeToSpend / breakdown.liquidAvailable) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sphere-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">Safe to Spend</span>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[250px] text-sm" side="bottom" align="start">
              <p>
                This is what you can comfortably spend today without affecting upcoming bills or your safety buffer.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center cursor-help">
              <span className="text-success font-bold text-xs">{Math.round(healthPercent)}%</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="rounded-xl">
            <p>Buffer health: {Math.round(healthPercent)}% of available funds protected</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className=" mb-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-3xl font-bold text-foreground tracking-tight"
        >
          {formatCurrency(safeToSpend)}
        </motion.div>
      </div>

      <div className="space-y-0.5">
        <BreakdownItem
          icon={<Wallet className="w-3.5 h-3.5" />}
          label="Available"
          value={breakdown.liquidAvailable}
          type="positive"
        />
        <BreakdownItem
          icon={<TrendingDown className="w-3.5 h-3.5" />}
          label="Pending"
          value={-breakdown.pendingOutflows}
          type="pending"
        />
        <BreakdownItem
          icon={<Calendar className="w-3.5 h-3.5" />}
          label="Bills (7 days)"
          value={-breakdown.upcoming7dEssentials}
          type="committed"
        />
        <BreakdownItem
          icon={<Shield className="w-3.5 h-3.5" />}
          label="Buffer"
          value={-breakdown.userBuffer}
          type="buffer"
        />
      </div>
    </motion.div>
  );
};

interface BreakdownItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  type: "positive" | "pending" | "committed" | "buffer";
}

const BreakdownItem = ({ icon, label, value, type }: BreakdownItemProps) => {
  const colorMap = {
    positive: "text-foreground",
    pending: "text-sphere-pending",
    committed: "text-sphere-committed",
    buffer: "text-sphere-buffer",
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center">{icon}</div>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${colorMap[type]}`}>
        {value >= 0 ? "+" : ""}
        {formatCurrency(value)}
      </span>
    </div>
  );
};

export default SafeToSpendCard;
