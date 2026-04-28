import { useState } from 'react';
import { MatchedVolunteer } from '../../types/volunteer.types';

interface Props {
  volunteer: MatchedVolunteer;
  rank: number;
  selected: boolean;
  onSelect: (uid: string) => void;
}

export default function VolunteerCard({ volunteer, rank, selected, onSelect }: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { matchScore, breakdown, matchedSkills } = volunteer;

  const scoreColor =
    matchScore >= 80 ? 'text-green-600' :
    matchScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  const breakdownItems = [
    { label: '🔧 Skills', value: breakdown.skill, max: 50 },
    { label: '📍 Proximity', value: breakdown.proximity, max: 25 },
    { label: '⭐ Reliability', value: breakdown.reliability, max: 15 },
    { label: '📅 Availability', value: breakdown.availability, max: 10 },
  ];

  return (
    <div
      className={`border rounded-xl p-4 transition ${
        selected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl font-bold text-gray-300">#{rank}</span>
            <h3 className="text-base font-semibold text-gray-900">{volunteer.name}</h3>
            <span className={`text-xl font-bold ${scoreColor}`}>{matchScore.toFixed(1)}</span>
            <span className="text-sm text-gray-400">/100</span>
          </div>

          {/* Matched skills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {matchedSkills.map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                {skill}
              </span>
            ))}
          </div>

          <p className="mt-2 text-sm text-gray-500">
            📍 {breakdown.distanceKm} km away &nbsp;·&nbsp; ⭐ {volunteer.reliabilityScore}% reliability
          </p>

          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {showBreakdown ? '▼ Hide breakdown' : '▶ Show breakdown'}
          </button>

          {showBreakdown && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg grid grid-cols-2 gap-2 text-sm">
              {breakdownItems.map(({ label, value, max }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{label}</span>
                    <span>{value.toFixed(1)}/{max}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(volunteer.uid)}
          className="w-5 h-5 mt-1 accent-green-600 cursor-pointer"
        />
      </div>
    </div>
  );
}
