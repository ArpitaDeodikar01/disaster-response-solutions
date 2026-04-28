import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTask, acceptTask, declineTask } from '../../services/firestore';
import { Task } from '../../types/task.types';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Layout/Navbar';
import TaskStatusChip from '../../components/Dashboard/TaskStatusChip';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    getTask(taskId).then((t) => { setTask(t); setLoading(false); });
  }, [taskId]);

  async function handleAccept() {
    if (!task || !user) return;
    setActing(true);
    const err = await acceptTask(task.taskId, user.uid);
    setActing(false);
    if (err) { toast.error(err); return; }
    toast.success('Task accepted!');
    navigate('/volunteer');
  }

  async function handleDecline() {
    if (!task || !user) return;
    setActing(true);
    await declineTask(task.taskId, user.uid);
    setActing(false);
    toast.success('Task declined');
    navigate('/volunteer');
  }

  if (loading) return <><Navbar /><LoadingSpinner /></>;
  if (!task) return <><Navbar /><div className="p-8 text-center text-gray-500">Task not found</div></>;

  const isConfirmed = user ? task.confirmedVolunteers.includes(user.uid) : false;

  return (
    <div className="page">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition">
          ← Back to tasks
        </button>

        <div className="card p-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{task.title}</h1>
              <p className="text-sm text-gray-500 mt-1">📍 {task.area}</p>
            </div>
            <TaskStatusChip status={task.status} />
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Location', value: task.area },
              { label: 'Scheduled', value: `${task.scheduledDay}, ${task.scheduledDate}` },
              { label: 'Volunteers', value: `${task.confirmedVolunteers.length}/${task.volunteersNeeded} confirmed` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{value}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-700 text-sm leading-relaxed mb-6">{task.description}</p>

          {task.requiredSkills.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {task.requiredSkills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {isConfirmed ? (
            <button
              onClick={() => navigate(`/volunteer/task/${task.taskId}/progress`)}
              className="btn-success w-full py-3"
            >
              Update Progress →
            </button>
          ) : task.status === 'open' || task.status === 'assigned' ? (
            <div className="flex gap-3">
              <button onClick={handleAccept} disabled={acting} className="btn-success flex-1 py-3">
                {acting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : '✓ Accept Task'}
              </button>
              <button onClick={handleDecline} disabled={acting}
                className="flex-1 py-3 border border-red-300 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition disabled:opacity-50">
                ✗ Decline
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
