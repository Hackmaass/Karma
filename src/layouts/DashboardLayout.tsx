import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, User, Settings, Search, Sparkles, LogOut, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import AiAssistant from '../components/AiAssistant';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardLayout() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex selection:bg-black selection:text-white">
      {/* Minimal Sidebar */}
      <aside className="w-64 border-r border-black/[0.04] bg-[#FAFAFA] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-black/[0.04]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black rounded-full" />
            <span className="font-medium tracking-tight">KarmaOS</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          <div className="text-xs font-medium text-black/40 uppercase tracking-wider mb-2 px-2">Intelligence</div>
          <NavItem to="/app" icon={<LayoutDashboard className="w-4 h-4" />} label="System Overview" end />
          <NavItem to="/app/talent" icon={<Briefcase className="w-4 h-4" />} label="Talent (Hiring)" />
          <NavItem to="/app/team" icon={<Users className="w-4 h-4" />} label="Work (Performance)" />
          
          <div className="text-xs font-medium text-black/40 uppercase tracking-wider mb-2 mt-8 px-2">Work DNA Profiles</div>
          <NavItem to="/app/employee/1" icon={<User className="w-4 h-4" />} label="Alex Chen" />
          <NavItem to="/app/employee/2" icon={<User className="w-4 h-4" />} label="Sarah Miller" />
        </nav>

        <div className="p-4 border-t border-black/[0.04]">
          <NavItem to="/app/settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-black/[0.04] bg-[#FAFAFA]/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
              <input 
                type="text" 
                placeholder="Search insights, candidates, or employees..." 
                className="w-full bg-black/[0.03] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-black/10 transition-shadow placeholder:text-black/40"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-2 text-sm font-medium bg-black/[0.03] hover:bg-black/[0.06] px-4 py-2 rounded-full transition-colors"
            >
              <Sparkles className="w-4 h-4 text-black/60" />
              <span>Founder Assistant</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-black/[0.04]">
              <div className="w-8 h-8 rounded-full bg-black/10 overflow-hidden">
                <img src={currentUser?.photoURL || "https://picsum.photos/seed/founder/100/100"} alt="Profile" referrerPolicy="no-referrer" />
              </div>
              <button onClick={logout} className="p-2 hover:bg-black/[0.04] rounded-full transition-colors" title="Log out">
                <LogOut className="w-4 h-4 text-black/40 hover:text-black" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 z-0">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </div>
        
        <AiAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      </main>
    </div>
  );
}

function NavItem({ to, icon, label, end }: { to: string; icon: React.ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive 
          ? "bg-black/[0.04] text-black" 
          : "text-black/60 hover:text-black hover:bg-black/[0.02]"
      )}
    >
      {icon}
      {label}
    </NavLink>
  );
}
