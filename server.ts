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
  };
}

let cachedEmployees: EnrichedEmployee[] | null = null;

function loadEmployees(): EnrichedEmployee[] {
  if (cachedEmployees) return cachedEmployees;

  const filePath = path.join(process.cwd(), 'Employees.xlsx');
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
  app.use(express.json());

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
        
        Provide a high-level primary insight about the current state of the organization, 3 key metrics (like Deep Work, Active Candidates, Overload Risk), and 3 recent agent observations (from Operations, Recruiter, or Analyst agents).`,
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
