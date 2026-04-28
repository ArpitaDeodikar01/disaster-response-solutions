import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { getAllVolunteers, getTask, saveSuggestedVolunteers } from './firestore';
import { MatchedVolunteer } from '../types/volunteer.types';

// ── Client-side matching (runs when Cloud Functions aren't deployed) ──────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function scoreVolunteer(volunteer: any, task: any) {
  // Skill match: 0-50
  const required = new Set((task.requiredSkills || []).map((s: string) => s.toLowerCase()));
  const has = new Set((volunteer.skills || []).map((s: string) => s.toLowerCase()));
  const matchedSkills = [...required].filter((s) => has.has(s));
  const skill = required.size === 0 ? 50 : (matchedSkills.length / required.size) * 50;

  // Proximity: 0-25
  const distanceKm = haversineKm(volunteer.lat ?? 0, volunteer.lng ?? 0, task.lat ?? 0, task.lng ?? 0);
  const proximity = Math.max(0, 25 - distanceKm * 2.5);

  // Reliability: 0-15
  const reliability = ((volunteer.reliabilityScore ?? 100) / 100) * 15;

  // Availability: 0 or 10
  const taskDay = (task.scheduledDay || '').toLowerCase();
  const availability = (volunteer.availability || []).some(
    (d: string) => d.toLowerCase() === taskDay
  ) ? 10 : 0;

  const total = skill + proximity + reliability + availability;

  return {
    matchScore: Math.round(total * 100) / 100,
    breakdown: {
      skill: Math.round(skill * 100) / 100,
      proximity: Math.round(proximity * 100) / 100,
      reliability: Math.round(reliability * 100) / 100,
      availability,
      distanceKm: Math.round(distanceKm * 10) / 10,
    },
    matchedSkills,
    distanceKm: Math.round(distanceKm * 10) / 10,
  };
}

async function matchLocally(taskId: string): Promise<MatchedVolunteer[]> {
  const [task, volunteers] = await Promise.all([getTask(taskId), getAllVolunteers()]);
  if (!task) throw new Error('Task not found');

  const available = volunteers.filter((v) => v.isAvailable !== false);
  const scored = available
    .map((v) => ({ ...v, ...scoreVolunteer(v, task) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5) as MatchedVolunteer[];

  // Persist suggestions to Firestore
  await saveSuggestedVolunteers(
    taskId,
    scored.map((m) => ({
      uid: m.uid, name: m.name,
      matchScore: m.matchScore,
      breakdown: m.breakdown,
      distanceKm: m.distanceKm,
      skills: m.skills,
    }))
  );

  return scored;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Get top 5 matched volunteers. Falls back to client-side if Functions not deployed. */
export async function getTopMatches(taskId: string): Promise<MatchedVolunteer[]> {
  try {
    const fn = httpsCallable<{ taskId: string }, { matches: MatchedVolunteer[] }>(
      functions, 'matchVolunteers'
    );
    const result = await fn({ taskId });
    return result.data.matches;
  } catch {
    // Cloud Function not deployed or CORS — run matching in browser
    console.info('[api] Cloud Function unavailable, running client-side matching');
    return matchLocally(taskId);
  }
}

/** Assign volunteers. Falls back to direct Firestore write if Functions not deployed. */
export async function assignVolunteers(taskId: string, volunteerUids: string[]) {
  try {
    const fn = httpsCallable(functions, 'assignVolunteers');
    return await fn({ taskId, volunteerUids });
  } catch {
    // Fallback: write directly to Firestore (no FCM notifications in this path)
    const { assignVolunteersToTask } = await import('./firestore');
    await assignVolunteersToTask(taskId, volunteerUids);
    console.info('[api] Assigned via Firestore fallback (no FCM notifications)');
  }
}
