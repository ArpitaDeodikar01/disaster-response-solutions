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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6">
            {([['tasks', '📋 My Tasks'], ['profile', '👤 Profile']] as [Tab, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`py-3 text-sm font-medium border-b-2 transition ${
                  tab === key ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {label}
              </button>
            ))}
          </nav>
        </div>

        {tab === 'tasks' && user && <TaskList uid={user.uid} />}
        {tab === 'profile' && user && <VolunteerProfile uid={user.uid} />}
      </div>
    </div>
  );
}
