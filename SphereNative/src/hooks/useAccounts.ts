import { useState, useEffect } from 'react';
import { Account } from '../lib/mockData';
import { getAccounts } from '../lib/database';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAccounts();
        setAccounts(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch accounts'));
        console.error('Error fetching accounts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch accounts'));
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  return { accounts, loading, error, refresh };
};
