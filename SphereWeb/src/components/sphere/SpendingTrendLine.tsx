import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { mockTransactions } from "@/lib/mockData";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const SpendingTrendLine = () => {
  // Generate daily spending data for the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();

  const dailyData = [];
  let cumulativeSpending = 0;

  for (let day = 1; day <= currentDay; day++) {
    const date = new Date(now.getFullYear(), now.getMonth(), day);
    const daySpending = mockTransactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getFullYear() === date.getFullYear() &&
          tDate.getMonth() === date.getMonth() &&
          tDate.getDate() === date.getDate() &&
          t.amount < 0
        );
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    cumulativeSpending += daySpending;
    dailyData.push({
      day,
      date: `${now.toLocaleString("default", { month: "short" })} ${day}`,
      spending: Math.round(cumulativeSpending),
      daily: Math.round(daySpending),
    });
  }

  const totalSpent = dailyData[dailyData.length - 1]?.spending || 0;
  
  // Calculate week-over-week trend
  const midPoint = Math.floor(dailyData.length / 2);
  const firstHalfAvg = dailyData.slice(0, midPoint).reduce((sum, d) => sum + d.daily, 0) / midPoint || 0;
  const secondHalfAvg = dailyData.slice(midPoint).reduce((sum, d) => sum + d.daily, 0) / (dailyData.length - midPoint) || 0;
  const trend = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
  const isUp = trend > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">This month&apos;s spending</span>
        <div className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-destructive" : "text-success"}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend).toFixed(0)}%
        </div>
      </div>
      
      <div className="h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg px-2 py-1.5 shadow-lg text-xs">
                      <p className="font-medium text-foreground">{data.date}</p>
                      <p className="text-muted-foreground">Total: {formatCurrency(data.spending)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="spending"
              stroke="url(#spendingGradient)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: "hsl(var(--primary))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground">
          {now.toLocaleString("default", { month: "short" })} 1
        </span>
        <span className="text-sm font-semibold text-foreground">{formatCurrency(totalSpent)}</span>
        <span className="text-xs text-muted-foreground">Today</span>
      </div>
    </motion.div>
  );
};

export default SpendingTrendLine;
