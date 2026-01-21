import { useState, useEffect } from 'react';
import { Liability } from '../lib/mockData';
import { getLiabilities } from '../lib/database';

export const useLiabilities = () => {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLiabilities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getLiabilities();
        setLiabilities(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch liabilities'));
        console.error('Error fetching liabilities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiabilities();
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLiabilities();
      setLiabilities(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch liabilities'));
      console.error('Error fetching liabilities:', err);
    } finally {
      setLoading(false);
    }
  };

  return { liabilities, loading, error, refresh };
};
