import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Loader2, Sparkles, Globe, Pencil, Trash2, Play, Check, X, ExternalLink, Star, UserCheck, Filter, Linkedin } from 'lucide-react';
import { fetchHiringRules, createHiringRule, updateHiringRule, deleteHiringRule, scrapeForRule, updateCandidateStatus, HiringRule, ScrapedCandidate } from '../lib/dataService';
import { cn } from '../lib/utils';

export default function HiringAutomation() {
  const [rules, setRules] = useState<HiringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [creating, setCreating] = useState(false);
  const [scrapingId, setScrapingId] = useState<number | null>(null);
  const [selectedRule, setSelectedRule] = useState<HiringRule | null>(null);
  const [candidates, setCandidates] = useState<ScrapedCandidate[]>([]);
  const [scrapeMeta, setScrapeMeta] = useState<{ source: string; totalScanned: number; matched: number; avgMatchScore: number } | null>(null);
  const [editingRule, setEditingRule] = useState<HiringRule | null>(null);
  const [tab, setTab] = useState<'rules' | 'candidates'>('rules');

  async function loadRules() {
    setLoading(true);
    const data = await fetchHiringRules();
    setRules(data);
    if (data.length > 0 && !selectedRule) setSelectedRule(data[0]);
    setLoading(false);
  }

  useEffect(() => { loadRules(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setCreating(true);
    const result = await createHiringRule(prompt.trim());
    if (result) {
      setRules(prev => [...prev, result]);
      setSelectedRule(result);
      setPrompt('');
      setShowCreate(false);
    }
    setCreating(false);
  };

  const handleScrape = async (id: number) => {
    setScrapingId(id);
    const result = await scrapeForRule(id);
    if (result) {
      setCandidates(result.candidates);
      setScrapeMeta(result.meta);
      setRules(prev => prev.map(r => r.id === id ? result.rule : r));
      if (selectedRule?.id === id) setSelectedRule(result.rule);
      setTab('candidates');
    }
    setScrapingId(null);
  };

  const handleDelete = async (id: number) => {
    await deleteHiringRule(id);
    const remaining = rules.filter(r => r.id !== id);
    setRules(remaining);
    if (selectedRule?.id === id) setSelectedRule(remaining[0] || null);
  };

  const handleSaveEdit = async () => {
    if (!editingRule) return;
    const updated = await updateHiringRule(editingRule.id, {
      filters: editingRule.filters,
      condition: editingRule.condition,
      action: editingRule.action,
      source: editingRule.source,
      roleTarget: editingRule.roleTarget,
    });
    if (updated) {
      setRules(prev => prev.map(r => r.id === updated.id ? updated : r));
      if (selectedRule?.id === updated.id) setSelectedRule(updated);
    }
    setEditingRule(null);
  };

  const handleCandidateAction = async (id: number, status: string) => {
    const updated = await updateCandidateStatus(id, status);
    if (updated) {
      setCandidates(prev => prev.map(c => c.id === id ? updated : c));
    }
  };

  const suggestions = [
    "Find React developers with 3+ years in Bangalore or Remote from LinkedIn",
    "Scrape Naukri for product managers with SaaS experience, exclude TCS and Infosys",
    "Source ML engineers with Python and PyTorch, 5+ years, any location",
    "Find full stack engineers familiar with TypeScript and AWS, 4-8 years experience",
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
        <p className="text-sm font-medium text-black/60 animate-pulse">Loading hiring automation...</p>
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
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-3xl font-medium tracking-tight">Hiring Automation</h1>
              </div>
              <p className="text-black/50 font-light">Create sourcing rules in plain English. KarmaOS scrapes LinkedIn & Naukri and matches candidates to your Work DNA profiles.</p>
            </div>
            <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 text-sm font-medium bg-black text-white px-5 py-2.5 rounded-full hover:bg-black/90 transition-all shadow-lg shadow-black/10">
              <Plus className="w-4 h-4" />
              New Rule
            </button>
          </div>
        </motion.div>
      </section>

      {/* Create Rule - Prompt Box */}
      <AnimatePresence>
        {showCreate && (
          <motion.section initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} transition={{ duration: 0.3 }}>
            <div className="bg-white border border-black/[0.04] rounded-3xl p-8 shadow-lg shadow-black/[0.03]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-medium tracking-tight">Describe who you're looking for</h2>
              </div>
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='e.g., "Find senior Node.js engineers with 5+ years, based in Bangalore, from LinkedIn and Naukri"'
                  className="w-full bg-page-bg border border-black/[0.04] rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none h-24 transition-all"
                  autoFocus
                />
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onClick={() => setPrompt(s)} className="text-xs bg-gradient-to-r from-black/[0.02] to-black/[0.04] hover:from-blue-50 hover:to-indigo-50 text-black/50 hover:text-blue-700 px-3 py-1.5 rounded-full transition-all border border-black/[0.03] hover:border-blue-200">
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-3 pt-1">
                  <button type="button" onClick={() => setShowCreate(false)} className="text-sm font-medium text-black/50 hover:text-black px-4 py-2">Cancel</button>
                  <button type="submit" disabled={creating || !prompt.trim()} className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2.5 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 shadow-lg shadow-blue-200/50">
                    {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> AI is parsing...</> : <><Sparkles className="w-4 h-4" /> Create Rule</>}
                  </button>
                </div>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-full w-fit">
        <button onClick={() => setTab('rules')} className={cn("text-sm font-medium px-5 py-2 rounded-full transition-all", tab === 'rules' ? 'bg-white text-black shadow-sm' : 'text-black/50 hover:text-black')}>
          Sourcing Rules
        </button>
        <button onClick={() => setTab('candidates')} className={cn("text-sm font-medium px-5 py-2 rounded-full transition-all", tab === 'candidates' ? 'bg-white text-black shadow-sm' : 'text-black/50 hover:text-black')}>
          Candidates {candidates.length > 0 && <span className="ml-1.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{candidates.length}</span>}
        </button>
      </div>

      {/* Rules Tab */}
      {tab === 'rules' && (
        <section>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {rules.length === 0 ? (
              <div className="bg-gradient-to-br from-white to-blue-50/30 border border-black/[0.04] rounded-3xl p-12 text-center shadow-sm">
                <div className="p-3 rounded-2xl bg-blue-100/50 w-fit mx-auto mb-4"><Search className="w-8 h-8 text-blue-400" /></div>
                <p className="text-black/40 text-sm mb-5">No hiring rules yet. Describe your ideal candidate and KarmaOS will find them.</p>
                <button onClick={() => setShowCreate(true)} className="text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2.5 rounded-full">Create your first rule</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {rules.map((rule) => (
                  <div key={rule.id} className={cn("bg-white border rounded-2xl shadow-sm transition-all", selectedRule?.id === rule.id ? 'border-blue-300 ring-2 ring-blue-100' : 'border-black/[0.04]')}>
                    {/* Rule Header */}
                    <div className="p-6 cursor-pointer" onClick={() => setSelectedRule(rule)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">{rule.roleTarget}</span>
                            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                              rule.source === 'linkedin' ? 'bg-sky-100 text-sky-700' :
                              rule.source === 'naukri' ? 'bg-purple-100 text-purple-700' :
                              'bg-indigo-100 text-indigo-700'
                            )}>
                              {rule.source === 'both' ? 'LinkedIn + Naukri' : rule.source}
                            </span>
                          </div>
                          <div className="text-sm font-medium mt-2">{rule.prompt}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleScrape(rule.id)} disabled={scrapingId === rule.id} className="flex items-center gap-1.5 text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3.5 py-2 rounded-full hover:from-blue-200 hover:to-indigo-200 transition-all disabled:opacity-50">
                            {scrapingId === rule.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                            {scrapingId === rule.id ? 'Scraping...' : 'Scrape Now'}
                          </button>
                          <button onClick={() => setEditingRule({ ...rule, filters: { ...rule.filters } })} className="p-2 text-black/30 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(rule.id)} className="p-2 text-black/30 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Parsed Filters */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-page-bg rounded-xl p-4 text-xs mt-3">
                        <div>
                          <div className="text-black/30 uppercase tracking-wider mb-1 font-bold">Experience</div>
                          <div className="text-black/80 font-medium">{rule.filters.minExperience}–{rule.filters.maxExperience} years</div>
                        </div>
                        <div>
                          <div className="text-black/30 uppercase tracking-wider mb-1 font-bold">Skills</div>
                          <div className="flex flex-wrap gap-1">
                            {rule.filters.skills.slice(0, 3).map((s, i) => (
                              <span key={i} className="bg-white border border-black/[0.06] px-1.5 py-0.5 rounded text-black/70">{s}</span>
                            ))}
                            {rule.filters.skills.length > 3 && <span className="text-black/40">+{rule.filters.skills.length - 3}</span>}
                          </div>
                        </div>
                        <div>
                          <div className="text-black/30 uppercase tracking-wider mb-1 font-bold">Location</div>
                          <div className="text-black/80 font-medium">{rule.filters.location}</div>
                        </div>
                        <div>
                          <div className="text-black/30 uppercase tracking-wider mb-1 font-bold">Last Run</div>
                          <div className="text-black/80 font-medium">{rule.lastRun ? `${rule.candidatesFound} found` : 'Never'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Candidates Tab */}
      {tab === 'candidates' && (
        <section>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* Scrape Meta */}
            {scrapeMeta && (
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-200/30 rounded-2xl p-4 mb-6 flex items-center gap-6">
                <div className="text-center">
                  <div className="text-xl font-semibold text-blue-900">{scrapeMeta.totalScanned}</div>
                  <div className="text-[10px] text-blue-600/60 uppercase tracking-wider font-medium">Scanned</div>
                </div>
                <div className="w-px h-10 bg-blue-200/50" />
                <div className="text-center">
                  <div className="text-xl font-semibold text-blue-900">{scrapeMeta.matched}</div>
                  <div className="text-[10px] text-blue-600/60 uppercase tracking-wider font-medium">Matched</div>
                </div>
                <div className="w-px h-10 bg-blue-200/50" />
                <div className="text-center">
                  <div className="text-xl font-semibold text-blue-900">{scrapeMeta.avgMatchScore}%</div>
                  <div className="text-[10px] text-blue-600/60 uppercase tracking-wider font-medium">Avg Score</div>
                </div>
              </div>
            )}

            {candidates.length === 0 ? (
              <div className="bg-white border border-black/[0.04] rounded-3xl p-12 text-center shadow-sm">
                <Globe className="w-8 h-8 text-black/20 mx-auto mb-4" />
                <p className="text-black/40 text-sm">No candidates yet. Run a scrape on a rule to find matches.</p>
              </div>
            ) : (
              <div className="bg-white border border-black/[0.04] rounded-3xl overflow-hidden shadow-sm divide-y divide-black/[0.04]">
                {candidates.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-5 hover:bg-black/[0.01] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                        {c.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{c.name}</span>
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded",
                            c.source === 'linkedin' ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'
                          )}>{c.source === 'linkedin' ? 'LI' : 'NK'}</span>
                          {c.status !== 'new' && (
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                              c.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-700' :
                              c.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            )}>{c.status}</span>
                          )}
                        </div>
                        <div className="text-xs text-black/50 mt-0.5">{c.title} at {c.company} · {c.experience}yr · {c.location}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {c.skills.slice(0, 5).map((s, j) => (
                            <span key={j} className="text-[10px] bg-black/[0.03] text-black/60 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className={cn("text-lg font-bold", c.matchScore >= 80 ? 'text-emerald-600' : c.matchScore >= 65 ? 'text-amber-600' : 'text-black/40')}>
                          {c.matchScore}%
                        </div>
                        <div className="text-[10px] text-black/30 font-medium">{c.dnaMatch}</div>
                        <div className="flex items-center gap-1">
                          {c.status === 'new' && (
                            <>
                              <button onClick={() => handleCandidateAction(c.id, 'shortlisted')} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors" title="Shortlist">
                                <Check className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleCandidateAction(c.id, 'rejected')} className="p-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors" title="Reject">
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          <a href={c.profileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-black/[0.04] text-black/40 rounded-full hover:bg-black/[0.08] transition-colors" title="View profile">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Manual Edit Modal */}
      <AnimatePresence>
        {editingRule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-8"
            onClick={() => setEditingRule(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-6">
                <Pencil className="w-5 h-5 text-black/40" />
                <h2 className="text-lg font-medium tracking-tight">Edit Rule Manually</h2>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Target Role</label>
                  <input type="text" value={editingRule.roleTarget} onChange={e => setEditingRule({ ...editingRule, roleTarget: e.target.value })} className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Min Experience</label>
                    <input type="number" value={editingRule.filters.minExperience} onChange={e => setEditingRule({ ...editingRule, filters: { ...editingRule.filters, minExperience: Number(e.target.value) } })} className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Max Experience</label>
                    <input type="number" value={editingRule.filters.maxExperience} onChange={e => setEditingRule({ ...editingRule, filters: { ...editingRule.filters, maxExperience: Number(e.target.value) } })} className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Skills (comma-separated)</label>
                  <input type="text" value={editingRule.filters.skills.join(', ')} onChange={e => setEditingRule({ ...editingRule, filters: { ...editingRule.filters, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })} className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Location</label>
                  <input type="text" value={editingRule.filters.location} onChange={e => setEditingRule({ ...editingRule, filters: { ...editingRule.filters, location: e.target.value } })} className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Source</label>
                  <select value={editingRule.source} onChange={e => setEditingRule({ ...editingRule, source: e.target.value as HiringRule['source'] })} className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200">
                    <option value="both">LinkedIn + Naukri</option>
                    <option value="linkedin">LinkedIn only</option>
                    <option value="naukri">Naukri only</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Exclude Companies (comma-separated)</label>
                  <input type="text" value={editingRule.filters.excludeCompanies.join(', ')} onChange={e => setEditingRule({ ...editingRule, filters: { ...editingRule.filters, excludeCompanies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })} placeholder="TCS, Infosys..." className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-black/[0.04] mt-6">
                <button onClick={() => setEditingRule(null)} className="text-sm font-medium text-black/50 hover:text-black px-4 py-2">Cancel</button>
                <button onClick={handleSaveEdit} className="text-sm font-medium bg-black text-white px-6 py-2.5 rounded-full hover:bg-black/90 transition-all">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
