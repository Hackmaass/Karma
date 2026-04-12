import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, LogIn, LogOut as LogOutIcon, Loader2, Users, Timer } from 'lucide-react';
import { fetchAttendance, checkIn, checkOut, AttendanceData } from '../lib/dataService';
import { cn } from '../lib/utils';

export default function Attendance() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const attendance = await fetchAttendance();
    setData(attendance);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const handleCheckIn = async (employeeId: number) => {
    await checkIn(employeeId);
    loadData();
  };

  const handleCheckOut = async (employeeId: number) => {
    await checkOut(employeeId);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
        <p className="text-sm font-medium text-black/60 animate-pulse">Loading attendance data...</p>
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Header */}
      <section>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-medium tracking-tight mb-2">Attendance</h1>
          <p className="text-lg text-black/60 font-light mb-8">Today's workforce presence — {data?.date}</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white border border-black/[0.04] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-black/50 mb-3">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <div className="text-4xl font-medium tracking-tight">{summary?.total || 0}</div>
            </div>
            <div className="bg-white border border-black/[0.04] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 mb-3">
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">Checked In</span>
              </div>
              <div className="text-4xl font-medium tracking-tight text-emerald-600">{summary?.checkedIn || 0}</div>
            </div>
            <div className="bg-white border border-black/[0.04] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 mb-3">
                <LogOutIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Checked Out</span>
              </div>
              <div className="text-4xl font-medium tracking-tight text-blue-600">{summary?.checkedOut || 0}</div>
            </div>
            <div className="bg-white border border-black/[0.04] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-black/50 mb-3">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">Avg Hours</span>
              </div>
              <div className="text-4xl font-medium tracking-tight">{(summary?.avgWorkingHours || 0).toFixed(1)}h</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Attendance Grid */}
      <section>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <h3 className="text-sm font-medium text-black/40 uppercase tracking-wider mb-6">Employee Status</h3>
          <div className="bg-white border border-black/[0.04] rounded-3xl overflow-hidden shadow-sm">
            <div className="divide-y divide-black/[0.04]">
              {data?.records.map((record) => (
                <div key={record.employeeId} className="flex items-center gap-4 p-5 hover:bg-black/[0.01] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-black/5 overflow-hidden shrink-0">
                    <img src={`https://picsum.photos/seed/${record.employeeName.replace(/\s/g, '')}/100/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{record.employeeName}</div>
                    <div className="text-xs text-black/50">{record.department}</div>
                  </div>
                  <div className="w-20 text-sm text-black/60">
                    {record.checkIn || '—'}
                  </div>
                  <div className="w-20 text-sm text-black/60">
                    {record.checkOut || '—'}
                  </div>
                  <div className="w-20 text-sm font-medium">
                    {record.workingHours ? `${record.workingHours}h` : '—'}
                  </div>
                  <div className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full w-24 text-center",
                    record.status === 'checked-in' ? 'bg-emerald-100 text-emerald-700' :
                    record.status === 'checked-out' ? 'bg-blue-100 text-blue-700' :
                    'bg-black/[0.04] text-black/40'
                  )}>
                    {record.status === 'checked-in' ? 'Active' : record.status === 'checked-out' ? 'Done' : 'Absent'}
                  </div>
                  <div className="w-24 flex justify-end">
                    {record.status === 'absent' && (
                      <button onClick={() => handleCheckIn(record.employeeId)} className="text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-200 transition-colors">
                        Check In
                      </button>
                    )}
                    {record.status === 'checked-in' && (
                      <button onClick={() => handleCheckOut(record.employeeId)} className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors">
                        Check Out
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(!data?.records || data.records.length === 0) && (
                <div className="p-12 text-center text-black/40 text-sm">No attendance records for today.</div>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
