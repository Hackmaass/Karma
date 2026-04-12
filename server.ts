import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

dotenv.config({ path: '.env.local' });
dotenv.config();

// --- Excel Data Loader ---

interface RawEmployee {
  No: number;
  'First Name': string;
  'Last Name': string;
  Gender: string;
  'Start Date': string;
  Years: number;
  Department: string;
  Country: string;
  Center: string;
  'Monthly Salary': number;
  'Annual Salary': number;
  'Job Rate': number;
  'Sick Leaves': number;
  'Unpaid Leaves': number;
  'Overtime Hours': number;
}

interface EnrichedEmployee {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  gender: string;
  startDate: string;
  yearsAtCompany: number;
  department: string;
  country: string;
  center: string;
  monthlySalary: number;
  annualSalary: number;
  jobRate: number;
  sickLeaves: number;
  unpaidLeaves: number;
  overtimeHours: number;
  // Enriched / Synthetic work pattern fields
  role: string;
  workDna: string;
  deepWorkRatio: string;
  meetingLoad: string;
  communicationStyle: string;
  recentOutput: string;
  focusBlocks: string;
  overloadRisk: 'low' | 'medium' | 'high';
  // GitHub / Dev Specifics
  githubHandle?: string;
  commitsLast30Days?: number;
  prsOpened?: number;
  codeReviewRatio?: string;
}

function deriveRole(department: string, years: number): string {
  const seniorThreshold = 3;
  const prefix = years >= seniorThreshold ? 'Senior' : '';
  const roleMap: Record<string, string> = {
    'IT': 'Software Engineer',
    'Manufacturing': 'Production Specialist',
    'Manufacturing Admin': 'Production Admin',
    'Quality Control': 'QC Analyst',
    'Quality Assurance': 'QA Engineer',
    'Sales': 'Sales Executive',
    'Marketing': 'Marketing Specialist',
    'Account Management': 'Account Manager',
    'Creative': 'Creative Designer',
    'Facilities/Engineering': 'Facilities Engineer',
    'Environmental Health/Safety': 'EHS Specialist',
    'Environmental Compliance': 'Compliance Officer',
    'Product Development': 'Product Developer',
    'Research Center': 'Research Analyst',
    'Training': 'Training Coordinator',
    'Green Building': 'Green Building Specialist',
    'Major Mfg Projects': 'Project Manager',
    'Professional Training Group': 'Training Lead',
  };
  const base = roleMap[department] || `${department} Specialist`;
  return prefix ? `${prefix} ${base}` : base;
}

function deriveWorkDna(department: string, overtimeHours: number, jobRate: number): string {
  // Makers: technical / heads-down roles with moderate overtime
  const makerDepts = ['IT', 'Manufacturing', 'Product Development', 'Research Center', 'Creative', 'Green Building'];
  // Synchronizers: coordination-heavy roles
  const syncDepts = ['Account Management', 'Sales', 'Marketing', 'Training', 'Professional Training Group', 'Major Mfg Projects'];

  if (makerDepts.includes(department)) {
    return overtimeHours > 50 ? 'Maker (Overclocked)' : 'Maker';
  }
  if (syncDepts.includes(department)) {
    return 'Synchronizer';
  }
  // Quality / Compliance roles = Operators
  return 'Operator';
}

