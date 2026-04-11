import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Bell, Link as LinkIcon, Shield, CreditCard, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Mock state for connected integrations
  const [connectedApps, setConnectedApps] = useState<Record<string, boolean>>({
    slack: false,
    discord: false,
    teams: false,
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin is from AI Studio preview or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const provider = event.data.provider;
        if (provider) {
          setConnectedApps(prev => ({ ...prev, [provider]: true }));
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async (provider: string) => {
    try {
      const redirectUri = `${window.location.origin}/api/auth/${provider}/callback`;
      const response = await fetch(`/api/auth/${provider}/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get ${provider} auth URL`);
      }
      
      const { url } = await response.json();

      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      alert(`Failed to initiate connection to ${provider}. Ensure environment variables are set.`);
    }
  };

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
              <SettingsTab icon={<LinkIcon className="w-4 h-4" />} label="Integrations" active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} />
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
                              className="w-full bg-[#FAFAFA] border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/10 transition-shadow"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-black/60">Last Name</label>
                            <input 
                              type="text" 
                              defaultValue={currentUser?.displayName?.split(' ')[1] || "User"}
                              className="w-full bg-[#FAFAFA] border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/10 transition-shadow"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-black/60">Email Address</label>
                          <input 
                            type="email" 
                            defaultValue={currentUser?.email || "admin@karmaos.com"}
                            className="w-full bg-[#FAFAFA] border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/10 transition-shadow text-black/60"
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
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-medium tracking-tight">Workplace Integrations</h2>
                    <p className="text-sm text-black/60">Connect KarmaOS to your team's communication tools to enable passive work observation and intelligence gathering.</p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {/* Slack */}
                    <div className="bg-white border border-black/[0.04] rounded-2xl p-6 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#E01E5A]/10 flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 text-[#E01E5A]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1 2.521-2.52A2.528 2.528 0 0 1 13.876 5.042a2.527 2.527 0 0 1-2.521 2.52H8.834v-2.52zM8.834 6.313a2.527 2.527 0 0 1 2.521 2.521 2.527 2.527 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.527 2.527 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1-2.523 2.522A2.528 2.528 0 0 1 10.12 18.956a2.527 2.527 0 0 1 2.522-2.52h2.523v2.52zM15.165 17.688a2.527 2.527 0 0 1-2.523-2.52 2.527 2.527 0 0 1 2.523-2.521h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.522h-6.313z"/>
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-black">Slack</span>
                          <span className="text-sm text-black/60">Analyze public channel activity and deep work patterns.</span>
                        </div>
                      </div>
                      {connectedApps.slack ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-full">
                          <CheckCircle2 className="w-4 h-4" />
                          Connected
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleConnect('slack')}
                          className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-black/90 transition-all shrink-0"
                        >
                          Connect Slack
                        </button>
                      )}
                    </div>

                    {/* Microsoft Teams */}
                    <div className="bg-white border border-black/[0.04] rounded-2xl p-6 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#6264A7]/10 flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 text-[#6264A7]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.5 10.5h-5.5v-3h5.5v3zm-7.5 0h-9v-3h9v3zm7.5 4.5h-5.5v-3h5.5v3zm-7.5 0h-9v-3h9v3zm7.5 4.5h-5.5v-3h5.5v3zm-7.5 0h-9v-3h9v3z"/>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-black">Microsoft Teams</span>
                          <span className="text-sm text-black/60">Sync organizational structure and team communication.</span>
                        </div>
                      </div>
                      {connectedApps.teams ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-full">
                          <CheckCircle2 className="w-4 h-4" />
                          Connected
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleConnect('teams')}
                          className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-black/90 transition-all shrink-0"
                        >
                          Connect Teams
                        </button>
                      )}
                    </div>

                    {/* Discord */}
                    <div className="bg-white border border-black/[0.04] rounded-2xl p-6 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#5865F2]/10 flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-black">Discord</span>
                          <span className="text-sm text-black/60">Monitor community engagement and developer activity.</span>
                        </div>
                      </div>
                      {connectedApps.discord ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-full">
                          <CheckCircle2 className="w-4 h-4" />
                          Connected
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleConnect('discord')}
                          className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-black/90 transition-all shrink-0"
                        >
                          Connect Discord
                        </button>
                      )}
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

function SettingsTab({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
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
      {label}
    </button>
  );
}
