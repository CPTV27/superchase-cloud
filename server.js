#!/usr/bin/env node

/**
 * SuperChase Enhanced Multi-Agent Coordinator - Cloud Ready
 * Native task intake with Gmail/Calendar automation
 * Replaces external webhook services with intelligent routing
 */

const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const cors = require('cors');
const os = require('os');

class SuperChaseCoordinator {
  constructor() {
    // Cloud-friendly paths
    this.baseDir = process.env.NODE_ENV === 'production' 
      ? path.join(process.cwd(), 'data', 'docs', 'routed')
      : 'C:\\SuperChase_OpenAI-Agentic\\data\\docs\\routed';
      
    this.port = process.env.PORT || 3000;
    
    this.agents = {
      claude: { active: true, queue: [], capabilities: ['ui', 'architecture', 'specs', 'gmail', 'calendar'] },
      nova: { active: false, queue: [], capabilities: ['research', 'analysis', 'validation', 'backend'] },
      copilot: { active: false, queue: [], capabilities: ['implementation', 'code', 'deployment', 'debugging'] }
    };
    this.taskHistory = [];
    this.app = express();
    this.setupExpress();
    
    // Ensure directories exist
    this.initializeDirectories();
  }

  async initializeDirectories() {
    const dirs = ['claude', 'nova', 'copilot', 'artifacts', 'logs', 'system'];
    for (const dir of dirs) {
      try {
        await fs.mkdir(path.join(this.baseDir, dir), { recursive: true });
      } catch (error) {
        // Directory might already exist
      }
    }
  }

  setupExpress() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    
    // Serve static files (web form)
    this.app.use(express.static(path.join(__dirname, 'public')));
    