function enrichEmployee(raw: RawEmployee): EnrichedEmployee {
  const overtime = raw['Overtime Hours'] || 0;
  const sickLeaves = raw['Sick Leaves'] || 0;
  const jobRate = raw['Job Rate'] || 3;
  const years = raw['Years'] || 0;
  const department = raw['Department'] || 'General';

  // Deep Work Ratio: higher job rate + lower overtime → more deep work
  const deepWorkBase = Math.min(85, Math.max(10, 70 - (overtime * 0.3) + (jobRate * 5)));
  const deepWorkRatio = `${Math.round(deepWorkBase)}%`;

  // Meeting Load: synchronizer roles get higher meeting load
  const syncDepts = ['Account Management', 'Sales', 'Marketing', 'Training', 'Major Mfg Projects'];
  const pseudoRandom = ((raw.No * 17 + jobRate * 11) % 15);
  const meetingBase = syncDepts.includes(department) ? 35 + pseudoRandom : 10 + pseudoRandom;
  const meetingLoad = `${Math.round(meetingBase)}%`;

  // Communication style
  const commStyles = syncDepts.includes(department)
    ? ['Heavy Slack usage, real-time coordination', 'Frequent cross-team meetings', 'High sync communication via chat']
    : ['Mostly async via PRs and docs', 'Minimal sync, prefers written updates', 'Async-first, occasional standups'];
  const communicationStyle = commStyles[Math.floor(Math.abs(raw.No * 7) % commStyles.length)];

  // Recent output
  const outputOptions = overtime > 30
    ? ['High output but working extended hours', 'Elevated delivery pace, sustainability at risk', 'Strong throughput, monitoring for burnout']
    : ['Consistent and sustainable output', 'Steady contribution within normal hours', 'Balanced workload with quality focus'];
  const recentOutput = outputOptions[Math.floor(Math.abs(raw.No * 13) % outputOptions.length)];

  // Focus blocks
  const focusHours = Math.max(0.5, 4 - (overtime * 0.02) - (sickLeaves * 0.1));
  const focusBlocks = `Averaging ${focusHours.toFixed(1)} hours uninterrupted`;

  // Overload risk
  let overloadRisk: 'low' | 'medium' | 'high' = 'low';
  if (overtime > 50 || sickLeaves >= 5) overloadRisk = 'high';
  else if (overtime > 20 || sickLeaves >= 3) overloadRisk = 'medium';

  const isDev = department === 'IT' || department === 'Product Development' || department === 'Research Center';
  let githubData = {};
  
  if (isDev) {
    const handle = `${raw['First Name'].toLowerCase()}-${raw['Last Name'].toLowerCase()}`;
    const commits = 20 + Math.floor(Math.abs(raw.No * 19) % 80);
    const prs = 5 + Math.floor(Math.abs(raw.No * 7) % 15);
    const reviewBase = 60 + Math.floor(Math.abs(raw.No * 3) % 40);
    githubData = {
      githubHandle: handle,
      commitsLast30Days: commits,
      prsOpened: prs,
      codeReviewRatio: `${reviewBase}%`,
    };
  }

  return {
    id: raw.No,
    firstName: raw['First Name'],
    lastName: raw['Last Name'],
    name: `${raw['First Name']} ${raw['Last Name']}`,
    gender: raw.Gender,
    startDate: typeof raw['Start Date'] === 'number'
      ? new Date((raw['Start Date'] - 25569) * 86400 * 1000).toLocaleDateString('en-US')
      : String(raw['Start Date']),
    yearsAtCompany: years,
    department,
    country: raw.Country,
    center: raw.Center,
    monthlySalary: raw['Monthly Salary'],
    annualSalary: raw['Annual Salary'],
    jobRate,
    sickLeaves,
    unpaidLeaves: raw['Unpaid Leaves'] || 0,
    overtimeHours: overtime,
    role: deriveRole(department, years),
    workDna: deriveWorkDna(department, overtime, jobRate),
    deepWorkRatio,
    meetingLoad,
    communicationStyle,
    recentOutput,
    focusBlocks,
    overloadRisk,
    ...githubData,
  };
}

let cachedEmployees: EnrichedEmployee[] | null = null;

