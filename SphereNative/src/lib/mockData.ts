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
  name: string;
  lender: string;
  type: 'credit_card' | 'loan' | 'bnpl' | 'mortgage' | 'student_loan' | 'auto_loan' | 'personal_loan';
  currentBalance: number;
  creditLimit?: number;
  statementBalance?: number;
  minimumPayment?: number;
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
  amount: number;
  categories: { [key: string]: number };
}

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

// Category colors
export const categoryColors: Record<string, string> = {
  'Food & Dining': '#f97316',
  'Groceries': '#22c55e',
  'Shopping': '#ec4899',
  'Transportation': '#3b82f6',
  'Entertainment': '#8b5cf6',
  'Bills & Utilities': '#6b7280',
  'Health': '#ef4444',
  'Coffee': '#92400e',
  'Gas': '#64748b',
  'Tech': '#06b6d4',
  'Dining': '#f97316',
  'Transport': '#3b82f6',
  'Other': '#9ca3af',
};

export const accounts: Account[] = [
  { id: 'acc-1', institution: 'TD Bank', type: 'checking', name: 'Chequing Account', availableBalance: 4250.32, currentBalance: 4350.32, currency: 'CAD', lastSync: new Date(), icon: '🟢' },
  { id: 'acc-2', institution: 'RBC', type: 'checking', name: 'Day to Day Banking', availableBalance: 2875.50, currentBalance: 2875.50, currency: 'CAD', lastSync: new Date(), icon: '🔵' },
  { id: 'acc-3', institution: 'TD Bank', type: 'savings', name: 'High Interest Savings', availableBalance: 12500.00, currentBalance: 12500.00, currency: 'CAD', lastSync: new Date(), icon: '🟢' },
  { id: 'acc-4', institution: 'RBC', type: 'savings', name: 'TFSA Savings', availableBalance: 8750.00, currentBalance: 8750.00, currency: 'CAD', lastSync: new Date(), icon: '🔵' },
  { id: 'acc-5', institution: 'Fidelity', type: 'investment', name: 'Brokerage Account', availableBalance: 34567.89, currentBalance: 34567.89, currency: 'CAD', lastSync: new Date(), icon: '📈' },
];

export const liabilities: Liability[] = [
  { id: 'lia-1', name: 'Chase Sapphire', lender: 'Chase', type: 'credit_card', currentBalance: 2340.50, creditLimit: 10000, statementBalance: 2100.00, minimumPayment: 45.00, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), apr: 24.99, lateFeeRule: 39, status: 'due_soon', icon: '💳' },
  { id: 'lia-2', name: 'Amex Gold', lender: 'American Express', type: 'credit_card', currentBalance: 890.25, creditLimit: 5000, statementBalance: 890.25, minimumPayment: 25.00, dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), apr: 21.99, lateFeeRule: 29, status: 'current', icon: '💳' },
  { id: 'lia-3', name: 'Auto Loan', lender: 'Toyota Financial', type: 'auto_loan', currentBalance: 15234.00, minimumPayment: 425.00, dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), apr: 5.99, status: 'current', icon: '🚗' },
  { id: 'lia-4', name: 'Student Loan', lender: 'Navient', type: 'student_loan', currentBalance: 28500.00, minimumPayment: 285.00, dueDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), apr: 4.5, status: 'current', icon: '🎓' },
];

export const recurringCharges: RecurringCharge[] = [
  { id: 'rec-1', merchant: 'Netflix', cadence: 'monthly', nextDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), avgAmount: 15.99, category: 'Entertainment' },
  { id: 'rec-2', merchant: 'Spotify', cadence: 'monthly', nextDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), avgAmount: 10.99, category: 'Entertainment' },
  { id: 'rec-3', merchant: 'Electric Co', cadence: 'monthly', nextDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), avgAmount: 145.00, category: 'Bills & Utilities' },
  { id: 'rec-4', merchant: 'Gym Membership', cadence: 'monthly', nextDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), avgAmount: 49.99, category: 'Health' },
  { id: 'rec-5', merchant: 'iCloud Storage', cadence: 'monthly', nextDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), avgAmount: 2.99, category: 'Tech' },
];

export const investmentAccounts: InvestmentAccount[] = [
  { id: 'inv-1', name: 'Fidelity 401(k)', institution: 'Fidelity', balance: 18500.00, contributions: 15000, gain: 3500, gainPercent: 23.3, color: '#10B981' },
  { id: 'inv-2', name: 'Vanguard IRA', institution: 'Vanguard', balance: 9800.00, contributions: 8000, gain: 1800, gainPercent: 22.5, color: '#3B82F6' },
  { id: 'inv-3', name: 'Robinhood Brokerage', institution: 'Robinhood', balance: 6267.89, contributions: 5000, gain: 1267.89, gainPercent: 25.4, color: '#F59E0B' },
];

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

export const generateTransactions = (): Transaction[] => {
  const txns: Transaction[] = [];
  for (let i = 0; i < 45; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    txns.push({
      id: `txn-${i}`,
      accountId: Math.random() > 0.3 ? 'acc-1' : 'acc-3',
      date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      amount: Math.random() * 150 + 5,
      merchant: merchant.name,
      category: merchant.category,
      pending: daysAgo < 2 && Math.random() > 0.5,
      paymentChannel: Math.random() > 0.5 ? 'card' : 'online',
    });
  }
  return txns.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const transactions = generateTransactions();

export const generateDailySpendData = (): DailySpend[] => {
  const data: DailySpend[] = [];
  for (let i = 0; i < 35; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const amount = Math.random() > 0.2 ? Math.floor(Math.random() * 200) + 10 : 0;
    data.push({
      date,
      amount,
      categories: { Shopping: amount * 0.4, Food: amount * 0.3, Other: amount * 0.3 },
    });
  }
  return data;
};

export const dailySpendData = generateDailySpendData();

export const calculateSafeToSpend = () => {
  const liquidAvailable = accounts.filter(a => a.type === 'checking').reduce((sum, a) => sum + a.availableBalance, 0);
  const pendingOutflows = transactions.filter(t => t.pending).reduce((sum, t) => sum + t.amount, 0);
  const upcoming7dEssentials = recurringCharges.filter(r => {
    const daysUntil = Math.ceil((r.nextDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    return daysUntil <= 7 && daysUntil >= 0;
  }).reduce((sum, r) => sum + r.avgAmount, 0);
  const userBuffer = 200;
  const safeToSpend = liquidAvailable - pendingOutflows - upcoming7dEssentials - userBuffer;
  return { safeToSpend: Math.max(0, safeToSpend), breakdown: { liquidAvailable, pendingOutflows, upcoming7dEssentials, userBuffer } };
};

export const calculateNetWorth = () => {
  const assets = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const liabilitiesTotal = liabilities.reduce((sum, l) => sum + l.currentBalance, 0);
  return { assets, liabilities: liabilitiesTotal, netWorth: assets - liabilitiesTotal };
};