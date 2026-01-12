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
  { id: 'acc-1', institution: 'TD Bank', type: 'checking', name: 'Chequing Account', availableBalance: 4250.32, currentBalance: 4350.32, currency: 'CAD', lastSync: new Date(), icon: '🟢' },
  { id: 'acc-2', institution: 'RBC', type: 'checking', name: 'Day to Day Banking', availableBalance: 2875.50, currentBalance: 2875.50, currency: 'CAD', lastSync: new Date(), icon: '🔵' },
  { id: 'acc-3', institution: 'TD Bank', type: 'savings', name: 'High Interest Savings', availableBalance: 12500.00, currentBalance: 12500.00, currency: 'CAD', lastSync: new Date(), icon: '🟢' },
  { id: 'acc-4', institution: 'RBC', type: 'savings', name: 'TFSA Savings', availableBalance: 8750.00, currentBalance: 8750.00, currency: 'CAD', lastSync: new Date(), icon: '🔵' },
  { id: 'acc-5', institution: 'Fidelity', type: 'investment', name: 'Brokerage Account', availableBalance: 34567.89, currentBalance: 34567.89, currency: 'CAD', lastSync: new Date(), icon: '📈' },
];

export const mockLiabilities: Liability[] = [
  { id: 'lia-1', lender: 'Chase Sapphire', type: 'credit_card', currentBalance: 2340.50, statementBalance: 2100.00, minPayment: 45.00, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), apr: 24.99, lateFeeRule: 39, status: 'due_soon', icon: '💳' },
  { id: 'lia-2', lender: 'Amex Gold', type: 'credit_card', currentBalance: 890.25, statementBalance: 890.25, minPayment: 25.00, dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), apr: 21.99, lateFeeRule: 29, status: 'current', icon: '💳' },
  { id: 'lia-3', lender: 'Auto Loan', type: 'loan', currentBalance: 15234.00, minPayment: 425.00, dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), apr: 5.99, status: 'current', icon: '🚗' },
];

export const mockRecurringCharges: RecurringCharge[] = [
  { id: 'rec-1', merchant: 'Netflix', cadence: 'monthly', nextDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), avgAmount: 15.99, category: 'Entertainment' },
  { id: 'rec-2', merchant: 'Spotify', cadence: 'monthly', nextDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), avgAmount: 10.99, category: 'Entertainment' },
  { id: 'rec-3', merchant: 'Electric Co', cadence: 'monthly', nextDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), avgAmount: 145.00, category: 'Utilities' },
  { id: 'rec-4', merchant: 'Gym Membership', cadence: 'monthly', nextDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), avgAmount: 49.99, category: 'Health' },
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
];

export const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  for (let i = 0; i < 45; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    transactions.push({
      id: `txn-${i}`,
      accountId: Math.random() > 0.3 ? 'acc-1' : 'acc-3',
      date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      amount: -(Math.random() * 150 + 5),
      merchant: merchant.name,
      category: merchant.category,
      pending: daysAgo < 2 && Math.random() > 0.5,
      paymentChannel: Math.random() > 0.5 ? 'card' : 'online',
    });
  }
  transactions.push({ id: 'txn-income-1', accountId: 'acc-1', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amount: 3200.00, merchant: 'Direct Deposit - Employer', category: 'Income', pending: false, paymentChannel: 'ach' });
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const mockTransactions = generateMockTransactions();

