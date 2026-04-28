import { urgencyLabel, urgencyColor } from '../../utils/formatters';

interface Props { score: number; showScore?: boolean; }

export default function UrgencyBadge({ score, showScore = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${urgencyColor(score)}`}>
      {urgencyLabel(score)}{showScore ? ` · ${score.toFixed(0)}` : ''}
    </span>
  );
}
