import { motion } from "framer-motion";
import AccountsOverview from "@/components/sphere/AccountsOverview";
import SavingsVaults from "@/components/sphere/SavingsVaults";
import TransferHistory from "@/components/sphere/TransferHistory";
import { useViewMode } from "@/contexts/ViewModeContext";
import { mockAccounts, calculateNetWorth } from "@/lib/mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Account type colors
const accountTypeColors: Record<string, string> = {
  checking: "hsl(var(--primary))",
  savings: "hsl(var(--category-groceries))",
  investment: "hsl(var(--category-shopping))",
};

const Accounts = () => {
  const { isSimpleView } = useViewMode();
  const { netWorth, assets, liabilities } = calculateNetWorth();

  // Calculate totals by account type for chart
  const accountsByType = mockAccounts.reduce((acc, account) => {
    acc[account.type] = (acc[account.type] || 0) + account.currentBalance;
    return acc;
  }, {} as Record<string, number>);

  const totalAssets = Object.values(accountsByType).reduce((sum, val) => sum + val, 0);

  // Simple View
  if (isSimpleView) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-lg font-semibold text-foreground">Your Accounts</h2>
        </motion.div>

        {/* Net Worth with visual breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="sphere-card p-6"
        >
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Net Worth</p>
            <p className="text-4xl font-bold text-foreground">{formatCurrency(netWorth)}</p>
          </div>

          {/* Assets vs Liabilities bar */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-success" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Assets</span>
                  <span className="text-sm font-medium text-foreground">{formatCurrency(assets)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-success"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Debts</span>
                  <span className="text-sm font-medium text-foreground">{formatCurrency(liabilities)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(liabilities / assets) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="h-full rounded-full bg-destructive"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account breakdown with colored indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="sphere-card p-5"
        >
          <p className="text-sm font-medium text-foreground mb-4">Account Breakdown</p>
          
          {/* Stacked bar visualization */}
          <div className="h-4 bg-muted rounded-full overflow-hidden flex mb-4">
            {Object.entries(accountsByType).map(([type, amount], index) => (
              <motion.div
                key={type}
                initial={{ width: 0 }}
                animate={{ width: `${(amount / totalAssets) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{ backgroundColor: accountTypeColors[type] || 'hsl(var(--primary))' }}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-2">
            {Object.entries(accountsByType).map(([type, amount]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: accountTypeColors[type] || 'hsl(var(--primary))' }}
                  />
                  <span className="text-sm text-muted-foreground capitalize">{type}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Detailed View
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-lg font-semibold text-foreground">Accounts & Banks</h2>
        <p className="text-sm text-muted-foreground">Your linked accounts and savings vaults</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <AccountsOverview />
        <SavingsVaults />
      </motion.div>
    </div>
  );
};

export default Accounts;