    // Health check for cloud platforms
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    });
    
    // Native intake endpoint (replaces Make.com webhook)
    this.app.post('/api/intake', async (req, res) => {
      try {
        const result = await this.processIncomingTask(req.body);
        res.json(result);
      } catch (error) {
        console.error('Intake error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Task status endpoint
    this.app.get('/api/tasks/:taskId', async (req, res) => {
      const task = this.taskHistory.find(t => t.id === req.params.taskId);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    });

    // System status endpoint
    this.app.get('/api/status', (req, res) => {
      res.json(this.getSystemStatus());
    });

    // Recent outputs
    this.app.get('/api/outputs', async (req, res) => {
      const outputs = await this.getRecentOutputs(req.query.limit || 10);
      res.json(outputs);
    });
    
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({ 
        name: 'SuperChase Multi-Agent Coordinator',
        version: '1.0.0',
        status: 'operational',
        endpoints: {
          intake: '/api/intake',
          status: '/api/status',
          health: '/health'
        }
      });
    });
  }

  async processIncomingTask(taskData) {
    const timestamp = Date.now();
    const taskId = taskData.id || `task_${timestamp}`;
    
    // Analyze task for intelligent routing
    const routing = this.analyzeTask(taskData.goal);
    
    const task = {
      id: taskId,
      goal: taskData.goal,
      deliverables: taskData.deliverables || ['analysis'],
      priority: taskData.priority || 'medium',
      constraints: taskData.constraints || [],
      context: {
        email_to: taskData.email_to,
        calendar_start: taskData.calendar_start,
        calendar_end: taskData.calendar_end,
        context_links: taskData.context_links || []
      },
      routing: routing,
      status: 'processing',
      created: new Date(),
      outputs: []
    };

    // Add to history and queue
    this.taskHistory.push(task);
    
    // Process deliverables based on routing
    await this.executeTask(task);
    
    // Log to project tracking
    await this.logTaskToProject(task);

    return {
      taskId: task.id,
      routing: routing,
      status: task.status,
      estimatedCompletion: this.estimateCompletion(task),
      deliverables: task.deliverables
    };
  }

  async executeTask(task) {
    try {
      const primaryAgent = task.routing.primaryAgent;
      
      if (primaryAgent === 'claude') {
        await this.executeClaudeTask(task);
      } else if (primaryAgent === 'nova') {
        await this.executeNovaTask(task);
      } else if (primaryAgent === 'copilot') {
        await this.executeCopilotTask(task);
      }
      
      task.status = 'completed';
    } catch (error) {
      console.error(`Task execution failed:`, error);
      task.status = 'failed';
      task.error = error.message;
    }
  }

  async executeClaudeTask(task) {
    const timestamp = Date.now();
    let outputs = [];

    // Generate email draft if requested
    if (task.deliverables.includes('email draft')) {
      const emailContent = await this.generateEmailDraft(task);
      const emailFile = await this.saveEmailDraft(task, emailContent, timestamp);
      outputs.push({
        type: 'email_draft',
        file: emailFile,
        content: emailContent
      });
    }

    // Generate calendar event if requested  
    if (task.deliverables.includes('calendar event')) {
      const eventContent = await this.generateCalendarEvent(task);
      const eventFile = await this.saveCalendarEvent(task, eventContent, timestamp);
      outputs.push({
        type: 'calendar_event',
        file: eventFile,
        content: eventContent
      });
    }

    // Generate analysis or other deliverables
    if (task.deliverables.includes('analysis') || task.deliverables.length === 0) {
      const analysis = await this.generateAnalysis(task);
      const analysisFile = await this.saveAnalysis(task, analysis, timestamp);
      outputs.push({
        type: 'analysis',
        file: analysisFile,
        content: analysis
      });
    }

    task.outputs = outputs;
    
    // Create task summary file
    await this.createTaskFile(task, 'claude', {
      reasoning: task.routing.reasoning,
      output: this.formatTaskOutputs(outputs),
      nextSteps: this.generateNextSteps(task),
      handoff: this.generateHandoffInstructions(task)
    });
  }

  async executeNovaTask(task) {
    // Placeholder for Nova integration
    console.log('Nova task execution - integration pending');
  }

  async executeCopilotTask(task) {
    // Placeholder for Copilot integration  
    console.log('Copilot task execution - integration pending');
  }

  async generateEmailDraft(task) {
    const subject = this.generateEmailSubject(task.goal);
    const body = this.generateEmailBody(task.goal, task.constraints);
    
    return {
      to: task.context.email_to,
      subject: subject,
      body: body,
      generated: new Date().toISOString()
    };
  }

  generateEmailSubject(goal) {
    if (goal.toLowerCase().includes('follow up')) {
      return `Follow-up: ${goal.replace(/follow up|follow-up/gi, '').trim()}`;
    }
    if (goal.toLowerCase().includes('meeting')) {
      return `Meeting: ${goal}`;
    }
    return `Re: ${goal}`;
  }

  generateEmailBody(goal, constraints = []) {
    const tone = constraints.find(c => c.startsWith('tone:'))?.split(':')[1]?.trim() || 'professional';
    const concise = constraints.includes('keep concise');
    
    let body = `Hi,\n\n`;
    
    if (concise) {
      body += `Quick follow-up on ${goal}.\n\n`;
      body += `Let me know your thoughts.\n\n`;
    } else {
      body += `I wanted to follow up regarding ${goal}.\n\n`;
      body += `Could we schedule some time to discuss this further?\n\n`;
      body += `Looking forward to hearing from you.\n\n`;
    }
    
    body += `Best regards`;
    
    return body;
  }

  async generateCalendarEvent(task) {
    const start = task.context.calendar_start || new Date(Date.now() + 24*60*60*1000).toISOString();
    const end = task.context.calendar_end || new Date(Date.now() + 25*60*60*1000).toISOString();
    
    return {
      summary: `Meeting: ${task.goal}`,
      description: `Scheduled via SuperChase\n\nGoal: ${task.goal}\n\nConstraints: ${task.constraints.join(', ')}`,
      start: { dateTime: start },
      end: { dateTime: end },
      attendees: task.context.email_to ? [{ email: task.context.email_to }] : [],
      generated: new Date().toISOString()
    };
  }

  async generateAnalysis(task) {
    return {
      task_summary: task.goal,
      priority_assessment: task.priority,
      recommended_actions: this.generateRecommendedActions(task),
      next_steps: this.generateNextSteps(task),
      generated: new Date().toISOString()
    };
  }

  generateRecommendedActions(task) {
    const actions = [];
    
    if (task.goal.toLowerCase().includes('client')) {
      actions.push('Review client history and recent interactions');
      actions.push('Prepare talking points for discussion');
    }
    
    if (task.goal.toLowerCase().includes('proposal') || task.goal.toLowerCase().includes('quote')) {
      actions.push('Gather current pricing information');  
      actions.push('Review similar past proposals');
    }
    
    if (actions.length === 0) {
      actions.push('Analyze task requirements');
      actions.push('Identify key stakeholders');
      actions.push('Determine success criteria');
    }
    
    return actions;
  }

  async saveEmailDraft(task, emailContent, timestamp) {
    const filename = `${timestamp}_claude_email_${task.id.slice(-8)}.json`;
    const filepath = path.join(this.baseDir, 'claude', filename);
    
    try {
      await fs.writeFile(filepath, JSON.stringify(emailContent, null, 2));
    } catch (error) {
      console.error('Failed to save email draft:', error);
    }
    return filename;
  }

  async saveCalendarEvent(task, eventContent, timestamp) {
    const filename = `${timestamp}_claude_calendar_${task.id.slice(-8)}.json`;
    const filepath = path.join(this.baseDir, 'claude', filename);
    
    try {
      await fs.writeFile(filepath, JSON.stringify(eventContent, null, 2));
    } catch (error) {
      console.error('Failed to save calendar event:', error);
    }
    return filename;
  }

  async saveAnalysis(task, analysis, timestamp) {
    const filename = `${timestamp}_claude_analysis_${task.id.slice(-8)}.json`;
    const filepath = path.join(this.baseDir, 'claude', filename);
    
    try {
      await fs.writeFile(filepath, JSON.stringify(analysis, null, 2));
    } catch (error) {
      console.error('Failed to save analysis:', error);
    }
    return filename;
  }

  formatTaskOutputs(outputs) {
    return outputs.map(output => {
      return `**${output.type.toUpperCase()}**: ${output.file}\n${JSON.stringify(output.content, null, 2)}`;
    }).join('\n\n');
  }

  analyzeTask(description) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n🔍 DEBUG: Analyzing task: "${description}"`);
    }
    
    const keywords = {
      claude: ['email', 'draft', 'calendar', 'event', 'meeting', 'component', 'ui', 'design', 'architecture'],
      nova: ['research', 'analyze', 'compare', 'investigate', 'alternatives', 'market'],
      copilot: ['implement', 'code', 'refactor', 'debug', 'optimize', 'deploy', 'build']
    };
    
    const scores = {};
    Object.keys(keywords).forEach(agent => {
      scores[agent] = keywords[agent].filter(keyword => 
        description.toLowerCase().includes(keyword)
      ).length;
    });
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📊 Keyword scores:`, scores);
    }
    
    const primaryAgent = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    // Default to Claude for email/calendar tasks
    const emailTask = description.toLowerCase().includes('email');
    const messageTask = description.toLowerCase().includes('message');
    const sendTask = description.toLowerCase().includes('send');
    const contactTask = description.toLowerCase().includes('contact');
    const calendarTask = description.toLowerCase().includes('calendar');
    const followUpSpaced = description.toLowerCase().includes('follow up');
    const followUpHyphen = description.toLowerCase().includes('follow-up');
    const draftTask = description.toLowerCase().includes('draft');
    
    if (emailTask || messageTask || sendTask || contactTask || calendarTask || followUpSpaced || followUpHyphen || draftTask) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ OVERRIDE: Routing to Claude for email/calendar task`);
      }
      return {
        primaryAgent: 'claude',
        agents: ['claude'],
        confidence: 0.9,
        reasoning: 'Email/Calendar task routed to Claude for direct Gmail/Calendar integration'
      };
    }
    
    return {
      primaryAgent,
      agents: [primaryAgent],
      confidence: Math.max(...Object.values(scores)) / description.split(' ').length,
      reasoning: `Primary trigger: ${primaryAgent} (${scores[primaryAgent]} matching keywords)`
    };
  }

  generateNextSteps(task) {
    const steps = [];
    
    if (task.deliverables.includes('email draft')) {
      steps.push('Review and send email draft');
    }
    if (task.deliverables.includes('calendar event')) {
      steps.push('Confirm calendar event details');
    }
    
    steps.push('Monitor task completion');
    steps.push('Follow up as needed');
    
    return steps;
  }

  generateHandoffInstructions(task) {
    if (task.routing.agents.length > 1) {
      return `Task requires multi-agent coordination. Next agent: ${task.routing.agents[1]}`;
    }
    return 'Task complete - no handoff required';
  }

  async createTaskFile(task, agent, content) {
    const timestamp = Date.now();
    const filename = `${timestamp}_${agent}_${task.id.slice(-8)}.md`;
    const filepath = path.join(this.baseDir, agent, filename);
    
    const taskFile = `# Task Assignment
