import { motion } from 'framer-motion';
import DebtDashboard from '@/components/sphere/DebtDashboard';
import { useViewMode } from '@/contexts/ViewModeContext';
import { mockLiabilities } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Debt type colors
const debtTypeColors: Record<string, string> = {
  credit_card: "hsl(var(--category-shopping))",
  student_loan: "hsl(var(--category-tech))",
  auto_loan: "hsl(var(--category-transport))",
  mortgage: "hsl(var(--category-groceries))",
  personal_loan: "hsl(var(--category-coffee))",
};

const Debts = () => {
  const { isSimpleView } = useViewMode();
  const navigate = useNavigate();
  const totalDebt = mockLiabilities.reduce((sum, l) => sum + l.currentBalance, 0);
  // Use statement balance as a proxy for credit limits/original amounts
  const totalLimit = mockLiabilities.reduce((sum, l) => sum + (l.statementBalance || l.currentBalance * 1.5), 0);
  const utilizationPercent = Math.min(100, (totalDebt / totalLimit) * 100);

  // Group by type for visualization
  const debtByType = mockLiabilities.reduce((acc, debt) => {
    acc[debt.type] = (acc[debt.type] || 0) + debt.currentBalance;
    return acc;
  }, {} as Record<string, number>);

  // Simple View
  if (isSimpleView) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-lg font-semibold text-foreground">Debts</h2>
        </motion.div>

        {/* Total Debt with semi-circle gauge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="sphere-card p-6 flex flex-col items-center"
        >
          <div className="relative w-48 h-24 mb-2">
            <svg className="w-full h-full" viewBox="0 0 100 50">
              {/* Background arc */}
              <path
                d="M 5 50 A 45 45 0 0 1 95 50"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Progress arc */}
              <motion.path
                d="M 5 50 A 45 45 0 0 1 95 50"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="141"
                initial={{ strokeDashoffset: 141 }}
                animate={{ strokeDashoffset: 141 - (141 * Math.min(utilizationPercent, 100) / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
              <p className="text-xs text-muted-foreground">{utilizationPercent.toFixed(0)}% utilized</p>
            </div>
          </div>
          
          <p className="text-3xl font-bold text-foreground mb-1">{formatCurrency(totalDebt)}</p>
          <p className="text-sm text-muted-foreground">Total Debt</p>
        </motion.div>

        {/* Debt Breakdown by Type */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="sphere-card p-5"
        >
          <p className="text-sm font-medium text-foreground mb-4">By Category</p>
          <div className="space-y-3">
            {Object.entries(debtByType).map(([type, amount], index) => {
              const percent = (amount / totalDebt) * 100;
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-sm font-medium text-foreground">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: debtTypeColors[type] || 'hsl(var(--primary))' }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  // Detailed View
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-foreground">Lenders & Debts</h2>
        <p className="text-sm text-muted-foreground">Manage your liabilities and payment schedules</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <DebtDashboard />
      </motion.div>
    </div>
  );
};

export default Debts;