function loadEmployees(): EnrichedEmployee[] {
  if (cachedEmployees) return cachedEmployees;

  const filePath = path.join(process.cwd(), 'public', 'Employees.xlsx');
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const rawData: RawEmployee[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  cachedEmployees = rawData.map(enrichEmployee);
  return cachedEmployees;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // --- Employee Data API ---

  app.get('/api/employees', (_req, res) => {
    try {
      const employees = loadEmployees();

      // Aggregate by department for workforce overview
      const departments: Record<string, { count: number; avgDeepWork: number; highRiskCount: number; totalOvertime: number }> = {};
      for (const emp of employees) {
        if (!departments[emp.department]) {
          departments[emp.department] = { count: 0, avgDeepWork: 0, highRiskCount: 0, totalOvertime: 0 };
        }
        const dept = departments[emp.department];
        dept.count++;
        dept.avgDeepWork += parseInt(emp.deepWorkRatio);
        dept.totalOvertime += emp.overtimeHours;
        if (emp.overloadRisk === 'high') dept.highRiskCount++;
      }

      // Finalize averages
      for (const key of Object.keys(departments)) {
        departments[key].avgDeepWork = Math.round(departments[key].avgDeepWork / departments[key].count);
      }

      const highRiskEmployees = employees.filter(e => e.overloadRisk === 'high');

      res.json({
        total: employees.length,
        employees,
        departments,
        alerts: highRiskEmployees.slice(0, 5).map(e => ({
          employee: e.name,
          issue: `${e.overtimeHours}h overtime, ${e.sickLeaves} sick leaves`,
          risk: e.overloadRisk,
          department: e.department,
        })),
      });
    } catch (error) {
      console.error('Error loading employees:', error);
      res.status(500).json({ error: 'Failed to load employee data' });
    }
  });

  app.get('/api/employees/:id', (req, res) => {
    try {
      const employees = loadEmployees();
      const id = parseInt(req.params.id, 10);
      const employee = employees.find(e => e.id === id);

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json(employee);
    } catch (error) {
      console.error('Error loading employee:', error);
      res.status(500).json({ error: 'Failed to load employee data' });
    }
  });

  // =====================================================
  // --- HR OPERATIONS LAYER (In-Memory MVP) ---
  // =====================================================

  // --- Data Stores ---

  interface LeaveRequest {
    id: number;
    employeeId: number;
    employeeName: string;
    department: string;
    type: 'sick' | 'casual' | 'unpaid';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }

  interface AttendanceRecord {
    employeeId: number;
    employeeName: string;
    department: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    workingHours: number | null;
    status: 'checked-in' | 'checked-out' | 'absent';
  }

  interface AutomationRule {
    id: number;
    prompt: string;
    condition: string;
    trigger: string;
    action: string;
    actionType: 'notification' | 'flag' | 'log';
    active: boolean;
    createdAt: string;
    lastRun: string | null;
    lastResults: AutomationResult[] | null;
  }

  interface AutomationResult {
    employeeId: number;
    employeeName: string;
    department: string;
    triggered: boolean;
    detail: string;
  }

  let leaveRequests: LeaveRequest[] = [];
  let leaveIdCounter = 1;
  let attendanceLog: AttendanceRecord[] = [];
  let automationRules: AutomationRule[] = [];
  let automationIdCounter = 1;

  // Seed some initial leave requests from existing employee data
  function seedHRData() {
    const employees = loadEmployees();
    const today = new Date();

    // Generate some historical leave requests
    const leaveTypes: Array<'sick' | 'casual' | 'unpaid'> = ['sick', 'casual', 'unpaid'];
    const reasons = [
      'Not feeling well', 'Family commitment', 'Personal errand',
      'Medical appointment', 'Mental health day', 'Travel',
    ];

    for (const emp of employees.slice(0, 30)) {
      const totalLeaves = emp.sickLeaves + emp.unpaidLeaves;
      const numRequests = Math.min(totalLeaves, Math.floor(Math.random() * 4) + 1);

      for (let i = 0; i < numRequests; i++) {
        const daysAgo = Math.floor(Math.random() * 60) + 1;
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - daysAgo);
        const leaveDays = Math.floor(Math.random() * 3) + 1;
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + leaveDays - 1);

        leaveRequests.push({
          id: leaveIdCounter++,
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          type: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          days: leaveDays,
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          status: Math.random() > 0.3 ? 'approved' : (Math.random() > 0.5 ? 'rejected' : 'pending'),
          createdAt: startDate.toISOString(),
        });
      }
    }

    // Add a few pending requests for realism
    for (const emp of employees.slice(5, 12)) {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 7) + 1);
      const leaveDays = Math.floor(Math.random() * 2) + 1;
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + leaveDays - 1);

      leaveRequests.push({
        id: leaveIdCounter++,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        type: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        days: leaveDays,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    }

    // Seed attendance for today
    const todayStr = today.toISOString().split('T')[0];
    for (const emp of employees.slice(0, 50)) {
      const checkedIn = Math.random() > 0.15;
      const checkedOut = checkedIn && Math.random() > 0.4;
      const checkInHour = 8 + Math.floor(Math.random() * 2);
      const checkInMin = Math.floor(Math.random() * 60);
      const checkOutHour = checkInHour + 7 + Math.floor(Math.random() * 3);
      const checkOutMin = Math.floor(Math.random() * 60);

      attendanceLog.push({
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        date: todayStr,
        checkIn: checkedIn ? `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}` : null,
        checkOut: checkedOut ? `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}` : null,
        workingHours: checkedOut
          ? parseFloat(((checkOutHour * 60 + checkOutMin) - (checkInHour * 60 + checkInMin)) / 60 + '' ).toFixed(1) as unknown as number
          : null,
        status: checkedOut ? 'checked-out' : (checkedIn ? 'checked-in' : 'absent'),
      });
    }

    // Seed one sample automation rule
    automationRules.push({
      id: automationIdCounter++,
      prompt: 'If an employee takes more than 3 leaves in a month, flag them for review',
      condition: 'employee.totalLeavesThisMonth > 3',
      trigger: 'leave_request_approved',
      action: 'Flag employee for manager review',
      actionType: 'flag',
      active: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      lastRun: null,
      lastResults: null,
    });
  }

  seedHRData();

  // --- Leave Management APIs ---

  app.get('/api/hr/leaves', (_req, res) => {
    const employees = loadEmployees();

    // Calculate leave balances per employee
    const balances: Record<number, { total: number; used: number; remaining: number }> = {};
    for (const emp of employees) {
      const totalAllowance = 18; // standard annual allowance
      const usedLeaves = leaveRequests
        .filter(l => l.employeeId === emp.id && l.status === 'approved')
        .reduce((sum, l) => sum + l.days, 0);
      balances[emp.id] = {
        total: totalAllowance,
        used: usedLeaves,
        remaining: Math.max(0, totalAllowance - usedLeaves),
      };
    }

    res.json({
      requests: leaveRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      balances,
      summary: {
        totalPending: leaveRequests.filter(l => l.status === 'pending').length,
        totalApproved: leaveRequests.filter(l => l.status === 'approved').length,
        totalRejected: leaveRequests.filter(l => l.status === 'rejected').length,
      },
    });
  });

  app.post('/api/hr/leaves', (req, res) => {
    const { employeeId, type, startDate, endDate, reason } = req.body;
    const employees = loadEmployees();
    const emp = employees.find(e => e.id === employeeId);

    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const request: LeaveRequest = {
      id: leaveIdCounter++,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      type,
      startDate,
      endDate,
      days,
      reason: reason || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    leaveRequests.push(request);
    res.json(request);
  });

  app.patch('/api/hr/leaves/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    const request = leaveRequests.find(l => l.id === id);
    if (!request) return res.status(404).json({ error: 'Leave request not found' });
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    request.status = status;
    res.json(request);
  });

  // --- Attendance APIs ---

  app.get('/api/hr/attendance', (_req, res) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceLog.filter(a => a.date === todayStr);

    const employees = loadEmployees();
    const checkedIn = todayRecords.filter(a => a.status === 'checked-in').length;
    const checkedOut = todayRecords.filter(a => a.status === 'checked-out').length;
    const absent = employees.length - todayRecords.length;

    res.json({
      date: todayStr,
      records: todayRecords,
      summary: {
        total: employees.length,
        checkedIn,
        checkedOut,
        absent,
        avgWorkingHours: todayRecords
          .filter(r => r.workingHours !== null)
          .reduce((sum, r) => sum + (r.workingHours || 0), 0) /
          Math.max(1, todayRecords.filter(r => r.workingHours !== null).length),
      },
    });
  });

  app.post('/api/hr/attendance/checkin', (req, res) => {
    const { employeeId } = req.body;
    const employees = loadEmployees();
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Check if already checked in
    const existing = attendanceLog.find(a => a.employeeId === employeeId && a.date === todayStr);
    if (existing) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    const record: AttendanceRecord = {
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      date: todayStr,
      checkIn: timeStr,
      checkOut: null,
      workingHours: null,
      status: 'checked-in',
    };

    attendanceLog.push(record);
    res.json(record);
  });

  app.post('/api/hr/attendance/checkout', (req, res) => {
    const { employeeId } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const record = attendanceLog.find(a => a.employeeId === employeeId && a.date === todayStr);
    if (!record) return res.status(400).json({ error: 'No check-in found for today' });
    if (record.status === 'checked-out') return res.status(400).json({ error: 'Already checked out' });

    record.checkOut = timeStr;
    record.status = 'checked-out';

    // Calculate working hours
    const [inH, inM] = record.checkIn!.split(':').map(Number);
    const [outH, outM] = timeStr.split(':').map(Number);
    record.workingHours = parseFloat((((outH * 60 + outM) - (inH * 60 + inM)) / 60).toFixed(1));

    res.json(record);
  });

  // --- Payroll API ---

  app.get('/api/hr/payroll', (_req, res) => {
    const employees = loadEmployees();
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const payrollData = employees.map(emp => {
      const approvedLeaves = leaveRequests
        .filter(l => l.employeeId === emp.id && l.status === 'approved' && l.type === 'unpaid')
        .reduce((sum, l) => sum + l.days, 0);

      const dailyRate = emp.monthlySalary / 22; // ~22 working days
      const deductions = Math.round(approvedLeaves * dailyRate);
      const netSalary = emp.monthlySalary - deductions;

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        monthlySalary: emp.monthlySalary,
        unpaidLeaveDays: approvedLeaves,
        deductions,
        netSalary,
      };
    });

    const totalPayroll = payrollData.reduce((sum, p) => sum + p.netSalary, 0);
    const totalDeductions = payrollData.reduce((sum, p) => sum + p.deductions, 0);

    res.json({
      month: currentMonth,
      totalEmployees: employees.length,
      totalPayroll,
      totalDeductions,
      employees: payrollData,
    });
  });

  // --- Automation APIs ---

  app.get('/api/automations', (_req, res) => {
    res.json(automationRules);
  });

  app.post('/api/automations', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

      // Use Gemini to parse the natural language prompt into a structured rule
      const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
      if (!GEMINI_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

      const parseResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Parse the following automation rule into a structured format. Respond ONLY with valid JSON.\n\nRule: "${prompt}"\n\nRespond with this exact JSON structure:\n{\n  "condition": "a human-readable condition statement",\n  "trigger": "the event that triggers evaluation (e.g., leave_request_approved, daily_check, attendance_logged)",\n  "action": "what happens when the condition is met",\n  "actionType": "notification OR flag OR log"\n}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(parseResponse.text?.trim() || '{}');

      const rule: AutomationRule = {
        id: automationIdCounter++,
        prompt,
        condition: parsed.condition || 'Unable to parse condition',
        trigger: parsed.trigger || 'manual',
        action: parsed.action || 'Log event',
        actionType: parsed.actionType || 'log',
        active: true,
        createdAt: new Date().toISOString(),
        lastRun: null,
        lastResults: null,
      };

      automationRules.push(rule);
      res.json(rule);
    } catch (error: any) {
      console.error('Automation creation error:', error?.message || error);
      res.status(500).json({ error: 'Failed to parse automation rule' });
    }
  });

  app.post('/api/automations/:id/run', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const rule = automationRules.find(r => r.id === id);
      if (!rule) return res.status(404).json({ error: 'Rule not found' });

      const employees = loadEmployees();
      const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

      if (!GEMINI_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
      }

      // Prepare context data for rule evaluation
      const leaveStats = employees.slice(0, 50).map(emp => {
        const empLeaves = leaveRequests.filter(l => l.employeeId === emp.id && l.status === 'approved');
        const recentLeaves = empLeaves.filter(l => {
          const d = new Date(l.startDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return d >= thirtyDaysAgo;
        });
        return {
          id: emp.id,
          name: emp.name,
          department: emp.department,
          totalLeavesThisMonth: recentLeaves.reduce((sum, l) => sum + l.days, 0),
          sickLeaves: emp.sickLeaves,
          overtimeHours: emp.overtimeHours,
          overloadRisk: emp.overloadRisk,
        };
      });

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

      const evalResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are evaluating a workforce automation rule against employee data.

Rule: "${rule.prompt}"
Parsed Condition: "${rule.condition}"

Employee Data (first 50):
${JSON.stringify(leaveStats, null, 2)}

Evaluate which employees trigger this rule. Respond ONLY with valid JSON array:
[
  { "employeeId": number, "employeeName": "string", "department": "string", "triggered": true/false, "detail": "brief explanation" }
]

Include only employees where triggered is true. If none triggered, return an empty array [].`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const results: AutomationResult[] = JSON.parse(evalResponse.text?.trim() || '[]');

      rule.lastRun = new Date().toISOString();
      rule.lastResults = results;

      res.json({ rule, results });
    } catch (error: any) {
      console.error('Automation run error:', error?.message || error);
      res.status(500).json({ error: 'Failed to evaluate rule' });
    }
  });

  app.delete('/api/automations/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = automationRules.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'Rule not found' });

    automationRules.splice(index, 1);
    res.json({ success: true });
  });

  // =====================================================
  // --- HIRING AUTOMATION ENGINE ---
  // =====================================================

  interface HiringRule {
    id: number;
    prompt: string;
    condition: string;
    action: string;
    source: 'linkedin' | 'naukri' | 'both' | 'manual';
    roleTarget: string;
    filters: {
      minExperience: number;
      maxExperience: number;
      skills: string[];
      location: string;
      excludeCompanies: string[];
    };
    active: boolean;
    createdAt: string;
    lastRun: string | null;
    candidatesFound: number;
  }

  interface ScrapedCandidate {
    id: number;
    name: string;
    title: string;
    company: string;
    experience: number;
    skills: string[];
    location: string;
    source: 'linkedin' | 'naukri';
    matchScore: number;
    dnaMatch: string;
    profileUrl: string;
    status: 'new' | 'shortlisted' | 'rejected' | 'contacted';
  }

  let hiringRules: HiringRule[] = [];
  let hiringRuleIdCounter = 1;
  let scrapedCandidates: ScrapedCandidate[] = [];
  let candidateIdCounter = 1;

  // Seed mock scraped candidates
  const mockNames = [
    'Priya Sharma', 'Arjun Patel', 'Neha Gupta', 'Rahul Verma', 'Ananya Singh',
    'Vikram Reddy', 'Sneha Iyer', 'Karthik Nair', 'Deepa Menon', 'Amit Kumar',
    'Riya Desai', 'Sanjay Rao', 'Pooja Thakur', 'Manish Jain', 'Kavya Pillai',
    'Rohan Das', 'Meera Krishnan', 'Aditya Saxena', 'Divya Agarwal', 'Nikhil Chowdhury'
  ];
  const mockTitles = ['Senior Software Engineer', 'Backend Developer', 'Full Stack Engineer', 'Product Manager', 'DevOps Engineer', 'Data Scientist', 'Frontend Developer', 'ML Engineer', 'Tech Lead', 'SDE-III'];
  const mockCompanies = ['Infosys', 'TCS', 'Wipro', 'Flipkart', 'Razorpay', 'Freshworks', 'Zoho', 'Swiggy', 'PhonePe', 'Groww', 'Paytm', 'Dream11'];
  const mockSkills = ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'PostgreSQL', 'MongoDB', 'Go', 'Java', 'Machine Learning', 'System Design', 'Redis', 'GraphQL'];
  const mockLocations = ['Bangalore', 'Mumbai', 'Hyderabad', 'Pune', 'Delhi NCR', 'Chennai', 'Remote'];
  const dnaPatterns = ['Maker (High Focus)', 'Maker (Overclocked)', 'Synchronizer', 'Operator', 'Maker'];

  for (let i = 0; i < 20; i++) {
    const skills: string[] = [];
    const numSkills = 3 + Math.floor(Math.random() * 4);
    const shuffled = [...mockSkills].sort(() => Math.random() - 0.5);
    for (let j = 0; j < numSkills; j++) skills.push(shuffled[j]);

    scrapedCandidates.push({
      id: candidateIdCounter++,
      name: mockNames[i],
      title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
      company: mockCompanies[Math.floor(Math.random() * mockCompanies.length)],
      experience: 2 + Math.floor(Math.random() * 10),
      skills,
      location: mockLocations[Math.floor(Math.random() * mockLocations.length)],
      source: Math.random() > 0.5 ? 'linkedin' : 'naukri',
      matchScore: 55 + Math.floor(Math.random() * 45),
      dnaMatch: dnaPatterns[Math.floor(Math.random() * dnaPatterns.length)],
      profileUrl: `https://linkedin.com/in/${mockNames[i].toLowerCase().replace(/\s/g, '-')}`,
      status: 'new',
    });
  }

  // Seed one hiring rule
  hiringRules.push({
    id: hiringRuleIdCounter++,
    prompt: 'Find senior backend engineers with 5+ years experience in Node.js or Go, based in Bangalore or Remote',
    condition: 'experience >= 5 AND skills include (Node.js OR Go) AND location in (Bangalore, Remote)',
    action: 'Auto-shortlist candidates with match score > 80%',
    source: 'both',
    roleTarget: 'Senior Backend Engineer',
    filters: {
      minExperience: 5,
      maxExperience: 15,
      skills: ['Node.js', 'Go', 'System Design'],
      location: 'Bangalore, Remote',
      excludeCompanies: [],
    },
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastRun: null,
    candidatesFound: 0,
  });

  // --- Hiring Rule APIs ---

  app.get('/api/hiring/rules', (_req, res) => {
    res.json(hiringRules);
  });

  app.post('/api/hiring/rules', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

      const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
      if (!GEMINI_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

      const parseResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Parse this hiring automation rule into structured format. Respond ONLY with valid JSON.\n\nRule: "${prompt}"\n\nRespond with:\n{\n  "condition": "human-readable filter condition",\n  "action": "what to do with matching candidates",\n  "source": "linkedin OR naukri OR both",\n  "roleTarget": "target job title",\n  "filters": {\n    "minExperience": number,\n    "maxExperience": number,\n    "skills": ["skill1", "skill2"],\n    "location": "city or Remote",\n    "excludeCompanies": []\n  }\n}`,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(parseResponse.text?.trim() || '{}');

      const rule: HiringRule = {
        id: hiringRuleIdCounter++,
        prompt,
        condition: parsed.condition || 'Unable to parse',
        action: parsed.action || 'Review candidates',
        source: parsed.source || 'both',
        roleTarget: parsed.roleTarget || 'General',
        filters: {
          minExperience: parsed.filters?.minExperience || 0,
          maxExperience: parsed.filters?.maxExperience || 20,
          skills: parsed.filters?.skills || [],
          location: parsed.filters?.location || 'Any',
          excludeCompanies: parsed.filters?.excludeCompanies || [],
        },
        active: true,
        createdAt: new Date().toISOString(),
        lastRun: null,
        candidatesFound: 0,
      };

      hiringRules.push(rule);
      res.json(rule);
    } catch (error: any) {
      console.error('Hiring rule creation error:', error?.message || error);
      res.status(500).json({ error: 'Failed to parse hiring rule' });
    }
  });

  app.patch('/api/hiring/rules/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const rule = hiringRules.find(r => r.id === id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });

    // Allow manual edits to filters
    const updates = req.body;
    if (updates.filters) rule.filters = { ...rule.filters, ...updates.filters };
    if (updates.condition) rule.condition = updates.condition;
    if (updates.action) rule.action = updates.action;
    if (updates.source) rule.source = updates.source;
    if (updates.roleTarget) rule.roleTarget = updates.roleTarget;
    if (typeof updates.active === 'boolean') rule.active = updates.active;

    res.json(rule);
  });

  app.delete('/api/hiring/rules/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = hiringRules.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'Rule not found' });
    hiringRules.splice(index, 1);
    res.json({ success: true });
  });

  // --- Scraping Simulation APIs ---

  app.post('/api/hiring/rules/:id/scrape', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const rule = hiringRules.find(r => r.id === id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });

    // Simulate scraping delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Filter existing candidates based on rule filters
    const matches = scrapedCandidates.filter(c => {
      const expMatch = c.experience >= rule.filters.minExperience && c.experience <= rule.filters.maxExperience;
      const skillMatch = rule.filters.skills.length === 0 || rule.filters.skills.some(s => c.skills.includes(s));
      const locMatch = rule.filters.location === 'Any' || rule.filters.location.toLowerCase().includes(c.location.toLowerCase()) || c.location === 'Remote';
      const sourceMatch = rule.source === 'both' || c.source === rule.source;
      const excludeMatch = rule.filters.excludeCompanies.length === 0 || !rule.filters.excludeCompanies.includes(c.company);
      return expMatch && skillMatch && locMatch && sourceMatch && excludeMatch;
    });

    rule.lastRun = new Date().toISOString();
    rule.candidatesFound = matches.length;

    res.json({
      rule,
      candidates: matches.sort((a, b) => b.matchScore - a.matchScore),
      meta: {
        source: rule.source,
        totalScanned: 150 + Math.floor(Math.random() * 200),
        matched: matches.length,
        avgMatchScore: matches.length > 0 ? Math.round(matches.reduce((s, c) => s + c.matchScore, 0) / matches.length) : 0,
      },
    });
  });

  app.get('/api/hiring/candidates', (_req, res) => {
    res.json(scrapedCandidates.sort((a, b) => b.matchScore - a.matchScore));
  });

  app.patch('/api/hiring/candidates/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const candidate = scrapedCandidates.find(c => c.id === id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    if (req.body.status) candidate.status = req.body.status;
    res.json(candidate);
  });

  // --- Gemini AI Routes ---

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
  const GEMINI_MODEL = 'gemini-2.5-flash';

  async function callGemini(systemInstruction: string, prompt: string, responseSchema: Record<string, unknown>) {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured. Add it to your .env.local file.');
    }

    // Dynamic import for @google/genai (ESM)
    const { GoogleGenAI, Type } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema as any,
      },
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return null;
  }

  // Dashboard Insights
  app.post('/api/gemini/dashboard', async (req, res) => {
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const result = await callGemini(
        'You are KarmaOS, an advanced AI workforce intelligence system. Your goal is to analyze work patterns, detect bottlenecks, and provide actionable insights to founders. Be concise, analytical, and objective.',
        `Analyze the following workforce data and generate insights for the Founder Assistant dashboard.
        
        Workforce Data:
        ${JSON.stringify(req.body, null, 2)}
        
        Provide a high-level primary insight about the current state of the organization, 3 key metrics (like Deep Work, Active Candidates, Overload Risk, or Developer Velocity from GitHub data), and 3 recent agent observations (from Operations, Recruiter, or Analyst agents). If analyzing IT/Engineering teams, prioritize GitHub metrics like commits and PR activity.`,
        {
          type: 'OBJECT' as const,
          properties: {
            primaryInsight: { type: 'STRING' as const, description: "A 2-3 sentence high-level insight about the organization's current state." },
            metrics: {
              type: 'ARRAY' as const,
              items: {
                type: 'OBJECT' as const,
                properties: {
                  title: { type: 'STRING' as const },
                  value: { type: 'STRING' as const },
                  statement: { type: 'STRING' as const },
                  trend: { type: 'STRING' as const },
                  trendUp: { type: 'BOOLEAN' as const },
                  alert: { type: 'BOOLEAN' as const },
                },
                required: ['title', 'value', 'statement'],
              },
            },
            observations: {
              type: 'ARRAY' as const,
              items: {
                type: 'OBJECT' as const,
                properties: {
                  agent: { type: 'STRING' as const },
                  title: { type: 'STRING' as const },
                  desc: { type: 'STRING' as const },
                  time: { type: 'STRING' as const },
                  type: { type: 'STRING' as const },
                },
                required: ['agent', 'title', 'desc', 'time', 'type'],
              },
            },
          },
          required: ['primaryInsight', 'metrics', 'observations'],
        }
      );
      res.json(result);
    } catch (error: any) {
      console.error('Gemini dashboard error:', error?.message || error);
      res.status(500).json({ error: error?.message || 'Failed to generate insights' });
    }
  });

  // Employee Insights
  app.post('/api/gemini/employee', async (req, res) => {
    try {
      const result = await callGemini(
        'You are KarmaOS, an advanced AI workforce intelligence system. You analyze individual employee performance, comparing their initial hiring signals with actual post-hire work patterns to identify burnout, alignment, or high performance.',
        `Analyze the following employee data and generate insights.
        
        Employee Data:
        ${JSON.stringify(req.body, null, 2)}
        
        Provide a comparison between their hiring profile and actual work reality, a narrative insight about their current work rhythm, and 3 key work patterns (e.g., Deep Work, Communication, Meetings).`,
        {
          type: 'OBJECT' as const,
          properties: {
            hiringVsReality: { type: 'STRING' as const, description: "A 2-3 sentence analysis comparing hiring screen results with actual current work output." },
            narrativeInsight: { type: 'STRING' as const, description: "A 2 sentence narrative about their current work rhythm." },
            patterns: {
              type: 'ARRAY' as const,
              items: {
                type: 'OBJECT' as const,
                properties: {
                  title: { type: 'STRING' as const },
                  value: { type: 'STRING' as const },
                  desc: { type: 'STRING' as const },
                },
                required: ['title', 'value', 'desc'],
              },
            },
          },
          required: ['hiringVsReality', 'narrativeInsight', 'patterns'],
        }
      );
      res.json(result);
    } catch (error: any) {
      console.error('Gemini employee error:', error?.message || error);
      res.status(500).json({ error: error?.message || 'Failed to generate insights' });
    }
  });

  // Talent Insights
  app.post('/api/gemini/talent', async (req, res) => {
    try {
      const result = await callGemini(
        'You are KarmaOS Recruiter Agent. You analyze candidate pipelines, technical screen results, and Work DNA matches to provide actionable hiring intelligence.',
        `Analyze the following recruiting data and generate insights for the Recruiter Agent dashboard.
        
        Recruiting Data:
        ${JSON.stringify(req.body, null, 2)}
        
        Provide a primary insight about the overall pipeline, 2 role summaries, and 3 interview intelligence observations.`,
        {
          type: 'OBJECT' as const,
          properties: {
            primaryInsight: { type: 'STRING' as const, description: "A 2-3 sentence insight about the candidate pipeline and top DNA matches." },
            roles: {
              type: 'ARRAY' as const,
              items: {
                type: 'OBJECT' as const,
                properties: {
                  title: { type: 'STRING' as const },
                  status: { type: 'STRING' as const },
                  insight: { type: 'STRING' as const },
                  dnaMatch: { type: 'STRING' as const },
                },
                required: ['title', 'status', 'insight', 'dnaMatch'],
              },
            },
            interviewIntelligence: {
              type: 'ARRAY' as const,
              items: {
                type: 'OBJECT' as const,
                properties: {
                  title: { type: 'STRING' as const },
                  desc: { type: 'STRING' as const },
                  meta: { type: 'STRING' as const },
                  type: { type: 'STRING' as const },
                },
                required: ['title', 'desc', 'meta', 'type'],
              },
            },
          },
          required: ['primaryInsight', 'roles', 'interviewIntelligence'],
        }
      );
      res.json(result);
    } catch (error: any) {
      console.error('Gemini talent error:', error?.message || error);
      res.status(500).json({ error: error?.message || 'Failed to generate insights' });
    }
  });

  // Chat (Founder Assistant)
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, systemContext } = req.body;
      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: message,
        config: {
          systemInstruction: `You are the Founder Assistant agent within KarmaOS, an expert workforce intelligence AI. 
          Keep answers concise, professional, and insightful. Speak directly to the founder/manager.
          Do not use heavy markdown formatting unless necessary.
          Current Context: ${systemContext || ''}`,
        },
      });

      res.json({ text: response.text || "I couldn't process that." });
    } catch (error: any) {
      console.error('Gemini chat error:', error?.message || error);
      res.status(500).json({ error: error?.message || 'Failed to generate response' });
    }
  });

  // --- OAuth Routes ---

  // 1. Slack
  app.get('/api/auth/slack/url', (req, res) => {
    const redirectUri = req.query.redirectUri as string;
    const clientId = process.env.SLACK_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: 'SLACK_CLIENT_ID not configured' });
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'channels:history,chat:write,users:read',
    });
    res.json({ url: `https://slack.com/oauth/v2/authorize?${params.toString()}` });
  });

  app.get(['/api/auth/slack/callback', '/api/auth/slack/callback/'], async (req, res) => {
    try {
      // In a real app, you would exchange the code for a token here using fetch
      // const response = await fetch('https://slack.com/api/oauth.v2.access', { ... });
      // const data = await response.json();
      // Store data.access_token in your database associated with the user
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'slack' }, '*');
                window.close();
              } else {
                window.location.href = '/app/settings';
              }
            </script>
            <p>Slack authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      res.status(500).send('Authentication failed');
    }
  });

  // 2. Discord
  app.get('/api/auth/discord/url', (req, res) => {
    const redirectUri = req.query.redirectUri as string;
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: 'DISCORD_CLIENT_ID not configured' });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify messages.read',
    });
    res.json({ url: `https://discord.com/api/oauth2/authorize?${params.toString()}` });
  });

  app.get(['/api/auth/discord/callback', '/api/auth/discord/callback/'], async (req, res) => {
    try {
      // Exchange code for token
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'discord' }, '*');
                window.close();
              } else {
                window.location.href = '/app/settings';
              }
            </script>
            <p>Discord authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      res.status(500).send('Authentication failed');
    }
  });

  // 3. Microsoft Teams
  app.get('/api/auth/teams/url', (req, res) => {
    const redirectUri = req.query.redirectUri as string;
    const clientId = process.env.TEAMS_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: 'TEAMS_CLIENT_ID not configured' });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      response_mode: 'query',
      scope: 'offline_access user.read ChannelMessage.Read.All',
    });
    res.json({ url: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}` });
  });

  app.get(['/api/auth/teams/callback', '/api/auth/teams/callback/'], async (req, res) => {
    try {
      // Exchange code for token
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'teams' }, '*');
                window.close();
              } else {
                window.location.href = '/app/settings';
              }
            </script>
            <p>Microsoft Teams authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      res.status(500).send('Authentication failed');
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