**Task ID**: ${task.id}
**Agent**: ${agent.toUpperCase()}
**Priority**: ${task.priority}
**Created**: ${task.created.toISOString()}

# Agent Reasoning
${content.reasoning || 'Standard task processing'}

# Output
${content.output}

# Next Steps
${Array.isArray(content.nextSteps) ? content.nextSteps.map((step, i) => `${i+1}. ${step}`).join('\n') : content.nextSteps}

# Handoff Instructions
${content.handoff || 'Standard completion protocol'}

# Metadata
- Priority Level: ${task.priority}
- Deliverables: ${task.deliverables.join(', ')}
- Status: ${task.status}
`;

    try {
      await fs.writeFile(filepath, taskFile);
      
      task.outputs.push({
        type: 'task_file',
        agent,
        file: filename,
        path: filepath,
        created: new Date()
      });
    } catch (error) {
      console.error('Failed to create task file:', error);
    }
    
    return filepath;
  }

  async logTaskToProject(task) {
    const logPath = path.join(this.baseDir, 'logs', 'project_log.md');
    const timestamp = new Date().toISOString();
    
    const logEntry = `
## ${timestamp} - Task Processed

**Task ID**: ${task.id}
**Goal**: ${task.goal}
**Priority**: ${task.priority}
**Agent**: ${task.routing.primaryAgent}
**Status**: ${task.status}
**Deliverables**: ${task.deliverables.join(', ')}

