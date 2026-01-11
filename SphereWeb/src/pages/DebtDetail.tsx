import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Car, ChevronLeft, Clock, Banknote, TrendingDown, Percent, Info } from 'lucide-react';
import { mockLiabilities, calculateCostOfWaiting, calculateSafeToSpend } from '@/lib/mockData';
import { format, differenceInDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DebtPayoffCalculator } from '@/components/sphere/DebtPayoffCalculator';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const getIcon = (type: string) => {
  switch (type) {
    case 'credit_card': return <CreditCard className="w-5 h-5" />;
    case 'loan': return <Car className="w-5 h-5" />;
    default: return <CreditCard className="w-5 h-5" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'credit_card': return 'Credit Card';
    case 'loan': return 'Loan';
    case 'bnpl': return 'Buy Now Pay Later';
    case 'mortgage': return 'Mortgage';
    default: return 'Debt';
  }
};

const DebtDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { safeToSpend } = calculateSafeToSpend();
  
  const liability = mockLiabilities.find(l => l.id === id);
  
  if (!liability) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Debt not found</p>
        <Button variant="ghost" onClick={() => navigate('/debts')} className="mt-4">
          Go back to Debts
        </Button>
      </div>
    );
  }

  const daysUntilDue = liability.dueDate 
    ? differenceInDays(liability.dueDate, new Date())
    : null;
  
  const utilizationPercent = liability.type === 'credit_card'
    ? (liability.currentBalance / 10000) * 100
    : null;

  const costWaiting7Days = calculateCostOfWaiting(liability, 7);
  const costWaiting30Days = calculateCostOfWaiting(liability, 30);
  const recommendedPayment = Math.min(safeToSpend, liability.currentBalance);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => navigate('/debts')}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
            {getIcon(liability.type)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground font-display">{liability.lender}</h2>
            <p className="text-sm text-muted-foreground">{getTypeLabel(liability.type)}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-6"
      >
        {/* Balance Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Banknote className="w-4 h-4" />
              Current Balance
            </div>
            <div className="text-2xl font-bold text-foreground font-display">
              {formatCurrency(liability.currentBalance)}
            </div>
          </div>
          {liability.minPayment && (
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingDown className="w-4 h-4" />
                Minimum Payment
              </div>
              <div className="text-2xl font-bold text-foreground font-display">
                {formatCurrency(liability.minPayment)}
              </div>
            </div>
          )}
        </div>

        {/* Credit Utilization */}
        {utilizationPercent !== null && (
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Percent className="w-4 h-4" />
                Credit Utilization
              </div>
              <span className={`text-sm font-medium ${utilizationPercent > 30 ? 'text-warning' : 'text-success'}`}>
                {utilizationPercent.toFixed(0)}%
              </span>
            </div>
            <Progress value={utilizationPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {utilizationPercent > 30 
                ? "High utilization may affect your credit score" 
                : "Good! Under 30% is ideal"}
            </p>
          </div>
        )}

        {/* Due Date & APR */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {liability.dueDate && (
            <div>
              <div className="text-muted-foreground mb-1">Due Date</div>
              <div className="font-medium text-foreground">
                {format(liability.dueDate, 'MMM d, yyyy')}
              </div>
              {daysUntilDue !== null && (
                <div className={`text-xs mt-0.5 ${daysUntilDue <= 5 ? 'text-warning' : 'text-muted-foreground'}`}>
                  {daysUntilDue} days remaining
                </div>
              )}
            </div>
          )}
          {liability.apr && (
            <div>
              <div className="text-muted-foreground mb-1">APR</div>
              <div className="font-medium text-foreground">{liability.apr}%</div>
            </div>
          )}
        </div>

        {/* Cost of Waiting */}
        {costWaiting7Days && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
                <Clock className="w-4 h-4" />
                Cost of Waiting
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-sm" side="top">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Why does timing matter?</h4>
                    <p className="text-muted-foreground">
                      Credit cards and loans charge <strong>daily interest</strong> on your balance. 
                      The longer you wait to pay, the more interest accumulates.
                    </p>
                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span className="text-muted-foreground">
                          <strong>Interest:</strong> Calculated daily based on your APR (Annual Percentage Rate) divided by 365.
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-destructive font-bold">•</span>
                        <span className="text-muted-foreground">
                          <strong>Late fees:</strong> If you miss the due date, you'll be charged a penalty fee on top of interest.
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-2">
                      💡 Paying early saves you money and protects your credit score!
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-white dark:bg-background border border-amber-200 dark:border-amber-800">
                <div className="text-xs text-muted-foreground mb-1">Wait 7 days</div>
                <div className="font-semibold text-amber-600 dark:text-amber-400">+{formatCurrency(costWaiting7Days.total)}</div>
                <div className="text-xs text-muted-foreground">
                  Interest: {formatCurrency(costWaiting7Days.interest)}
                  {costWaiting7Days.lateFee > 0 && ` + ${formatCurrency(costWaiting7Days.lateFee)} fee`}
                </div>
              </div>
              {costWaiting30Days && (
                <div className="text-center p-3 rounded-lg bg-white dark:bg-background border border-amber-200 dark:border-amber-800">
                  <div className="text-xs text-muted-foreground mb-1">Wait 30 days</div>
                  <div className="font-semibold text-destructive">+{formatCurrency(costWaiting30Days.total)}</div>
                  <div className="text-xs text-muted-foreground">
                    Interest: {formatCurrency(costWaiting30Days.interest)}
                    {costWaiting30Days.lateFee > 0 && ` + ${formatCurrency(costWaiting30Days.lateFee)} fee`}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payoff Calculator */}
        {liability.apr && liability.minPayment && (
          <DebtPayoffCalculator
            balance={liability.currentBalance}
            apr={liability.apr}
            minPayment={liability.minPayment}
            lenderName={liability.lender}
          />
        )}

        {/* Payment Options */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Payment Options</div>
          <div className="grid gap-2">
            {liability.minPayment && (
              <Button variant="outline" className="justify-between h-auto py-3">
                <span>Pay Minimum</span>
                <span className="font-semibold">{formatCurrency(liability.minPayment)}</span>
              </Button>
            )}
            {recommendedPayment > (liability.minPayment || 0) && (
              <Button variant="outline" className="justify-between h-auto py-3 border-primary/50 bg-primary/5">
                <div className="flex items-center gap-2">
                  <span>Recommended</span>
                  <span className="text-xs text-muted-foreground">(based on safe-to-spend)</span>
                </div>
                <span className="font-semibold text-primary">{formatCurrency(recommendedPayment)}</span>
              </Button>
            )}
            <Button variant="outline" className="justify-between h-auto py-3">
              <span>Pay in Full</span>
              <span className="font-semibold">{formatCurrency(liability.currentBalance)}</span>
            </Button>
            <Button variant="ghost" className="justify-center text-muted-foreground">
              Custom Amount
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DebtDetail;
