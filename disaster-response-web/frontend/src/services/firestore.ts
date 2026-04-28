import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  runTransaction,
  arrayRemove,
  increment,
  FieldValue,
} from 'firebase/firestore';
import { db } from './firebase';
import { Need } from '../types/need.types';
import { Task } from '../types/task.types';
import { Volunteer } from '../types/volunteer.types';

// ── NEEDS ─────────────────────────────────────────────────────────────────────

export async function createNeed(data: Omit<Need, 'needId' | 'urgencyScore' | 'scoreBreakdown' | 'createdAt'>) {
  const ref = await addDoc(collection(db, 'needs'), {
    ...data,
    urgencyScore: 0,
    scoreBreakdown: {},
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getNeed(needId: string): Promise<Need | null> {
  const snap = await getDoc(doc(db, 'needs', needId));
  if (!snap.exists()) return null;
  return { needId: snap.id, ...snap.data() } as Need;
}

export async function updateNeedStatus(needId: string, status: string) {
  await updateDoc(doc(db, 'needs', needId), { status });
}

// ── TASKS ─────────────────────────────────────────────────────────────────────

export async function createTask(data: Omit<Task, 'taskId' | 'createdAt'>) {
  const ref = await addDoc(collection(db, 'tasks'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getTask(taskId: string): Promise<Task | null> {
  const snap = await getDoc(doc(db, 'tasks', taskId));
  if (!snap.exists()) return null;
  return { taskId: snap.id, ...snap.data() } as Task;
}

export async function updateTaskStatus(taskId: string, status: string) {
  const update: Record<string, unknown> = { status };
  if (status === 'completed') update.completedAt = serverTimestamp();
  await updateDoc(doc(db, 'tasks', taskId), update);
}

export async function assignVolunteersToTask(taskId: string, uids: string[]) {
  await updateDoc(doc(db, 'tasks', taskId), {
    assignedVolunteers: uids,
    status: 'assigned',
  });
}

export async function saveSuggestedVolunteers(taskId: string, suggestions: object[]) {
  await updateDoc(doc(db, 'tasks', taskId), { suggestedVolunteers: suggestions });
}

/**
 * Transactional accept — prevents race conditions when multiple volunteers
 * try to accept the same task simultaneously.
 */
export async function acceptTask(taskId: string, uid: string): Promise<string | null> {
  try {
    await runTransaction(db, async (txn) => {
      const ref = doc(db, 'tasks', taskId);
      const snap = await txn.get(ref);
      if (!snap.exists()) throw new Error('Task not found');

      const data = snap.data() as Task;
      const confirmed = data.confirmedVolunteers ?? [];
      const needed = data.volunteersNeeded ?? 1;

      if (confirmed.includes(uid)) throw new Error('Already accepted');
      if (confirmed.length >= needed) throw new Error('Task is already full');

      const newConfirmed = [...confirmed, uid];
      const newStatus = newConfirmed.length >= needed ? 'in_progress' : data.status;

      txn.update(ref, { confirmedVolunteers: newConfirmed, status: newStatus });
    });
    return null;
  } catch (e: unknown) {
    return (e as Error).message;
  }
}

export async function declineTask(taskId: string, uid: string) {
  await updateDoc(doc(db, 'tasks', taskId), {
    assignedVolunteers: arrayRemove(uid),
    confirmedVolunteers: arrayRemove(uid),
  });
  await updateDoc(doc(db, 'volunteers', uid), {
    tasksDeclined: increment(1),
  });
}

// ── VOLUNTEERS ────────────────────────────────────────────────────────────────

export async function getVolunteer(uid: string): Promise<Volunteer | null> {
  const snap = await getDoc(doc(db, 'volunteers', uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as Volunteer;
}

export async function getAllVolunteers(): Promise<Volunteer[]> {
  const snap = await getDocs(collection(db, 'volunteers'));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as Volunteer));
}

export async function updateVolunteerAvailability(uid: string, isAvailable: boolean) {
  await updateDoc(doc(db, 'volunteers', uid), { isAvailable, updatedAt: serverTimestamp() });
}
