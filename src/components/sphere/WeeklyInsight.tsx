import { motion } from "framer-motion";
import { Sparkles, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockTransactions, mockDailySpend } from "@/lib/mockData";
import { differenceInDays } from "date-fns";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const WeeklyInsight = () => {
  const navigate = useNavigate();

  // Calculate this week vs last week
  const now = new Date();
  const thisWeekSpend = mockDailySpend
    .filter((d) => differenceInDays(now, d.date) <= 7)
    .reduce((sum, d) => sum + d.totalSpend, 0);

  const lastWeekSpend = mockDailySpend
    .filter((d) => {
      const days = differenceInDays(now, d.date);
      return days > 7 && days <= 14;
    })
    .reduce((sum, d) => sum + d.totalSpend, 0);

  const percentChange = lastWeekSpend > 0 ? ((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100 : 0;

  // Find top category this week
  const categoryTotals: { [key: string]: number } = {};
  mockTransactions
    .filter((t) => differenceInDays(now, new Date(t.date)) <= 7 && t.amount < 0)
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    });

  const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];

  // Find repeated merchants
  const merchantCounts: { [key: string]: number } = {};
  mockTransactions
    .filter((t) => differenceInDays(now, new Date(t.date)) <= 7 && t.amount < 0)
    .forEach((t) => {
      merchantCounts[t.merchant] = (merchantCounts[t.merchant] || 0) + 1;
    });

  const repeatedMerchants = Object.entries(merchantCounts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a);

  const isPositiveWeek = percentChange <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      onClick={() => navigate("/reflection")}
      className="sphere-card p-6 bg-gradient-to-br from-card to-primary-muted/30 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-lg font-semibold text-foreground font-display">Weekly Reflection</h3>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="space-y-4">
        {/* Week comparison */}
        <div className="p-4 rounded-xl bg-card/80">
          <div className="flex items-center gap-2 mb-2">
            {isPositiveWeek ? (
              <TrendingDown className="w-4 h-4 text-success" />
            ) : (
              <TrendingUp className="w-4 h-4 text-warning" />
            )}
            <span className="text-sm font-medium text-foreground">Compared to last week</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{formatCurrency(thisWeekSpend)}</span>
            <span className={`text-sm font-medium ${isPositiveWeek ? "text-success" : "text-warning"}`}>
              {percentChange > 0 ? "+" : ""}
              {percentChange.toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isPositiveWeek
              ? "You spent less this week. Nice steady pace."
              : "A bit higher than usual, but that's okay."}
          </p>
        </div>
        {/*
        //top category
        {topCategory && (
          <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-card/80">
            <div>
              <div className="text-xs text-muted-foreground">Most spent on</div>
              <div className="font-medium text-foreground">{topCategory[0]}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-foreground">{formatCurrency(topCategory[1])}</div>
            </div>
          </div>
        )}
        //patterns
        {repeatedMerchants.length > 0 && (
          <div className="py-3 px-4 rounded-xl bg-card/80">
            <div className="text-xs text-muted-foreground mb-2">What repeated this week</div>
            <div className="flex flex-wrap gap-2">
              {repeatedMerchants.slice(0, 3).map(([merchant, count]) => (
                <span 
                  key={merchant}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground"
                >
                  {merchant} <span className="text-primary">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        */}
        {/* View more prompt */}
        <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary font-medium text-sm">
          Tap to reflect on your week
        </div>
      </div>
    </motion.div>
  );
};

export default WeeklyInsight;
