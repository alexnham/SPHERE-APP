import { useState, useEffect } from 'react';
import { RecurringCharge } from '../lib/mockData';
import { getRecurringTransactions } from '../lib/database';

export const useBills = () => {
  const [bills, setBills] = useState<RecurringCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecurringTransactions({ is_active: true });
        setBills(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch bills'));
        console.error('Error fetching bills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecurringTransactions({ is_active: true });
      setBills(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch bills'));
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  return { bills, loading, error, refresh };
};
