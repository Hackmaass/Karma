import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Brain, Briefcase, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isFirebaseConfigured } from '../lib/firebase';
import { useTheme } from '../contexts/ThemeContext';

export default function LandingPage() {
  const { loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, isDark } = useTheme();

  // Redirect to app if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/app');
    }
  }, [currentUser, navigate]);

  const handleLogin = async () => {
    if (!isFirebaseConfigured) {
      // Bypass login for the prototype if Firebase isn't configured yet
      navigate('/app');
      return;
    }
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-page-bg text-page-text font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-page-bg/80 backdrop-blur-md border-b border-black/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black rounded-full" />
          <span className="font-medium tracking-tight text-lg">KarmaOS</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 hover:bg-black/[0.04] rounded-full transition-colors text-black/60 hover:text-black"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={handleLogin} className="text-sm font-medium text-black/60 hover:text-black transition-colors">
            Sign In
          </button>
          <button
            onClick={handleLogin}
            className="text-sm font-medium bg-black text-white px-5 py-2.5 rounded-full hover:bg-black/90 transition-all active:scale-95"
          >
            Request Access
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-8 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] text-sm font-medium text-black/60 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            The first AI Workforce Operating System
          </div>
          <h1 className="text-[5rem] leading-[0.95] font-medium tracking-[-0.03em] mb-8">
            Hire them.<br />
            <span className="text-black/40">Understand them.</span>
          </h1>
          <p className="text-xl text-black/60 max-w-2xl mx-auto leading-relaxed mb-12 font-light tracking-tight">
            KarmaOS doesn't just automate recruiting. It passively observes how work actually happens post-hire, connecting talent acquisition directly to team performance.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleLogin}
              className="group flex items-center gap-2 text-base font-medium bg-black text-white px-8 py-4 rounded-full hover:bg-black/90 transition-all active:scale-95"
            >
              View Interactive Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* UI Preview Section */}
      <section className="px-8 pb-32 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[2.5rem] bg-white border border-black/[0.04] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.05)] overflow-hidden aspect-[16/10] flex flex-col"
        >
          {/* Fake Window Chrome */}
          <div className="h-12 border-b border-black/[0.04] flex items-center px-6 gap-2 bg-page-bg/50">
            <div className="w-3 h-3 rounded-full bg-black/10" />
            <div className="w-3 h-3 rounded-full bg-black/10" />
            <div className="w-3 h-3 rounded-full bg-black/10" />
          </div>
          {/* Fake UI Content */}
          <div className="flex-1 p-12 flex flex-col gap-8 bg-page-bg/30">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-black/60 uppercase tracking-wider">System Status</span>
              </div>
              <h2 className="text-3xl leading-relaxed font-light text-black/80">
                The engineering team is finding time to focus, but <span className="font-medium text-black">design approvals are creating a bottleneck</span>. The Recruiter Agent has identified <span className="font-medium text-black">2 strong candidates</span> for the open Senior Backend role.
              </h2>
            </div>
            
            <div className="grid grid-cols-3 gap-6 mt-4">
              <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm">
                <div className="text-sm font-medium text-black/50 mb-4">Deep Work</div>
                <div className="text-4xl font-medium tracking-tight mb-3">68%</div>
                <div className="text-sm text-black/80">Team is finding time to focus.</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm">
                <div className="text-sm font-medium text-black/50 mb-4">Active Candidates</div>
                <div className="text-4xl font-medium tracking-tight mb-3">14</div>
                <div className="text-sm text-black/80">2 in final stages.</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm">
                <div className="text-sm font-medium text-black/50 mb-4">Recent Observation</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium bg-black/[0.04] px-2 py-0.5 rounded text-black/60">Operations Agent</span>
                </div>
                <div className="text-sm text-black/80">PR reviews in 'core-api' are taking 48h longer than average.</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Problem / Solution */}
      <section className="py-32 bg-white border-y border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-24">
            <div>
              <h2 className="text-3xl font-medium tracking-tight mb-6">The Problem: Disconnected Systems</h2>
              <p className="text-lg text-black/60 leading-relaxed font-light">
                AI recruiters are great at hiring, but they stop at the offer letter. Once a candidate joins, leaders rely on gut feeling or intrusive time-tracking to see if the hire was actually successful.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-medium tracking-tight mb-6">The Solution: A Unified OS</h2>
              <p className="text-lg text-black/60 leading-relaxed font-light">
                KarmaOS uses a system of intelligent agents. The Recruiter Agent handles hiring, while the Analyst Agent passively observes work metadata to ensure the talent you hired is actually thriving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 max-w-5xl mx-auto px-8">
        <div className="text-center mb-24">
          <h2 className="text-4xl font-medium tracking-tight mb-6">A system of intelligent agents.</h2>
          <p className="text-xl text-black/60 font-light">Working together to build and sustain high-performing teams.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              icon: <Briefcase className="w-6 h-6" />,
              title: "Recruiter Agent",
              desc: "Automates sourcing, screening, and identifies candidate Work DNA before you hire."
            },
            {
              icon: <Activity className="w-6 h-6" />,
              title: "Operations Agent",
              desc: "Passively observes metadata to detect bottlenecks, context-switching, and burnout."
            },
            {
              icon: <Brain className="w-6 h-6" />,
              title: "Founder Assistant",
              desc: "A conversational interface that connects hiring data to real-world performance."
            }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black/[0.03] flex items-center justify-center text-black/80">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium tracking-tight">{feature.title}</h3>
              <p className="text-black/60 leading-relaxed font-light">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-black text-white text-center px-8">
        <h2 className="text-4xl font-medium tracking-tight mb-8">Ready to understand your team?</h2>
        <button
          onClick={handleLogin}
          className="inline-flex items-center gap-2 text-base font-medium bg-white text-black px-8 py-4 rounded-full hover:bg-white/90 transition-all active:scale-95"
        >
          Start your free trial
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-page-bg pt-16 pb-8 border-t border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-medium text-black/80 mb-1">Product</h4>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Features</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Integrations</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Pricing</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Changelog</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-medium text-black/80 mb-1">Resources</h4>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Documentation</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">API Reference</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Blog</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Community</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-medium text-black/80 mb-1">Company</h4>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">About</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Customers</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Careers</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Contact</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-medium text-black/80 mb-1">Legal</h4>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Privacy Policy</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Terms of Service</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Security</Link>
            </div>
          </div>
          
          <div className="pt-8 border-t border-black/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-black/40">
              Copyright © 2026 KarmaOS Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-3 text-xs text-black/60">
              <Link to="#" className="hover:text-black transition-colors">Privacy Policy</Link>
              <span className="text-black/20">|</span>
              <Link to="#" className="hover:text-black transition-colors">Terms of Use</Link>
              <span className="text-black/20">|</span>
              <Link to="#" className="hover:text-black transition-colors">Legal</Link>
              <span className="text-black/20">|</span>
              <Link to="#" className="hover:text-black transition-colors">Site Map</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
