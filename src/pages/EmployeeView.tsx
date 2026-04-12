import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams } from 'react-router-dom';
import { Battery, BatteryWarning, BatteryMedium, BrainCircuit, MessageCircle, CalendarDays, Fingerprint, Activity, Loader2 } from 'lucide-react';
import { generateEmployeeInsights, EmployeeInsights } from '../lib/gemini';
import { fetchEmployeeData, EnrichedEmployee } from '../lib/dataService';

export default function EmployeeView() {
  const { id } = useParams();
  const employeeId = id || '1';

  const [employee, setEmployee] = useState<EnrichedEmployee | null>(null);
  const [insights, setInsights] = useState<EmployeeInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      const empData = await fetchEmployeeData(employeeId);
      setEmployee(empData);

      if (empData) {
        // Build the data object for Gemini analysis
        const dataForGemini = {
          name: empData.name,
          role: empData.role,
          department: empData.department,
          yearsAtCompany: empData.yearsAtCompany,
          workDna: empData.workDna,
          hiringProfile: {
            technicalScore: `${Math.min(100, 60 + empData.jobRate * 8)}%`,
            dna: empData.workDna,
            strengths: empData.workDna.includes('Maker')
              ? ['technical execution', 'independent problem solving']
              : empData.workDna.includes('Synchronizer')
                ? ['cross-functional communication', 'coordination']
                : ['quality assurance', 'process adherence'],
          },
          currentWorkData: {
            deepWorkRatio: empData.deepWorkRatio,
            meetingLoad: empData.meetingLoad,
            communication: empData.communicationStyle,
            recentOutput: empData.recentOutput,
            focusBlocks: empData.focusBlocks,
            overtimeHours: empData.overtimeHours,
            sickLeaves: empData.sickLeaves,
            overloadRisk: empData.overloadRisk,
          },
        };
        const data = await generateEmployeeInsights(dataForGemini);
        if (data) {
          setInsights(data);
        }
      }
      setLoading(false);
    }
    fetchInsights();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
        <p className="text-sm font-medium text-black/60 animate-pulse">
          KarmaOS Analyst Agent is reviewing {employee?.name || `Employee #${employeeId}`}'s work patterns...
        </p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-lg font-medium text-black/60">Employee not found.</p>
      </div>
    );
  }

  const loadLabel = employee.overloadRisk === 'high' ? 'High Risk' : employee.overloadRisk === 'medium' ? 'Moderate' : 'Optimal';

  // Fallback descriptions if Gemini hasn't responded
  const fallbackHiring = `${employee.name} has been at the company for ${employee.yearsAtCompany} year${employee.yearsAtCompany !== 1 ? 's' : ''} in ${employee.department}. With a job rate of ${employee.jobRate}/5 and ${employee.overtimeHours} overtime hours, their current work pattern ${employee.overloadRisk === 'high' ? 'shows signs of overload' : 'is well-balanced'}.`;
  const fallbackNarrative = `${employee.name}'s deep work ratio is at ${employee.deepWorkRatio} with ${employee.focusBlocks.toLowerCase()}. ${employee.communicationStyle}.`;

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
            <img src={`https://picsum.photos/seed/${employee.name.replace(/\s/g, '')}/200/200`} alt={employee.name} referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight mb-1">{employee.name}</h1>
            <div className="flex items-center gap-3">
              <p className="text-lg text-black/60 font-light">{employee.role}</p>
              <span className="w-1 h-1 rounded-full bg-black/20" />
              <div className="flex items-center gap-1.5 text-sm font-medium text-black/50">
                <Fingerprint className="w-3.5 h-3.5" />
                Work DNA: {employee.workDna}
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
          {employee.overloadRisk === 'low' ? <Battery className="w-5 h-5 text-emerald-500" /> :
            employee.overloadRisk === 'high' ? <BatteryWarning className="w-5 h-5 text-amber-500" /> :
              <BatteryMedium className="w-5 h-5 text-yellow-500" />}
          <div>
            <div className="text-xs font-medium text-black/40 uppercase tracking-wider">Current Load</div>
            <div className="font-medium">{loadLabel}</div>
          </div>
        </motion.div>
      </section>

      {/* Hiring vs Reality */}
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
            {insights?.hiringVsReality || fallbackHiring}
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
            {insights?.narrativeInsight || fallbackNarrative}
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
              <PatternCard icon={<BrainCircuit className="w-5 h-5" />} title="Deep Work" value={employee.deepWorkRatio} desc={parseInt(employee.deepWorkRatio) > 50 ? "Solid focus time." : "Fragmented schedule."} delay={0.3} />
              <PatternCard icon={<MessageCircle className="w-5 h-5" />} title="Communication" value={employee.meetingLoad} desc={employee.communicationStyle} delay={0.4} />
              <PatternCard icon={<CalendarDays className="w-5 h-5" />} title="Overtime" value={`${employee.overtimeHours}h`} desc={employee.overtimeHours > 30 ? "Working extended hours." : "Normal hours."} delay={0.5} />
            </>
          )}
      </section>

      {/* Employee Details */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-sm font-medium text-black/40 uppercase tracking-wider mb-6">Profile Details</h3>
          <div className="bg-white border border-black/[0.04] rounded-3xl p-6 shadow-sm">
            <div className="grid md:grid-cols-4 gap-6">
              <DetailItem label="Department" value={employee.department} />
              <DetailItem label="Country" value={employee.country} />
              <DetailItem label="Center" value={employee.center} />
              <DetailItem label="Years" value={`${employee.yearsAtCompany} yr${employee.yearsAtCompany !== 1 ? 's' : ''}`} />
              <DetailItem label="Start Date" value={employee.startDate} />
              <DetailItem label="Job Rate" value={`${employee.jobRate}/5`} />
              <DetailItem label="Sick Leaves" value={`${employee.sickLeaves}`} />
              <DetailItem label="Unpaid Leaves" value={`${employee.unpaidLeaves}`} />
            </div>
          </div>
        </motion.div>
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

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-black/40 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
