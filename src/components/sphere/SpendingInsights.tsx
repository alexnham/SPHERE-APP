import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { mockTransactions } from "@/lib/mockData";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Category colors using semantic design tokens
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

const SpendingInsights = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_ITEMS = 4;
  // Calculate spending by category for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentTransactions = mockTransactions.filter(
    (t) => t.date >= thirtyDaysAgo && t.amount < 0 && t.category !== "Income",
  );

  const categorySpending = recentTransactions.reduce(
    (acc, t) => {
      const category = t.category;
      acc[category] = (acc[category] || 0) + Math.abs(t.amount);
      return acc;
    },
    {} as Record<string, number>,
  );

  const pieData = Object.entries(categorySpending)
    .map(([name, value]) => ({
      name,
      value: Math.round(value),
      color: categoryColors[name] || "hsl(220, 15%, 60%)",
    }))
    .sort((a, b) => b.value - a.value);

  const totalSpending = pieData.reduce((sum, d) => sum + d.value, 0);

  // Generate weekly data for bar chart
  const weeklyData = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - i * 7);

    const weekSpending = mockTransactions
      .filter((t) => t.date >= weekStart && t.date < weekEnd && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    weeklyData.push({
      week: `Week ${4 - i}`,
      spending: Math.round(weekSpending),
    });
  }

  // Calculate trend (compare last week to previous)
  const lastWeek = weeklyData[weeklyData.length - 1]?.spending || 0;
  const prevWeek = weeklyData[weeklyData.length - 2]?.spending || 0;
  const trendPercent = prevWeek > 0 ? ((lastWeek - prevWeek) / prevWeek) * 100 : 0;
  const isSpendingUp = trendPercent > 0;

  const chartConfig = {
    spending: {
      label: "Spending",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="sphere-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Spending Insights</h3>
          <p className="text-sm text-muted-foreground">Last 30 days breakdown</p>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
            isSpendingUp ? "bg-destructive-muted text-destructive" : "bg-success-muted text-success"
          }`}
        >
          {isSpendingUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(trendPercent).toFixed(0)}% vs last week
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="touch-pan-x touch-pan-y">
          <div className="h-48 sm:h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="60%"
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="transition-all duration-200 hover:opacity-80 cursor-pointer"
                      style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  wrapperStyle={{ zIndex: 50 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg"
                        >
                          <p className="font-medium text-foreground">{data.name}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(data.value)}</p>
                          <p className="text-xs text-primary">{((data.value / totalSpending) * 100).toFixed(1)}%</p>
                        </motion.div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <p className="text-base sm:text-lg font-bold text-foreground">{formatCurrency(totalSpending)}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </motion.div>
            </div>
          </div>

          {/* Legend - expandable */}
          <div className="mt-4 space-y-1.5 overflow-hidden">
            <AnimatePresence initial={false}>
              {(isExpanded ? pieData : pieData.slice(0, INITIAL_ITEMS)).map((item, index) => (
                <motion.div
                  key={item.name}
                  className="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors min-w-0"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, delay: index < INITIAL_ITEMS ? 0 : 0.05 * (index - INITIAL_ITEMS) }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                      whileHover={{ scale: 1.3 }}
                    />
                    <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                  </div>
                  <span className="text-xs font-medium text-foreground shrink-0 ml-2">
                    {((item.value / totalSpending) * 100).toFixed(0)}%
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {pieData.length > INITIAL_ITEMS && (
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-2 w-full justify-center py-1"
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
                    Show {pieData.length - INITIAL_ITEMS} more
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Bar Chart - Weekly Trend */}
        <div className="touch-pan-x touch-pan-y">
          <p className="text-sm font-medium text-foreground mb-3">Weekly Spending</p>
          <ChartContainer config={chartConfig} className="h-48 sm:h-56 w-full">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `$${value}`}
                width={45}
              />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
                cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
              />
              <Bar
                dataKey="spending"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                animationDuration={800}
                animationEasing="ease-out"
                className="cursor-pointer"
                onMouseEnter={(data, index, e) => {
                  if (e?.target) {
                    (e.target as SVGElement).style.filter = "brightness(1.1)";
                  }
                }}
                onMouseLeave={(data, index, e) => {
                  if (e?.target) {
                    (e.target as SVGElement).style.filter = "none";
                  }
                }}
              />
            </BarChart>
          </ChartContainer>

          {/* Top Category Callout */}
          <motion.div
            className="mt-4 p-3 rounded-lg bg-muted/50 cursor-pointer transition-all hover:bg-muted/70"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Top category</p>
                <p className="font-medium text-foreground">{pieData[0]?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{formatCurrency(pieData[0]?.value || 0)}</p>
                <p className="text-xs text-muted-foreground">
                  {((pieData[0]?.value / totalSpending) * 100).toFixed(0)}% of total
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SpendingInsights;
