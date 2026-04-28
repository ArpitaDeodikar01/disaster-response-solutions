import { useEffect, useState } from 'react';
import { subscribeToNeeds } from '../services/realtime';
import { Need } from '../types/need.types';

export function useNeeds() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToNeeds((data) => {
      setNeeds(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { needs, loading, error };
}
