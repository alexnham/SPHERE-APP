import { useState, useEffect } from 'react';
import { DatabaseVault } from '../lib/database';
import { getVaults } from '../lib/database';

export const useVaults = () => {
  const [vaults, setVaults] = useState<DatabaseVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVaults = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getVaults();
        setVaults(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch vaults'));
        console.error('Error fetching vaults:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVaults();
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVaults();
      setVaults(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch vaults'));
      console.error('Error fetching vaults:', err);
    } finally {
      setLoading(false);
    }
  };

  return { vaults, loading, error, refresh };
};
