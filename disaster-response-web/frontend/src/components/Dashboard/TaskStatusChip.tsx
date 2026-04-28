import { taskStatusColor } from '../../utils/formatters';

export default function TaskStatusChip({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${taskStatusColor(status)}`}>
      {label}
    </span>
  );
}
