

# KarmaOS 
**The Intelligence System for Modern Teams**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](#)
[![Gemini](https://img.shields.io/badge/Gemini_AI-1A73E8?style=for-the-badge&logo=google&logoColor=white)](#)
</div>

---

## 🧠 What is KarmaOS?

Most productivity tools measure **activity**—keystrokes, hours logged, or messages sent. KarmaOS is different. It measures **impact** and **friction**. 

By passively reading *metadata* across your tools (Slack, GitHub, Calendar, Jira) and applying intelligent classification and LLM reasoning via **Google Gemini**, KarmaOS turns raw signals into clear, actionable human narratives. 

Instead of showing you a complex dashboard of charts, it simply tells you: *"Good morning. Your team is highly focused today, but engineering is currently blocked on design approvals for the new checkout flow."*

---

## ✨ Core Philosophy

| Core Principle | How KarmaOS Delivers |
| --- | --- |
| **Meaning Over Metrics** | Synthesizes complex data points into a single, understandable narrative statement. |
| **Passive Measurement** | Requires zero behavioral change. No timers, no forms, no manual status updates. |
| **Proactive Insight** | Identifies bottlenecks and overload risks *before* they turn into missed deadlines or team burnout. |
| **Privacy First** | Reads metadata only (timestamps, thread length, context switches) — never reads your private message content. |

---

## 🏗️ System Architecture

KarmaOS is more than just a dashboard; it is a meticulously structured data pipeline that processes metadata into meaning. 

```mermaid
graph TD
    subgraph Passive Data Layer [Passive Data Collection : Metadata Only]
        S[Slack/Teams<br>Frequency, Thread depth]
        G[GitHub/GitLab<br>PR times, Review lags]
        C[Google Calendar<br>Meeting density, Fragmentation]
        J[Jira/Linear<br>State changes, Velocity]
    end

    subgraph Data Processing [KarmaOS Engine]
        A[Aggregator<br>15-minute Time Blocks]
        ML[Rule-Based Classifier<br>Deep Work vs Coordination]
    end

    subgraph Intelligence Layer [LLM Synthesis]
        LLM((Google Gemini API<br>Narrative Interpretation))
    end

    subgraph User Experience [The Dashboard]
        UI[Clean UI<br>Actionable Insights]
        AI[AI Assistant<br>Chat & Deep Dives]
    end

    S --> A
    G --> A
    C --> A
    J --> A

    A --> ML
    ML --> LLM
    LLM --> UI
    LLM --> AI

    style S fill:#36C5F0,stroke:#none,color:#fff
    style G fill:#24292e,stroke:#none,color:#fff
    style C fill:#4285F4,stroke:#none,color:#fff
    style J fill:#0052CC,stroke:#none,color:#fff
    style A fill:#2A2A35,stroke:#4f46e5,color:#fff,stroke-width:2px
    style ML fill:#2A2A35,stroke:#4f46e5,color:#fff,stroke-width:2px
    style LLM fill:#5E1B89,stroke:#d8b4fe,color:#fff,stroke-width:2px
    style UI fill:#18181B,stroke:#3f3f46,color:#fff
    style AI fill:#18181B,stroke:#3f3f46,color:#fff
```

### How the Data Flows:
1. **Aggregates metadata** events into 15-minute chronological blocks.
2. **Classifies** those blocks into distinct states (*Deep Work*, *Shallow Coordination*, *Friction*).
3. **Prompts Gemini** with aggregated statistical summaries.
4. **Renders** Gemini's narrative outputs to managers in a high-signal, zero-anxiety UI.

---

## ⚡ Getting Started 

> [!IMPORTANT]  
> To run the complete mock app and utilize the AI assistant, ensure you have set up your GEMINI API credentials.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Rename `.env.example` to `.env.local` or edit `.env.local` directly and add your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

> [!TIP]  
> View your original app generation and logs in [AI Studio](https://ai.studio/apps/0c48ce4b-17f6-4c4d-b456-b195c7719db0).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide React
- **Intelligence**: Google Gemini API
- **Data Architecture (MVP)**: Simulated Event & State Generators

> [!NOTE]  
> The current version focuses on the **MVP Scope** proving out the UI and AI interpretation loop. Hardcoded structural logic replaces complex OAuth integration flows for this early tech demonstration.
