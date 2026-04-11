import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams } from 'react-router-dom';
import { Battery, BatteryWarning, BrainCircuit, MessageCircle, CalendarDays, Fingerprint, Activity, Loader2 } from 'lucide-react';
import { generateEmployeeInsights, EmployeeInsights } from '../lib/gemini';
import { fetchEmployeeData } from '../lib/dataService';

export default function EmployeeView() {
  const { id } = useParams();
  const employeeId = id || '1';
  const isAlex = employeeId === '1';
  
  const name = isAlex ? 'Alex Chen' : 'Sarah Miller';
  const role = isAlex ? 'Senior Engineer' : 'Product Manager';
  const load = isAlex ? 'Optimal' : 'High Risk';
  const dna = isAlex ? 'Maker' : 'Synchronizer';

  const [insights, setInsights] = useState<EmployeeInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      // Fetch data from our service (which can be easily swapped to Kaggle data)
      const employeeData = await fetchEmployeeData(employeeId);
      const data = await generateEmployeeInsights(employeeData);
      if (data) {
        setInsights(data);
      }
      setLoading(false);
    }
    fetchInsights();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
        <p className="text-sm font-medium text-black/60 animate-pulse">KarmaOS Analyst Agent is reviewing {name}'s work patterns...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Header */}
      <section className="flex items-end justify-between">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-black/10 overflow-hidden">
            <img src={`https://picsum.photos/seed/${name.replace(' ', '')}/200/200`} alt={name} referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight mb-1">{name}</h1>
            <div className="flex items-center gap-3">
              <p className="text-lg text-black/60 font-light">{role}</p>
              <span className="w-1 h-1 rounded-full bg-black/20" />
              <div className="flex items-center gap-1.5 text-sm font-medium text-black/50">
                <Fingerprint className="w-3.5 h-3.5" />
                Work DNA: {dna}
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-3 bg-white border border-black/[0.04] px-5 py-3 rounded-2xl shadow-sm"
        >
          {isAlex ? <Battery className="w-5 h-5 text-emerald-500" /> : <BatteryWarning className="w-5 h-5 text-amber-500" />}
          <div>
            <div className="text-xs font-medium text-black/40 uppercase tracking-wider">Current Load</div>
            <div className="font-medium">{load}</div>
          </div>
        </motion.div>
      </section>

      {/* Hiring vs Reality (The Differentiator) */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-[#FAFAFA] border border-black/[0.08] rounded-3xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-black/40" />
            <h3 className="text-sm font-medium text-black/60 uppercase tracking-wider">Hiring vs. Reality</h3>
          </div>
          
          <h2 className="text-xl leading-relaxed font-light text-black/80 relative z-10">
            {insights?.hiringVsReality || (isAlex 
              ? <span>Alex scored <span className="font-medium text-black">95% on the technical screen</span> during hiring. Current output matches expectations. His high deep work ratio confirms the "Maker" DNA profile identified by the Recruiter Agent.</span>
              : <span>Sarah scored highly on cross-functional communication during hiring. However, current data shows <span className="font-medium text-black">severe context-switching fatigue</span>. The Operations Agent suggests she is trapped in low-impact alignment meetings.</span>
            )}
          </h2>
        </motion.div>
      </section>

      {/* Narrative Insight */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white border border-black/[0.04] rounded-3xl p-8 shadow-sm"
        >
          <h2 className="text-xl leading-relaxed font-light text-black/80">
            {insights?.narrativeInsight || (isAlex 
              ? <span>Alex has found a strong rhythm this week, with <span className="font-medium text-black">uninterrupted focus blocks averaging 3 hours</span>. Code output is high, and coordination overhead is minimal.</span>
              : <span>Sarah is showing signs of <span className="font-medium text-black">context-switching fatigue</span>. She has attended 18 meetings in 3 days and is answering Slack messages late into the evening.</span>
            )}
          </h2>
        </motion.div>
      </section>

      {/* Work Patterns */}
      <section className="grid md:grid-cols-3 gap-6">
        {insights?.patterns.map((pattern, i) => (
          <PatternCard 
            key={i}
            icon={
              i === 0 ? <BrainCircuit className="w-5 h-5" /> :
              i === 1 ? <MessageCircle className="w-5 h-5" /> :
              <CalendarDays className="w-5 h-5" />
            }
            title={pattern.title}
            value={pattern.value}
            desc={pattern.desc}
            delay={0.3 + (i * 0.1)}
          />
        )) || (
          <>
            <PatternCard icon={<BrainCircuit className="w-5 h-5" />} title="Deep Work" value={isAlex ? "65%" : "15%"} desc={isAlex ? "Excellent focus time." : "Severely fragmented."} delay={0.3} />
            <PatternCard icon={<MessageCircle className="w-5 h-5" />} title="Communication" value={isAlex ? "20%" : "45%"} desc={isAlex ? "Mostly async via PRs." : "Heavy Slack usage."} delay={0.4} />
            <PatternCard icon={<CalendarDays className="w-5 h-5" />} title="Meetings" value={isAlex ? "15%" : "40%"} desc={isAlex ? "Only essential syncs." : "Back-to-back schedule."} delay={0.5} />
          </>
        )}
      </section>
    </div>
  );
}

interface PatternCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  desc: string;
  delay: number;
}

function PatternCard({ icon, title, value, desc, delay }: PatternCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white border border-black/[0.04] rounded-3xl p-6 shadow-sm flex flex-col"
    >
      <div className="flex items-center gap-3 text-black/60 mb-6">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      <div className="text-4xl font-medium tracking-tight mb-2">{value}</div>
      <div className="text-sm text-black/60">{desc}</div>
    </motion.div>
  );
}
