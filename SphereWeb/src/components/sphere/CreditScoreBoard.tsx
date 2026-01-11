import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Info } from 'lucide-react';
import { XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Mock credit score data
const mockScoreHistory = [
  { month: 'Jul', score: 712 },
  { month: 'Aug', score: 718 },
  { month: 'Sep', score: 715 },
  { month: 'Oct', score: 725 },
  { month: 'Nov', score: 732 },
  { month: 'Dec', score: 738 },
  { month: 'Jan', score: 742 },
];

const currentScore = 742;
const previousScore = 738;
const scoreChange = currentScore - previousScore;

interface CreditDriver {
  name: string;
  status: 'positive' | 'neutral' | 'negative';
  impact: 'high' | 'medium' | 'low';
  value: string;
  description: string;
}

const creditDrivers: CreditDriver[] = [
  {
    name: 'Payment History',
    status: 'positive',
    impact: 'high',
    value: '100%',
    description: 'All payments on time for 24 months'
  },
  {
    name: 'Credit Utilization',
    status: 'neutral',
    impact: 'high',
    value: '28%',
    description: 'Using 28% of available credit'
  },
  {
    name: 'Credit Age',
    status: 'positive',
    impact: 'medium',
    value: '4.2 yrs',
    description: 'Average age of credit accounts'
  },
  {
    name: 'Credit Mix',
    status: 'positive',
    impact: 'low',
    value: 'Good',
    description: 'Mix of credit cards and loans'
  },
  {
    name: 'Hard Inquiries',
    status: 'neutral',
    impact: 'low',
    value: '2',
    description: 'Inquiries in the last 12 months'
  },
];

const getScoreColor = (score: number) => {
  if (score >= 740) return 'text-success';
  if (score >= 670) return 'text-primary';
  if (score >= 580) return 'text-warning';
  return 'text-destructive';
};

const getScoreLabel = (score: number) => {
  if (score >= 800) return 'Exceptional';
  if (score >= 740) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
};

const getScoreGradient = (score: number) => {
  if (score >= 740) return 'from-success/20 to-success/5';
  if (score >= 670) return 'from-primary/20 to-primary/5';
  if (score >= 580) return 'from-warning/20 to-warning/5';
  return 'from-destructive/20 to-destructive/5';
};

export const CreditScoreBoard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="sphere-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground font-display">Credit Score</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Last updated Jan 1, 2026</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Info className="w-4 h-4 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Your credit score is an estimate based on available data. Actual scores may vary by bureau.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Score Display */}
      <div className={`p-6 rounded-2xl bg-gradient-to-b ${getScoreGradient(currentScore)} mb-6`}>
        <div className="flex items-center justify-between">
          <div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className={`text-5xl font-bold font-display ${getScoreColor(currentScore)}`}
            >
              {currentScore}
            </motion.div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-medium text-foreground">{getScoreLabel(currentScore)}</span>
              <div className={`flex items-center gap-0.5 text-sm font-medium ${scoreChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {scoreChange >= 0 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {Math.abs(scoreChange)} pts
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Score Range</div>
            <div className="text-sm text-foreground">300 – 850</div>
          </div>
        </div>
      </div>

      {/* Score Trendline */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3">6-Month Trend</h4>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockScoreHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                domain={['dataMin - 20', 'dataMax + 10']} 
                hide 
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#scoreGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Drivers */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Key Drivers</h4>
        <div className="space-y-2">
          {creditDrivers.map((driver, index) => (
            <DriverRow key={driver.name} driver={driver} index={index} />
          ))}
        </div>
      </div>

    </motion.div>
  );
};

interface DriverRowProps {
  driver: CreditDriver;
  index: number;
}

const DriverRow = ({ driver, index }: DriverRowProps) => {
  const statusColors = {
    positive: 'bg-success text-success',
    neutral: 'bg-warning text-warning',
    negative: 'bg-destructive text-destructive',
  };

  const impactLabels = {
    high: 'High impact',
    medium: 'Medium impact',
    low: 'Low impact',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
      className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${statusColors[driver.status].split(' ')[0]}`} />
        <div>
          <div className="text-sm font-medium text-foreground">{driver.name}</div>
          <div className="text-xs text-muted-foreground">{driver.description}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-foreground">{driver.value}</div>
        <div className="text-[10px] text-muted-foreground">{impactLabels[driver.impact]}</div>
      </div>
    </motion.div>
  );
};

export default CreditScoreBoard;
