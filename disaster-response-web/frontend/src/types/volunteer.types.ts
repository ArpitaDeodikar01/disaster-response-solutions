import { Timestamp } from 'firebase/firestore';

export interface Volunteer {
  uid: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  availability: string[];
  lat: number;
  lng: number;
  address: string;
  reliabilityScore: number;
  tasksCompleted: number;
  tasksDeclined: number;
  isAvailable: boolean;
  fcmTokens: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MatchedVolunteer extends Volunteer {
  matchScore: number;
  breakdown: {
    skill: number;
    proximity: number;
    reliability: number;
    availability: number;
    distanceKm: number;
  };
  matchedSkills: string[];
}
