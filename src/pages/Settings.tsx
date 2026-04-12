import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bell, Link as LinkIcon, Shield, CreditCard, CheckCircle2, XCircle, Plug, Activity, Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ─── Integration config ───────────────────────────────────

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  dataPoints: string[];
  icon: React.ReactNode;
  mockSyncData?: { label: string; value: string }[];
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Analyze channel activity, message patterns, and response times to assess deep work and collaboration rhythms.',
    color: '#E01E5A',
    bgColor: '#E01E5A',
    dataPoints: ['Channel activity', 'Message frequency', 'Response time', 'Focus hours'],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1 2.521-2.52A2.528 2.528 0 0 1 13.876 5.042a2.527 2.527 0 0 1-2.521 2.52H8.834v-2.52zM8.834 6.313a2.527 2.527 0 0 1 2.521 2.521 2.527 2.527 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.527 2.527 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1-2.523 2.522A2.528 2.528 0 0 1 10.12 18.956a2.527 2.527 0 0 1 2.522-2.52h2.523v2.52zM15.165 17.688a2.527 2.527 0 0 1-2.523-2.52 2.527 2.527 0 0 1 2.523-2.521h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.522h-6.313z"/>
      </svg>
    ),
    mockSyncData: [
      { label: 'Channels synced', value: '14' },
      { label: 'Messages analyzed', value: '2,847' },
      { label: 'Avg response time', value: '12 min' },
    ],
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Sync organizational hierarchy, meeting data, and chat frequency for workload intelligence.',
    color: '#6264A7',
    bgColor: '#6264A7',
    dataPoints: ['Meeting frequency', 'Chat activity', 'Org structure', 'Calendar data'],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.404 4.478c.457 0 .905.042 1.342.124C19.833 1.942 17.139 0 14 0c-3.866 0-7 3.134-7 7 0 .552.064 1.088.185 1.602a5.998 5.998 0 0 1 3.344-1.014c1.583 0 3.03.613 4.11 1.617A4.982 4.982 0 0 1 19.404 4.478zM14 9.588c.668 0 1.3.157 1.864.434A3.992 3.992 0 0 0 14 6c-2.21 0-4 1.79-4 4 0 .74.203 1.432.554 2.026A5.97 5.97 0 0 1 14 9.588zM10.529 14.588c0-1.404.51-2.69 1.355-3.68A5.985 5.985 0 0 0 8 9.588c-3.314 0-6 2.686-6 6v2.824h8.529v-3.824zM24 15.588c0-2.761-2.239-5-5-5s-5 2.239-5 5v2.824h10v-2.824z"/>
      </svg>
    ),
    mockSyncData: [
      { label: 'Meetings tracked', value: '89' },
      { label: 'Team channels', value: '6' },
      { label: 'Avg meeting duration', value: '34 min' },
    ],
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    description: 'Analyze email volume, calendar density, and response patterns to measure cognitive load and availability.',
    color: '#0078D4',
    bgColor: '#0078D4',
    dataPoints: ['Email volume', 'Calendar density', 'Response patterns', 'Meeting conflicts'],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 7.387v10.478c0 .23-.08.424-.238.576a.806.806 0 0 1-.587.234h-8.55V6.58h8.55c.224 0 .42.08.587.24A.772.772 0 0 1 24 7.387zM13.587 3.27v17.46a.938.938 0 0 1-.062.328.84.84 0 0 1-.452.47.91.91 0 0 1-.389.072L.747 19.06a.787.787 0 0 1-.56-.32A.878.878 0 0 1 0 18.19V5.81c0-.203.064-.38.19-.527a.786.786 0 0 1 .558-.323L12.684 2.4c.14-.02.265-.004.389.072a.84.84 0 0 1 .452.47.938.938 0 0 1 .062.328zM9.5 12c0-1.038-.287-1.9-.862-2.59-.574-.688-1.292-1.033-2.153-1.033-.86 0-1.578.345-2.153 1.034C3.757 10.1 3.47 10.962 3.47 12c0 1.038.287 1.9.862 2.59.575.688 1.292 1.033 2.153 1.033.86 0 1.579-.345 2.153-1.034.575-.689.862-1.551.862-2.589zm4.087-5.42v10.84h7.288v-10.84H13.587z"/>
      </svg>
    ),
    mockSyncData: [
      { label: 'Emails analyzed', value: '1,203' },
      { label: 'Calendar events', value: '47' },
      { label: 'Avg email response', value: '2.3 hr' },
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Monitor community engagement, developer discussions, and voice channel participation for team sentiment.',
    color: '#5865F2',
    bgColor: '#5865F2',
    dataPoints: ['Server activity', 'Voice participation', 'Thread engagement', 'Sentiment'],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
      </svg>
    ),
    mockSyncData: [
      { label: 'Servers monitored', value: '3' },
      { label: 'Active discussions', value: '156' },
      { label: 'Voice hours', value: '24.5 hr' },
    ],
  },
  {
    id: 'google',
    name: 'Google Workspace',
    description: 'Connect Gmail and Google Calendar to track email load, meeting density, and document collaboration.',
    color: '#4285F4',
    bgColor: '#4285F4',
    dataPoints: ['Gmail volume', 'Calendar events', 'Drive activity', 'Meet usage'],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    mockSyncData: [
      { label: 'Emails synced', value: '4,102' },
      { label: 'Calendar events', value: '62' },
      { label: 'Drive files', value: '340' },
    ],
  },
];

