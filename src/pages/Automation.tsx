import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Plus, Play, Trash2, Loader2, AlertTriangle, Bell, Flag, FileText, Sparkles, Database, CheckCircle2, ArrowRight } from 'lucide-react';
import { fetchAutomations, createAutomation, runAutomation, deleteAutomation, AutomationRule, AutomationResult } from '../lib/dataService';
import {
  ReactFlow,
  Background,
  MiniMap,
  type Node,
  type Edge,
  Position,
  MarkerType,
  Handle,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ─── Custom Node Components ───────────────────────────────

function DataSourceNode({ data }: { data: Record<string, string> }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300/60 rounded-2xl px-5 py-4 min-w-[180px] shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-300 hover:-translate-y-0.5">
        <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-white !shadow-md" />
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-indigo-100">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.1em]">Data Source</span>
        </div>
        <div className="text-[13px] font-semibold text-indigo-900">{data.label}</div>
        <div className="text-[11px] text-indigo-600/60 mt-1">{data.sub}</div>
      </div>
    </div>
  );
}

function TriggerNode({ data }: { data: Record<string, string> }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300/60 rounded-2xl px-5 py-4 min-w-[180px] shadow-lg shadow-amber-100/50 hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300 hover:-translate-y-0.5">
        <Handle type="target" position={Position.Left} className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white !shadow-md" />
        <Handle type="source" position={Position.Right} className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white !shadow-md" />
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-amber-100">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.1em]">Trigger</span>
        </div>
        <div className="text-[13px] font-semibold text-amber-900">{data.label}</div>
        <div className="text-[11px] text-amber-600/60 mt-1">{data.sub}</div>
      </div>
    </div>
  );
}

function ConditionNode({ data }: { data: Record<string, string> }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-blue-500/20 rounded-2xl blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-300/60 rounded-2xl px-5 py-4 min-w-[200px] max-w-[240px] shadow-lg shadow-sky-100/50 hover:shadow-xl hover:shadow-sky-200/50 transition-all duration-300 hover:-translate-y-0.5">
        <Handle type="target" position={Position.Left} className="!bg-sky-500 !w-3 !h-3 !border-2 !border-white !shadow-md" />
        <Handle type="source" position={Position.Right} className="!bg-sky-500 !w-3 !h-3 !border-2 !border-white !shadow-md" />
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-sky-100">
            <svg className="w-3.5 h-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-[10px] font-bold text-sky-500 uppercase tracking-[0.1em]">Condition</span>
        </div>
        <div className="text-[13px] font-semibold text-sky-900 leading-snug">{data.label}</div>
        <div className="text-[11px] text-sky-600/60 mt-1">{data.sub}</div>
      </div>
    </div>
  );
}

