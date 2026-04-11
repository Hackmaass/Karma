import { motion } from 'motion/react';
import { Users, GitPullRequest, MessageSquare, Calendar } from 'lucide-react';

export default function TeamInsights() {
  return (
    <div className="flex flex-col gap-12 pb-24">
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-medium tracking-tight mb-2">Team Insights</h1>
          <p className="text-lg text-black/60 font-light">Understanding how your organization works together.</p>
        </motion.div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Collaboration Graph Summary */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border border-black/[0.04] rounded-3xl p-8 shadow-sm"
        >
          <h2 className="text-xl font-medium tracking-tight mb-6">Collaboration Flow</h2>
          <div className="space-y-6">
            <p className="text-black/80 leading-relaxed">
              The strongest collaboration is currently between <span className="font-medium">Engineering</span> and <span className="font-medium">Product</span>. 
              Marketing is operating mostly in isolation this week.
            </p>
            
            <div className="space-y-4">
              <FlowItem from="Engineering" to="Product" strength={85} />
              <FlowItem from="Design" to="Engineering" strength={40} alert />
              <FlowItem from="Marketing" to="Sales" strength={60} />
            </div>
          </div>
        </motion.section>

        {/* Bottlenecks */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white border border-black/[0.04] rounded-3xl p-8 shadow-sm"
        >
          <h2 className="text-xl font-medium tracking-tight mb-6">Active Bottlenecks</h2>
          <div className="space-y-6">
            <BottleneckItem 
              icon={<GitPullRequest className="w-4 h-4" />}
              title="Code Review Queue"
              desc="Average time to merge increased to 2.4 days. 12 PRs waiting."
              impact="High"
            />
            <BottleneckItem 
              icon={<MessageSquare className="w-4 h-4" />}
              title="Cross-team Communication"
              desc="Design specs are being clarified in Slack rather than Jira, causing context loss."
              impact="Medium"
            />
            <BottleneckItem 
              icon={<Calendar className="w-4 h-4" />}
              title="Meeting Overload"
              desc="Product team has < 2 hours of contiguous focus time per day."
              impact="High"
            />
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function FlowItem({ from, to, strength, alert }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-sm font-medium text-black/60 text-right">{from}</div>
      <div className="flex-1 h-2 bg-black/[0.04] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${alert ? 'bg-amber-500' : 'bg-black/20'}`} 
          style={{ width: `${strength}%` }}
        />
      </div>
      <div className="w-24 text-sm font-medium text-black/60">{to}</div>
    </div>
  );
}

function BottleneckItem({ icon, title, desc, impact }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 w-8 h-8 rounded-full bg-black/[0.03] flex items-center justify-center text-black/60 shrink-0">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-black">{title}</span>
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
            impact === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-black/[0.04] text-black/60'
          }`}>
            {impact} Impact
          </span>
        </div>
        <p className="text-sm text-black/60 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
