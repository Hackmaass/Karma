# KarmaOS - Real AI + ML Implementation

To make KarmaOS a *real* intelligence system and not just a dashboard with a chat UI, the backend architecture must be designed to process metadata into meaning.

## 1. Data Collection (The Passive Layer)
KarmaOS does not read message content (for privacy and noise reduction). It reads **metadata**.
- **Slack/Teams:** Timestamps, thread lengths, participant lists, channel activity levels.
- **GitHub/GitLab:** PR creation times, time-to-review, time-to-merge, comment counts.
- **Google Calendar/Outlook:** Meeting durations, attendee counts, fragmentation of free time.
- **Jira/Linear:** Ticket state changes, time-in-column, assignee changes.

## 2. Structuring the Data
Raw events are aggregated into 15-minute blocks for each user.
```json
{
  "user_id": "u_123",
  "timestamp": "2023-10-27T10:00:00Z",
  "signals": {
    "slack_messages_sent": 12,
    "github_activity": 0,
    "in_meeting": true
  }
}
```

## 3. Classification (Rule-Based + ML)
The system classifies these blocks into work states:
- **Deep Work:** Continuous blocks (>45 mins) of high GitHub/Figma/IDE activity with zero/low Slack/Email activity and no meetings.
- **Shallow Work:** High frequency of context switching between tools (e.g., Jira -> Slack -> Email -> Jira) within a short window.
- **Coordination:** Time spent in calendar meetings or dense, multi-participant Slack threads.

## 4. Insight Generation (LLM Reasoning)
This is where Gemini comes in. We do not use Gemini to parse raw data (too expensive, too slow). We use rule-based logic to aggregate the classifications, and then feed the *aggregated summaries* to Gemini to generate the narrative insights.

**Pipeline:**
1. **Aggregate:** "Engineering team spent 60% time in Coordination, 10% in Deep Work. 5 PRs are stale (>48h). Design team spent 70% in Deep Work."
2. **Prompt Gemini:** (See `PROMPTS.md` for exact prompts). We ask Gemini to identify the friction.
3. **Output:** Gemini reasons: "High engineering coordination + low deep work + stale PRs = Engineering is blocked."
4. **Display:** The UI renders this as: *"Engineering is currently blocked, resulting in high coordination overhead."*

## 5. Avoiding "Fake AI"
- We do not use LLMs to generate random motivational quotes.
- We do not use LLMs to draw charts.
- We use deterministic code for metrics (e.g., calculating the exact percentage of Deep Work).
- We use LLMs *exclusively* for **synthesis and narrative generation**—taking 5 disparate data points and explaining the human story behind them.
