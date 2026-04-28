import { useState } from 'react';
import Navbar from '../../components/Layout/Navbar';
import TaskList from './TaskList';
import VolunteerProfile from './VolunteerProfile';
import { useAuth } from '../../hooks/useAuth';

type Tab = 'tasks' | 'profile';

export default function VolunteerDashboard() {
  const [tab, setTab] = useState<Tab>('tasks');
  const { user } = useAuth();

  return (
    <div className="page">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and manage your assigned tasks</p>
        </div>

        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit shadow-card">
          {([['tasks', '📋 My Tasks'], ['profile', '👤 Profile']] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`py-2 px-4 text-sm font-medium rounded-lg transition-all ${
                tab === key ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'tasks'   && user && <TaskList uid={user.uid} />}
        {tab === 'profile' && user && <VolunteerProfile uid={user.uid} />}
      </div>
    </div>
  );
}
