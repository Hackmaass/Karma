import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CalendarOff, Check, X, Plus, Loader2, Clock } from 'lucide-react';
import { fetchLeaves, submitLeave, updateLeaveStatus, fetchAllEmployees, LeaveData, EnrichedEmployee } from '../lib/dataService';

export default function LeaveManagement() {
  const [leaveData, setLeaveData] = useState<LeaveData | null>(null);
  const [employees, setEmployees] = useState<EnrichedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Form state
  const [formEmpId, setFormEmpId] = useState<number>(0);
  const [formType, setFormType] = useState<string>('casual');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formReason, setFormReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    const [leaves, emps] = await Promise.all([fetchLeaves(), fetchAllEmployees()]);
    setLeaveData(leaves);
    setEmployees(emps);
    if (emps.length > 0 && formEmpId === 0) setFormEmpId(emps[0].id);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStart || !formEnd) return;
    setSubmitting(true);
    await submitLeave({ employeeId: formEmpId, type: formType, startDate: formStart, endDate: formEnd, reason: formReason });
    setShowForm(false);
    setFormReason('');
    setSubmitting(false);
    loadData();
  };

  const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
    await updateLeaveStatus(id, status);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
        <p className="text-sm font-medium text-black/60 animate-pulse">Loading leave management...</p>
      </div>
    );
  }

  const filteredRequests = leaveData?.requests.filter(r => filter === 'all' || r.status === filter) || [];

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Header */}
      <section>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-medium tracking-tight mb-2">Leave Management</h1>
              <p className="text-lg text-black/60 font-light">Track and manage employee leave requests across the organization.</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 text-sm font-medium bg-black text-white px-5 py-2.5 rounded-full hover:bg-black/90 transition-all">
              <Plus className="w-4 h-4" />
              Apply Leave
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-black/[0.04] rounded-3xl p-6 shadow-sm">
              <div className="text-sm font-medium text-black/50 mb-2">Pending</div>
              <div className="text-4xl font-medium tracking-tight text-amber-600">{leaveData?.summary.totalPending || 0}</div>
              <div className="text-sm text-black/60 mt-1">Awaiting approval</div>
            </div>
            <div className="bg-white border border-black/[0.04] rounded-3xl p-6 shadow-sm">
              <div className="text-sm font-medium text-black/50 mb-2">Approved</div>
              <div className="text-4xl font-medium tracking-tight text-emerald-600">{leaveData?.summary.totalApproved || 0}</div>
              <div className="text-sm text-black/60 mt-1">This period</div>
            </div>
            <div className="bg-white border border-black/[0.04] rounded-3xl p-6 shadow-sm">
              <div className="text-sm font-medium text-black/50 mb-2">Rejected</div>
              <div className="text-4xl font-medium tracking-tight text-red-500">{leaveData?.summary.totalRejected || 0}</div>
              <div className="text-sm text-black/60 mt-1">This period</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Apply Leave Form */}
      {showForm && (
        <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
          <div className="bg-white border border-black/[0.04] rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-medium tracking-tight mb-6">New Leave Request</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black/60">Employee</label>
                <select value={formEmpId} onChange={(e) => setFormEmpId(Number(e.target.value))} className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/10">
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} — {emp.department}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black/60">Leave Type</label>
                <select value={formType} onChange={(e) => setFormType(e.target.value)} className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/10">
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black/60">Start Date</label>
                <input type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)} className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/10" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black/60">End Date</label>
                <input type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/10" required />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-sm font-medium text-black/60">Reason</label>
                <input type="text" value={formReason} onChange={(e) => setFormReason(e.target.value)} placeholder="Optional reason..." className="w-full bg-page-bg border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/10" />
              </div>
              <div className="col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="text-sm font-medium text-black/60 hover:text-black px-4 py-2 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="text-sm font-medium bg-black text-white px-6 py-2.5 rounded-full hover:bg-black/90 transition-all disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </motion.section>
      )}

      {/* Filters */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                filter === f ? 'bg-black/[0.06] text-black' : 'text-black/50 hover:text-black hover:bg-black/[0.02]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white border border-black/[0.04] rounded-3xl overflow-hidden shadow-sm">
          <div className="divide-y divide-black/[0.04]">
            {filteredRequests.slice(0, 20).map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-5 hover:bg-black/[0.01] transition-colors">
                <div className="w-10 h-10 rounded-full bg-black/5 overflow-hidden shrink-0">
                  <img src={`https://picsum.photos/seed/${req.employeeName.replace(/\s/g, '')}/100/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{req.employeeName}</div>
                  <div className="text-xs text-black/50">{req.department}</div>
                </div>
                <div className="text-sm text-black/60 w-24">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    req.type === 'sick' ? 'bg-orange-100 text-orange-700' :
                    req.type === 'unpaid' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{req.type}</span>
                </div>
                <div className="text-sm text-black/60 w-40 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {req.startDate} · {req.days}d
                </div>
                <div className="text-sm text-black/50 w-32 truncate">{req.reason || '—'}</div>
                <div className="w-28 flex items-center justify-end gap-2">
                  {req.status === 'pending' ? (
                    <>
                      <button onClick={() => handleStatusUpdate(req.id, 'approved')} className="p-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors" title="Approve">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleStatusUpdate(req.id, 'rejected')} className="p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors" title="Reject">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>{req.status}</span>
                  )}
                </div>
              </div>
            ))}
            {filteredRequests.length === 0 && (
              <div className="p-12 text-center text-black/40 text-sm">No leave requests found.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
