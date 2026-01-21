import { useState, useEffect } from 'react';
import { Transaction } from '../lib/mockData';
import { getTransactions } from '../lib/database';

interface UseTransactionsOptions {
  limit?: number;
  account_id?: string;
  category?: string;
  pending?: boolean;
  start_date?: string;
  end_date?: string;
}

export const useTransactions = (options?: UseTransactionsOptions) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTransactions(options);
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [JSON.stringify(options)]);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransactions(options);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  return { transactions, loading, error, refresh };
};
