import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { LayoutDashboard, Users, User, Settings, Search, Sparkles, LogOut, Briefcase, ChevronDown, ChevronUp, Moon, Sun, CalendarOff, Clock, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import AiAssistant from '../components/AiAssistant';
import { useAuth } from '../contexts/AuthContext';
import { fetchAllEmployees, EnrichedEmployee } from '../lib/dataService';
import { useTheme } from '../contexts/ThemeContext';

export default function DashboardLayout() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [employees, setEmployees] = useState<EnrichedEmployee[]>([]);
  const [showAllEmployees, setShowAllEmployees] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function loadEmployees() {
      const emps = await fetchAllEmployees();
      setEmployees(emps);
    }
    loadEmployees();
  }, []);

  // Search-filtered employees for top-bar search
  const filteredEmployees = searchQuery.trim()
    ? employees.filter(e =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8)
    : [];

  // Sidebar employees: show first 5 or all
  const sidebarEmployees = showAllEmployees ? employees.slice(0, 20) : employees.slice(0, 5);

  return (
    <div className="min-h-screen bg-page-bg text-page-text font-sans flex selection:bg-black selection:text-white">
      {/* Minimal Sidebar */}
      <aside className="w-64 border-r border-black/[0.04] bg-page-bg flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-black/[0.04]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black rounded-full" />
            <span className="font-medium tracking-tight">KarmaOS</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
          <div className="text-xs font-medium text-black/40 uppercase tracking-wider mb-2 px-2">Intelligence</div>
          <NavItem to="/app" icon={<LayoutDashboard className="w-4 h-4" />} label="System Overview" end />
          <NavItem to="/app/talent" icon={<Briefcase className="w-4 h-4" />} label="Talent (Hiring)" />
          <NavItem to="/app/hiring" icon={<Search className="w-4 h-4" />} label="Hiring Automation" />
          <NavItem to="/app/team" icon={<Users className="w-4 h-4" />} label="Work (Performance)" />
          
          <div className="text-xs font-medium text-black/40 uppercase tracking-wider mb-2 mt-8 px-2">Operations</div>
          <NavItem to="/app/leave" icon={<CalendarOff className="w-4 h-4" />} label="Leave Management" />
          <NavItem to="/app/attendance" icon={<Clock className="w-4 h-4" />} label="Attendance" />
          <NavItem to="/app/automation" icon={<Zap className="w-4 h-4" />} label="Automation" />
          
          <div className="text-xs font-medium text-black/40 uppercase tracking-wider mb-2 mt-8 px-2 flex items-center justify-between">
            <span>Work DNA Profiles</span>
            {employees.length > 5 && (
              <button
                onClick={() => setShowAllEmployees(!showAllEmployees)}
                className="text-black/30 hover:text-black/60 transition-colors"
                title={showAllEmployees ? "Show less" : "Show more"}
              >
                {showAllEmployees ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
          {sidebarEmployees.map(emp => (
            <NavItem
              key={emp.id}
              to={`/app/employee/${emp.id}`}
              icon={<User className="w-4 h-4" />}
              label={emp.name}
            />
          ))}
          {employees.length > 20 && showAllEmployees && (
            <div className="text-xs text-black/40 px-3 py-1">
              + {employees.length - 20} more — use search to find
            </div>
          )}
          {employees.length > 5 && !showAllEmployees && (
            <button
              onClick={() => setShowAllEmployees(true)}
              className="text-xs text-black/40 hover:text-black/60 px-3 py-1 text-left transition-colors"
            >
              + {employees.length - 5} more employees
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-black/[0.04]">
          <NavItem to="/app/settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-black/[0.04] bg-page-bg/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1 relative">
            <div className="relative w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
              <input 
                type="text" 
                placeholder="Search employees by name, role, or department..." 
                className="w-full bg-black/[0.03] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-black/10 transition-shadow placeholder:text-black/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Search Results Dropdown */}
              {filteredEmployees.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-black/[0.08] rounded-2xl shadow-lg overflow-hidden z-50">
                  {filteredEmployees.map(emp => (
                    <button
                      key={emp.id}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/[0.02] transition-colors border-b border-black/[0.04] last:border-b-0"
                      onClick={() => {
                        navigate(`/app/employee/${emp.id}`);
                        setSearchQuery('');
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-black/5 overflow-hidden shrink-0">
                        <img src={`https://picsum.photos/seed/${emp.name.replace(/\s/g, '')}/100/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{emp.name}</div>
                        <div className="text-xs text-black/50 truncate">{emp.role} · {emp.department}</div>
                      </div>
                      <div className={cn(
                        "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shrink-0",
                        emp.overloadRisk === 'high' ? 'bg-amber-100 text-amber-800' :
                          emp.overloadRisk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-emerald-100 text-emerald-800'
                      )}>
                        {emp.overloadRisk}
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
            <button 
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 hover:bg-black/[0.04] rounded-full transition-colors text-black/60 hover:text-black"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
        <div className="flex-1 overflow-y-auto scroll-smooth p-8 z-0">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
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
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
