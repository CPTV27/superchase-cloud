# SuperChase Native Task Intake System

## Architecture Decision: Scrap Make.com

**Reasoning:** Make.com is a redundant middleman. SuperChase already has:
- Direct OpenAI API access
- Gmail/Calendar integration  
- Multi-agent coordination
- Intelligent routing

## Native Implementation Plan

### 1. Task Intake Webhook (Replace Make.com)
```javascript
// Built into SuperChase coordinator
app.post('/api/intake', async (req, res) => {
  const task = req.body;
  
  // Route through our existing agent system
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
// Claude agent handles Gmail/Calendar directly
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

### 3. Unified Logging (Replace Google Sheets)
All tasks logged to: `C:\SuperChase_OpenAI-Agentic\data\docs\routed\logs\`

### 4. Same Trigger Methods (Improved)

**Curl:**
```bash
curl -X POST 'http://localhost:3000/api/intake' \
  -H 'Content-Type: application/json' \
  -d '{"goal": "Follow up with client", "deliverables": ["email draft"]}'
```

**Python Script:**
```python
# Same quick_task.py but pointing to SuperChase
WEBHOOK = "http://localhost:3000/api/intake"
```

**HTML Form:**
```html
<!-- Same capture.html but integrated with SuperChase -->
const WEBHOOK = "/api/intake";
```

## Implementation Timeline

**Today:**
- Delete Make.com scenario
- Build intake endpoint in coordinator.js
- Test with existing Gmail/Calendar tools

**Tomorrow:**
- Deploy native webhook
- Update capture scripts to point to SuperChase
- Test full workflow

## Benefits of Native Approach

1. **Single system** - no external dependencies
2. **Intelligent routing** - tasks go to best agent
3. **Context awareness** - agents can reference past work
4. **Unified logging** - everything in SuperChase project files
5. **Extensible** - easy to add new deliverable types
6. **Real-time coordination** - agents can handoff tasks

---

**Decision: Kill Make.com, build native.** Ready to implement the intake webhook directly in SuperChase?