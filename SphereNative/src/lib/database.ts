import { apiCall } from './supabase';
import { Account, Transaction, Liability, RecurringCharge, InvestmentAccount, DailySpend } from './mockData';

// ============================================================================
// TYPE DEFINITIONS (based on API responses)
// ============================================================================

export interface DatabaseAccount {
  id: string;
  plaid_account_id: string;
  name: string;
  official_name?: string;
  type: string;
  subtype?: string;
  current_balance: number;
  available_balance: number;
  currency: string;
  mask?: string;
  icon?: string;
  last_synced_at?: string;
  plaid_items?: {
    institution_name: string;
    status: string;
  };
}

export interface DatabaseTransaction {
  id: string;
  plaid_transaction_id?: string;
  account_id: string;
  user_id: string;
  amount: number;
  direction?: 'INFLOW' | 'OUTFLOW'; // INFLOW = income/deposits, OUTFLOW = expenses/purchases
  date: string; // Posted date (YYYY-MM-DD)
  authorized_date?: string; // Authorized/purchase date (YYYY-MM-DD)
  datetime?: string; // Posted datetime (ISO 8601)
  authorized_datetime?: string; // Authorized/purchase datetime (ISO 8601)
  merchant_name?: string;
  primary_category?: string;
  name?: string;
  category?: string[];
  subcategory?: string;
  pending: boolean;
  payment_channel?: string;
  account?: {
    id: string;
    name: string;
    type: string;
    subtype?: string;
    mask?: string;
  };
  recurring_stream?: any;
}

export interface DatabaseLiability {
  id: string;
  name: string;
  lender: string;
  type: 'credit_card' | 'loan' | 'bnpl' | 'mortgage' | 'student_loan' | 'auto_loan' | 'personal_loan';
  current_balance: number;
  credit_limit?: number;
  statement_balance?: number;
  minimum_payment?: number;
  due_date?: string;
  apr?: number;
  late_fee?: number;
  status: 'current' | 'due_soon' | 'overdue';
  icon?: string;
  account_id?: string;
}

export interface DatabaseRecurringTransaction {
  id: string;
  stream_id: string;
  description?: string;
  merchant_name?: string;
  category?: string[];
  is_active: boolean;
  frequency?: string;
  average_amount?: number;
  last_amount?: number;
  last_date?: string;
  first_date?: string;
  next_expected_date?: string;
  days_until_next?: number;
  is_overdue?: boolean;
}

export interface DatabaseVault {
  id: string;
  name: string;
  icon: string;
  balance: number;
  color: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalVaultBalance: number;
  totalDebt: number;
  netWorth: number;
  accountCount: number;
  vaultCount: number;
  liabilityCount: number;
  transactionCount: number;
  pendingTransactionCount: number;
  overdueLiabilityCount: number;
  connectedBanks: number;
}

// ============================================================================
// HELPER FUNCTIONS - Map database types to app types
// ============================================================================

export const mapAccount = (dbAccount: DatabaseAccount): Account => {
  const typeMap: Record<string, Account['type']> = {
    'depository': 'checking',
    'credit': 'credit',
    'loan': 'loan',
    'investment': 'investment',
  };

  const subtypeMap: Record<string, Account['type']> = {
    'checking': 'checking',
    'cash_management': 'checking', // Cash management is treated as checking
    'cash management': 'checking',
    'savings': 'savings',
    'credit card': 'credit',
    'brokerage': 'investment',
  };

  let accountType: Account['type'] = 'checking';
  if (dbAccount.subtype) {
    accountType = subtypeMap[dbAccount.subtype] || accountType;
  }
  if (dbAccount.type) {
    accountType = typeMap[dbAccount.type] || accountType;
  }

  return {
    id: dbAccount.id,
    institution: dbAccount.plaid_items?.institution_name || 'Unknown',
    type: accountType,
    name: dbAccount.name,
    availableBalance: dbAccount.available_balance || 0,
    currentBalance: dbAccount.current_balance || 0,
    currency: dbAccount.currency || 'USD',
    lastSync: dbAccount.last_synced_at ? new Date(dbAccount.last_synced_at) : new Date(),
    icon: dbAccount.icon || '🏦',
  };
};

export const mapTransaction = (dbTransaction: DatabaseTransaction): Transaction => {
  // Parse date strings (YYYY-MM-DD) to Date objects
  // Ensure dates are parsed in local timezone to avoid timezone issues
  const parseDate = (dateStr: string): Date => {
    // If date is in YYYY-MM-DD format, parse it as local date
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date(dateStr);
  };

  return {
    id: dbTransaction.id,
    accountId: dbTransaction.account_id,
    date: parseDate(dbTransaction.date), // Posted date
    authorizedDate: dbTransaction.authorized_date ? parseDate(dbTransaction.authorized_date) : undefined, // Purchase date
    datetime: dbTransaction.datetime ? new Date(dbTransaction.datetime) : undefined, // Posted datetime
    authorizedDatetime: dbTransaction.authorized_datetime ? new Date(dbTransaction.authorized_datetime) : undefined, // Purchase datetime
    amount: dbTransaction.amount,
    direction: dbTransaction.direction, // INFLOW or OUTFLOW
    merchant: dbTransaction.merchant_name || dbTransaction.name || 'Unknown',
    category: dbTransaction.primary_category || dbTransaction.category?.[0] || 'Other',
    pending: dbTransaction.pending || false,
    paymentChannel: dbTransaction.payment_channel || 'other',
  };
};

