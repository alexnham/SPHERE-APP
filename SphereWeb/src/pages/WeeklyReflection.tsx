import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, TrendingUp, TrendingDown, CheckCircle2, ThumbsUp, ThumbsDown, Minus, Calendar, RefreshCw, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockTransactions, mockDailySpend } from '@/lib/mockData';
import { differenceInDays, format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Merchant logo URLs using logo.clearbit.com
const getMerchantLogo = (merchant: string): string | null => {
  const logoMap: Record<string, string> = {
    'Apple Store': 'https://logo.clearbit.com/apple.com',
    'Target': 'https://logo.clearbit.com/target.com',
    'Amazon': 'https://logo.clearbit.com/amazon.com',
    'Starbucks': 'https://logo.clearbit.com/starbucks.com',
    'Chipotle': 'https://logo.clearbit.com/chipotle.com',
    'Whole Foods': 'https://logo.clearbit.com/wholefoods.com',
    'Shell Gas': 'https://logo.clearbit.com/shell.com',
    'CVS': 'https://logo.clearbit.com/cvs.com',
    'Walgreens': 'https://logo.clearbit.com/walgreens.com',
    'Netflix': 'https://logo.clearbit.com/netflix.com',
    'Spotify': 'https://logo.clearbit.com/spotify.com',
    'Uber': 'https://logo.clearbit.com/uber.com',
    'Lyft': 'https://logo.clearbit.com/lyft.com',
    'McDonalds': 'https://logo.clearbit.com/mcdonalds.com',
    'Costco': 'https://logo.clearbit.com/costco.com',
    'Walmart': 'https://logo.clearbit.com/walmart.com',
    'Best Buy': 'https://logo.clearbit.com/bestbuy.com',
  };
  return logoMap[merchant] || null;
};

const WeeklyReflection = () => {
  const navigate = useNavigate();
  const now = new Date();

  // Calculate this week vs last week
  const thisWeekSpend = mockDailySpend
    .filter(d => differenceInDays(now, d.date) <= 7)
    .reduce((sum, d) => sum + d.totalSpend, 0);
  
  const lastWeekSpend = mockDailySpend
    .filter(d => {
      const days = differenceInDays(now, d.date);
      return days > 7 && days <= 14;
    })
    .reduce((sum, d) => sum + d.totalSpend, 0);

  const percentChange = lastWeekSpend > 0 
    ? ((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100
    : 0;

  // Get all transactions this week
  const thisWeekTransactions = mockTransactions
    .filter(t => differenceInDays(now, new Date(t.date)) <= 7 && t.amount < 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Category breakdown
  const categoryTotals: { [key: string]: number } = {};
  thisWeekTransactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
  });
  
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);

  // Repeated merchants
  const merchantCounts: { [key: string]: { count: number; total: number } } = {};
  thisWeekTransactions.forEach(t => {
    if (!merchantCounts[t.merchant]) {
      merchantCounts[t.merchant] = { count: 0, total: 0 };
    }
    merchantCounts[t.merchant].count += 1;
    merchantCounts[t.merchant].total += Math.abs(t.amount);
  });
  
  const repeatedMerchants = Object.entries(merchantCounts)
    .filter(([, data]) => data.count >= 2)
    .sort(([, a], [, b]) => b.total - a.total);

  // Largest transactions for reflection
  const largestTransactions = [...thisWeekTransactions]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5);

  const isPositiveWeek = percentChange <= 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/overview')}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Weekly Reflection
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(subDays(now, 7), 'MMM d')} - {format(now, 'MMM d, yyyy')}
          </p>
        </div>
      </motion.div>

      {/* Week Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="sphere-card p-6 bg-gradient-to-br from-card to-primary-muted/30"
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isPositiveWeek ? (
              <TrendingDown className="w-5 h-5 text-success" />
            ) : (
              <TrendingUp className="w-5 h-5 text-warning" />
            )}
            <span className="text-sm font-medium text-muted-foreground">This Week's Total</span>
          </div>
          <div className="text-4xl font-bold text-foreground mb-1">
            {formatCurrency(thisWeekSpend)}
          </div>
          <div className={`text-sm font-medium ${isPositiveWeek ? 'text-success' : 'text-warning'}`}>
            {percentChange > 0 ? '+' : ''}{percentChange.toFixed(0)}% vs last week
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {isPositiveWeek 
              ? "You spent less this week. Nice steady pace! 🎉"
              : "A bit higher than usual. Let's see where it went."
            }
          </p>
        </div>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="sphere-card p-6"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Where It Went
        </h2>
        <div className="space-y-3">
          {sortedCategories.map(([category, amount], index) => {
            const percentage = (amount / thisWeekSpend) * 100;
            return (
              <div key={category} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{category}</span>
                  <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Repeated Patterns */}
      {repeatedMerchants.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sphere-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            What Repeated
          </h2>
          <div className="space-y-3">
            {repeatedMerchants.map(([merchant, data]) => (
              <div 
                key={merchant}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
              >
                <div>
                  <div className="font-medium text-foreground">{merchant}</div>
                  <div className="text-xs text-muted-foreground">{data.count} visits</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">{formatCurrency(data.total)}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Reflection on Largest Spends */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="sphere-card p-6"
      >
        <h2 className="text-lg font-semibold text-foreground mb-2">Quick Reflection</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tap how you feel about your biggest spends this week
        </p>
        <div className="space-y-3">
          {largestTransactions.map((transaction) => (
            <div 
              key={transaction.id}
              className="p-4 rounded-xl bg-muted/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getMerchantLogo(transaction.merchant) ? (
                    <img 
                      src={getMerchantLogo(transaction.merchant)!}
                      alt={transaction.merchant}
                      className="w-8 h-8 rounded-lg object-contain bg-white p-1"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center ${getMerchantLogo(transaction.merchant) ? 'hidden' : ''}`}>
                    <Store className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{transaction.merchant}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(transaction.date), 'EEE, MMM d')} · {transaction.category}
                    </div>
                  </div>
                </div>
                <div className="font-semibold text-foreground">
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-2">Worth it?</span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 hover:bg-success/20 transition-colors text-success text-xs font-medium">
                  <ThumbsUp className="w-3 h-3" />
                  Yes
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors text-muted-foreground text-xs font-medium">
                  <Minus className="w-3 h-3" />
                  Neutral
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors text-destructive text-xs font-medium">
                  <ThumbsDown className="w-3 h-3" />
                  No
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Mark Complete */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button 
          className="w-full py-6 text-base"
          size="lg"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Mark Week as Reviewed
        </Button>
      </motion.div>
    </div>
  );
};

export default WeeklyReflection;
