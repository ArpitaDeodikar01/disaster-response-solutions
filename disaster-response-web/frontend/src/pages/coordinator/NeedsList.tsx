import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNeeds } from '../../hooks/useNeeds';
import UrgencyBadge from '../../components/Dashboard/UrgencyBadge';
import ScoreBreakdown from '../../components/Dashboard/ScoreBreakdown';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { formatDate, formatCategory } from '../../utils/formatters';

export default function NeedsList() {
  const { needs, loading } = useNeeds();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) return <LoadingSpinner text="Loading needs..." />;

  if (needs.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">📭</p>
        <p>No needs reported yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{needs.length} needs · sorted by urgency score</p>
      {needs.map((need) => (
        <div key={need.needId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900">{need.area}</h3>
                <UrgencyBadge score={need.urgencyScore} />
              </div>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                <span className="capitalize">📂 {formatCategory(need.category)}</span>
                <span>⚠️ {need.severity}</span>
                <span>📊 {need.reportedCount} reports</span>
                <span>📅 {formatDate(need.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{need.description}</p>
            </div>
          </div>

          {/* Score breakdown toggle */}
          <button
            onClick={() => setExpanded(expanded === need.needId ? null : need.needId)}
            className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {expanded === need.needId ? '▼ Hide score breakdown' : '▶ Show score breakdown'}
          </button>

          {expanded === need.needId && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <ScoreBreakdown breakdown={need.scoreBreakdown} />
            </div>
          )}

          {need.status === 'open' && (
            <button
              onClick={() => navigate(`/coordinator/need/${need.needId}`)}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg transition"
            >
              View & Create Task →
            </button>
          )}
          {need.status !== 'open' && (
            <div className="mt-3 text-xs text-gray-400 capitalize">Status: {need.status.replace('_', ' ')}</div>
          )}
        </div>
      ))}
    </div>
  );
}
