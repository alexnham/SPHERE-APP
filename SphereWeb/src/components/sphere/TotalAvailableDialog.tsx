import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Building2, PiggyBank, Landmark } from 'lucide-react';
import { mockAccounts, Account } from '@/lib/mockData';

interface TotalAvailableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getBankLogo = (institution: string): string | null => {
  const bankLogos: { [key: string]: string } = {
    'TD Bank': 'https://logo.clearbit.com/td.com',
    'RBC': 'https://logo.clearbit.com/rbc.com',
    'Fidelity': 'https://logo.clearbit.com/fidelity.com',
  };
  return bankLogos[institution] || null;
};

const AccountIcon = ({ account }: { account: Account }) => {
  const logo = getBankLogo(account.institution);
  
  if (logo) {
    return (
      <img 
        src={logo} 
        alt={account.institution} 
        className="w-8 h-8 rounded-lg object-contain bg-white p-1"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  
  if (account.type === 'savings') {
    return (
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <PiggyBank className="w-4 h-4 text-primary" />
      </div>
    );
  }
  
  return (
    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
      <Landmark className="w-4 h-4 text-muted-foreground" />
    </div>
  );
};

const TotalAvailableDialog = ({ open, onOpenChange, total }: TotalAvailableDialogProps) => {
  // Only show checking accounts for liquid available
  const checkingAccounts = mockAccounts.filter(a => a.type === 'checking');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Total Available</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Total */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <p className="text-4xl font-bold text-foreground">{formatCurrency(total)}</p>
            <p className="text-sm text-muted-foreground mt-1">Across {checkingAccounts.length} accounts</p>
          </motion.div>

          {/* Breakdown */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Breakdown by Account</p>
            {checkingAccounts.map((account, index) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <AccountIcon account={account} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.institution}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(account.availableBalance)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Visual bar */}
          <div className="space-y-2">
            <div className="flex h-3 rounded-full overflow-hidden">
              {checkingAccounts.map((account, index) => {
                const percentage = (account.availableBalance / total) * 100;
                const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];
                return (
                  <motion.div
                    key={account.id}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className="h-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              {checkingAccounts.map((account, index) => {
                const percentage = ((account.availableBalance / total) * 100).toFixed(0);
                return (
                  <span key={account.id}>
                    {account.institution}: {percentage}%
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TotalAvailableDialog;
