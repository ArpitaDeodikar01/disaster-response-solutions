import { useNavigate } from 'react-router-dom';
import { useVolunteerTasks } from '../../hooks/useTasks';
import TaskStatusChip from '../../components/Dashboard/TaskStatusChip';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

export default function TaskList({ uid }: { uid: string }) {
  const { tasks, loading } = useVolunteerTasks(uid);
  const navigate = useNavigate();

  if (loading) return <LoadingSpinner />;

  if (tasks.length === 0) {
    return (
      <div className="text-center py-24 text-gray-400">
        <div className="text-5xl mb-4">📭</div>
        <p className="font-medium text-gray-500">No tasks assigned yet</p>
        <p className="text-sm mt-1">You'll see tasks here once a coordinator assigns you</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.taskId}
          onClick={() => navigate(`/volunteer/task/${task.taskId}`)}
          className="card-hover p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                <span>📍 {task.area}</span>
                <span>📅 {task.scheduledDate} <span className="capitalize">({task.scheduledDay})</span></span>
              </div>
            </div>
            <TaskStatusChip status={task.status} />
          </div>

          {task.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {task.requiredSkills.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">{s}</span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-end">
            <span className="text-xs text-gray-400 font-medium">View details →</span>
          </div>
        </div>
      ))}
    </div>
  );
}
