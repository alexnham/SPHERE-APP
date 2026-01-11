import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, RefreshCw, Bell, Check, Clock, Tv, Zap, Dumbbell, Smartphone, UtensilsCrossed, Car, FileText, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockRecurringCharges } from '@/lib/mockData';
import { format, differenceInDays } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const getCategoryIcon = (category: string): LucideIcon => {
  const map: { [key: string]: LucideIcon } = {
    'Entertainment': Tv,
    'Utilities': Zap,
    'Health': Dumbbell,
    'Tech': Smartphone,
    'Food': UtensilsCrossed,
    'Transport': Car,
  };
  return map[category] || FileText;
};

const Bills = () => {
  const navigate = useNavigate();
  const [acknowledgedBills, setAcknowledgedBills] = useState<Set<string>>(new Set());

  const sortedBills = [...mockRecurringCharges].sort(
    (a, b) => a.nextDate.getTime() - b.nextDate.getTime()
  );

  const totalMonthly = sortedBills
    .filter(b => b.cadence === 'monthly')
    .reduce((sum, b) => sum + b.avgAmount, 0);

  const totalUpcoming = sortedBills
    .filter(b => differenceInDays(b.nextDate, new Date()) <= 7)
    .reduce((sum, b) => sum + b.avgAmount, 0);

  const acknowledgeBill = (billId: string) => {
    setAcknowledgedBills(prev => new Set([...prev, billId]));
  };

  // Group bills by timeframe
  const thisWeek = sortedBills.filter(b => differenceInDays(b.nextDate, new Date()) <= 7);
  const laterBills = sortedBills.filter(b => differenceInDays(b.nextDate, new Date()) > 7);

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
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Bills
          </h1>
          <p className="text-sm text-muted-foreground">
            {mockRecurringCharges.length} recurring charges detected
          </p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="sphere-card p-4 text-center">
          <div className="text-xs text-muted-foreground mb-1">Next 7 Days</div>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(totalUpcoming)}</div>
        </div>
        <div className="sphere-card p-4 text-center">
          <div className="text-xs text-muted-foreground mb-1">Monthly Total</div>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(totalMonthly)}</div>
        </div>
      </motion.div>

      {/* This Week */}
      {thisWeek.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="sphere-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Due This Week
          </h2>
          <div className="space-y-2">
            {thisWeek.map((bill, index) => {
              const daysUntil = differenceInDays(bill.nextDate, new Date());
              const isAcknowledged = acknowledgedBills.has(bill.id);

              return (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className={`
                    flex items-center justify-between py-3 px-4 rounded-xl
                    ${isAcknowledged ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center">
                      {(() => {
                        const Icon = getCategoryIcon(bill.category);
                        return <Icon className="w-4 h-4 text-muted-foreground" />;
                      })()}
                    </div>
                    <div>
                      <div className="font-medium text-foreground flex items-center gap-2">
                        {bill.merchant}
                        {isAcknowledged && (
                          <span className="inline-flex items-center justify-center w-4 h-4 bg-primary/20 rounded-full">
                            <Check className="w-2.5 h-2.5 text-primary" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        {bill.cadence} • {format(bill.nextDate, 'MMM d')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-foreground">
                        {formatCurrency(bill.avgAmount)}
                      </div>
                      <div className={`text-xs ${daysUntil <= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `in ${daysUntil} days`}
                      </div>
                    </div>
                    {!isAcknowledged && daysUntil <= 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => acknowledgeBill(bill.id)}
                        className="h-8 px-2 text-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Later Bills */}
      {laterBills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sphere-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Coming Up Later
          </h2>
          <div className="space-y-2">
            {laterBills.map((bill, index) => {
              const daysUntil = differenceInDays(bill.nextDate, new Date());

              return (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.03 }}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center">
                      {(() => {
                        const Icon = getCategoryIcon(bill.category);
                        return <Icon className="w-4 h-4 text-muted-foreground" />;
                      })()}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{bill.merchant}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        {bill.cadence}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      {formatCurrency(bill.avgAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(bill.nextDate, 'MMM d')} ({daysUntil} days)
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Bills;
