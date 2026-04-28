import { Volunteer } from '../types/volunteer.types';
import { ParsedNeedRow } from './csvParser';

interface MatchBreakdown {
  skill: number;
  proximity: number;
  reliability: number;
  availability: number;
  distanceKm: number;
}

interface MatchedVolunteer {
  uid: string;
  name: string;
  matchScore: number;
  breakdown: MatchBreakdown;
  distanceKm: number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Map category to required skills
const CATEGORY_SKILLS: Record<string, string[]> = {
  medical: ['First Aid', 'Medical'],
  shelter: ['Construction', 'Logistics'],
  food_distribution: ['Cooking', 'Logistics'],
  water_sanitation: ['Water Sanitation', 'Logistics'],
  education: ['Teaching'],
  general: [],
};

/**
 * Match volunteers to a need row.
 * Returns top N volunteers sorted by match score.
 */
export function matchVolunteers(
  need: ParsedNeedRow,
  volunteers: Volunteer[],
  topN = 3
): MatchedVolunteer[] {
  const requiredSkills = CATEGORY_SKILLS[need.category] ?? [];
  const available = volunteers.filter((v) => v.isAvailable !== false);

  const scored = available.map((v) => {
    const breakdown: MatchBreakdown = { skill: 0, proximity: 0, reliability: 0, availability: 0, distanceKm: 0 };

    // Skill: 0-50 pts
    const required = new Set(requiredSkills.map((s) => s.toLowerCase()));
    const has = new Set((v.skills || []).map((s) => s.toLowerCase()));
    const matched = [...required].filter((s) => has.has(s));
    breakdown.skill = required.size === 0 ? 50 : (matched.length / required.size) * 50;

    // Proximity: 0-25 pts
    const distanceKm = haversine(v.lat ?? 0, v.lng ?? 0, need.lat, need.lng);
    breakdown.proximity = Math.max(0, 25 - distanceKm * 2.5);
    breakdown.distanceKm = Math.round(distanceKm * 10) / 10;

    // Reliability: 0-15 pts
    breakdown.reliability = ((v.reliabilityScore ?? 100) / 100) * 15;

    // Availability: 10 pts (assume available for urgent needs)
    breakdown.availability = 10;

    const total = breakdown.skill + breakdown.proximity + breakdown.reliability + breakdown.availability;

    return {
      uid: v.uid,
      name: v.name,
      matchScore: Math.round(total * 100) / 100,
      breakdown,
      distanceKm: breakdown.distanceKm,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, topN);
}
