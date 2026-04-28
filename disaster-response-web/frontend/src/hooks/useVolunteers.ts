import { useEffect, useState } from 'react';
import { getVolunteer } from '../services/firestore';
import { Volunteer } from '../types/volunteer.types';

export function useVolunteer(uid: string) {
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    getVolunteer(uid).then((v) => {
      setVolunteer(v);
      setLoading(false);
    });
  }, [uid]);

  return { volunteer, loading };
}
