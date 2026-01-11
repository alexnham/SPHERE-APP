import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw, PiggyBank, Rocket, Building2 } from 'lucide-react';
import { mockAccounts, mockLiabilities, calculateNetWorth, Account } from '@/lib/mockData';
import TransferMoneyDialog from './TransferMoneyDialog';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Bank logo URLs using logo.clearbit.com
const getBankLogo = (institution: string): string | null => {
  const logoMap: Record<string, string> = {
    'TD Bank': 'https://logo.clearbit.com/td.com',
    'RBC': 'https://logo.clearbit.com/rbc.com',
    'Fidelity': 'https://logo.clearbit.com/fidelity.com',
    'Chase': 'https://logo.clearbit.com/chase.com',
    'Bank of America': 'https://logo.clearbit.com/bankofamerica.com',
    'Wells Fargo': 'https://logo.clearbit.com/wellsfargo.com',
    'Citibank': 'https://logo.clearbit.com/citi.com',
    'Capital One': 'https://logo.clearbit.com/capitalone.com',
    'Scotiabank': 'https://logo.clearbit.com/scotiabank.com',
    'BMO': 'https://logo.clearbit.com/bmo.com',
    'CIBC': 'https://logo.clearbit.com/cibc.com',
    'Tangerine': 'https://logo.clearbit.com/tangerine.ca',
    'Wealthsimple': 'https://logo.clearbit.com/wealthsimple.com',
    'Questrade': 'https://logo.clearbit.com/questrade.com',
    'Vanguard': 'https://logo.clearbit.com/vanguard.com',
    'Charles Schwab': 'https://logo.clearbit.com/schwab.com',
  };
  return logoMap[institution] || null;
};

// Get account type icon
const AccountIcon = ({ account }: { account: Account }) => {
  const logoUrl = getBankLogo(account.institution);
  
  // For savings accounts, show piggy bank
  if (account.type === 'savings') {
    return (
      <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center">
        <PiggyBank className="w-5 h-5 text-muted-foreground" />
      </div>
    );
  }
  
  // For investment/brokerage accounts, show rocket
  if (account.type === 'investment') {
    return (
      <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center">
        <Rocket className="w-5 h-5 text-muted-foreground" />
      </div>
    );
  }
  
  // For checking accounts, show bank logo if available
  if (logoUrl) {
    return (
      <img 
        src={logoUrl}
        alt={account.institution}
        className="w-10 h-10 rounded-full object-contain bg-muted/40 p-1.5"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) fallback.classList.remove('hidden');
        }}
      />
    );
  }
  
  // Fallback to generic bank icon
  return (
    <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center">
      <Building2 className="w-5 h-5 text-muted-foreground" />
    </div>
  );
};

export const AccountsOverview = () => {
  const { assets, liabilities, netWorth } = calculateNetWorth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="sphere-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground font-display">Net Worth</h3>
        <div className="flex items-center gap-2">
          <TransferMoneyDialog />
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-foreground font-display mb-2">
          {formatCurrency(netWorth)}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-muted-foreground">Assets:</span>
            <span className="font-medium text-foreground">{formatCurrency(assets)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <span className="text-muted-foreground">Debts:</span>
            <span className="font-medium text-foreground">{formatCurrency(liabilities)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Accounts</h4>
        {mockAccounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <AccountIcon account={account} />
              <div className="hidden">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">{account.name}</div>
                <div className="text-xs text-muted-foreground">{account.institution}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-sm text-foreground">
                {formatCurrency(account.currentBalance)}
              </div>
              {account.type === 'checking' && account.availableBalance !== account.currentBalance && (
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(account.availableBalance)} available
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AccountsOverview;