${task.error ? `**Error**: ${task.error}` : ''}

---
`;
    
    try {
      await fs.appendFile(logPath, logEntry);
    } catch (error) {
      console.error('Failed to log task:', error);
    }
  }

  estimateCompletion(task) {
    const baseMinutes = {
      claude: 5,
      nova: 15, 
      copilot: 20
    };
    
    const deliverableTime = task.deliverables.length * 2;
    const agentTime = baseMinutes[task.routing.primaryAgent] || 10;
    
    return `${agentTime + deliverableTime} minutes`;
  }

  getSystemStatus() {
    return {
      agents: this.agents,
      activeTasks: this.taskHistory.filter(t => t.status === 'processing').length,
      completedTasks: this.taskHistory.filter(t => t.status === 'completed').length,
      failedTasks: this.taskHistory.filter(t => t.status === 'failed').length,
      totalTasks: this.taskHistory.length,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      platform: os.platform(),
      nodeVersion: process.version
    };
  }

  async getRecentOutputs(limit = 10) {
    const outputs = [];
    
    for (const agent of Object.keys(this.agents)) {
      try {
        const agentDir = path.join(this.baseDir, agent);
        const files = await fs.readdir(agentDir);
        const agentFiles = files
          .filter(f => f.endsWith('.md') || f.endsWith('.json'))
          .map(f => ({
            agent,
            file: f,
            path: path.join(agentDir, f),
            timestamp: parseInt(f.split('_')[0])
          }));
        
        outputs.push(...agentFiles);
      } catch (err) {
        // Agent directory might not exist yet
      }
    }
    
    return outputs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  start(port = this.port) {
    this.app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 SuperChase Coordinator running on port ${port}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Intake endpoint: ${process.env.NODE_ENV === 'production' ? 'https://your-app.railway.app' : 'http://localhost:' + port}/api/intake`);
      console.log(`📊 Health check: ${process.env.NODE_ENV === 'production' ? 'https://your-app.railway.app' : 'http://localhost:' + port}/health`);
    });
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const coordinator = new SuperChaseCoordinator();
  
  if (args.includes('--server') || args.includes('-s') || process.env.NODE_ENV === 'production') {
    coordinator.start();
    return;
  }
  
  if (args.length === 0) {
    console.log(`
SuperChase Enhanced Multi-Agent Coordinator - Cloud Ready

Usage:
  node server.js                    Start server (cloud mode)
  node server.js --server           Start server (development mode)
  node server.js route "task"       Route a single task
  node server.js status             Check system status
  
Cloud Deployment:
  Automatically detects cloud environment via NODE_ENV=production
  Uses PORT environment variable for cloud platforms
  
Examples:
  node server.js --server
  node server.js route "Follow up with client about proposal" 
  node server.js status
`);
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'route':
      const taskDesc = args[1];
      const priority = args[2] || 'medium';
      const result = await coordinator.processIncomingTask({
        goal: taskDesc,
        priority: priority,
        deliverables: ['analysis']
      });
      console.log(JSON.stringify(result, null, 2));
      break;
      
    case 'status':
      const status = coordinator.getSystemStatus();
      console.log(JSON.stringify(status, null, 2));
      break;
      
    default:
      console.log('Unknown command:', command);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SuperChaseCoordinator;