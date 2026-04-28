import { useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import SessionLoginModal from './SessionLoginModal';

export default function SessionBar() {
  const { sessions, activeSessionId, createSession, switchSession, removeSession } = useSession();
  const [showLogin, setShowLogin] = useState<string | null>(null);

  function handleAdd() {
    const id = createSession();
    setShowLogin(id);
  }

  return (
    <>
      <div className="bg-gray-900 border-b border-white/5 text-xs flex items-center gap-1.5 px-4 py-1.5 overflow-x-auto">
        <span className="text-gray-500 mr-1 shrink-0 font-medium">Sessions</span>
        <span className="text-gray-700 mr-1">·</span>

        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <div
              key={session.id}
              onClick={() => switchSession(session.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer transition-all shrink-0 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${session.user ? 'bg-emerald-400' : 'bg-gray-600'}`} />
              <span className="max-w-[130px] truncate">
                {session.user ? session.label : `${session.label} (not logged in)`}
              </span>

              {!session.user && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowLogin(session.id); }}
                  className="ml-0.5 text-blue-400 hover:text-blue-200 font-semibold"
                >
                  Login
                </button>
              )}

              {sessions.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeSession(session.id); }}
                  className="ml-0.5 text-gray-500 hover:text-red-400 font-bold leading-none"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={handleAdd}
          className="ml-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition shrink-0"
        >
          + Add Session
        </button>
      </div>

      {showLogin && (
        <SessionLoginModal sessionId={showLogin} onClose={() => setShowLogin(null)} />
      )}
    </>
  );
}
