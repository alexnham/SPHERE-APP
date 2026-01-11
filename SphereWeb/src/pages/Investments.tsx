import { motion } from 'framer-motion';
import InvestmentPortfolio from '@/components/sphere/InvestmentPortfolio';
import { useViewMode } from '@/contexts/ViewModeContext';
import { mockAccounts } from '@/lib/mockData';
import { TrendingUp } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Generate mock performance data for sparkline
const generatePerformanceData = () => {
  const data = [];
  let value = 45000;
  for (let i = 0; i < 12; i++) {
    value = value * (1 + (Math.random() * 0.08 - 0.02));
    data.push(Math.round(value));
  }
  return data;
};

// Mini area chart component
const MiniAreaChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 60;
  const width = 200;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  const areaPath = `M0,${height} L${points.split(' ').map((p, i) => {
    const [x, y] = p.split(',');
    return `${x},${y}`;
  }).join(' L')} L${width},${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGradient)" />
      <polyline
        fill="none"
        stroke="hsl(var(--success))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const Investments = () => {
  const { isSimpleView } = useViewMode();
  const investmentAccounts = mockAccounts.filter(a => a.type === 'investment');
  const totalInvestments = investmentAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const performanceData = generatePerformanceData();
  
  // Mock gains
  const totalGains = totalInvestments * 0.124;
  const percentGain = 12.4;

  // Simple View
  if (isSimpleView) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-lg font-semibold text-foreground">Investments</h2>
        </motion.div>

        {/* Portfolio Value with chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="sphere-card p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Portfolio Value</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(totalInvestments)}</p>
              <div className="flex items-center gap-1 mt-1 text-success">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">+{formatCurrency(totalGains)} ({percentGain}%)</span>
              </div>
            </div>
          </div>
          
          {/* Performance chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <MiniAreaChart data={performanceData} />
          </motion.div>
          <p className="text-xs text-muted-foreground text-center mt-2">Last 12 months</p>
        </motion.div>

        {/* Account Distribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="sphere-card p-5"
        >
          <p className="text-sm font-medium text-foreground mb-4">Your Portfolios</p>
          <div className="space-y-3">
            {investmentAccounts.map((account, index) => {
              const percent = (account.currentBalance / totalInvestments) * 100;
              return (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{account.name}</span>
                    <span className="text-sm font-medium text-foreground">{formatCurrency(account.currentBalance)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                      className="h-full rounded-full bg-success"
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
        <h2 className="text-lg font-semibold text-foreground">Investments</h2>
        <p className="text-sm text-muted-foreground">Track your portfolio performance</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <InvestmentPortfolio />
      </motion.div>
    </div>
  );
};

export default Investments;
