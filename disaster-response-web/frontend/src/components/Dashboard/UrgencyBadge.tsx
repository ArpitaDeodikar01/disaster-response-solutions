import { urgencyLabel, urgencyColor } from '../../utils/formatters';

interface Props {
  score: number;
  showScore?: boolean;
}

export default function UrgencyBadge({ score, showScore = true }: Props) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${urgencyColor(score)}`}>
      {urgencyLabel(score)}{showScore ? ` · ${score.toFixed(0)}/100` : ''}
    </span>
  );
}
