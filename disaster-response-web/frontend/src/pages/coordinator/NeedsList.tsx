import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNeeds } from '../../hooks/useNeeds';
import UrgencyBadge from '../../components/Dashboard/UrgencyBadge';
import ScoreBreakdown from '../../components/Dashboard/ScoreBreakdown';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { formatDate, formatCategory } from '../../utils/formatters';

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-400',
  low: 'bg-emerald-500',
};

export default function NeedsList() {
  const { needs, loading } = useNeeds();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) return <LoadingSpinner text="Loading needs..." />;

  if (needs.length === 0) {
    return (
      <div className="text-center py-24 text-gray-400">
        <div className="text-5xl mb-4">📭</div>
        <p className="font-medium text-gray-500">No needs reported yet</p>
        <p className="text-sm mt-1">Use "Report Need" or "Import CSV" to add needs</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{needs.length} needs · sorted by urgency</p>
      </div>

      {needs.map((need, idx) => (
        <div key={need.needId} className="card hover:shadow-card-hover transition-all duration-200">
          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Rank */}
              <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${SEVERITY_DOT[need.severity] ?? 'bg-gray-400'}`} />
                  <h3 className="font-semibold text-gray-900">{need.area}</h3>
                  <UrgencyBadge score={need.urgencyScore} />
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Category</span>
                    <span className="font-medium text-gray-700 capitalize">{formatCategory(need.category)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Severity</span>
                    <span className="font-medium text-gray-700 capitalize">{need.severity}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Reports</span>
                    <span className="font-medium text-gray-700">{need.reportedCount}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Reported</span>
                    <span className="font-medium text-gray-700">{formatDate(need.createdAt)}</span>
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{need.description}</p>
              </div>

              {/* Urgency score ring */}
              <div className="shrink-0 text-center">
                <div className={`text-2xl font-bold ${need.urgencyScore >= 70 ? 'text-red-600' : need.urgencyScore >= 45 ? 'text-orange-500' : 'text-emerald-600'}`}>
                  {need.urgencyScore.toFixed(0)}
                </div>
                <div className="text-xs text-gray-400">/ 100</div>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => setExpanded(expanded === need.needId ? null : need.needId)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition"
              >
                <span>{expanded === need.needId ? '▼' : '▶'}</span>
                Score breakdown
              </button>

              {need.status === 'open' ? (
                <button
                  onClick={() => navigate(`/coordinator/need/${need.needId}`)}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  View & Create Task →
                </button>
              ) : (
                <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full capitalize">
                  {need.status.replace('_', ' ')}
                </span>
              )}
            </div>

            {expanded === need.needId && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <ScoreBreakdown breakdown={need.scoreBreakdown} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
