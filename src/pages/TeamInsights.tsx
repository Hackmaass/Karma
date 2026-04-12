import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GitPullRequest, AlertTriangle, Users, TrendingUp, Loader2 } from 'lucide-react';
import { fetchWorkforceData, WorkforceData, DepartmentStats } from '../lib/dataService';

export default function TeamInsights() {
  const [data, setData] = useState<WorkforceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const result = await fetchWorkforceData();
      setData(result);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
        <p className="text-sm font-medium text-black/60 animate-pulse">Analyzing team collaboration patterns...</p>
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-lg font-medium text-black/60">No workforce data available.</p>
      </div>
    );
  }

  // Sort departments by employee count
  const deptEntries = Object.entries(data.departments).sort((a, b) => b[1].count - a[1].count);
  const topDepts = deptEntries.slice(0, 8);

  // Find departments with collaboration opportunities (by center overlap)
  const riskDepts = deptEntries.filter(([, stats]) => stats.highRiskCount > 0).slice(0, 3);

  return (
    <div className="flex flex-col gap-12 pb-24">
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-medium tracking-tight mb-2">Team Insights</h1>
          <p className="text-lg text-black/60 font-light">Understanding how your {data.total} employees work across {deptEntries.length} departments.</p>
        </motion.div>
      </section>

      {/* Department Overview */}
      <div className="grid md:grid-cols-2 gap-8">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border border-black/[0.04] rounded-3xl p-8 shadow-sm"
        >
          <h2 className="text-xl font-medium tracking-tight mb-6">Department Deep Work Index</h2>
          <div className="space-y-4">
            {topDepts.map(([name, stats]) => (
              <DeptBar key={name} name={name} stats={stats} />
            ))}
          </div>
        </motion.section>

        {/* Risk Alerts */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white border border-black/[0.04] rounded-3xl p-8 shadow-sm"
        >
          <h2 className="text-xl font-medium tracking-tight mb-6">Overload Risks</h2>
          <div className="space-y-6">
            {data.alerts.length > 0 ? data.alerts.map((alert, i) => (
              <RiskItem
                key={i}
                icon={<AlertTriangle className="w-4 h-4" />}
                title={alert.employee}
                desc={`${alert.issue} — ${alert.department}`}
                impact="High"
              />
            )) : (
              <p className="text-sm text-black/60">No high-risk employees detected. The team is well-balanced.</p>
            )}
          </div>
        </motion.section>
      </div>

      {/* Department Grid */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-sm font-medium text-black/40 uppercase tracking-wider mb-6">All Departments</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {deptEntries.map(([name, stats], i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + (i * 0.03) }}
                className="bg-white border border-black/[0.04] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-black/80">{name}</span>
                  {stats.highRiskCount > 0 && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {stats.highRiskCount} at risk
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-4">
                  <div>
                    <div className="text-2xl font-medium tracking-tight">{stats.count}</div>
                    <div className="text-xs text-black/50">employees</div>
                  </div>
                  <div>
                    <div className="text-2xl font-medium tracking-tight">{stats.avgDeepWork}%</div>
                    <div className="text-xs text-black/50">deep work</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}

interface DeptBarProps {
  name: string;
  stats: DepartmentStats;
}

function DeptBar({ name, stats }: DeptBarProps) {
  const barColor = stats.avgDeepWork > 60 ? 'bg-emerald-500/70' : stats.avgDeepWork > 40 ? 'bg-black/20' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-4">
      <div className="w-36 text-sm font-medium text-black/60 text-right truncate" title={name}>{name}</div>
      <div className="flex-1 h-2.5 bg-black/[0.04] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${stats.avgDeepWork}%` }}
        />
      </div>
      <div className="w-16 text-sm font-medium text-black/60">{stats.avgDeepWork}%</div>
    </div>
  );
}

interface RiskItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  impact: string;
}

function RiskItem({ icon, title, desc, impact }: RiskItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-black">{title}</span>
          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            {impact} Impact
          </span>
        </div>
        <p className="text-sm text-black/60 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