export const mapLiability = (dbLiability: DatabaseLiability): Liability => {
  return {
    id: dbLiability.id,
    name: dbLiability.name,
    lender: dbLiability.lender,
    type: dbLiability.type,
    currentBalance: dbLiability.current_balance,
    creditLimit: dbLiability.credit_limit,
    statementBalance: dbLiability.statement_balance,
    minimumPayment: dbLiability.minimum_payment,
    dueDate: dbLiability.due_date ? new Date(dbLiability.due_date) : undefined,
    apr: dbLiability.apr,
    lateFeeRule: dbLiability.late_fee,
    status: dbLiability.status,
    icon: dbLiability.icon || '💳',
  };
};

export const mapRecurringCharge = (dbRecurring: DatabaseRecurringTransaction): RecurringCharge => {
  const cadenceMap: Record<string, RecurringCharge['cadence']> = {
    'WEEKLY': 'weekly',
    'BIWEEKLY': 'biweekly',
    'MONTHLY': 'monthly',
    'YEARLY': 'yearly',
  };

  return {
    id: dbRecurring.id,
    merchant: dbRecurring.merchant_name || dbRecurring.description || 'Unknown',
    cadence: cadenceMap[dbRecurring.frequency || 'MONTHLY'] || 'monthly',
    nextDate: dbRecurring.next_expected_date ? new Date(dbRecurring.next_expected_date) : new Date(),
    avgAmount: dbRecurring.average_amount || dbRecurring.last_amount || 0,
    category: dbRecurring.category?.[0] || 'Other',
  };
};

// ============================================================================
// DATABASE SERVICE FUNCTIONS
// ============================================================================

// Accounts
export const getAccounts = async (): Promise<Account[]> => {
  const accounts: DatabaseAccount[] = await apiCall('/api/accounts');
  return accounts.map(mapAccount);
};

// Transactions
export const getTransactions = async (options?: {
  limit?: number;
  offset?: number;
  account_id?: string;
  category?: string;
  pending?: boolean;
  start_date?: string;
  end_date?: string;
  authorized_start_date?: string;
  authorized_end_date?: string;
}): Promise<Transaction[]> => {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());
  if (options?.account_id) params.append('account_id', options.account_id);
  if (options?.category) params.append('category', options.category);
  if (options?.pending !== undefined) params.append('pending', options.pending.toString());
  if (options?.start_date) params.append('start_date', options.start_date);
  if (options?.end_date) params.append('end_date', options.end_date);
  if (options?.authorized_start_date) params.append('authorized_start_date', options.authorized_start_date);
  if (options?.authorized_end_date) params.append('authorized_end_date', options.authorized_end_date);

  const queryString = params.toString();
  const url = `/api/transactions${queryString ? `?${queryString}` : ''}`;
  const transactions: DatabaseTransaction[] = await apiCall(url);
  return transactions.map(mapTransaction);
};

// Liabilities
export const getLiabilities = async (): Promise<Liability[]> => {
  const liabilities: DatabaseLiability[] = await apiCall('/api/liabilities');
  return liabilities.map(mapLiability);
};

// Recurring Transactions (Bills)
export const getRecurringTransactions = async (options?: {
  is_active?: boolean;
  frequency?: string;
}): Promise<RecurringCharge[]> => {
  const params = new URLSearchParams();
  if (options?.is_active !== undefined) params.append('is_active', options.is_active.toString());
  if (options?.frequency) params.append('frequency', options.frequency);

  const queryString = params.toString();
  const url = `/api/recurring_transactions${queryString ? `?${queryString}` : ''}`;
  const recurring: DatabaseRecurringTransaction[] = await apiCall(url);
  return recurring.map(mapRecurringCharge);
};

// Also available as getBills for consistency
export const getBills = getRecurringTransactions;

// Savings Vaults
export const getVaults = async (): Promise<DatabaseVault[]> => {
  return await apiCall('/api/vaults');
};

export const createVault = async (vault: {
  name: string;
  icon?: string;
  balance?: number;
  color?: string;
  description?: string;
}): Promise<DatabaseVault> => {
  return await apiCall('/api/vaults', {
    method: 'POST',
    body: JSON.stringify(vault),
  });
};

export const updateVault = async (vault: {
  id: string;
  name?: string;
  icon?: string;
  balance?: number;
  color?: string;
  description?: string;
}): Promise<DatabaseVault> => {
  return await apiCall('/api/vaults', {
    method: 'PATCH',
    body: JSON.stringify(vault),
  });
};

export const deleteVault = async (id: string): Promise<void> => {
  await apiCall(`/api/vaults?id=${id}`, { method: 'DELETE' });
};

// Summary
export const getSummary = async (): Promise<FinancialSummary> => {
  return await apiCall('/api/summary');
};

