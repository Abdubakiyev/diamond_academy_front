import { useEffect, useState } from 'react';
import { Level } from '../types/level';
import { getLevels } from '../api/level';

export const useLevels = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLevels = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getLevels();
        setLevels(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch levels');
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  return { levels, loading, error };
};