export const calculateSafeToSpend = () => {
  const liquidAvailable = mockAccounts.filter(a => a.type === 'checking').reduce((sum, a) => sum + a.availableBalance, 0);
  const pendingOutflows = mockTransactions.filter(t => t.pending && t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const upcoming7dEssentials = mockRecurringCharges.filter(r => {
    const daysUntil = Math.ceil((r.nextDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    return daysUntil <= 7 && daysUntil >= 0;
  }).reduce((sum, r) => sum + r.avgAmount, 0);
  const userBuffer = 200;
  const safeToSpend = liquidAvailable - pendingOutflows - upcoming7dEssentials - userBuffer;
  return { safeToSpend: Math.max(0, safeToSpend), breakdown: { liquidAvailable, pendingOutflows, upcoming7dEssentials, userBuffer } };
};

export const calculateNetWorth = () => {
  const assets = mockAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const liabilities = mockLiabilities.reduce((sum, l) => sum + l.currentBalance, 0);
  return { assets, liabilities, netWorth: assets - liabilities };
};

// Helper to convert HSL to Hex
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const colors = {
  light: {
    // Light Cyan Theme - matching web app
    background: hslToHex(185, 50, 95),      // --background: 185 50% 95%
    card: hslToHex(185, 45, 98),            // --card: 185 45% 98%
    surface: hslToHex(185, 40, 96),         // slightly darker for surfaces
    text: hslToHex(195, 30, 20),            // --foreground: 195 30% 20%
    textSecondary: hslToHex(195, 15, 45),   // --muted-foreground: 195 15% 45%
    primary: hslToHex(185, 55, 45),         // --primary: 185 55% 45%
    primaryMuted: 'rgba(45, 140, 150, 0.1)', // cyan primary with opacity
    success: hslToHex(165, 50, 45),         // --success: 165 50% 45%
    successMuted: 'rgba(45, 150, 120, 0.1)',
    warning: hslToHex(38, 92, 50),          // --warning: 38 92% 50%
    warningMuted: 'rgba(245, 158, 11, 0.1)',
    destructive: hslToHex(0, 65, 55),       // --destructive: 0 65% 55%
    destructiveMuted: 'rgba(220, 80, 80, 0.1)',
    border: hslToHex(185, 25, 85),          // --border: 185 25% 85%
    muted: hslToHex(185, 25, 90),           // --muted: 185 25% 90%
    secondary: hslToHex(200, 60, 96),       // --secondary: 200 60% 96%
    pending: hslToHex(38, 80, 50),          // --sphere-pending
    committed: hslToHex(195, 20, 50),       // --sphere-committed
    buffer: hslToHex(185, 55, 45),          // --sphere-buffer (same as primary)
    ring: hslToHex(185, 55, 45),            // --ring
  },
  dark: {
    // Dark Cyan Theme - matching web app
    background: hslToHex(195, 30, 10),      // --background: 195 30% 10%
    card: hslToHex(195, 25, 14),            // --card: 195 25% 14%
    surface: hslToHex(195, 25, 18),         // slightly lighter for surfaces
    text: hslToHex(185, 25, 90),            // --foreground: 185 25% 90%
    textSecondary: hslToHex(185, 15, 55),   // --muted-foreground: 185 15% 55%
    primary: hslToHex(185, 50, 55),         // --primary: 185 50% 55%
    primaryMuted: 'rgba(70, 180, 190, 0.15)', // cyan primary with opacity
    success: hslToHex(165, 50, 50),         // --success: 165 50% 50%
    successMuted: 'rgba(52, 211, 153, 0.15)',
    warning: hslToHex(38, 85, 55),          // --warning: 38 85% 55%
    warningMuted: 'rgba(251, 191, 36, 0.15)',
    destructive: hslToHex(0, 65, 55),       // --destructive: 0 65% 55%
    destructiveMuted: 'rgba(248, 113, 113, 0.15)',
    border: hslToHex(195, 20, 20),          // --border: 195 20% 20%
    muted: hslToHex(195, 20, 18),           // --muted: 195 20% 18%
    secondary: hslToHex(200, 40, 22),       // --secondary: 200 40% 22%
    pending: hslToHex(38, 85, 55),          // --sphere-pending
    committed: hslToHex(195, 20, 55),       // --sphere-committed
    buffer: hslToHex(185, 50, 50),          // --sphere-buffer
    ring: hslToHex(185, 50, 55),            // --ring
  },
};

export const categoryColors: Record<string, string> = {
  // Cyan palette category colors - matching web app
  Groceries: hslToHex(165, 55, 55),         // --category-groceries
  Shopping: hslToHex(320, 45, 65),          // --category-shopping
  Coffee: hslToHex(30, 60, 55),             // --category-coffee
  Transport: hslToHex(185, 50, 50),         // --category-transport
  Dining: hslToHex(10, 55, 60),             // --category-dining
  Gas: hslToHex(200, 50, 58),               // --category-gas
  Health: hslToHex(175, 50, 50),            // --category-health
  Tech: hslToHex(260, 50, 65),              // --category-tech
  Entertainment: hslToHex(340, 50, 65),     // --category-entertainment
  Utilities: hslToHex(190, 50, 55),         // --category-utilities
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
};