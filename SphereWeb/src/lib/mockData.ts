// Mock data for Sphere finance dashboard

export interface Account {
  id: string;
  institution: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan';
  name: string;
  availableBalance: number;
  currentBalance: number;
  currency: string;
  lastSync: Date;
  icon: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: Date;
  amount: number;
  merchant: string;
  category: string;
  pending: boolean;
  paymentChannel: string;
}

export interface Liability {
  id: string;
  lender: string;
  type: 'credit_card' | 'loan' | 'bnpl' | 'mortgage';
  currentBalance: number;
  statementBalance?: number;
  minPayment?: number;
  dueDate?: Date;
  apr?: number;
  lateFeeRule?: number;
  status: 'current' | 'due_soon' | 'overdue';
  icon: string;
}

export interface RecurringCharge {
  id: string;
  merchant: string;
  cadence: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  nextDate: Date;
  avgAmount: number;
  category: string;
}

export interface DailySpend {
  date: Date;
  totalSpend: number;
  categories: { [key: string]: number };
}

export const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    institution: 'TD Bank',
    type: 'checking',
    name: 'Chequing Account',
    availableBalance: 4250.32,
    currentBalance: 4350.32,
    currency: 'CAD',
    lastSync: new Date(),
    icon: '🟢'
  },
  {
    id: 'acc-2',
    institution: 'RBC',
    type: 'checking',
    name: 'Day to Day Banking',
    availableBalance: 2875.50,
    currentBalance: 2875.50,
    currency: 'CAD',
    lastSync: new Date(),
    icon: '🔵'
  },
  {
    id: 'acc-3',
    institution: 'TD Bank',
    type: 'savings',
    name: 'High Interest Savings',
    availableBalance: 12500.00,
    currentBalance: 12500.00,
    currency: 'CAD',
    lastSync: new Date(),
    icon: '🟢'
  },
  {
    id: 'acc-4',
    institution: 'RBC',
    type: 'savings',
    name: 'TFSA Savings',
    availableBalance: 8750.00,
    currentBalance: 8750.00,
    currency: 'CAD',
    lastSync: new Date(),
    icon: '🔵'
  },
  {
    id: 'acc-5',
    institution: 'Fidelity',
    type: 'investment',
    name: 'Brokerage Account',
    availableBalance: 34567.89,
    currentBalance: 34567.89,
    currency: 'CAD',
    lastSync: new Date(),
    icon: '📈'
  },
];

export const mockLiabilities: Liability[] = [
  {
    id: 'lia-1',
    lender: 'Chase Sapphire',
    type: 'credit_card',
    currentBalance: 2340.50,
    statementBalance: 2100.00,
    minPayment: 45.00,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    apr: 24.99,
    lateFeeRule: 39,
    status: 'due_soon',
    icon: '💳'
  },
  {
    id: 'lia-2',
    lender: 'Amex Gold',
    type: 'credit_card',
    currentBalance: 890.25,
    statementBalance: 890.25,
    minPayment: 25.00,
    dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    apr: 21.99,
    lateFeeRule: 29,
    status: 'current',
    icon: '💳'
  },
  {
    id: 'lia-3',
    lender: 'Auto Loan',
    type: 'loan',
    currentBalance: 15234.00,
    minPayment: 425.00,
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    apr: 5.99,
    status: 'current',
    icon: '🚗'
  },
];

export const mockRecurringCharges: RecurringCharge[] = [
  { id: 'rec-1', merchant: 'Netflix', cadence: 'monthly', nextDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), avgAmount: 15.99, category: 'Entertainment' },
  { id: 'rec-2', merchant: 'Spotify', cadence: 'monthly', nextDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), avgAmount: 10.99, category: 'Entertainment' },
  { id: 'rec-3', merchant: 'Electric Co', cadence: 'monthly', nextDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), avgAmount: 145.00, category: 'Utilities' },
  { id: 'rec-4', merchant: 'Gym Membership', cadence: 'monthly', nextDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), avgAmount: 49.99, category: 'Health' },
  { id: 'rec-5', merchant: 'iCloud Storage', cadence: 'monthly', nextDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), avgAmount: 2.99, category: 'Tech' },
];

