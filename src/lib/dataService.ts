// src/lib/dataService.ts
// This service fetches data from the server's Excel-backed API.
// The server reads public/Employees.xlsx and enriches each record with synthetic work pattern data.
// A client-side fallback is also implemented for static hosting environments like Vercel.

import * as XLSX from 'xlsx';

export interface EnrichedEmployee {
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
  role: string;
  workDna: string;
  deepWorkRatio: string;
  meetingLoad: string;
  communicationStyle: string;
  recentOutput: string;
  focusBlocks: string;
  overloadRisk: 'low' | 'medium' | 'high';
}

export interface DepartmentStats {
  count: number;
  avgDeepWork: number;
  highRiskCount: number;
  totalOvertime: number;
}

export interface WorkforceData {
  total: number;
  employees: EnrichedEmployee[];
  departments: Record<string, DepartmentStats>;
  alerts: {
    employee: string;
    issue: string;
    risk: string;
    department: string;
  }[];
}

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
  const makerDepts = ['IT', 'Manufacturing', 'Product Development', 'Research Center', 'Creative', 'Green Building'];
  const syncDepts = ['Account Management', 'Sales', 'Marketing', 'Training', 'Professional Training Group', 'Major Mfg Projects'];

  if (makerDepts.includes(department)) {
    return overtimeHours > 50 ? 'Maker (Overclocked)' : 'Maker';
  }
  if (syncDepts.includes(department)) {
    return 'Synchronizer';
  }
  return 'Operator';
}

