import { useEffect, useState } from 'react';
import { subscribeToAllTasks, subscribeToVolunteerTasks } from '../services/realtime';
import { Task } from '../types/task.types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAllTasks((data) => {
      setTasks(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { tasks, loading };
}

export function useVolunteerTasks(uid: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeToVolunteerTasks(uid, (data) => {
      setTasks(data);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { tasks, loading };
}
