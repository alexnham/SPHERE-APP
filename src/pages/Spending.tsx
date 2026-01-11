import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, CheckCircle2, AlertCircle } from "lucide-react";
import SpendingInsights from "@/components/sphere/SpendingInsights";
import BudgetGoals from "@/components/sphere/BudgetGoals";
import SpendingCalendar from "@/components/sphere/SpendingCalendar";
import { useViewMode } from "@/contexts/ViewModeContext";
import { mockTransactions } from "@/lib/mockData";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Category colors for pie chart
const categoryColors: Record<string, string> = {
  Groceries: "hsl(var(--category-groceries))",
  Shopping: "hsl(var(--category-shopping))",
  Coffee: "hsl(var(--category-coffee))",
  Transport: "hsl(var(--category-transport))",
  Dining: "hsl(var(--category-dining))",
  Gas: "hsl(var(--category-gas))",
  Health: "hsl(var(--category-health))",
  Tech: "hsl(var(--category-tech))",
};

const Spending = () => {
  const { isSimpleView } = useViewMode();

  // Calculate simple summary data
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyTransactions = mockTransactions.filter(t => t.date >= startOfMonth && t.amount < 0);
  const monthlySpending = monthlyTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Category breakdown for simple view
  const categorySpending = monthlyTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    return acc;
  }, {} as Record<string, number>);
  
  const topCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);
  
  const totalBudget = 1700;
  const budgetRemaining = totalBudget - monthlySpending;
  const isOnTrack = budgetRemaining > 0;
  const progressPercent = Math.min(100, (monthlySpending / totalBudget) * 100);

  // Simple View
  if (isSimpleView) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-lg font-semibold text-foreground">Spending & Budgets</h2>
        </motion.div>

        {/* Circular Progress with spending */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="sphere-card p-6 flex flex-col items-center"
        >
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={isOnTrack ? "hsl(var(--primary))" : "hsl(var(--warning))"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={264}
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 264 - (264 * progressPercent / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-foreground">{progressPercent.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">of budget</p>
            </div>
          </div>
          
          <p className="text-3xl font-bold text-foreground mb-2">{formatCurrency(monthlySpending)}</p>
          
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            isOnTrack ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
          }`}>
            {isOnTrack ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">{formatCurrency(budgetRemaining)} left</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">{formatCurrency(Math.abs(budgetRemaining))} over</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SpendingCalendar />
        </motion.div>
      </div>
    );
  }

  // Detailed View
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-lg font-semibold text-foreground">Spending & Budgets</h2>
        <p className="text-sm text-muted-foreground">Track your spending patterns and budget goals</p>
      </motion.div>

      <Tabs defaultValue="spending" className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2 bg-muted/50">
          <TabsTrigger value="spending" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Spending
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Budget
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spending" className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <SpendingInsights />
            <SpendingCalendar />
          </motion.div>
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <BudgetGoals />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Spending;
