import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import React from 'react';
import { Bot, UserCheck, Clock, BrainCircuit, Loader2 } from 'lucide-react';
import { generateTalentInsights, TalentInsights } from '../lib/gemini';
import { fetchTalentData } from '../lib/dataService';

export default function TalentIntelligence() {
  const [insights, setInsights] = useState<TalentInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      // Fetch data from our service (which can be easily swapped to Kaggle data)
      const talentData = await fetchTalentData();
      const data = await generateTalentInsights(talentData);
      if (data) {
        setInsights(data);
      }
      setLoading(false);
    }
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
        <p className="text-sm font-medium text-black/60 animate-pulse">KarmaOS Recruiter Agent is analyzing candidate pipelines...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Header */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-black/[0.04] flex items-center justify-center">
              <Bot className="w-4 h-4 text-black/60" />
            </div>
            <h1 className="text-3xl font-medium tracking-tight">Recruiter Agent</h1>
          </div>
          <p className="text-lg text-black/60 font-light">Automated sourcing, screening, and Work DNA matching.</p>
        </motion.div>
      </section>

      {/* Primary Insight */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border border-black/[0.04] rounded-3xl p-8 shadow-sm"
        >
          <h2 className="text-2xl leading-relaxed font-light text-black/80">
            {insights?.primaryInsight || <>The agent has screened 42 candidates for the Senior Backend role. <span className="font-medium text-black">Two candidates strongly match the "High Deep Work" DNA profile</span> of your current top performers.</>}
          </h2>
          <div className="mt-6 flex items-center gap-4">
            <button className="text-sm font-medium bg-black text-white px-5 py-2.5 rounded-full hover:bg-black/90 transition-all">
              Review Top Matches
            </button>
            <button className="text-sm font-medium text-black/60 hover:text-black transition-colors">
              View Agent Logs
            </button>
          </div>
        </motion.div>
      </section>

      {/* Active Roles (Insight-first, not a Kanban board) */}
      <section className="grid md:grid-cols-2 gap-6">
        {insights?.roles.map((role, i) => (
          <RoleCard
            key={i}
            title={role.title}
            status={role.status}
            insight={role.insight}
            dnaMatch={role.dnaMatch}
            delay={0.2 + (i * 0.1)}
          />
        )) || (
            <>
              <RoleCard title="Senior Backend Engineer" status="Interviewing" insight="Agent completed 12 technical screens. 3 candidates advanced to human review." dnaMatch="Maker (High Focus)" delay={0.2} />
              <RoleCard title="Product Marketing Manager" status="Sourcing" insight="Agent is adjusting outreach messaging. Initial response rate was below 15% threshold." dnaMatch="Synchronizer (High Coordination)" delay={0.3} />
            </>
          )}
      </section>

      {/* Interview Quality Analysis */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-sm font-medium text-black/40 uppercase tracking-wider mb-6">Interview Intelligence</h3>
          <div className="bg-white border border-black/[0.04] rounded-3xl overflow-hidden shadow-sm">
            <div className="divide-y divide-black/[0.04]">
              {insights?.interviewIntelligence.map((intel, i) => (
                <InsightRow
                  key={i}
                  icon={
                    intel.type === 'success' ? <BrainCircuit className="w-4 h-4 text-emerald-500" /> :
                      intel.type === 'warning' ? <Clock className="w-4 h-4 text-amber-500" /> :
                        <UserCheck className="w-4 h-4 text-black/40" />
                  }
                  title={intel.title}
                  desc={intel.desc}
                  meta={intel.meta}
                />
              )) || (
                  <>
                    <InsightRow icon={<BrainCircuit className="w-4 h-4 text-emerald-500" />} title="Strong Signal Detected" desc="Candidate 'David L.' demonstrated exceptional system design reasoning in the AI technical screen." meta="Score: 94/100" />
                    <InsightRow icon={<Clock className="w-4 h-4 text-amber-500" />} title="Scheduling Friction" desc="Agent is struggling to find overlapping time between Candidate 'Elena M.' and the engineering panel." meta="Action Required" />
                    <InsightRow icon={<UserCheck className="w-4 h-4 text-black/40" />} title="Work DNA Match" desc="Candidate 'James T.' matches the communication patterns of your most successful PMs." meta="High Confidence" />
                  </>
                )}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

interface RoleCardProps {
  title: string;
  status: string;
  insight: string;
  dnaMatch: string;
  delay: number;
}

function RoleCard({ title, status, insight, dnaMatch, delay }: RoleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white border border-black/[0.04] rounded-3xl p-6 shadow-sm flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-black/50">{status}</div>
        <div className="text-xs font-medium bg-black/[0.04] px-2 py-1 rounded-md text-black/60">Target DNA: {dnaMatch}</div>
      </div>
      <div className="text-xl font-medium tracking-tight mb-3">{title}</div>
      <div className="text-sm text-black/80 leading-relaxed">{insight}</div>
    </motion.div>
  );
}

interface InsightRowProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  meta: string;
}

function InsightRow({ icon, title, desc, meta }: InsightRowProps) {
  return (
    <div className="flex items-start gap-4 p-6 hover:bg-black/[0.01] transition-colors cursor-pointer">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-black mb-1">{title}</div>
        <div className="text-sm text-black/60">{desc}</div>
      </div>
      <div className="text-xs font-medium text-black/40 bg-black/[0.03] px-2 py-1 rounded-md">{meta}</div>
    </div>
  );
}
