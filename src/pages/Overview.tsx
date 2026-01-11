import { useState } from 'react';
import { motion } from 'framer-motion';
import SafeToSpendCard from '@/components/sphere/SafeToSpendCard';
import UpcomingBills from '@/components/sphere/UpcomingBills';
import WeeklyInsight from '@/components/sphere/WeeklyInsight';
import SpendingTrendLine from '@/components/sphere/SpendingTrendLine';
import TotalAvailableDialog from '@/components/sphere/TotalAvailableDialog';
import { calculateSafeToSpend, mockDailySpend } from '@/lib/mockData';
import { Wallet, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import { useViewMode } from '@/contexts/ViewModeContext';
import { useNavigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Simple mini sparkline component
const MiniSparkline = ({ data, color = "hsl(var(--primary))" }: { data: number[], color?: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 40;
  const width = 120;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="4"
        fill={color}
      />
    </svg>
  );
};

const Overview = () => {
  const { breakdown, safeToSpend } = calculateSafeToSpend();
  const [showTotalDialog, setShowTotalDialog] = useState(false);
  const { isSimpleView } = useViewMode();
  const navigate = useNavigate();

  // Calculate weekly spending trend for simple view
  const now = new Date();
  const last7Days = mockDailySpend
    .filter(d => differenceInDays(now, d.date) <= 7)
    .map(d => d.totalSpend);
  
  const thisWeekTotal = last7Days.reduce((sum, d) => sum + d, 0);
  const prevWeekDays = mockDailySpend
    .filter(d => {
      const days = differenceInDays(now, d.date);
      return days > 7 && days <= 14;
    })
    .map(d => d.totalSpend);
  const prevWeekTotal = prevWeekDays.reduce((sum, d) => sum + d, 0);
  const weeklyChange = prevWeekTotal > 0 ? ((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100 : 0;
  const isSpendingDown = weeklyChange < 0;

  // Simple View - Clean, minimal UI with visual elements
  if (isSimpleView) {
    return (
      <div className="space-y-6 py-4">
        {/* Simple Total Available with visual ring */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="relative inline-flex items-center justify-center mb-4">
            {/* Decorative ring */}
            <svg className="w-48 h-48" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#ringGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={565}
                initial={{ strokeDashoffset: 565 }}
                animate={{ strokeDashoffset: 565 * 0.25 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-muted-foreground mb-1">Available</p>
              <motion.p
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-3xl font-bold text-foreground"
              >
                {formatCurrency(breakdown.liquidAvailable)}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Safe to Spend with mini chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="sphere-card p-5 max-w-md mx-auto"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Safe to spend</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(safeToSpend)}</p>
            </div>
            <MiniSparkline data={last7Days.length > 1 ? last7Days : [0, 0]} />
          </div>
          <div className={`flex items-center gap-1 mt-3 text-sm ${isSpendingDown ? 'text-success' : 'text-warning'}`}>
            {isSpendingDown ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            <span>{Math.abs(weeklyChange).toFixed(0)}% vs last week</span>
          </div>
        </motion.div>

        {/* Simple Quick Actions with icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3 max-w-md mx-auto"
        >
          {[
            { label: 'Upcoming Bills', path: '/bills', icon: '📅' },
            { label: 'Spending & Budget', path: '/spending', icon: '📊' },
            { label: 'Your Accounts', path: '/accounts', icon: '🏦' },
          ].map((item, index) => (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full sphere-card p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.button>
          ))}
        </motion.div>
      </div>
    );
  }

  // Detailed View - Full data display
  return (
    <div className="space-y-8">
      {/* Hero: Total Available - Centered & Prominent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center pt-4"
      >
        <motion.div 
          className="inline-flex items-center gap-2 mb-3 cursor-pointer group"
          onClick={() => setShowTotalDialog(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Total Available</span>
        </motion.div>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-5xl lg:text-6xl font-bold text-foreground tracking-tight cursor-pointer hover:text-primary transition-colors"
          onClick={() => setShowTotalDialog(true)}
        >
          {formatCurrency(breakdown.liquidAvailable)}
        </motion.div>
        <p className="text-sm text-muted-foreground mt-2 mb-6">Across all linked accounts</p>
        
        {/* Spending Trend Line */}
        <SpendingTrendLine />
      </motion.div>

      <TotalAvailableDialog 
        open={showTotalDialog} 
        onOpenChange={setShowTotalDialog}
        total={breakdown.liquidAvailable}
      />

      {/* Safe to Spend - Secondary, Centered */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex justify-center"
      >
        <div className="w-full max-w-md">
          <SafeToSpendCard />
        </div>
      </motion.div>

      {/* Other Cards - Centered Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="w-full max-w-2xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingBills />
          <WeeklyInsight />
        </div>
      </motion.div>
    </div>
  );
};

export default Overview;
