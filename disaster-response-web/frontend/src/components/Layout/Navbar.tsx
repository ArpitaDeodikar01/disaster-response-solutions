import { signOut } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, role } = useAuth();

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out');
  }

  return (
    <nav className="bg-red-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <span className="font-bold text-lg tracking-tight">Disaster Response</span>
          {role && (
            <span className="ml-2 px-2 py-0.5 bg-red-900 rounded text-xs uppercase tracking-wider">
              {role}
            </span>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-red-200 hidden sm:block">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-red-900 hover:bg-red-800 rounded-lg text-sm transition"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
