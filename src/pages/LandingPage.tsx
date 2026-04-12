import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Brain, Briefcase, Moon, Sun, Zap, CalendarOff, Clock, Search, Plug, Shield, Globe, Users, ChevronRight } from 'lucide-react';
import { FaSlack, FaMicrosoft, FaEnvelope, FaDiscord, FaLinkedin, FaGoogle, FaGithub } from 'react-icons/fa';
import LogoLoop from '../components/LogoLoop';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function LandingPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, isDark } = useTheme();

  useEffect(() => {
    if (currentUser) {
      navigate('/app');
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-page-bg text-page-text font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-page-bg/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black rounded-full" />
          <span className="font-medium tracking-tight text-lg">KarmaOS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-black/50">
          <a href="#features" className="hover:text-black transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-black transition-colors">How it Works</a>
          <a href="#integrations" className="hover:text-black transition-colors">Integrations</a>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 hover:bg-black/[0.04] rounded-full transition-colors text-black/60 hover:text-black"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/login" className="text-sm font-medium text-black/60 hover:text-black transition-colors">
            Sign In
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium bg-black text-white px-5 py-2.5 rounded-full hover:bg-black/90 transition-all active:scale-95"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-44 pb-24 px-8 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-100/80 to-teal-100/80 text-sm font-medium text-emerald-800 mb-8 border border-emerald-200/50">
            <img src="/favicon.svg" alt="" className="w-3.5 h-3.5" />
            AI powered HR workforce
          </div>
          <h1 className="text-[4.5rem] md:text-[5.5rem] leading-[0.92] font-medium tracking-[-0.03em] mb-8">
            Hire. Manage.<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">Automate.</span>
          </h1>
          <p className="text-xl text-black/50 max-w-2xl mx-auto leading-relaxed mb-12 font-light tracking-tight">
            KarmaOS connects recruiting, HR operations, and workforce intelligence into a single AI-powered system. From sourcing on LinkedIn to managing leave to automating rules with plain English.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/login"
              className="group flex items-center gap-2 text-base font-medium bg-black text-white px-8 py-4 rounded-full hover:bg-black/90 transition-all active:scale-95 shadow-xl shadow-black/10"
            >
              View Interactive Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="group flex items-center gap-2 text-base font-medium text-black/60 hover:text-black px-6 py-4 transition-all">
              See Features
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
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
          className="relative rounded-[2.5rem] bg-white border border-black/[0.04] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden aspect-[16/10] flex flex-col"
        >
          <div className="h-12 border-b border-black/[0.04] flex items-center px-6 gap-2 bg-page-bg/50">
            <div className="w-3 h-3 rounded-full bg-red-400/60" />
            <div className="w-3 h-3 rounded-full bg-amber-400/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 bg-black/[0.03] rounded-md text-xs text-black/40 font-mono">karmaos.app/dashboard</div>
            </div>
          </div>
          <div className="flex-1 flex">
            {/* Fake Sidebar */}
            <div className="w-56 border-r border-black/[0.04] bg-page-bg/30 p-4 hidden md:flex flex-col gap-1">
              <div className="text-[10px] font-bold text-black/30 uppercase tracking-wider mb-2 px-2">Intelligence</div>
              <div className="text-xs px-3 py-2 rounded-lg bg-black/[0.04] font-medium">System Overview</div>
              <div className="text-xs px-3 py-2 rounded-lg text-black/50">Talent (Hiring)</div>
              <div className="text-xs px-3 py-2 rounded-lg text-black/50">Hiring Automation</div>
              <div className="text-xs px-3 py-2 rounded-lg text-black/50">Work (Performance)</div>
              <div className="text-[10px] font-bold text-black/30 uppercase tracking-wider mb-2 mt-4 px-2">Operations</div>
              <div className="text-xs px-3 py-2 rounded-lg text-black/50">Leave Management</div>
              <div className="text-xs px-3 py-2 rounded-lg text-black/50">Attendance</div>
              <div className="text-xs px-3 py-2 rounded-lg text-black/50">Automation</div>
            </div>
            {/* Fake Content */}
            <div className="flex-1 p-8 md:p-10 flex flex-col gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-medium text-black/40 uppercase tracking-wider">System Status</span>
                </div>
                <h2 className="text-xl md:text-2xl leading-relaxed font-light text-black/80">
                  Engineering team is finding time to focus, but <span className="font-medium text-black">3 leave requests need approval</span>. The Hiring Agent has <span className="font-medium text-black">shortlisted 5 candidates</span> from LinkedIn for the backend role.
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="bg-page-bg p-4 rounded-2xl border border-black/[0.04]">
                  <div className="text-[11px] font-medium text-black/40 mb-2">Deep Work</div>
                  <div className="text-2xl font-medium tracking-tight">68%</div>
                </div>
                <div className="bg-page-bg p-4 rounded-2xl border border-black/[0.04]">
                  <div className="text-[11px] font-medium text-black/40 mb-2">Attendance</div>
                  <div className="text-2xl font-medium tracking-tight text-emerald-600">47/50</div>
                </div>
                <div className="bg-page-bg p-4 rounded-2xl border border-black/[0.04]">
                  <div className="text-[11px] font-medium text-black/40 mb-2">Active Rules</div>
                  <div className="text-2xl font-medium tracking-tight text-amber-600">6</div>
                </div>
                <div className="bg-page-bg p-4 rounded-2xl border border-black/[0.04]">
                  <div className="text-[11px] font-medium text-black/40 mb-2">Candidates</div>
                  <div className="text-2xl font-medium tracking-tight text-blue-600">20</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white border-y border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-4xl font-medium tracking-tight mb-4">One platform. Every workforce function.</h2>
              <p className="text-lg text-black/50 font-light max-w-2xl mx-auto">From sourcing candidates to managing daily operations to building custom automations — all powered by AI.</p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Briefcase className="w-5 h-5" />,
                color: 'from-blue-100 to-indigo-100',
                iconColor: 'text-blue-600',
                title: "Recruiter Agent",
                desc: "AI-powered candidate sourcing, screening, and Work DNA matching. Connects post-hire performance back to hiring decisions."
              },
              {
                icon: <Search className="w-5 h-5" />,
                color: 'from-indigo-100 to-violet-100',
                iconColor: 'text-indigo-600',
                title: "Hiring Automation",
                desc: "Describe your ideal hire in plain English. KarmaOS scrapes LinkedIn & Naukri, filters candidates, and lets you manually fine-tune rules."
              },
              {
                icon: <Activity className="w-5 h-5" />,
                color: 'from-emerald-100 to-teal-100',
                iconColor: 'text-emerald-600',
                title: "Performance Intelligence",
                desc: "Passively measures deep work, context-switching, and collaboration patterns. No time trackers — just metadata analysis."
              },
              {
                icon: <CalendarOff className="w-5 h-5" />,
                color: 'from-amber-100 to-orange-100',
                iconColor: 'text-amber-600',
                title: "Leave Management",
                desc: "Apply, approve, reject. Track sick, casual, and unpaid leave with automatic balance calculation across the organization."
              },
              {
                icon: <Clock className="w-5 h-5" />,
                color: 'from-sky-100 to-blue-100',
                iconColor: 'text-sky-600',
                title: "Attendance Tracking",
                desc: "Lightweight check-in/out with automatic working hours calculation. Real-time status grid across the whole team."
              },
              {
                icon: <Zap className="w-5 h-5" />,
                color: 'from-rose-100 to-pink-100',
                iconColor: 'text-rose-600',
                title: "Automation Engine",
                desc: "Define rules in plain English — AI parses them into visual React Flow workflows. One-click evaluation against live data."
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-page-bg border border-black/[0.04] rounded-3xl p-8 hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center ${feature.iconColor} mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium tracking-tight mb-2">{feature.title}</h3>
                <p className="text-sm text-black/50 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 max-w-5xl mx-auto px-8">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl font-medium tracking-tight mb-4">How it works</h2>
            <p className="text-lg text-black/50 font-light">Three layers working together to turn workforce noise into actionable signal.</p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              step: "01",
              title: "Connect",
              desc: "Plug in Slack, Teams, Outlook, LinkedIn, Google Workspace, and your HR data. KarmaOS reads metadata only — never private content.",
              icon: <Plug className="w-5 h-5" />,
            },
            {
              step: "02",
              title: "Automate",
              desc: "Define rules in plain English: hiring filters, leave policies, performance alerts. Gemini AI parses them into executable workflows.",
              icon: <Zap className="w-5 h-5" />,
            },
            {
              step: "03",
              title: "Understand",
              desc: "KarmaOS synthesizes everything into clear narratives and visual pipelines. No spreadsheets — just answers and actions.",
              icon: <Brain className="w-5 h-5" />,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm font-medium">{item.step}</div>
                <span className="text-black/20 text-sm">{item.icon}</span>
              </div>
              <h3 className="text-xl font-medium tracking-tight">{item.title}</h3>
              <p className="text-black/50 leading-relaxed font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Integrations Banner */}
      <section id="integrations" className="py-32 bg-white border-y border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-4xl font-medium tracking-tight mb-4">Connects to everything</h2>
              <p className="text-lg text-black/50 font-light">Plug into your team's tools and job boards with one-click integrations.</p>
            </motion.div>
          </div>

          <div className="mx-auto max-w-full overflow-hidden">
            <LogoLoop
              logos={[
                { node: <FaSlack />, name: 'Slack', color: '#E01E5A' } as any,
                { node: <FaMicrosoft />, name: 'Microsoft Teams', color: '#6264A7' } as any,
                { node: <FaEnvelope />, name: 'Outlook', color: '#0078D4' } as any,
                { node: <FaDiscord />, name: 'Discord', color: '#5865F2' } as any,
                { node: <FaGoogle />, name: 'Google Workspace', color: '#4285F4' } as any,
                { node: <FaLinkedin />, name: 'LinkedIn', color: '#0A66C2' } as any,
                { node: <FaGithub />, name: 'GitHub', color: '#181717' } as any,
                { node: <div className="font-bold font-serif text-[18px] leading-none">N</div>, name: 'Naukri', color: '#4A00E0' } as any,
              ]}
              speed={45}
              direction="left"
              logoHeight={48}
              gap={24}
              hoverSpeed={10}
              fadeOut
              fadeOutColor="var(--color-white, #ffffff)"
              ariaLabel="Integrations loop"
              renderItem={(item: any, key: string) => (
                <div key={key} className="flex items-center gap-3 bg-page-bg border border-black/[0.04] rounded-full px-6 hover:shadow-lg transition-all h-full cursor-pointer hover:border-black/10">
                  <div className="w-[1.2rem] h-[1.2rem] flex items-center justify-center shrink-0" style={{ color: item.color }}>
                    {item.node}
                  </div>
                  <span className="text-[15px] font-medium text-black/70 whitespace-nowrap">{item.name}</span>
                </div>
              )}
            />
          </div>


        </div>
      </section>

      {/* Security + Privacy */}
      <section className="py-24 max-w-5xl mx-auto px-8">
        <div className="bg-white border border-black/[0.04] rounded-3xl p-12 flex items-center gap-12">
          <div className="p-4 rounded-2xl bg-black/[0.03] shrink-0">
            <Shield className="w-8 h-8 text-black/40" />
          </div>
          <div>
            <h3 className="text-xl font-medium tracking-tight mb-2">Privacy-first architecture</h3>
            <p className="text-sm text-black/50 leading-relaxed">
              KarmaOS reads <strong>metadata only</strong> — timestamps, thread length, context switches — never private message content. All AI calls are server-side; your Gemini API key never touches the browser. Integration tokens are locally stored, and Firebase auth gates access.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-black text-white text-center px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">Ready to run your workforce<br />on a single OS?</h2>
          <p className="text-lg text-white/50 font-light max-w-xl mx-auto mb-10">From hiring to operations to automation — KarmaOS is all you need.</p>
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 text-base font-medium bg-white text-black px-8 py-4 rounded-full hover:bg-white/90 transition-all active:scale-95"
          >
            Launch KarmaOS
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-page-bg pt-16 pb-8 border-t border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-medium text-black/80 mb-1">Product</h4>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Intelligence</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">HR Operations</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Automation</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Hiring</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-medium text-black/80 mb-1">Integrations</h4>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Slack</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Microsoft Teams</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Outlook</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">LinkedIn</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-medium text-black/80 mb-1">Company</h4>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">About</Link>
              <Link to="#" className="text-xs text-black/60 hover:text-black transition-colors">Blog</Link>
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
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-black rounded-full" />
              <span className="text-xs text-black/40">KarmaOS — AI powered HR workforce</span>
            </div>
            <div className="text-xs text-black/30">
              © 2026 KarmaOS Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
