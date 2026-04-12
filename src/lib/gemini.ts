// src/lib/gemini.ts
// Client-side wrapper that calls server-side Gemini API endpoints.
// The actual Gemini API key and SDK are on the server — this keeps the key secure.

export interface DashboardInsights {
  primaryInsight: string;
  metrics: {
    title: string;
    value: string;
    statement: string;
    trend?: string;
    trendUp?: boolean;
    alert?: boolean;
  }[];
  observations: {
    agent: string;
    title: string;
    desc: string;
    time: string;
    type: 'alert' | 'success' | 'info';
  }[];
}

export async function generateDashboardInsights(workforceData: unknown): Promise<DashboardInsights | null> {
  try {
    const response = await fetch('/api/gemini/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workforceData),
    });
    if (!response.ok) {
      const err = await response.json();
      console.error('Dashboard insights error:', err.error);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error generating dashboard insights:", error);
    return null;
  }
}

export interface TalentInsights {
  primaryInsight: string;
  roles: {
    title: string;
    status: string;
    insight: string;
    dnaMatch: string;
  }[];
  interviewIntelligence: {
    title: string;
    desc: string;
    meta: string;
    type: 'success' | 'warning' | 'info';
  }[];
}

export async function generateTalentInsights(talentData: unknown): Promise<TalentInsights | null> {
  try {
    const response = await fetch('/api/gemini/talent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(talentData),
    });
    if (!response.ok) {
      const err = await response.json();
      console.error('Talent insights error:', err.error);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error generating talent insights:", error);
    return null;
  }
}

export interface EmployeeInsights {
  hiringVsReality: string;
  narrativeInsight: string;
  patterns: {
    title: string;
    value: string;
    desc: string;
  }[];
}

export async function generateEmployeeInsights(employeeData: unknown): Promise<EmployeeInsights | null> {
  try {
    const response = await fetch('/api/gemini/employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    });
    if (!response.ok) {
      const err = await response.json();
      console.error('Employee insights error:', err.error);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error generating employee insights:", error);
    return null;
  }
}

/**
 * Chat with the Founder Assistant via server-side Gemini.
 */
export async function chatWithAssistant(message: string, systemContext: string): Promise<string> {
  try {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, systemContext }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to get response');
    }
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error in chat:", error);
    return "Sorry, I encountered an error connecting to my intelligence core.";
  }
}
