#!/usr/bin/env node

/**
 * SuperChase Multi-Agent Coordinator
 * Handles task routing, agent communication, and output coordination
 */

const fs = require('fs').promises;
const path = require('path');

class SuperChaseCoordinator {
  constructor() {
    this.baseDir = 'C:\\SuperChase_OpenAI-Agentic\\data\\docs\\routed';
    this.agents = {
      claude: { active: true, queue: [] },
      nova: { active: false, queue: [] },
      copilot: { active: false, queue: [] }
    };
    this.taskHistory = [];
  }

  // Task routing based on keywords and priority
  routeTask(taskDescription, priority = 'medium') {
    const routing = this.analyzeTask(taskDescription);
    const timestamp = Date.now();
    
    const task = {
      id: `task_${timestamp}`,
      description: taskDescription,
      priority,
      agents: routing.agents,
      currentAgent: routing.agents[0],
      status: 'queued',
      created: new Date(),
      outputs: []
    };
    
    this.taskHistory.push(task);
    this.queueTask(task);
    
    return {
      taskId: task.id,
      routing: routing,
      estimatedCompletion: this.estimateCompletion(task),
      nextSteps: this.generateNextSteps(task)
    };
  }

  analyzeTask(description) {
    const keywords = {
      claude: ['component', 'ui', 'design', 'architecture', 'artifact', 'preview', 'wireframe', 'mockup', 'system'],
      nova: ['research', 'analyze', 'compare', 'investigate', 'alternatives', 'benchmark', 'validate', 'market'],
      copilot: ['implement', 'code', 'refactor', 'debug', 'optimize', 'deploy', 'build', 'fix']
    };
    
    const scores = {};
    Object.keys(keywords).forEach(agent => {
      scores[agent] = keywords[agent].filter(keyword => 
        description.toLowerCase().includes(keyword)
      ).length;
    });
    
    // Determine primary agent and workflow
    const primaryAgent = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    let agents = [primaryAgent];
    
    // Add secondary agents based on complexity
    if (description.includes('research') && !agents.includes('nova')) {
      agents.unshift('nova');
    }
    if (description.includes('implement') && !agents.includes('copilot')) {
      agents.push('copilot');
    }
    
    return {
      primaryAgent,
      agents,
      confidence: Math.max(...Object.values(scores)) / description.split(' ').length,
      reasoning: `Primary trigger: ${primaryAgent}, Workflow: ${agents.join(' → ')}`
    };
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
${content.reasoning || 'Standard task routing'}

# Output
${content.output}

# Next Steps
${content.nextSteps || 'Awaiting next agent in sequence'}

# Handoff Instructions
${content.handoff || 'Standard handoff protocol'}

# Metadata
- Priority Level: ${task.priority}
- Estimated Completion: ${content.estimatedCompletion || '30 minutes'}
- Dependencies: ${content.dependencies || 'None'}
- Human Review Needed: ${content.humanReview || 'No'}
`;

    await fs.writeFile(filepath, taskFile);
    
    task.outputs.push({
      agent,
      file: filename,
      created: new Date(),
      path: filepath
    });
    
    return filepath;
  }

  async generateArtifactPreview(task, htmlContent) {
    const timestamp = Date.now();
    const filename = `artifact_${task.id}_${timestamp}.html`;
    const filepath = path.join(this.baseDir, 'artifacts', filename);
    
    // Ensure artifacts directory exists
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    
    await fs.writeFile(filepath, htmlContent);
    
    return {
      previewUrl: `file://${filepath}`,
      filename,
      path: filepath
    };
  }

  queueTask(task) {
    const agent = task.currentAgent;
    this.agents[agent].queue.push(task);
  }

  estimateCompletion(task) {
    const baseMinutes = {
      claude: 15,
      nova: 30, 
      copilot: 45
    };
    
    const totalMinutes = task.agents.reduce((sum, agent) => {
      return sum + (baseMinutes[agent] || 20);
    }, 0);
    
    return `${totalMinutes} minutes (${task.agents.length} agents)`;
  }

  generateNextSteps(task) {
    const steps = [];
    
    task.agents.forEach((agent, index) => {
      if (index === 0) {
        steps.push(`1. ${agent.toUpperCase()}: Begin task analysis and initial work`);
      } else {
        steps.push(`${index + 1}. ${agent.toUpperCase()}: Continue after ${task.agents[index - 1]} handoff`);
      }
    });
    
    steps.push(`${steps.length + 1}. Review and integrate all agent outputs`);
    
    return steps;
  }

  // Status and monitoring
  getSystemStatus() {
    return {
      agents: this.agents,
      activeTasks: this.taskHistory.filter(t => t.status !== 'completed').length,
      totalTasks: this.taskHistory.length,
      queueDepth: Object.values(this.agents).reduce((sum, agent) => sum + agent.queue.length, 0)
    };
  }

  async getRecentOutputs(limit = 10) {
    const outputs = [];
    
    for (const agent of Object.keys(this.agents)) {
      try {
        const agentDir = path.join(this.baseDir, agent);
        const files = await fs.readdir(agentDir);
        const agentFiles = files
          .filter(f => f.endsWith('.md'))
          .map(f => ({
            agent,
            file: f,
            path: path.join(agentDir, f),
            timestamp: parseInt(f.split('_')[0])
          }));
        
        outputs.push(...agentFiles);
      } catch (err) {
        // Agent directory doesn't exist yet
        console.log(`Agent directory not found: ${agent}`);
      }
    }
    
    return outputs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}

// CLI Interface
async function main() {
  const coordinator = new SuperChaseCoordinator();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
SuperChase Multi-Agent Coordinator

Usage:
  node coordinator.js route "task description" [priority]
  node coordinator.js status
  node coordinator.js outputs
  
Examples:
  node coordinator.js route "Build auth system for Melody Vault" high
  node coordinator.js route "Research music streaming APIs" 
  node coordinator.js status
`);
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'route':
      const taskDesc = args[1];
      const priority = args[2] || 'medium';
      const result = coordinator.routeTask(taskDesc, priority);
      console.log(JSON.stringify(result, null, 2));
      break;
      
    case 'status':
      const status = coordinator.getSystemStatus();
      console.log(JSON.stringify(status, null, 2));
      break;
      
    case 'outputs':
      const outputs = await coordinator.getRecentOutputs();
      console.log(JSON.stringify(outputs, null, 2));
      break;
      
    default:
      console.log('Unknown command:', command);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SuperChaseCoordinator;