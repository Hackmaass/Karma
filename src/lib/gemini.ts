import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini API client
// The API key is injected by the AI Studio environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL_NAME = "gemini-3-flash-preview";

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

export async function generateDashboardInsights(workforceData: any): Promise<DashboardInsights | null> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze the following workforce data and generate insights for the Founder Assistant dashboard.
      
      Workforce Data:
      ${JSON.stringify(workforceData, null, 2)}
      
      Provide a high-level primary insight about the current state of the organization, 3 key metrics (like Deep Work, Active Candidates, Overload Risk), and 3 recent agent observations (from Operations, Recruiter, or Analyst agents).`,
      config: {
        systemInstruction: "You are KarmaOS, an advanced AI workforce intelligence system. Your goal is to analyze work patterns, detect bottlenecks, and provide actionable insights to founders. Be concise, analytical, and objective.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryInsight: {
              type: Type.STRING,
              description: "A 2-3 sentence high-level insight about the organization's current state, highlighting bottlenecks or successes."
            },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  value: { type: Type.STRING },
                  statement: { type: Type.STRING },
                  trend: { type: Type.STRING },
                  trendUp: { type: Type.BOOLEAN },
                  alert: { type: Type.BOOLEAN }
                },
                required: ["title", "value", "statement"]
              }
            },
            observations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  agent: { type: Type.STRING, description: "e.g., Operations Agent, Recruiter Agent, Analyst Agent" },
                  title: { type: Type.STRING },
                  desc: { type: Type.STRING },
                  time: { type: Type.STRING, description: "e.g., 2h ago, 1d ago" },
                  type: { type: Type.STRING, description: "alert, success, or info" }
                },
                required: ["agent", "title", "desc", "time", "type"]
              }
            }
          },
          required: ["primaryInsight", "metrics", "observations"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as DashboardInsights;
    }
    return null;
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

export async function generateTalentInsights(talentData: any): Promise<TalentInsights | null> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze the following recruiting data and generate insights for the Recruiter Agent dashboard.
      
      Recruiting Data:
      ${JSON.stringify(talentData, null, 2)}
      
      Provide a primary insight about the overall pipeline, 2 role summaries, and 3 interview intelligence observations.`,
      config: {
        systemInstruction: "You are KarmaOS Recruiter Agent. You analyze candidate pipelines, technical screen results, and Work DNA matches to provide actionable hiring intelligence.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryInsight: {
              type: Type.STRING,
              description: "A 2-3 sentence insight about the current state of the candidate pipeline and top DNA matches."
            },
            roles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  status: { type: Type.STRING },
                  insight: { type: Type.STRING },
                  dnaMatch: { type: Type.STRING }
                },
                required: ["title", "status", "insight", "dnaMatch"]
              }
            },
            interviewIntelligence: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  desc: { type: Type.STRING },
                  meta: { type: Type.STRING },
                  type: { type: Type.STRING, description: "success, warning, or info" }
                },
                required: ["title", "desc", "meta", "type"]
              }
            }
          },
          required: ["primaryInsight", "roles", "interviewIntelligence"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as TalentInsights;
    }
    return null;
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

export async function generateEmployeeInsights(employeeData: any): Promise<EmployeeInsights | null> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze the following employee data and generate insights.
      
      Employee Data:
      ${JSON.stringify(employeeData, null, 2)}
      
      Provide a comparison between their hiring profile and actual work reality, a narrative insight about their current work rhythm, and 3 key work patterns (e.g., Deep Work, Communication, Meetings).`,
      config: {
        systemInstruction: "You are KarmaOS, an advanced AI workforce intelligence system. You analyze individual employee performance, comparing their initial hiring signals with actual post-hire work patterns to identify burnout, alignment, or high performance.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hiringVsReality: {
              type: Type.STRING,
              description: "A 2-3 sentence analysis comparing their hiring screen results with their actual current work output and DNA."
            },
            narrativeInsight: {
              type: Type.STRING,
              description: "A 2 sentence narrative about their current work rhythm, focus blocks, or context-switching fatigue."
            },
            patterns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  value: { type: Type.STRING },
                  desc: { type: Type.STRING }
                },
                required: ["title", "value", "desc"]
              }
            }
          },
          required: ["hiringVsReality", "narrativeInsight", "patterns"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as EmployeeInsights;
    }
    return null;
  } catch (error) {
    console.error("Error generating employee insights:", error);
    return null;
  }
}
