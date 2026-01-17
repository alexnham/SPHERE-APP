import { apiCall } from './supabase';

export interface PlaidAccount {
  id: string;
  name: string;
  type: string;
  subtype: string;
  current_balance: number;
  available_balance: number;
  institution_name: string;
}

export interface PlaidTransaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  merchant_name?: string;
  primary_category?: string;
}

export interface PlaidLinkToken {
  link_token: string;
  expiration: string;
}

export interface PlaidSummary {
  totalBalance: number;
  accountCount: number;
  transactionCount: number;
  connectedBanks: number;
}

// Create a link token to initialize Plaid Link
export const createLinkToken = async (): Promise<PlaidLinkToken> => {
  return apiCall('/api/create_link_token', { method: 'POST' });
};

/**
 * createLinkTokenWithRedirect
 * Call your backend's /api/create_link_token with a redirect_uri so Plaid Link can OAuth back to the app.
 * Backend should forwards redirect_uri to Plaid's /link/token/create request when provided.
 */
export const createLinkTokenWithRedirect = async (redirectUri: string): Promise<PlaidLinkToken> => {
  return apiCall('/api/create_link_token', {
    method: 'POST',
    body: JSON.stringify({ redirect_uri: redirectUri }),
  });
};

// Exchange public token for access token (after user completes Plaid Link)
export const exchangePublicToken = async (publicToken: string): Promise<{ success: boolean }> => {
  return apiCall('/api/exchange_public_token', {
    method: 'POST',
    body: JSON.stringify({ public_token: publicToken }),
  });
};

// Get account summary
export const getSummary = async (): Promise<PlaidSummary> => {
  return apiCall('/api/summary');
};

// Get all accounts
export const getAccounts = async (): Promise<PlaidAccount[]> => {
  return apiCall('/api/accounts');
};

// Get transactions
export const getTransactions = async (limit: number = 50): Promise<PlaidTransaction[]> => {
  return apiCall(`/api/transactions?limit=${limit}`);
};

// Refresh data from Plaid
export const refreshData = async (): Promise<{ success: boolean }> => {
  return apiCall('/api/refresh', { method: 'POST' });
};
