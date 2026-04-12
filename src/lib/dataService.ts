// src/lib/dataService.ts
// This service fetches data from the server's Excel-backed API.
// The server reads Employees.xlsx and enriches each record with synthetic work pattern data.

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
    console.error("Failed to fetch workforce data from API:", e);
    // Minimal fallback so the page doesn't crash
    return {
      total: 0,
      employees: [],
      departments: {},
      alerts: [],
    };
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
