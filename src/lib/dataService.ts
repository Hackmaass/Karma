// src/lib/dataService.ts
// This service provides an abstraction layer for data fetching.
// Currently, it returns hardcoded mock data, but you can easily swap these
// implementations to fetch from Kaggle datasets (JSON/CSV) or a real backend.

export const mockWorkforceData = {
  teams: {
    engineering: {
      status: "focused",
      deepWorkAverage: "68%",
      bottlenecks: ["design approvals for core-api", "PR reviews taking 48h+"]
    },
    design: {
      status: "overloaded",
      deepWorkAverage: "30%",
      bottlenecks: ["too many context switches", "ad-hoc requests from marketing"]
    }
  },
  recruiting: {
    openRoles: ["Senior Backend"],
    activeCandidates: 14,
    finalStages: 2
  },
  alerts: [
    { employee: "Sarah M.", issue: "working late, 18 meetings in 3 days", risk: "high" }
  ]
};

interface MockEmployee {
  name: string;
  role: string;
  hiringProfile: {
    technicalScore: string;
    dna: string;
    strengths: string[];
  };
  currentWorkData: {
    deepWorkRatio: string;
    meetingLoad: string;
    communication: string;
    recentOutput: string;
    focusBlocks: string;
  };
}

export const mockEmployees: Record<string, MockEmployee> = {
  '1': {
    name: 'Alex Chen',
    role: 'Senior Engineer',
    hiringProfile: {
      technicalScore: "95%",
      dna: "Maker",
      strengths: ["system design", "independent problem solving"]
    },
    currentWorkData: {
      deepWorkRatio: "65%",
      meetingLoad: "15%",
      communication: "Mostly async via PRs",
      recentOutput: "High code output, minimal coordination overhead",
      focusBlocks: "Averaging 3 hours uninterrupted"
    }
  },
  '2': {
    name: 'Sarah Miller',
    role: 'Product Manager',
    hiringProfile: {
      technicalScore: "88%",
      dna: "Synchronizer",
      strengths: ["cross-functional communication", "alignment"]
    },
    currentWorkData: {
      deepWorkRatio: "15%",
      meetingLoad: "40%",
      communication: "Heavy Slack usage, answering late into evening",
      recentOutput: "Trapped in low-impact alignment meetings",
      focusBlocks: "Severely fragmented, 18 meetings in 3 days"
    }
  }
};

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
 * Fetches workforce data for the Dashboard.
 * OPENING FOR KAGGLE INTEGRATION: Replace the return statement with a fetch call to your Kaggle JSON/CSV.
 */
export async function fetchWorkforceData() {
  // Example Kaggle Integration:
  // try {
  //   const response = await fetch('/data/kaggle_workforce.json');
  //   return await response.json();
  // } catch (e) {
  //   console.error("Failed to load Kaggle data, falling back to mock", e);
  // }
  
  return mockWorkforceData;
}

/**
 * Fetches specific employee data for the Employee View.
 * OPENING FOR KAGGLE INTEGRATION: Fetch your dataset, find the employee by ID, and map to this structure.
 */
export async function fetchEmployeeData(id: string) {
  // Example Kaggle Integration:
  // try {
  //   const response = await fetch('/data/kaggle_employees.json');
  //   const allEmployees = await response.json();
  //   return allEmployees.find((emp: any) => emp.id === id) || mockEmployees['1'];
  // } catch (e) { ... }

  return mockEmployees[id] || mockEmployees['1'];
}

/**
 * Fetches talent pipeline data for the Recruiter Agent.
 * OPENING FOR KAGGLE INTEGRATION: Replace with a fetch call to your Kaggle ATS/Recruiting dataset.
 */
export async function fetchTalentData() {
  // Example Kaggle Integration:
  // try {
  //   const response = await fetch('/data/kaggle_talent.json');
  //   return await response.json();
  // } catch (e) { ... }

  return mockTalentData;
}