// ─── localStorage helpers ─────────────────────────────────

function loadConnectedState(): Record<string, { connected: boolean; connectedAt: string | null }> {
  try {
    const stored = localStorage.getItem('karmaos_integrations');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  const empty: Record<string, { connected: boolean; connectedAt: string | null }> = {};
  INTEGRATIONS.forEach(i => { empty[i.id] = { connected: false, connectedAt: null }; });
  return empty;
}

function saveConnectedState(state: Record<string, { connected: boolean; connectedAt: string | null }>) {
  localStorage.setItem('karmaos_integrations', JSON.stringify(state));
}

// ─── Main Component ──────────────────────────────────────

export default function Settings() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [connectedApps, setConnectedApps] = useState(loadConnectedState);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  // Persist to localStorage on change
  useEffect(() => { saveConnectedState(connectedApps); }, [connectedApps]);

  // Simulate connection flow (2s delay to mimic OAuth)
  const handleConnect = async (id: string) => {
    setConnectingId(id);
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnectedApps(prev => ({
      ...prev,
      [id]: { connected: true, connectedAt: new Date().toISOString() },
    }));
    setConnectingId(null);
    setExpandedId(id); // auto-expand to show sync data
  };

  const handleDisconnect = (id: string) => {
    setConnectedApps(prev => ({
      ...prev,
      [id]: { connected: false, connectedAt: null },
    }));
    if (expandedId === id) setExpandedId(null);
  };

  const handleSync = async (id: string) => {
    setSyncing(id);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSyncing(null);
  };

  const connectedCount = Object.values(connectedApps).filter(v => v.connected).length;

  return (
    <div className="flex flex-col gap-12 pb-24">
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-medium tracking-tight mb-8">Settings</h1>
          
          <div className="flex flex-col md:flex-row gap-12">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
              <SettingsTab icon={<User className="w-4 h-4" />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
              <SettingsTab icon={<LinkIcon className="w-4 h-4" />} label="Integrations" active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} badge={connectedCount > 0 ? String(connectedCount) : undefined} />
              <SettingsTab icon={<Bell className="w-4 h-4" />} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
              <SettingsTab icon={<Shield className="w-4 h-4" />} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
              <SettingsTab icon={<CreditCard className="w-4 h-4" />} label="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
            </div>

            {/* Content Area */}
            <div className="flex-1 max-w-2xl flex flex-col gap-12">
              
              {activeTab === 'profile' && (
                <>
                  {/* Profile Section */}
                  <div className="flex flex-col gap-6">
                    <h2 className="text-xl font-medium tracking-tight">Profile</h2>
                    <div className="bg-white border border-black/[0.04] rounded-3xl p-8 shadow-sm flex flex-col gap-8">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-black/5 overflow-hidden border border-black/[0.04]">
                          <img 
                            src={currentUser?.photoURL || "https://picsum.photos/seed/founder/200/200"} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <button className="text-sm font-medium bg-black/[0.03] hover:bg-black/[0.06] px-4 py-2 rounded-full transition-colors w-fit">
                            Change Photo
                          </button>
                          <span className="text-xs text-black/40">JPG, GIF or PNG. Max size of 800K</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-black/60">First Name</label>
                            <input 
                              type="text" 
                              defaultValue={currentUser?.displayName?.split(' ')[0] || "Admin"}
                              className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/10 transition-shadow"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-black/60">Last Name</label>
                            <input 
                              type="text" 
                              defaultValue={currentUser?.displayName?.split(' ')[1] || "User"}
                              className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/10 transition-shadow"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-black/60">Email Address</label>
                          <input 
                            type="email" 
                            defaultValue={currentUser?.email || "admin@karmaos.com"}
                            className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/10 transition-shadow text-black/60"
                            disabled
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-black/[0.04] flex justify-end">
                        <button className="text-sm font-medium bg-black text-white px-6 py-2.5 rounded-full hover:bg-black/90 transition-all">
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="flex flex-col gap-6">
                    <h2 className="text-xl font-medium tracking-tight text-red-600">Danger Zone</h2>
                    <div className="bg-white border border-red-500/20 rounded-3xl p-8 shadow-sm flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-medium text-black">Log out of all devices</span>
                          <span className="text-sm text-black/60">You will be logged out of this session immediately.</span>
                        </div>
                        <button 
                          onClick={logout}
                          className="text-sm font-medium bg-black/[0.03] hover:bg-black/[0.06] text-black px-4 py-2 rounded-full transition-colors"
                        >
                          Log out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'integrations' && (
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-medium tracking-tight">Workplace Integrations</h2>
                    <p className="text-sm text-black/60">
                      Connect your team's tools directly from KarmaOS. Data syncs feed into the intelligence layer for richer insights.
                    </p>
                  </div>

                  {/* Connected Summary */}
                  {connectedCount > 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-2xl p-5 flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-emerald-100">
                        <Plug className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-emerald-900">{connectedCount} integration{connectedCount > 1 ? 's' : ''} active</div>
                        <div className="text-xs text-emerald-700/60">Data from connected tools enriches your workforce intelligence.</div>
                      </div>
                      <div className="flex -space-x-2">
                        {INTEGRATIONS.filter(i => connectedApps[i.id]?.connected).map(i => (
                          <div key={i.id} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center" style={{ backgroundColor: `${i.color}15` }}>
                            <span style={{ color: i.color }} className="scale-50">{i.icon}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Integration Cards */}
                  <div className="flex flex-col gap-4">
                    {INTEGRATIONS.map((integration) => {
                      const state = connectedApps[integration.id] || { connected: false, connectedAt: null };
                      const isExpanded = expandedId === integration.id;
                      const isConnecting = connectingId === integration.id;
                      const isSyncing = syncing === integration.id;

                      return (
                        <motion.div
                          key={integration.id}
                          layout
                          className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-colors ${
                            state.connected ? 'border-emerald-200/60' : 'border-black/[0.04]'
                          }`}
                        >
                          {/* Main Row */}
                          <div
                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-black/[0.01] transition-colors"
                            onClick={() => setExpandedId(isExpanded ? null : integration.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${integration.color}12`, color: integration.color }}
                              >
                                {integration.icon}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{integration.name}</span>
                                  {state.connected && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                      Live
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-black/50 mt-0.5 max-w-sm">
                                  {state.connected
                                    ? `Connected ${state.connectedAt ? new Date(state.connectedAt).toLocaleDateString() : ''}`
                                    : integration.description}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                              {isConnecting ? (
                                <div className="flex items-center gap-2 text-sm font-medium text-black/50 px-4 py-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Connecting...
                                </div>
                              ) : state.connected ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSync(integration.id)}
                                    disabled={isSyncing}
                                    className="flex items-center gap-1.5 text-xs font-medium text-black/50 hover:text-black bg-black/[0.03] hover:bg-black/[0.06] px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                                  >
                                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                                    {isSyncing ? 'Syncing...' : 'Sync'}
                                  </button>
                                  <button
                                    onClick={() => handleDisconnect(integration.id)}
                                    className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    Disconnect
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleConnect(integration.id)}
                                  className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-black/90 transition-all shrink-0"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded Detail */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-6 border-t border-black/[0.04]">
                                  {/* Data Points */}
                                  <div className="pt-5 mb-5">
                                    <div className="text-xs font-medium text-black/40 uppercase tracking-wider mb-3">Data Points</div>
                                    <div className="flex flex-wrap gap-2">
                                      {integration.dataPoints.map((dp, i) => (
                                        <span key={i} className="text-xs bg-black/[0.03] text-black/60 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                          <Activity className="w-3 h-3" />
                                          {dp}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Sync Stats (only when connected) */}
                                  {state.connected && integration.mockSyncData && (
                                    <div>
                                      <div className="text-xs font-medium text-black/40 uppercase tracking-wider mb-3">Last Sync</div>
                                      <div className="grid grid-cols-3 gap-3">
                                        {integration.mockSyncData.map((d, i) => (
                                          <div key={i} className="bg-page-bg rounded-xl p-3">
                                            <div className="text-lg font-semibold tracking-tight">{d.value}</div>
                                            <div className="text-[11px] text-black/40">{d.label}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* How it works (not connected) */}
                                  {!state.connected && (
                                    <div className="bg-page-bg rounded-xl p-4">
                                      <div className="text-xs font-medium text-black/40 uppercase tracking-wider mb-2">How it works</div>
                                      <div className="flex items-center gap-2 text-xs text-black/60">
                                        <span className="bg-black/[0.04] px-2 py-0.5 rounded font-medium">Connect</span>
                                        <ArrowRight className="w-3 h-3 text-black/30" />
                                        <span className="bg-black/[0.04] px-2 py-0.5 rounded font-medium">Authorize</span>
                                        <ArrowRight className="w-3 h-3 text-black/30" />
                                        <span className="bg-black/[0.04] px-2 py-0.5 rounded font-medium">Auto-sync data</span>
                                        <ArrowRight className="w-3 h-3 text-black/30" />
                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">AI analyzes</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Outlook Integration Note */}
                  <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-200/30 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-blue-900 mb-1">About Outlook Integration</div>
                        <div className="text-xs text-blue-700/70 leading-relaxed">
                          KarmaOS supports Microsoft Outlook via the <strong>Microsoft Graph API</strong>. 
                          To enable it for production, register an Azure AD app at{' '}
                          <a href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">
                            Azure Portal → App Registrations
                          </a>{' '}
                          and grant <code className="bg-blue-100 px-1 rounded text-[11px]">Mail.Read</code> + <code className="bg-blue-100 px-1 rounded text-[11px]">Calendars.Read</code> permissions. 
                          Add your Client ID and Secret to <code className="bg-blue-100 px-1 rounded text-[11px]">.env.local</code> as <code className="bg-blue-100 px-1 rounded text-[11px]">OUTLOOK_CLIENT_ID</code> / <code className="bg-blue-100 px-1 rounded text-[11px]">OUTLOOK_CLIENT_SECRET</code>.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function SettingsTab({ icon, label, active, onClick, badge }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; badge?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
        active 
          ? "bg-black/[0.04] text-black" 
          : "text-black/60 hover:text-black hover:bg-black/[0.02]"
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 w-5 h-5 rounded-full flex items-center justify-center">{badge}</span>
      )}
    </button>
  );
}
