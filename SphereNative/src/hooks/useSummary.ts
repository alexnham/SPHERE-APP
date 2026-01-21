import { useState, useEffect } from 'react';
import { FinancialSummary } from '../lib/database';

export const useSummary = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await import('../lib/database').then(m => m.getSummary());
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch summary'));
        console.error('Error fetching summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await import('../lib/database').then(m => m.getSummary());
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch summary'));
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  return { summary, loading, error, refresh };
};
