import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Info, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { mockInvestmentAccounts } from '@/lib/mockData';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate totals from investment accounts
const portfolioValue = mockInvestmentAccounts.reduce((sum, acc) => sum + acc.balance, 0);
const totalContributions = mockInvestmentAccounts.reduce((sum, acc) => sum + acc.contributions, 0);
const totalGain = portfolioValue - totalContributions;
const gainPercent = ((totalGain / totalContributions) * 100);

// Mock 1-year performance data
const generatePerformanceData = () => {
  const data = [];
  let value = totalContributions;
  for (let i = 12; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    // Simulate gradual growth with some volatility
    const monthlyChange = (Math.random() * 0.06 - 0.02) + 0.015; // Average ~1.5% monthly growth
    value = value * (1 + monthlyChange);
    data.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      value: Math.round(value),
    });
  }
  // Ensure last value matches current portfolio
  data[data.length - 1].value = Math.round(portfolioValue);
  return data;
};

const performanceData = generatePerformanceData();

// Mock allocation data
const allocations = [
  { name: 'US Stocks', value: 55, color: 'hsl(152, 45%, 45%)' },
  { name: 'International', value: 20, color: 'hsl(175, 35%, 45%)' },
  { name: 'Bonds', value: 15, color: 'hsl(220, 15%, 55%)' },
  { name: 'Real Estate', value: 10, color: 'hsl(38, 70%, 55%)' },
];

// Projection calculation
const calculateProjection = (years: number, monthlyContribution: number = 500) => {
  const annualReturn = 0.07; // 7% assumed annual return
  const monthlyReturn = annualReturn / 12;
  const months = years * 12;
  
  let futureValue = portfolioValue;
  for (let i = 0; i < months; i++) {
    futureValue = futureValue * (1 + monthlyReturn) + monthlyContribution;
  }
  return futureValue;
};

const fiveYearProjection = calculateProjection(5);
const tenYearProjection = calculateProjection(10);

const chartConfig = {
  value: {
    label: 'Portfolio Value',
    color: 'hsl(var(--primary))',
  },
};

const InvestmentPortfolio = () => {
  const [expanded, setExpanded] = useState(false);
  const isPositive = totalGain >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="sphere-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Investment Portfolio</h3>
          <p className="text-sm text-muted-foreground">Long-term growth focus</p>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Low-dopamine view</span>
        </div>
      </div>

      {/* Main Stats - Clickable */}
      <motion.div
        onClick={() => setExpanded(!expanded)}
        className="grid grid-cols-2 gap-4 mb-6 cursor-pointer group"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="p-4 rounded-xl bg-muted/30 relative">
          <p className="text-sm text-muted-foreground mb-1">Total Value</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(portfolioValue)}</p>
          <div className="absolute top-3 right-3 text-muted-foreground group-hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
        <div className={`p-4 rounded-xl ${isPositive ? 'bg-success-muted' : 'bg-destructive-muted'}`}>
          <p className="text-sm text-muted-foreground mb-1">Total Return</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{formatCurrency(totalGain)}
            </p>
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
          </div>
          <p className={`text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? '+' : ''}{gainPercent.toFixed(1)}% all time
          </p>
        </div>
      </motion.div>

      {/* Expanded Account Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="space-y-3 pt-2 border-t border-border/50">
              <p className="text-sm font-medium text-muted-foreground pt-3">Individual Accounts</p>
              {mockInvestmentAccounts.map((account, index) => {
                const isAccountPositive = account.gain >= 0;
                return (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-muted/20 border border-border/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: account.color }}
                        />
                        <span className="font-medium text-foreground">{account.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{account.institution}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-foreground">{formatCurrency(account.balance)}</p>
                        <p className="text-xs text-muted-foreground">Contributed: {formatCurrency(account.contributions)}</p>
                      </div>
                      <div className={`text-right ${isAccountPositive ? 'text-success' : 'text-destructive'}`}>
                        <div className="flex items-center gap-1 justify-end">
                          {isAccountPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span className="font-medium">{isAccountPositive ? '+' : ''}{formatCurrency(account.gain)}</span>
                        </div>
                        <p className="text-xs">{isAccountPositive ? '+' : ''}{account.gainPercent.toFixed(1)}%</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Chart */}
      <div className="mb-6">
        <p className="text-sm font-medium text-foreground mb-3">12-Month Performance</p>
        <ChartContainer config={chartConfig} className="h-40">
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              hide
              domain={['dataMin - 1000', 'dataMax + 1000']}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#portfolioGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </div>

      {/* Allocation */}
      <div className="mb-6">
        <p className="text-sm font-medium text-foreground mb-3">Asset Allocation</p>
        <div className="flex h-3 rounded-full overflow-hidden mb-3">
          {allocations.map((allocation, index) => (
            <div
              key={allocation.name}
              className="h-full transition-all duration-300"
              style={{
                width: `${allocation.value}%`,
                backgroundColor: allocation.color,
              }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {allocations.map((allocation) => (
            <div key={allocation.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: allocation.color }}
              />
              <span className="text-xs text-muted-foreground">{allocation.name}</span>
              <span className="text-xs font-medium text-foreground ml-auto">{allocation.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Long-term Projections */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">If you keep contributing $500/mo</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">5-year projection</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(fiveYearProjection)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">10-year projection</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(tenYearProjection)}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          *Assumes 7% annual return. Past performance doesn't guarantee future results.
        </p>
      </div>

      {/* No-dopamine footer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Investing is a marathon, not a sprint • Check back monthly, not daily
        </p>
      </div>
    </motion.div>
  );
};

export default InvestmentPortfolio;
