import { taskStatusColor } from '../../utils/formatters';

const STATUS_ICON: Record<string, string> = {
  open: '🔵', assigned: '🟣', in_progress: '🟠', completed: '🟢', cancelled: '⚫',
};

export default function TaskStatusChip({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${taskStatusColor(status)}`}>
      <span>{STATUS_ICON[status] ?? '⚪'}</span> {label}
    </span>
  );
}