// Profile
export const getProfile = async () => {
  return await apiCall('/api/profile');
};

export const updateProfile = async (updates: any) => {
  return await apiCall('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

// Refresh data
export const refreshData = async (): Promise<{ success: boolean; message: string }> => {
  return await apiCall('/api/refresh', { method: 'POST' });
};

// Helper: Generate daily spend data from transactions
export const generateDailySpendData = async (): Promise<DailySpend[]> => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 35); // Last 35 days

  const transactions = await getTransactions({
    start_date: startDate.toISOString().split('T')[0],
    limit: 1000,
  });

  // Group by date
  const dailySpend: Record<string, { amount: number; categories: Record<string, number> }> = {};

  transactions.forEach(txn => {
    if (txn.amount > 0) return; // Only spending, not income
    const dateStr = txn.date.toISOString().split('T')[0];
    if (!dailySpend[dateStr]) {
      dailySpend[dateStr] = { amount: 0, categories: {} };
    }
    dailySpend[dateStr].amount += Math.abs(txn.amount);
    const cat = txn.category || 'Other';
    dailySpend[dateStr].categories[cat] = (dailySpend[dateStr].categories[cat] || 0) + Math.abs(txn.amount);
  });

  // Convert to array
  return Object.entries(dailySpend).map(([dateStr, data]) => ({
    date: new Date(dateStr),
    amount: data.amount,
    categories: data.categories,
  })).sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Helper: Calculate safe to spend
export const calculateSafeToSpend = async () => {
  let accounts: Account[], transactions: Transaction[], bills: RecurringCharge[], vaults: DatabaseVault[];
  
  try {
    accounts = await getAccounts();
  } catch (error) {
    console.warn('Failed to fetch accounts, using empty array:', error);
    accounts = [];
  }
  
  try {
    transactions = await getTransactions({ limit: 1000 });
  } catch (error) {
    console.warn('Failed to fetch transactions, using empty array:', error);
    transactions = [];
  }
  
  try {
    bills = await getRecurringTransactions({ is_active: true });
  } catch (error) {
    console.warn('Failed to fetch bills, using empty array:', error);
    bills = [];
  }
  
  // Get vaults for buffer calculation
  try {
    vaults = await getVaults();
  } catch (error) {
    console.warn('Failed to fetch vaults, using empty array:', error);
    vaults = [];
  }
  
  // Get profile with error handling
  let profile: any;
  try {
    profile = await getProfile();
  } catch (error) {
    console.warn('Failed to fetch profile, using defaults:', error);
    profile = { default_buffer_amount: 200 };
  }

  // Find the Rainy Day / Buffer vault specifically
  const bufferVault = vaults.find(v => 
    v.name.toLowerCase().includes('buffer') || 
    v.name.toLowerCase().includes('rainy day')
  );
  
  // Always use the buffer vault balance if found, otherwise fallback to profile default
  const buffer = bufferVault !== undefined ? (bufferVault.balance || 0) : (profile.default_buffer_amount || 200);
  
  const liquidAvailable = accounts
    .filter(a => a.type === 'checking')
    .reduce((sum, a) => sum + a.availableBalance, 0);

  const pendingOutflows = transactions
    .filter(t => t.pending && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const now = new Date();
  const upcoming7dEssentials = bills
    .filter(b => {
      const daysUntil = Math.ceil((b.nextDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      return daysUntil <= 7 && daysUntil >= 0;
    })
    .reduce((sum, b) => sum + b.avgAmount, 0);

  const safeToSpend = liquidAvailable - pendingOutflows - upcoming7dEssentials - buffer;

  return {
    safeToSpend: Math.max(0, safeToSpend),
    breakdown: {
      liquidAvailable,
      pendingOutflows,
      upcoming7dEssentials,
      userBuffer: buffer,
      isVaultBuffer: bufferVault !== undefined,
      bufferVaultName: bufferVault?.name,
    },
  };
};

// Helper: Calculate net worth
export const calculateNetWorth = async () => {
  const summary = await getSummary();
  return {
    assets: summary.totalBalance + summary.totalVaultBalance,
    liabilities: summary.totalDebt,
    netWorth: summary.netWorth,
  };
};

// Investment accounts (from accounts with type=investment)
export const getInvestmentAccounts = async (): Promise<InvestmentAccount[]> => {
  const accounts = await getAccounts();
  const investmentAccounts = accounts.filter(a => a.type === 'investment');
  
  // Map to InvestmentAccount format
  // Note: This is a simplified mapping - you may need to adjust based on actual investment data structure
  return investmentAccounts.map((acc, index) => {
    const contributions = acc.currentBalance * 0.7; // Estimate
    const gain = acc.currentBalance - contributions;
    const gainPercent = contributions > 0 ? (gain / contributions) * 100 : 0;
    
    return {
      id: acc.id,
      name: acc.name,
      institution: acc.institution,
      balance: acc.currentBalance,
      contributions,
      gain,
      gainPercent,
      color: ['#10B981', '#3B82F6', '#F59E0B'][index % 3],
    };
  });
};
