import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Car, ChevronRight, ArrowUpDown } from 'lucide-react';
import { mockLiabilities, calculateSafeToSpend } from '@/lib/mockData';
import { format, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
type SortOption = 'due_date' | 'amount' | 'apr';

const sortLabels: Record<SortOption, string> = {
  due_date: 'Due Date',
  amount: 'Amount',
  apr: 'Interest Rate',
};

export const DebtDashboard = () => {
  const [sortBy, setSortBy] = useState<SortOption>('due_date');
  const { safeToSpend } = calculateSafeToSpend();
  const totalDebt = mockLiabilities.reduce((sum, l) => sum + l.currentBalance, 0);

  // Sort liabilities based on selected option
  const sortedLiabilities = [...mockLiabilities].sort((a, b) => {
    switch (sortBy) {
      case 'due_date':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      case 'amount':
        return b.currentBalance - a.currentBalance;
      case 'apr':
        return (b.apr || 0) - (a.apr || 0);
      default:
        return 0;
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="sphere-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground font-display">Lenders & Debts</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Total owed: {formatCurrency(totalDebt)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Safe to pay today</div>
          <div className="text-lg font-semibold text-success">{formatCurrency(safeToSpend)}</div>
        </div>
      </div>

      {/* Sort Control */}
      <div className="flex items-center justify-end mb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="text-xs">{sortLabels[sortBy]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setSortBy('due_date')}
              className={sortBy === 'due_date' ? 'bg-secondary' : ''}
            >
              Due Date (soonest first)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortBy('amount')}
              className={sortBy === 'amount' ? 'bg-secondary' : ''}
            >
              Amount (highest first)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortBy('apr')}
              className={sortBy === 'apr' ? 'bg-secondary' : ''}
            >
              Interest Rate (highest first)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        {sortedLiabilities.map((liability, index) => (
          <DebtBubble 
            key={liability.id} 
            liability={liability} 
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
};

interface DebtBubbleProps {
  liability: typeof mockLiabilities[0];
  index: number;
}

const DebtBubble = ({ liability, index }: DebtBubbleProps) => {
  const navigate = useNavigate();
  
  const daysUntilDue = liability.dueDate 
    ? differenceInDays(liability.dueDate, new Date())
    : null;
  
  // Credit utilization (assume $10k limit for demo)
  const utilizationPercent = liability.type === 'credit_card'
    ? (liability.currentBalance / 10000) * 100
    : null;

  // Urgency state
  const getUrgencyState = () => {
    if (liability.status === 'overdue') return { label: 'Overdue', color: 'text-destructive' };
    if (daysUntilDue !== null && daysUntilDue <= 3) return { label: `${daysUntilDue} days`, color: 'text-destructive' };
    if (daysUntilDue !== null && daysUntilDue <= 7) return { label: `${daysUntilDue} days`, color: 'text-warning' };
    if (daysUntilDue !== null) return { label: `${daysUntilDue} days`, color: 'text-muted-foreground' };
    return { label: 'No due date', color: 'text-muted-foreground' };
  };

  const urgency = getUrgencyState();

  // Amount to display (minimum payment for credit cards, or current balance)
  const displayAmount = liability.minPayment || liability.currentBalance;

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.05 }}
      onClick={() => navigate(`/debts/${liability.id}`)}
      className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 hover:border-border transition-all text-left group"
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground shrink-0">
          {getIcon(liability.type)}
        </div>
        
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-0.5">
          {/* Account name + type on one line */}
          <div className="font-medium text-foreground text-sm">
            {liability.lender} <span className="text-muted-foreground font-normal text-xs">• {getTypeLabel(liability.type)}</span>
          </div>
          {/* Due date + urgency on one line */}
          <div className="text-xs text-muted-foreground">
            {liability.dueDate && (
              <>
                Due {format(liability.dueDate, 'MMM d')} • <span className={urgency.color}>{urgency.label}</span>
              </>
            )}
            {/* Credit utilization inline */}
            {utilizationPercent !== null && (
              <span className={`ml-2 ${utilizationPercent > 30 ? 'text-warning' : 'text-success'}`}>
                • {utilizationPercent.toFixed(0)}% used
              </span>
            )}
          </div>
        </div>

        {/* Amount + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div className="font-semibold text-foreground font-display">
              {formatCurrency(displayAmount)}
            </div>
            {liability.minPayment && (
              <div className="text-xs text-muted-foreground">min due</div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </motion.button>
  );
};

export default DebtDashboard;
