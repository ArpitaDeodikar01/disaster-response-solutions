import { ScoreBreakdown as SB } from '../../types/need.types';

interface Props { breakdown: SB }

const bars = [
  { key: 'volume' as const, label: 'Volume', max: 35, color: 'bg-blue-500' },
  { key: 'severity' as const, label: 'Severity', max: 30, color: 'bg-orange-500' },
  { key: 'recency' as const, label: 'Recency', max: 20, color: 'bg-green-500' },
  { key: 'category' as const, label: 'Category', max: 15, color: 'bg-purple-500' },
];

export default function ScoreBreakdown({ breakdown }: Props) {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Score Breakdown</p>
      {bars.map(({ key, label, max, color }) => {
        const val = breakdown[key] ?? 0;
        const pct = Math.min((val / max) * 100, 100);
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-600 w-12 text-right">{val.toFixed(1)}/{max}</span>
          </div>
        );
      })}
    </div>
  );
}