// Generate mock transactions for the past 30 days
export const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const merchants = [
    { name: 'Whole Foods', category: 'Groceries' },
    { name: 'Amazon', category: 'Shopping' },
    { name: 'Starbucks', category: 'Coffee' },
    { name: 'Uber', category: 'Transport' },
    { name: 'Target', category: 'Shopping' },
    { name: 'Chipotle', category: 'Dining' },
    { name: 'Shell Gas', category: 'Gas' },
    { name: 'CVS Pharmacy', category: 'Health' },
    { name: 'Apple Store', category: 'Tech' },
    { name: 'Local Restaurant', category: 'Dining' },
  ];

  for (let i = 0; i < 45; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    transactions.push({
      id: `txn-${i}`,
      accountId: Math.random() > 0.3 ? 'acc-1' : 'acc-3',
      date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      amount: -(Math.random() * 150 + 5).toFixed(2) as unknown as number,
      merchant: merchant.name,
      category: merchant.category,
      pending: daysAgo < 2 && Math.random() > 0.5,
      paymentChannel: Math.random() > 0.5 ? 'card' : 'online',
    });
  }

  // Add income
  transactions.push({
    id: 'txn-income-1',
    accountId: 'acc-1',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    amount: 3200.00,
    merchant: 'Direct Deposit - Employer',
    category: 'Income',
    pending: false,
    paymentChannel: 'ach',
  });

  transactions.push({
    id: 'txn-income-2',
    accountId: 'acc-1',
    date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    amount: 3200.00,
    merchant: 'Direct Deposit - Employer',
    category: 'Income',
    pending: false,
    paymentChannel: 'ach',
  });

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const mockTransactions = generateMockTransactions();

// Generate daily spend data for calendar
export const generateDailySpend = (): DailySpend[] => {
  const dailyData: DailySpend[] = [];
  
  for (let i = 0; i < 35; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayTransactions = mockTransactions.filter(t => {
      const txDate = new Date(t.date);
      txDate.setHours(0, 0, 0, 0);
      return txDate.getTime() === date.getTime() && t.amount < 0;
    });

    const categories: { [key: string]: number } = {};
    let total = 0;

    dayTransactions.forEach(t => {
      const amount = Math.abs(t.amount);
      total += amount;
      categories[t.category] = (categories[t.category] || 0) + amount;
    });

    dailyData.push({
      date,
      totalSpend: total,
      categories,
    });
  }

  return dailyData;
};

export const mockDailySpend = generateDailySpend();

// Calculate Safe-to-Spend
export const calculateSafeToSpend = () => {
  const liquidAvailable = mockAccounts
    .filter(a => a.type === 'checking')
    .reduce((sum, a) => sum + a.availableBalance, 0);
  
  const pendingOutflows = mockTransactions
    .filter(t => t.pending && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const upcoming7dEssentials = mockRecurringCharges
    .filter(r => {
      const daysUntil = Math.ceil((r.nextDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      return daysUntil <= 7 && daysUntil >= 0;
    })
    .reduce((sum, r) => sum + r.avgAmount, 0);
  
  const userBuffer = 200;

  const safeToSpend = liquidAvailable - pendingOutflows - upcoming7dEssentials - userBuffer;

  return {
    safeToSpend: Math.max(0, safeToSpend),
    breakdown: {
      liquidAvailable,
      pendingOutflows,
      upcoming7dEssentials,
      userBuffer,
    }
  };
};

// Calculate cost of waiting for liabilities
export const calculateCostOfWaiting = (liability: Liability, daysToWait: number) => {
  if (!liability.apr) return null;
  
  const dailyRate = liability.apr / 100 / 365;
  const interest = liability.currentBalance * dailyRate * daysToWait;
  
  let lateFee = 0;
  if (liability.dueDate && liability.lateFeeRule) {
    const daysUntilDue = Math.ceil((liability.dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    if (daysToWait > daysUntilDue) {
      lateFee = liability.lateFeeRule;
    }
  }

  return {
    interest: Number(interest.toFixed(2)),
    lateFee,
    total: Number((interest + lateFee).toFixed(2)),
  };
};

// Net worth calculation
export const calculateNetWorth = () => {
  const assets = mockAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const liabilities = mockLiabilities.reduce((sum, l) => sum + l.currentBalance, 0);
  return {
    assets,
    liabilities,
    netWorth: assets - liabilities,
  };
};

// Mock investment accounts data
export interface InvestmentAccount {
  id: string;
  name: string;
  institution: string;
  balance: number;
  contributions: number;
  gain: number;
  gainPercent: number;
  color: string;
}

export const mockInvestmentAccounts: InvestmentAccount[] = [
  {
    id: 'inv-1',
    name: 'Fidelity 401(k)',
    institution: 'Fidelity',
    balance: 18500.00,
    contributions: 15000,
    gain: 3500,
    gainPercent: 23.3,
    color: 'hsl(152, 45%, 45%)',
  },
  {
    id: 'inv-2',
    name: 'Vanguard IRA',
    institution: 'Vanguard',
    balance: 9800.00,
    contributions: 8000,
    gain: 1800,
    gainPercent: 22.5,
    color: 'hsl(220, 50%, 55%)',
  },
  {
    id: 'inv-3',
    name: 'Robinhood Brokerage',
    institution: 'Robinhood',
    balance: 6267.89,
    contributions: 5000,
    gain: 1267.89,
    gainPercent: 25.4,
    color: 'hsl(38, 70%, 55%)',
  },
];
