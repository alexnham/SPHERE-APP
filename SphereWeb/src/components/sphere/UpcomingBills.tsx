import { motion } from 'framer-motion';
import { Calendar, RefreshCw, ChevronRight, Tv, Zap, Dumbbell, Smartphone, UtensilsCrossed, Car, FileText, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockRecurringCharges } from '@/lib/mockData';
import { format, differenceInDays } from 'date-fns';

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

const getGentleMessage = (daysUntil: number, merchant: string): string => {
  if (daysUntil === 0) {
    return `${merchant} is due today — you've got this`;
  } else if (daysUntil === 1) {
    return `${merchant} tomorrow — just a heads up`;
  } else if (daysUntil <= 3) {
    return `${merchant} in ${daysUntil} days — no rush, just planning`;
  }
  return '';
};

export const UpcomingBills = () => {
  const navigate = useNavigate();
  
  const sortedBills = [...mockRecurringCharges].sort(
    (a, b) => a.nextDate.getTime() - b.nextDate.getTime()
  );

  const totalUpcoming = sortedBills
    .filter(b => differenceInDays(b.nextDate, new Date()) <= 7)
    .reduce((sum, b) => sum + b.avgAmount, 0);

  const displayedBills = sortedBills.slice(0, 3);
  const remainingCount = sortedBills.length - 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      onClick={() => navigate('/bills')}
      className="sphere-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-lg font-semibold text-foreground font-display">Upcoming Bills</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Next 7 days</div>
            <div className="text-sm font-medium text-foreground">{formatCurrency(totalUpcoming)}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        {displayedBills.map((bill, index) => {
          const daysUntil = differenceInDays(bill.nextDate, new Date());
          
          return (
            <motion.div
              key={bill.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center">
                  {(() => {
                    const Icon = getCategoryIcon(bill.category);
                    return <Icon className="w-4 h-4 text-muted-foreground" />;
                  })()}
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground">{bill.merchant}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    {bill.cadence}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm text-foreground">
                  {formatCurrency(bill.avgAmount)}
                </div>
                <div className={`text-xs ${daysUntil <= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `in ${daysUntil} days`}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {remainingCount > 0 && (
        <div className="mt-4 text-center">
          <span className="text-sm text-primary font-medium">
            +{remainingCount} more bill{remainingCount > 1 ? 's' : ''} • Tap to view all
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default UpcomingBills;
