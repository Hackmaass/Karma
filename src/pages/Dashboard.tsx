import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, AlertCircle, Clock, Briefcase, Activity, Loader2 } from 'lucide-react';
import { generateDashboardInsights, DashboardInsights } from '../lib/gemini';
import { fetchWorkforceData } from '../lib/dataService';

export default function Dashboard() {
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      // Fetch data from our service (which can be easily swapped to Kaggle data)
      const workforceData = await fetchWorkforceData();
      const data = await generateDashboardInsights(workforceData);
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
        <p className="text-sm font-medium text-black/60 animate-pulse">KarmaOS is analyzing workforce data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Primary Insight (First 5 seconds) */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-black/60 uppercase tracking-wider">System Status</span>
          </div>
          <div className="bg-white border border-black/[0.04] rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl leading-relaxed font-light text-black/80">
              {insights?.primaryInsight || "The engineering team is finding time to focus, but design approvals are creating a bottleneck. The Recruiter Agent has identified 2 strong candidates for the open Senior Backend role."}
            </h2>
            <div className="mt-6 flex items-center gap-4">
              <button className="text-sm font-medium bg-black text-white px-5 py-2.5 rounded-full hover:bg-black/90 transition-all">
                View Blockers
              </button>
              <button className="text-sm font-medium text-black/60 hover:text-black transition-colors">
                Ask Founder Assistant
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Key Metrics (Statements, not just numbers) */}
      <section className="grid grid-cols-3 gap-6">
        {insights?.metrics.map((metric, i) => (
          <MetricCard 
            key={i}
            title={metric.title}
            value={metric.value}
            statement={metric.statement}
            trend={metric.trend}
            trendUp={metric.trendUp}
            alert={metric.alert}
            delay={0.1 + (i * 0.1)}
          />
        )) || (
          <>
            <MetricCard title="Deep Work" value="68%" statement="Team is finding time to focus." trend="+12%" trendUp={true} delay={0.1} />
            <MetricCard title="Active Candidates" value="14" statement="2 in final stages." trend="Recruiter Agent Active" trendUp={true} delay={0.2} />
            <MetricCard title="Overload Risk" value="Low" statement="Sarah M. is working late." alert={true} delay={0.3} />
          </>
        )}
      </section>

      {/* Activity Context */}
      <section>
        <h3 className="text-sm font-medium text-black/40 uppercase tracking-wider mb-6">Recent Agent Observations</h3>
        <div className="bg-white border border-black/[0.04] rounded-3xl overflow-hidden shadow-sm">
          <div className="divide-y divide-black/[0.04]">
            {insights?.observations.map((obs, i) => (
              <ContextRow 
                key={i}
                icon={
                  obs.type === 'alert' ? <Activity className="w-4 h-4 text-amber-500" /> :
                  obs.type === 'success' ? <Briefcase className="w-4 h-4 text-emerald-500" /> :
                  <Clock className="w-4 h-4 text-black/40" />
                }
                agent={obs.agent}
                title={obs.title}
                desc={obs.desc}
                time={obs.time}
              />
            )) || (
              <>
                <ContextRow icon={<Activity className="w-4 h-4 text-amber-500" />} agent="Operations Agent" title="Bottleneck Detected" desc="PR reviews in the 'core-api' repository are taking 48h longer than the team average." time="2h ago" />
                <ContextRow icon={<Briefcase className="w-4 h-4 text-emerald-500" />} agent="Recruiter Agent" title="Candidate Screened" desc="Completed technical screen for David L. Strong match for 'Maker' Work DNA." time="5h ago" />
                <ContextRow icon={<Clock className="w-4 h-4 text-black/40" />} agent="Analyst Agent" title="Performance Validation" desc="New hires from Q1 are showing 40% higher deep work ratios than the baseline." time="1d ago" />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ title, value, statement, trend, trendUp, alert, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white border border-black/[0.04] rounded-3xl p-6 shadow-sm flex flex-col"
    >
      <div className="text-sm font-medium text-black/50 mb-4">{title}</div>
      <div className="text-4xl font-medium tracking-tight mb-3">{value}</div>
      <div className="text-sm text-black/80 mb-4 flex-1">{statement}</div>
      
      {trend && !alert && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-black/60'}`}>
          {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trend}
        </div>
      )}
      {alert && (
        <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
          <AlertCircle className="w-4 h-4" />
          Requires attention
        </div>
      )}
    </motion.div>
  );
}

function ContextRow({ icon, agent, title, desc, time }: any) {
  return (
    <div className="flex items-start gap-4 p-6 hover:bg-black/[0.01] transition-colors cursor-pointer">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium bg-black/[0.04] px-2 py-0.5 rounded text-black/60">{agent}</span>
          <span className="font-medium text-black">{title}</span>
        </div>
        <div className="text-sm text-black/60">{desc}</div>
      </div>
      <div className="text-xs font-medium text-black/40">{time}</div>
    </div>
  );
}
