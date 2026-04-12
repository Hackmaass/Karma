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