function enrichEmployee(raw: RawEmployee): EnrichedEmployee {
  const overtime = raw['Overtime Hours'] || 0;
  const sickLeaves = raw['Sick Leaves'] || 0;
  const jobRate = raw['Job Rate'] || 3;
  const years = raw['Years'] || 0;
  const department = raw['Department'] || 'General';

  const deepWorkBase = Math.min(85, Math.max(10, 70 - (overtime * 0.3) + (jobRate * 5)));
  const deepWorkRatio = `${Math.round(deepWorkBase)}%`;

  const syncDepts = ['Account Management', 'Sales', 'Marketing', 'Training', 'Major Mfg Projects'];
  const pseudoRandom = ((raw.No * 17 + jobRate * 11) % 15);
  const meetingBase = syncDepts.includes(department) ? 35 + pseudoRandom : 10 + pseudoRandom;
  const meetingLoad = `${Math.round(meetingBase)}%`;

  const commStyles = syncDepts.includes(department)
    ? ['Heavy Slack usage, real-time coordination', 'Frequent cross-team meetings', 'High sync communication via chat']
    : ['Mostly async via PRs and docs', 'Minimal sync, prefers written updates', 'Async-first, occasional standups'];
  const communicationStyle = commStyles[Math.floor(Math.abs(raw.No * 7) % commStyles.length)];

  const outputOptions = overtime > 30
    ? ['High output but working extended hours', 'Elevated delivery pace, sustainability at risk', 'Strong throughput, monitoring for burnout']
    : ['Consistent and sustainable output', 'Steady contribution within normal hours', 'Balanced workload with quality focus'];
  const recentOutput = outputOptions[Math.floor(Math.abs(raw.No * 13) % outputOptions.length)];

  const focusHours = Math.max(0.5, 4 - (overtime * 0.02) - (sickLeaves * 0.1));
  const focusBlocks = `Averaging ${focusHours.toFixed(1)} hours uninterrupted`;

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

export const mockTalentData = {
  pipeline: {
    totalScreened: 42,
    openRoles: ["Senior Backend Engineer", "Product Marketing Manager"],
    topMatches: 2,
    targetDna: "High Deep Work"
  },
  roles: [
    {
      title: "Senior Backend Engineer",
      status: "Interviewing",
      technicalScreens: 12,
      advancedToHuman: 3,
      targetDna: "Maker (High Focus)"
    },
    {
      title: "Product Marketing Manager",
      status: "Sourcing",
      responseRate: "12%",
      targetDna: "Synchronizer (High Coordination)"
    }
  ],
  interviews: [
    { candidate: "David L.", signal: "Strong system design reasoning", score: 94 },
    { candidate: "Elena M.", issue: "Scheduling friction with engineering panel", action: "Required" },
    { candidate: "James T.", signal: "Matches communication patterns of top PMs", confidence: "High" }
  ]
};

/**
 * Fetches workforce data from the server's Excel-backed API.
 * Returns all employees with department-level aggregations and risk alerts.
 */
export async function fetchWorkforceData(): Promise<WorkforceData> {
  try {
    const response = await fetch('/api/employees');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.warn("Failed to fetch workforce data from API, falling back to local file...", e);
    
    // Client-side fallback for static deployments (Vercel)
    try {
      const response = await fetch('/Employees.xlsx');
      if (!response.ok) throw new Error("Could not fetch Employees.xlsx");
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const rawData: RawEmployee[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      
      const employees = rawData.map(enrichEmployee);

      const departments: Record<string, DepartmentStats> = {};
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

      for (const key of Object.keys(departments)) {
        departments[key].avgDeepWork = Math.round(departments[key].avgDeepWork / departments[key].count);
      }

      const highRiskEmployees = employees.filter(e => e.overloadRisk === 'high');

      return {
        total: employees.length,
        employees,
        departments,
        alerts: highRiskEmployees.slice(0, 5).map(e => ({
          employee: e.name,
          issue: `${e.overtimeHours}h overtime, ${e.sickLeaves} sick leaves`,
          risk: e.overloadRisk,
          department: e.department,
        })),
      };
    } catch (fallbackError) {
      console.error("Client-side fallback failed:", fallbackError);
      return {
        total: 0,
        employees: [],
        departments: {},
        alerts: [],
      };
    }
  }
}

/**
 * Fetches a specific employee by ID from the server's Excel-backed API.
 */
export async function fetchEmployeeData(id: string): Promise<EnrichedEmployee | null> {
  try {
    const response = await fetch(`/api/employees/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error(`Failed to fetch employee #${id}:`, e);
    return null;
  }
}

/**
 * Fetches all employees (lightweight wrapper for components that need the list).
 */
export async function fetchAllEmployees(): Promise<EnrichedEmployee[]> {
  try {
    const data = await fetchWorkforceData();
    return data.employees;
  } catch (e) {
    console.error("Failed to fetch employees list:", e);
    return [];
  }
}

/**
 * Fetches talent pipeline data for the Recruiter Agent.
 * Still uses mock data as recruiting pipeline is separate from employee records.
 */
export async function fetchTalentData() {
  return mockTalentData;
}

// =====================================================
// --- HR OPERATIONS SERVICE LAYER ---
// =====================================================

// --- Leave Management ---

export interface LeaveRequest {
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

export interface LeaveBalance {
  total: number;
  used: number;
  remaining: number;
}

export interface LeaveData {
  requests: LeaveRequest[];
  balances: Record<number, LeaveBalance>;
  summary: {
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
  };
}

export async function fetchLeaves(): Promise<LeaveData> {
  try {
    const response = await fetch('/api/hr/leaves');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to fetch leaves:', e);
    return { requests: [], balances: {}, summary: { totalPending: 0, totalApproved: 0, totalRejected: 0 } };
  }
}

export async function submitLeave(data: {
  employeeId: number;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<LeaveRequest | null> {
  try {
    const response = await fetch('/api/hr/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to submit leave:', e);
    return null;
  }
}

export async function updateLeaveStatus(id: number, status: 'approved' | 'rejected'): Promise<LeaveRequest | null> {
  try {
    const response = await fetch(`/api/hr/leaves/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to update leave:', e);
    return null;
  }
}

// --- Attendance ---

export interface AttendanceRecord {
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number | null;
  status: 'checked-in' | 'checked-out' | 'absent';
}

export interface AttendanceData {
  date: string;
  records: AttendanceRecord[];
  summary: {
    total: number;
    checkedIn: number;
    checkedOut: number;
    absent: number;
    avgWorkingHours: number;
  };
}

export async function fetchAttendance(): Promise<AttendanceData> {
  try {
    const response = await fetch('/api/hr/attendance');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to fetch attendance:', e);
    return { date: '', records: [], summary: { total: 0, checkedIn: 0, checkedOut: 0, absent: 0, avgWorkingHours: 0 } };
  }
}

export async function checkIn(employeeId: number): Promise<AttendanceRecord | null> {
  try {
    const response = await fetch('/api/hr/attendance/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to check in:', e);
    return null;
  }
}

export async function checkOut(employeeId: number): Promise<AttendanceRecord | null> {
  try {
    const response = await fetch('/api/hr/attendance/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to check out:', e);
    return null;
  }
}

// --- Payroll ---

export interface PayrollEmployee {
  employeeId: number;
  employeeName: string;
  department: string;
  monthlySalary: number;
  unpaidLeaveDays: number;
  deductions: number;
  netSalary: number;
}

export interface PayrollData {
  month: string;
  totalEmployees: number;
  totalPayroll: number;
  totalDeductions: number;
  employees: PayrollEmployee[];
}

export async function fetchPayrollSummary(): Promise<PayrollData> {
  try {
    const response = await fetch('/api/hr/payroll');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to fetch payroll:', e);
    return { month: '', totalEmployees: 0, totalPayroll: 0, totalDeductions: 0, employees: [] };
  }
}

// --- Automation ---

export interface AutomationResult {
  employeeId: number;
  employeeName: string;
  department: string;
  triggered: boolean;
  detail: string;
}

export interface AutomationRule {
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

export async function fetchAutomations(): Promise<AutomationRule[]> {
  try {
    const response = await fetch('/api/automations');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to fetch automations:', e);
    return [];
  }
}

export async function createAutomation(prompt: string): Promise<AutomationRule | null> {
  try {
    const response = await fetch('/api/automations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to create automation:', e);
    return null;
  }
}

export async function runAutomation(id: number): Promise<{ rule: AutomationRule; results: AutomationResult[] } | null> {
  try {
    const response = await fetch(`/api/automations/${id}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to run automation:', e);
    return null;
  }
}

export async function deleteAutomation(id: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/automations/${id}`, { method: 'DELETE' });
    return response.ok;
  } catch (e) {
    console.error('Failed to delete automation:', e);
    return false;
  }
}

// =====================================================
// --- HIRING AUTOMATION SERVICE LAYER ---
// =====================================================

export interface HiringRuleFilters {
  minExperience: number;
  maxExperience: number;
  skills: string[];
  location: string;
  excludeCompanies: string[];
}

export interface HiringRule {
  id: number;
  prompt: string;
  condition: string;
  action: string;
  source: 'linkedin' | 'naukri' | 'both' | 'manual';
  roleTarget: string;
  filters: HiringRuleFilters;
  active: boolean;
  createdAt: string;
  lastRun: string | null;
  candidatesFound: number;
}

export interface ScrapedCandidate {
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

export async function fetchHiringRules(): Promise<HiringRule[]> {
  try {
    const response = await fetch('/api/hiring/rules');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to fetch hiring rules:', e);
    return [];
  }
}

export async function createHiringRule(prompt: string): Promise<HiringRule | null> {
  try {
    const response = await fetch('/api/hiring/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to create hiring rule:', e);
    return null;
  }
}

export async function updateHiringRule(id: number, updates: Partial<HiringRule>): Promise<HiringRule | null> {
  try {
    const response = await fetch(`/api/hiring/rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to update hiring rule:', e);
    return null;
  }
}

export async function deleteHiringRule(id: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/hiring/rules/${id}`, { method: 'DELETE' });
    return response.ok;
  } catch (e) {
    console.error('Failed to delete hiring rule:', e);
    return false;
  }
}

export async function scrapeForRule(id: number): Promise<{ rule: HiringRule; candidates: ScrapedCandidate[]; meta: { source: string; totalScanned: number; matched: number; avgMatchScore: number } } | null> {
  try {
    const response = await fetch(`/api/hiring/rules/${id}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to scrape:', e);
    return null;
  }
}

export async function fetchCandidates(): Promise<ScrapedCandidate[]> {
  try {
    const response = await fetch('/api/hiring/candidates');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to fetch candidates:', e);
    return [];
  }
}

export async function updateCandidateStatus(id: number, status: string): Promise<ScrapedCandidate | null> {
  try {
    const response = await fetch(`/api/hiring/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to update candidate:', e);
    return null;
  }
}
