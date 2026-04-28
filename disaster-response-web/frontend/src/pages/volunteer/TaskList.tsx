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
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">📭</p>
        <p>No tasks assigned yet</p>
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
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">{task.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">📍 {task.area}</p>
              <p className="text-sm text-gray-500">📅 {task.scheduledDate} ({task.scheduledDay})</p>
            </div>
            <TaskStatusChip status={task.status} />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {task.requiredSkills.map((s) => (
              <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{s}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
