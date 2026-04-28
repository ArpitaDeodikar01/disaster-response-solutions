import { signOut } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  coordinator: { label: 'Coordinator', color: 'bg-orange-500/20 text-orange-200 border border-orange-500/30' },
  volunteer:   { label: 'Volunteer',   color: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' },
};

export default function Navbar() {
  const { user, role } = useAuth();

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out');
  }

  const roleConfig = role ? ROLE_CONFIG[role] : null;
  const initials = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <nav className="bg-gray-950 border-b border-white/5 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-base font-bold shadow-lg shadow-brand-600/30">
            🚨
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-white text-base tracking-tight">DisasterResponse</span>
            {roleConfig && (
              <span className={`hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${roleConfig.color}`}>
                {roleConfig.label}
              </span>
            )}
          </div>
        </div>

        {/* Right side */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-400 truncate max-w-[200px]">{user.email}</span>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>

            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
