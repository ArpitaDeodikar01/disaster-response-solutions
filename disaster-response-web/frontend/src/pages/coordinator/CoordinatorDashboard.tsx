import { useState } from 'react';
import Navbar from '../../components/Layout/Navbar';
import NeedsList from './NeedsList';
import ActiveTasks from './ActiveTasks';
import CreateNeed from './CreateNeed';
import CsvImport from './CsvImport';

type Tab = 'needs' | 'tasks' | 'create' | 'import';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'needs',  label: 'Needs',        icon: '⚠️' },
  { key: 'tasks',  label: 'Active Tasks',  icon: '📋' },
  { key: 'create', label: 'Report Need',   icon: '➕' },
  { key: 'import', label: 'Import CSV',    icon: '📥' },
];

export default function CoordinatorDashboard() {
  const [tab, setTab] = useState<Tab>('needs');

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Coordinator Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage disaster needs, tasks, and volunteer assignments</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit shadow-card">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 py-2 px-4 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                tab === key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        {tab === 'needs'  && <NeedsList />}
        {tab === 'tasks'  && <ActiveTasks />}
        {tab === 'create' && <CreateNeed onCreated={() => setTab('needs')} />}
        {tab === 'import' && <CsvImport />}
      </div>
    </div>
  );
}