function ActionNode({ data }: { data: Record<string, string> }) {
  const isNotif = data.actionType === 'notification';
  const isFlag = data.actionType === 'flag';

  const palette = isNotif
    ? { from: 'from-emerald-50', to: 'to-green-50', border: 'border-emerald-300/60', glow1: 'from-emerald-500/20', glow2: 'to-green-500/20', shadow: 'shadow-emerald-100/50', hoverShadow: 'shadow-emerald-200/50', badge: 'bg-emerald-100', badgeText: 'text-emerald-500', title: 'text-emerald-900', sub: 'text-emerald-600/60', handle: '!bg-emerald-500' }
    : isFlag
    ? { from: 'from-orange-50', to: 'to-red-50', border: 'border-orange-300/60', glow1: 'from-orange-500/20', glow2: 'to-red-500/20', shadow: 'shadow-orange-100/50', hoverShadow: 'shadow-orange-200/50', badge: 'bg-orange-100', badgeText: 'text-orange-500', title: 'text-orange-900', sub: 'text-orange-600/60', handle: '!bg-orange-500' }
    : { from: 'from-violet-50', to: 'to-purple-50', border: 'border-violet-300/60', glow1: 'from-violet-500/20', glow2: 'to-purple-500/20', shadow: 'shadow-violet-100/50', hoverShadow: 'shadow-violet-200/50', badge: 'bg-violet-100', badgeText: 'text-violet-500', title: 'text-violet-900', sub: 'text-violet-600/60', handle: '!bg-violet-500' };

  const icon = isNotif ? <Bell className="w-3.5 h-3.5" /> : isFlag ? <Flag className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />;

  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${palette.glow1} ${palette.glow2} rounded-2xl blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className={`relative bg-gradient-to-br ${palette.from} ${palette.to} border-2 ${palette.border} rounded-2xl px-5 py-4 min-w-[180px] shadow-lg ${palette.shadow} hover:shadow-xl hover:${palette.hoverShadow} transition-all duration-300 hover:-translate-y-0.5`}>
        <Handle type="target" position={Position.Left} className={`${palette.handle} !w-3 !h-3 !border-2 !border-white !shadow-md`} />
        <Handle type="source" position={Position.Right} className={`${palette.handle} !w-3 !h-3 !border-2 !border-white !shadow-md`} />
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg ${palette.badge} ${palette.badgeText}`}>{icon}</div>
          <span className={`text-[10px] font-bold ${palette.badgeText} uppercase tracking-[0.1em]`}>Action</span>
        </div>
        <div className={`text-[13px] font-semibold ${palette.title}`}>{data.label}</div>
        <div className={`text-[11px] ${palette.sub} mt-1`}>{data.sub}</div>
      </div>
    </div>
  );
}

function ResultNode({ data }: { data: Record<string, string> }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300/60 rounded-2xl px-5 py-4 min-w-[170px] shadow-lg shadow-teal-100/50 hover:shadow-xl hover:shadow-teal-200/50 transition-all duration-300 hover:-translate-y-0.5">
        <Handle type="target" position={Position.Left} className="!bg-teal-500 !w-3 !h-3 !border-2 !border-white !shadow-md" />
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-teal-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <span className="text-[10px] font-bold text-teal-500 uppercase tracking-[0.1em]">Output</span>
        </div>
        <div className="text-[13px] font-semibold text-teal-900">{data.label}</div>
        <div className="text-[11px] text-teal-600/60 mt-1">{data.sub}</div>
      </div>
    </div>
  );
}

const nodeTypes = {
  dataSource: DataSourceNode,
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  result: ResultNode,
};

// ─── Build Flow from Rule ─────────────────────────────────

function buildFlowFromRule(rule: AutomationRule): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    {
      id: 'datasource',
      type: 'dataSource',
      position: { x: 0, y: 80 },
      data: { label: 'Workforce Data', sub: 'Employees, leaves, attendance' },
    },
    {
      id: 'trigger',
      type: 'trigger',
      position: { x: 260, y: 80 },
      data: { label: rule.trigger.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), sub: 'Event listener' },
    },
    {
      id: 'condition',
      type: 'condition',
      position: { x: 520, y: 80 },
      data: { label: rule.condition, sub: 'AI-parsed logic' },
    },
    {
      id: 'action',
      type: 'action',
      position: { x: 820, y: 80 },
      data: { label: rule.action, sub: rule.actionType.charAt(0).toUpperCase() + rule.actionType.slice(1), actionType: rule.actionType },
    },
    {
      id: 'result',
      type: 'result',
      position: { x: 1080, y: 80 },
      data: { label: 'Manager Dashboard', sub: 'Results delivered' },
    },
  ];

  const edgeDefaults = {
    style: { strokeWidth: 2 },
    animated: true,
  };

  const edges: Edge[] = [
    {
      id: 'e1',
      source: 'datasource',
      target: 'trigger',
      ...edgeDefaults,
      style: { ...edgeDefaults.style, stroke: '#8b5cf6' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6', width: 16, height: 16 },
      label: 'feeds',
      labelStyle: { fontSize: 9, fontWeight: 700, fill: '#8b5cf6' },
      labelBgStyle: { fill: '#f5f3ff', stroke: '#c4b5fd', strokeWidth: 1 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 8,
    },
    {
      id: 'e2',
      source: 'trigger',
      target: 'condition',
      ...edgeDefaults,
      style: { ...edgeDefaults.style, stroke: '#f59e0b' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b', width: 16, height: 16 },
      label: 'fires',
      labelStyle: { fontSize: 9, fontWeight: 700, fill: '#d97706' },
      labelBgStyle: { fill: '#fffbeb', stroke: '#fcd34d', strokeWidth: 1 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 8,
    },
    {
      id: 'e3',
      source: 'condition',
      target: 'action',
      ...edgeDefaults,
      style: { ...edgeDefaults.style, stroke: '#10b981' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981', width: 16, height: 16 },
      label: 'TRUE →',
      labelStyle: { fontSize: 9, fontWeight: 800, fill: '#059669' },
      labelBgStyle: { fill: '#ecfdf5', stroke: '#6ee7b7', strokeWidth: 1 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 8,
    },
    {
      id: 'e4',
      source: 'action',
      target: 'result',
      ...edgeDefaults,
      style: { ...edgeDefaults.style, stroke: '#14b8a6' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#14b8a6', width: 16, height: 16 },
      label: 'delivers',
      labelStyle: { fontSize: 9, fontWeight: 700, fill: '#0d9488' },
      labelBgStyle: { fill: '#f0fdfa', stroke: '#5eead4', strokeWidth: 1 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 8,
    },
  ];

  return { nodes, edges };
}

// ─── Main Component ───────────────────────────────────────

export default function Automation() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [creating, setCreating] = useState(false);
  const [runningId, setRunningId] = useState<number | null>(null);
  const [runResults, setRunResults] = useState<Record<number, AutomationResult[]>>({});
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  async function loadRules() {
    setLoading(true);
    const data = await fetchAutomations();
    setRules(data);
    if (data.length > 0 && !selectedRule) {
      setSelectedRule(data[0]);
      const flow = buildFlowFromRule(data[0]);
      setNodes(flow.nodes);
      setEdges(flow.edges);
    }
    setLoading(false);
  }

  useEffect(() => { loadRules(); }, []);

  const selectRule = (rule: AutomationRule) => {
    setSelectedRule(rule);
    const flow = buildFlowFromRule(rule);
    setNodes(flow.nodes);
    setEdges(flow.edges);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setCreating(true);
    const result = await createAutomation(prompt.trim());
    if (result) {
      setRules(prev => [...prev, result]);
      selectRule(result);
      setPrompt('');
      setShowCreate(false);
    }
    setCreating(false);
  };

  const handleRun = async (id: number) => {
    setRunningId(id);
    const result = await runAutomation(id);
    if (result) {
      setRunResults(prev => ({ ...prev, [id]: result.results }));
      setRules(prev => prev.map(r => r.id === id ? result.rule : r));
      if (selectedRule?.id === id) setSelectedRule(result.rule);
    }
    setRunningId(null);
  };

  const handleDelete = async (id: number) => {
    const success = await deleteAutomation(id);
    if (success) {
      const remaining = rules.filter(r => r.id !== id);
      setRules(remaining);
      if (selectedRule?.id === id) {
        if (remaining.length > 0) selectRule(remaining[0]);
        else { setSelectedRule(null); setNodes([]); setEdges([]); }
      }
      setRunResults(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    }
  };

  const suggestions = [
    "If any employee has more than 3 sick leaves this month, notify their manager",
    "Flag employees with overtime hours above 50 for burnout risk review",
    "If attendance is below 80% in a department, log an alert for HR",
    "Notify manager when an employee has both high overtime and high sick leaves",
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
        <p className="text-sm font-medium text-black/60 animate-pulse">Loading automation engine...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-24">
      {/* Header */}
      <section>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <h1 className="text-3xl font-medium tracking-tight">Automation Engine</h1>
              </div>
              <p className="text-black/50 font-light">Describe workflows in plain English. KarmaOS builds, visualizes, and evaluates them.</p>
            </div>
            <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 text-sm font-medium bg-black text-white px-5 py-2.5 rounded-full hover:bg-black/90 transition-all shadow-lg shadow-black/10">
              <Plus className="w-4 h-4" />
              New Automation
            </button>
          </div>
        </motion.div>
      </section>

      {/* Create Rule */}
      <AnimatePresence>
        {showCreate && (
          <motion.section initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} transition={{ duration: 0.3 }}>
            <div className="bg-white border border-black/[0.04] rounded-3xl p-8 shadow-lg shadow-black/[0.03]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-medium tracking-tight">What should happen?</h2>
              </div>
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='Type in plain English... e.g., "If someone takes too many leaves, alert their manager"'
                  className="w-full bg-page-bg border border-black/[0.04] rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none h-24 transition-all"
                  autoFocus
                />
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onClick={() => setPrompt(s)} className="text-xs bg-gradient-to-r from-black/[0.02] to-black/[0.04] hover:from-black/[0.04] hover:to-black/[0.07] text-black/50 hover:text-black px-3 py-1.5 rounded-full transition-all border border-black/[0.03]">
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-3 pt-1">
                  <button type="button" onClick={() => setShowCreate(false)} className="text-sm font-medium text-black/50 hover:text-black px-4 py-2 transition-colors">Cancel</button>
                  <button type="submit" disabled={creating || !prompt.trim()} className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-full hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-amber-200/50">
                    {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing with AI...</> : <><Zap className="w-4 h-4" /> Create Rule</>}
                  </button>
                </div>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Visual Workflow Canvas */}
      {selectedRule && nodes.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-black/40 uppercase tracking-wider">Workflow Pipeline</h3>
              <p className="text-xs text-black/30 mt-0.5">Drag nodes to rearrange · Scroll to zoom · Click Run to evaluate</p>
            </div>
            <button
              onClick={() => handleRun(selectedRule.id)}
              disabled={runningId === selectedRule.id}
              className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-200/50"
            >
              {runningId === selectedRule.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {runningId === selectedRule.id ? 'Evaluating...' : 'Run Pipeline'}
            </button>
          </div>
          <div className="bg-gradient-to-br from-slate-50/80 via-white to-indigo-50/30 border border-black/[0.06] rounded-3xl overflow-hidden shadow-xl shadow-black/[0.03]" style={{ height: 320 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              proOptions={{ hideAttribution: true }}
              nodesConnectable={false}
              minZoom={0.3}
              maxZoom={1.5}
              defaultEdgeOptions={{ type: 'smoothstep' }}
            >
              <Background variant={BackgroundVariant.Dots} gap={16} size={1.5} color="rgba(0,0,0,0.04)" />
              <MiniMap
                nodeColor={() => '#e2e8f0'}
                maskColor="rgba(255,255,255,0.8)"
                style={{ border: '1px solid rgba(0,0,0,0.04)', borderRadius: 12, overflow: 'hidden' }}
              />
            </ReactFlow>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-black/25" />
            <span className="text-sm text-black/40 italic">&ldquo;{selectedRule.prompt}&rdquo;</span>
          </div>
        </motion.section>
      )}

      {/* Run Results */}
      <AnimatePresence>
        {selectedRule && (runResults[selectedRule.id] || selectedRule.lastResults) && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <h3 className="text-sm font-medium text-black/40 uppercase tracking-wider mb-4">
              Triggered Employees — {(runResults[selectedRule.id] || selectedRule.lastResults || []).length} match{(runResults[selectedRule.id] || selectedRule.lastResults || []).length !== 1 ? 'es' : ''}
            </h3>
            {(runResults[selectedRule.id] || selectedRule.lastResults || []).length === 0 ? (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-3xl p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-700 text-sm font-medium">All clear — no employees triggered this rule</p>
              </div>
            ) : (
              <div className="bg-white border border-black/[0.04] rounded-3xl overflow-hidden shadow-sm divide-y divide-black/[0.04]">
                {(runResults[selectedRule.id] || selectedRule.lastResults || []).map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-5 hover:bg-amber-50/30 transition-colors"
                  >
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 shadow-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-black/5 overflow-hidden shrink-0">
                      <img src={`https://picsum.photos/seed/${result.employeeName.replace(/\s/g, '')}/100/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{result.employeeName}</div>
                      <div className="text-xs text-black/40">{result.department}</div>
                    </div>
                    <div className="text-xs text-black/50 max-w-sm text-right">{result.detail}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Rules List */}
      <section>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <h3 className="text-sm font-medium text-black/40 uppercase tracking-wider mb-4">All Automations ({rules.length})</h3>

          {rules.length === 0 ? (
            <div className="bg-gradient-to-br from-white to-amber-50/30 border border-black/[0.04] rounded-3xl p-12 text-center shadow-sm">
              <div className="p-3 rounded-2xl bg-amber-100/50 w-fit mx-auto mb-4">
                <Zap className="w-8 h-8 text-amber-400" />
              </div>
              <p className="text-black/40 text-sm mb-5">No automation rules yet.</p>
              <button onClick={() => setShowCreate(true)} className="text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-full hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-200/50">
                Create your first rule
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {rules.map((rule, i) => (
                <motion.button
                  key={rule.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => selectRule(rule)}
                  className={`w-full text-left bg-white border rounded-2xl p-5 transition-all duration-200 ${
                    selectedRule?.id === rule.id
                      ? 'border-amber-300 ring-2 ring-amber-100 shadow-lg shadow-amber-100/50'
                      : 'border-black/[0.04] hover:border-black/10 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        rule.actionType === 'notification' ? 'bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-600' :
                        rule.actionType === 'flag' ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600' :
                        'bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600'
                      }`}>
                        {rule.actionType === 'notification' ? <Bell className="w-4 h-4" /> :
                         rule.actionType === 'flag' ? <Flag className="w-4 h-4" /> :
                         <FileText className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{rule.prompt}</div>
                        <div className="text-xs text-black/35 mt-0.5 flex items-center gap-2">
                          <span>{rule.trigger.replace(/_/g, ' ')}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span>{rule.actionType}</span>
                          {rule.lastRun && <span className="text-black/25">· ran {new Date(rule.lastRun).toLocaleTimeString()}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleRun(rule.id)}
                        disabled={runningId === rule.id}
                        className="flex items-center gap-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 px-3.5 py-2 rounded-full hover:bg-emerald-200 transition-colors disabled:opacity-50"
                      >
                        {runningId === rule.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        Run
                      </button>
                      <button onClick={() => handleDelete(rule.id)} className="p-2 text-black/20 hover:text-red-500 transition-colors rounded-full hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
