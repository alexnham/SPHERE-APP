import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { mockTransactions } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface BudgetCategory {
  name: string;
  budget: number;
  spent: number;
  color: string;
  icon: string;
}

// Category color mapping using CSS variables
const categoryConfig: Record<string, { color: string; icon: string }> = {
  Groceries: { color: 'hsl(var(--category-groceries))', icon: '🥑' },
  Shopping: { color: 'hsl(var(--category-shopping))', icon: '🛍️' },
  Coffee: { color: 'hsl(var(--category-coffee))', icon: '☕' },
  Transport: { color: 'hsl(var(--category-transport))', icon: '🚗' },
  Dining: { color: 'hsl(var(--category-dining))', icon: '🍽️' },
  Gas: { color: 'hsl(var(--category-gas))', icon: '⛽' },
  Health: { color: 'hsl(var(--category-health))', icon: '💊' },
  Tech: { color: 'hsl(var(--category-tech))', icon: '💻' },
  Entertainment: { color: 'hsl(var(--category-entertainment))', icon: '🎬' },
  Utilities: { color: 'hsl(var(--category-utilities))', icon: '💡' },
};

// Monthly budgets per category
const monthlyBudgets: Record<string, number> = {
  Groceries: 500,
  Shopping: 300,
  Coffee: 80,
  Transport: 150,
  Dining: 250,
  Gas: 120,
  Health: 100,
  Tech: 200,
};

const BudgetGoals = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_ITEMS = 3;
  // Calculate spending for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlySpending = mockTransactions
    .filter(t => t.date >= startOfMonth && t.amount < 0 && t.category !== 'Income')
    .reduce((acc, t) => {
      const category = t.category;
      acc[category] = (acc[category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  // Build budget categories
  const budgetCategories: BudgetCategory[] = Object.entries(monthlyBudgets).map(([name, budget]) => ({
    name,
    budget,
    spent: Math.round(monthlySpending[name] || 0),
    color: categoryConfig[name]?.color || 'hsl(var(--muted-foreground))',
    icon: categoryConfig[name]?.icon || '📊',
  })).sort((a, b) => (b.spent / b.budget) - (a.spent / a.budget));

  const totalBudget = Object.values(monthlyBudgets).reduce((a, b) => a + b, 0);
  const totalSpent = budgetCategories.reduce((sum, c) => sum + c.spent, 0);
  const overallProgress = Math.min(100, (totalSpent / totalBudget) * 100);
  
  // Days remaining in month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysRemaining = daysInMonth - dayOfMonth;
  const expectedProgress = (dayOfMonth / daysInMonth) * 100;
  const isOnTrack = overallProgress <= expectedProgress + 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="sphere-card p-6 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Monthly Budgets</h3>
            <p className="text-sm text-muted-foreground">{daysRemaining} days remaining</p>
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer hover:opacity-80 ${
              isOnTrack 
                ? 'bg-success-muted text-success' 
                : 'bg-warning-muted text-warning'
            }`}>
              {isOnTrack ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  On Track
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  Ahead of Pace
                </>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-w-[240px] text-sm" side="bottom" align="end">
            {isOnTrack ? (
              <p>You're spending at or below your expected pace for this point in the month. Keep it up!</p>
            ) : (
              <p>You're spending faster than expected. At this rate, you may exceed your monthly budget before the month ends.</p>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Overall Progress */}
      <div className="mb-4 p-4 rounded-xl bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Overall Spending</span>
          <span className="text-sm text-muted-foreground">
            {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="h-full rounded-full"
            style={{ background: 'var(--gradient-primary)' }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {overallProgress.toFixed(0)}% used
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {expectedProgress.toFixed(0)}% expected by today
          </span>
        </div>
      </div>

      {/* Spending Predictor */}
      {(() => {
        const expectedSpending = Math.round((totalBudget * dayOfMonth) / daysInMonth);
        const difference = totalSpent - expectedSpending;
        const percentDiff = expectedSpending > 0 ? Math.abs((difference / expectedSpending) * 100) : 0;
        
        // Determine status: green if under/equal, yellow if 1-20% over, red if >20% over
        const isUnder = difference <= 0;
        const isWarning = difference > 0 && percentDiff <= 20;
        const isOver = difference > 0 && percentDiff > 20;
        
        const statusColor = isUnder ? 'text-success' : isWarning ? 'text-warning' : 'text-destructive';
        const bgColor = isUnder ? 'bg-success/10' : isWarning ? 'bg-warning/10' : 'bg-destructive/10';
        const borderColor = isUnder ? 'border-success/20' : isWarning ? 'border-warning/20' : 'border-destructive/20';
        
        return (
          <div className={`mb-6 p-4 rounded-xl border ${bgColor} ${borderColor}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Spending Pace</span>
              <div className={`flex items-center gap-1 text-xs font-medium ${statusColor}`}>
                {isUnder ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                {isUnder ? 'Under budget' : isWarning ? 'Slightly over' : 'Over budget'}
              </div>
            </div>
            
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">You've spent</p>
                <p className={`text-2xl font-bold ${statusColor}`}>{formatCurrency(totalSpent)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Should be at</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(expectedSpending)}</p>
              </div>
            </div>
            
            <div className={`mt-3 pt-3 border-t ${borderColor}`}>
              <p className={`text-xs ${statusColor} flex items-center gap-1`}>
                {isUnder ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    You're {formatCurrency(Math.abs(difference))} under your projected spending
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    You're {formatCurrency(difference)} ({percentDiff.toFixed(0)}%) over your projected spending
                  </>
                )}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Category Budgets */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {(isExpanded ? budgetCategories : budgetCategories.slice(0, INITIAL_ITEMS)).map((category, index) => {
            const progress = Math.min(100, (category.spent / category.budget) * 100);
            const isOverBudget = category.spent > category.budget;
            const isNearLimit = progress >= 80 && !isOverBudget;
            
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: index < INITIAL_ITEMS ? 0 : 0.05 * (index - INITIAL_ITEMS) }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="group p-3 -mx-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <motion.span 
                      className="text-base"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {category.icon}
                    </motion.span>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium transition-all ${
                      isOverBudget ? 'text-destructive' : 
                      isNearLimit ? 'text-warning' : 
                      'text-foreground group-hover:text-primary'
                    }`}>
                      {formatCurrency(category.spent)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {formatCurrency(category.budget)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden group-hover:h-3 transition-all duration-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, progress)}%` }}
                    transition={{ duration: 0.6, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full transition-all duration-200 group-hover:shadow-lg"
                    style={{ 
                      backgroundColor: isOverBudget 
                        ? 'hsl(var(--destructive))' 
                        : isNearLimit 
                          ? 'hsl(var(--warning))' 
                          : category.color,
                      boxShadow: 'none'
                    }}
                    whileHover={{
                      boxShadow: isOverBudget 
                        ? '0 0 12px hsl(var(--destructive) / 0.5)' 
                        : isNearLimit 
                          ? '0 0 12px hsl(var(--warning) / 0.5)' 
                          : '0 0 12px hsl(var(--primary) / 0.5)'
                    }}
                  />
                </div>
                {isOverBudget && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-destructive mt-1 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {formatCurrency(category.spent - category.budget)} over budget
                  </motion.p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {budgetCategories.length > INITIAL_ITEMS && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors w-full justify-center py-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Show {budgetCategories.length - INITIAL_ITEMS} more
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Footer insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 pt-4 border-t border-border/50"
      >
        <p className="text-xs text-muted-foreground">
          💡 Your budgets adjust based on your spending patterns. No pressure—just awareness.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default BudgetGoals;
