# SuperChase Native Task Intake System

## Core Architecture

SuperChase has everything needed for intelligent task processing:
- Direct OpenAI API access with context
- Gmail/Calendar integration tools
- Multi-agent coordination (Claude/Nova/Copilot)
- Intelligent routing based on content analysis
- File system integration for persistence
- Artifact system for live previews

## Native Implementation

### 1. Task Intake API
```javascript
// Built into SuperChase coordinator
app.post('/api/intake', async (req, res) => {
  const task = req.body;
  
  // Route through existing agent system
  const routing = coordinator.routeTask(task.goal, task.priority || 'medium');
  
  // Process with appropriate agents
  if (task.deliverables.includes('email draft')) {
    await agents.claude.createEmailDraft(task);
  }
  
  if (task.deliverables.includes('calendar event')) {
    await agents.claude.createCalendarEvent(task);
  }
  
  res.json({ taskId: routing.taskId, status: 'queued' });
});
```

### 2. Enhanced Agent Capabilities
```javascript
class ClaudeAgent {
  async createEmailDraft(task) {
    // Use existing Gmail tools
    const draft = await this.generateEmailContent(task);
    await gmail.createDraft(draft);
    
    // Log to project tracking
    this.logDeliverable('email_draft', draft);
  }
  
  async createCalendarEvent(task) {
    // Use existing Calendar tools  
    const event = await this.generateCalendarEvent(task);
    await calendar.createEvent(event);
    
    this.logDeliverable('calendar_event', event);
  }
}
```

### 3. Unified Logging
All tasks logged to: `C:\SuperChase_OpenAI-Agentic\data\docs\routed\logs\`

### 4. Trigger Methods

**Curl:**
```bash
curl -X POST 'http://localhost:3000/api/intake' \
  -H 'Content-Type: application/json' \
  -d '{"goal": "Follow up with client", "deliverables": ["email draft"]}'
```

**Python Script:**
```python
import requests, sys, json, datetime as dt

ENDPOINT = "http://localhost:3000/api/intake"

payload = {
    "id": f"TASK_{int(dt.datetime.now().timestamp())}",
    "goal": " ".join(sys.argv[1:]) or "Follow up with client",
    "deliverables": ["email draft", "calendar event"],
    "email_to": "me@chasepierson.tv",
    "due": (dt.datetime.now()+dt.timedelta(days=1)).strftime("%Y-%m-%dT%H:00:00-04:00"),
    "constraints": ["tone: professional"]
}

r = requests.post(ENDPOINT, json=payload, timeout=20)
print("Queued:", r.status_code, r.text[:200])
```

**HTML Capture Form:**
```html
<!doctype html><meta charset="utf-8"><title>SuperChase Capture</title>
<style>body{font:16px/1.4 system-ui;padding:24px;max-width:720px;margin:auto}
label{display:block;margin:.5rem 0 .25rem}input,textarea,button{width:100%;padding:.6rem;border:1px solid #ccc;border-radius:8px}
button{background:#2F80ED;color:#fff;margin-top:1rem;cursor:pointer}</style>
<h1>SuperChase – Task Capture</h1>
<form onsubmit="send(event)">
  <label>Goal</label><textarea id="goal" rows="3" required></textarea>
  <label>Email To</label><input id="email_to" value="me@chasepierson.tv">
  <label>Start</label><input id="start" type="datetime-local">
  <label>End</label><input id="end" type="datetime-local">
  <button>Send to SuperChase</button>
</form>
<pre id="out"></pre>
<script>
const ENDPOINT = "/api/intake";
async function send(e){
  e.preventDefault();
  const payload = {
    id: "FORM_"+Date.now(),
    goal: goal.value,
    deliverables: ["email draft","calendar event"],
    email_to: email_to.value,
    calendar_start: new Date(start.value).toISOString(),
    calendar_end: new Date(end.value).toISOString(),
    constraints: ["tone: professional","keep concise"]
  };
  const r = await fetch(ENDPOINT,{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  out.textContent = (r.ok?"Queued ":"Error ")+r.status+" "+(await r.text());
}
</script>
```

## Benefits

1. **Single system** - no external dependencies
2. **Intelligent routing** - tasks go to best agent  
3. **Context awareness** - agents reference past work
4. **Unified logging** - everything in SuperChase
5. **Extensible** - easy to add new deliverable types
6. **Real-time coordination** - agents can handoff tasks

## Implementation Timeline

**Today:**
- Build intake endpoint in coordinator.js
- Test with existing Gmail/Calendar tools

**Tomorrow:**  
- Deploy native API
- Test full workflow with capture scripts

---

**Status: Ready to implement native intake system.**