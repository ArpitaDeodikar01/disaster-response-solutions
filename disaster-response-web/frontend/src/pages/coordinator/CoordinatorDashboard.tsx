import { useState } from 'react';
import Navbar from '../../components/Layout/Navbar';
import NeedsList from './NeedsList';
import ActiveTasks from './ActiveTasks';
import CreateNeed from './CreateNeed';

type Tab = 'needs' | 'tasks' | 'create';

export default function CoordinatorDashboard() {
  const [tab, setTab] = useState<Tab>('needs');

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'needs', label: 'Needs Dashboard', icon: '⚠️' },
    { key: 'tasks', label: 'Active Tasks', icon: '📋' },
    { key: 'create', label: 'Report Need', icon: '➕' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab bar */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-1 sm:gap-6 overflow-x-auto">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 py-3 px-2 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                  tab === key
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </nav>
        </div>

        {tab === 'needs' && <NeedsList />}
        {tab === 'tasks' && <ActiveTasks />}
        {tab === 'create' && <CreateNeed onCreated={() => setTab('needs')} />}
      </div>
    </div>
  );
}
