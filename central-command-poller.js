// SuperChase Central Command Polling Service
// Polls Airtable Work Queue and routes tasks to SuperChase

import axios from 'axios';

class CentralCommandPoller {
  constructor(config) {
    this.airtableToken = config.airtableToken;
    this.baseId = config.baseId;
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}`;
    this.isPolling = false;
    this.pollInterval = config.pollInterval || 30000; // 30 seconds
    this.coordinator = config.coordinator; // SuperChase coordinator instance
  }

  // Headers for Airtable API
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.airtableToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Get new tasks from Work Queue (status = "new")
  async getNewTasks() {
    try {
      const response = await axios.get(`${this.baseUrl}/Work%20Queue`, {
        headers: this.getHeaders(),
        params: {
          filterByFormula: '{status} = "new"',
          sort: [{ field: 'created_date', direction: 'asc' }]
        }
      });

      return response.data.records;
    } catch (error) {
      console.error('Error fetching tasks from Central Command:', error.message);
      return [];
    }
  }

  // Update task status with graceful field handling
  async updateTaskStatus(recordId, status, additionalFields = {}) {
    try {
      // Start with basic status update
      const updateData = { status: status };
      
      // Only add fields that exist in table (prevent 422 errors)
      const safeFields = ['system_target', 'assigned_agent', 'started_at', 'completed_at', 'routed_at', 'cost_actual', 'last_error'];
      
      for (const [key, value] of Object.entries(additionalFields)) {
        if (safeFields.includes(key)) {
          updateData[key] = value;
        } else {
          console.log(`⚠️  Skipping field '${key}' - may not exist in table`);
        }
      }

      const response = await axios.patch(
        `${this.baseUrl}/Work%20Queue/${recordId}`,
        { fields: updateData },
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      // If 422 error (field doesn't exist), try with status only
      if (error.response?.status === 422) {
        console.log(`⚠️  Field error - falling back to status-only update`);
        try {
          const response = await axios.patch(
            `${this.baseUrl}/Work%20Queue/${recordId}`,
            { fields: { status: status } },
            { headers: this.getHeaders() }
          );
          return response.data;
        } catch (fallbackError) {
          console.error('❌ Status-only update also failed:', fallbackError.message);
          throw fallbackError;
        }
      }
      
      console.error('Error updating task status:', error.message);
      throw error;
    }
  }

  // Log execution in Agents Ledger
  async logExecution(taskRecordId, agentUsed, executionData) {
    try {
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const logData = {
        execution_id: executionId,
        task_link: [taskRecordId],
        agent_used: agentUsed,
        tokens_consumed: executionData.tokensUsed || 0,
        cost_usd: executionData.cost || 0,
        confidence_score: executionData.confidence || 0.8,
        execution_time_seconds: executionData.executionTime || 0,
        output_summary: executionData.summary || 'Task processed by SuperChase'
      };

      const response = await axios.post(
        `${this.baseUrl}/Agents%20Ledger`,
        { fields: logData },
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error logging execution:', error.message);
    }
  }

  // Intelligent agent assignment based on task content
  analyzeTaskForAgent(taskId, routingPayload) {
    const content = `${taskId} ${routingPayload}`.toLowerCase();
    
    // Architecture/Technical = Claude
    if (content.includes('architect') || content.includes('design') || content.includes('technical') || content.includes('system')) {
      return { agent: 'claude', target: 'superchase', confidence: 0.9 };
    }
    
    // Creative/Content = GPT-4
    if (content.includes('creative') || content.includes('content') || content.includes('marketing') || content.includes('copy')) {
      return { agent: 'gpt4', target: 'superchase', confidence: 0.8 };
    }
    
    // Data/Analysis = Multi-agent
    if (content.includes('analysis') || content.includes('data') || content.includes('report') || content.includes('research')) {
      return { agent: 'multi_agent', target: 'superchase', confidence: 0.85 };
    }
    
    // Invoice/Business = Copilot  
    if (content.includes('invoice') || content.includes('business') || content.includes('finance')) {
      return { agent: 'copilot', target: 'superchase', confidence: 0.7 };
    }
    
    // Default
    return { agent: 'claude', target: 'superchase', confidence: 0.6 };
  }

  // Route task to appropriate system
  async routeTask(taskRecord) {
    const fields = taskRecord.fields;
    const taskId = fields.task_id;
    const routingPayload = fields.routing_payload || '';
    const priority = fields.priority || 'P2';
    
    // Auto-assign if missing, otherwise use existing values
    let systemTarget = fields.system_target;
    let assignedAgent = fields.assigned_agent;
    
    if (!systemTarget || !assignedAgent) {
      const analysis = this.analyzeTaskForAgent(taskId, routingPayload);
      systemTarget = systemTarget || analysis.target;
      assignedAgent = assignedAgent || analysis.agent;
      
      console.log(`🤖 Auto-assigned: ${taskId} → ${assignedAgent} (confidence: ${analysis.confidence})`);
    }

    console.log(`🔄 Central Command: Routing task ${taskId} to ${systemTarget} via ${assignedAgent}`);
    
    const startTime = Date.now();

    try {
      // Update status to in_progress with metadata
      await this.updateTaskStatus(taskRecord.id, 'in_progress', {
        started_at: new Date().toISOString(),
        routed_at: new Date().toISOString(),
        system_target: systemTarget,
        assigned_agent: assignedAgent
      });

      // Parse routing payload
      let payload = {};
      if (routingPayload) {
        try {
          payload = JSON.parse(routingPayload);
        } catch (e) {
          console.warn(`⚠️ Invalid JSON in routing_payload for ${taskId}`);
        }
      }

      // Route to SuperChase using existing processIncomingTask method
      const result = await this.routeToSuperChase(taskId, payload, systemTarget, assignedAgent);

      // Log execution
      await this.logExecution(taskRecord.id, assignedAgent, {
        tokensUsed: result.tokensUsed || 0,
        cost: result.cost || 0,
        confidence: result.confidence || 0.85,
        executionTime: result.executionTime || 30,
        summary: result.summary || `Task ${taskId} completed via ${systemTarget}`
      });

      // Calculate execution metrics
      const executionTime = Math.round((Date.now() - startTime) / 1000);
      const estimatedCost = this.calculateCost(assignedAgent, executionTime, result.tokensUsed);
      
      // Update to completed with full metadata
      await this.updateTaskStatus(taskRecord.id, 'done', {
        completed_at: new Date().toISOString(),
        cost_actual: estimatedCost
      });

      console.log(`✅ Central Command: Task ${taskId} completed in ${executionTime}s (Cost: $${estimatedCost})`);

    } catch (error) {
      const executionTime = Math.round((Date.now() - startTime) / 1000);
      console.error(`❌ Central Command: Error processing task ${taskId} after ${executionTime}s:`, error.message);
      
      // Update to error status with details
      await this.updateTaskStatus(taskRecord.id, 'error', {
        last_error: error.message,
        completed_at: new Date().toISOString()
      });

      // Log error with metrics
      await this.logExecution(taskRecord.id, assignedAgent, {
        executionTime: executionTime,
        summary: `Error after ${executionTime}s: ${error.message}`
      });
    }
  }

  // Calculate estimated cost based on agent and usage
  calculateCost(agent, executionTimeSeconds, tokensUsed = 0) {
    const baseCost = {
      'claude': 0.015,    // Per request base
      'gpt4': 0.03,       // Higher for GPT-4
      'copilot': 0.008,   // Lower for simple tasks
      'multi_agent': 0.05 // Higher for coordination
    };
    
    const tokenCost = tokensUsed * 0.000002; // $0.000002 per token
    const timeCost = executionTimeSeconds * 0.001; // Time penalty
    
    return Math.round((baseCost[agent] + tokenCost + timeCost) * 100) / 100;
  }

  // Enhanced SuperChase routing with better payload handling
  async routeToSuperChase(taskId, payload, systemTarget, agent) {
    try {
      console.log(`🎯 Routing to ${systemTarget} via ${agent}...`);
      
      // Extract goal from payload or use taskId
      const goal = payload.goal || payload.description || payload.task || taskId;
      
      // Create enhanced task data
      const taskData = {
        id: taskId,
        goal: goal,
        deliverables: payload.deliverables || this.getDefaultDeliverables(agent),
        priority: this.mapPriority(payload.priority),
        constraints: payload.constraints || [],
        system_target: systemTarget,
        assigned_agent: agent,
        context: payload.context || '',
        deadline: payload.deadline || null
      };

      // Use SuperChase coordinator with timing
      const processingStart = Date.now();
      const result = await this.coordinator.processIncomingTask(taskData);
      const processingTime = Date.now() - processingStart;
      
      // Estimate token usage based on agent and task complexity
      const estimatedTokens = this.estimateTokenUsage(goal, agent);
      
      return {
        tokensUsed: estimatedTokens,
        confidence: result.confidence || 0.8,
        executionTime: Math.round(processingTime / 1000),
        summary: `${agent} via ${systemTarget}: ${result.status || 'completed'}`,
        superChaseResult: result
      };

    } catch (error) {
      console.error(`🚨 SuperChase routing error:`, error.message);
      throw error;
    }
  }
  
  // Helper methods
  getDefaultDeliverables(agent) {
    const defaults = {
      'claude': ['architecture_doc', 'implementation_plan'],
      'gpt4': ['content', 'analysis'],
      'copilot': ['code', 'documentation'],
      'multi_agent': ['comprehensive_report']
    };
    return defaults[agent] || ['analysis'];
  }
  
  mapPriority(priority) {
    const priorityMap = { 'P0': 'critical', 'P1': 'high', 'P2': 'medium', 'P3': 'low' };
    return priorityMap[priority] || 'medium';
  }
  
  estimateTokenUsage(goal, agent) {
    const baseTokens = goal.length * 4; // Rough estimate
    const agentMultiplier = {
      'claude': 1.5,      // More detailed responses
      'gpt4': 1.8,        // Comprehensive outputs
      'copilot': 1.0,     // Concise code
      'multi_agent': 2.5  // Multiple agents
    };
    return Math.round(baseTokens * (agentMultiplier[agent] || 1.2));
  }

  // Enhanced polling with priority handling
  async startPolling() {
    if (this.isPolling) {
      console.log('Central Command poller already running');
      return;
    }

    this.isPolling = true;
    console.log(`🔄 Central Command poller started (${this.pollInterval/1000}s interval)`);
    console.log(`🎯 Monitoring: New tasks → Auto-assignment → SuperChase routing → Completion tracking`);

    while (this.isPolling) {
      try {
        const newTasks = await this.getNewTasks();
        
        if (newTasks.length > 0) {
          console.log(`📥 Central Command: Found ${newTasks.length} new tasks to process`);
          
          // Sort by priority (P0 = highest)
          newTasks.sort((a, b) => {
            const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
            const aPriority = priorityOrder[a.fields.priority] || 2;
            const bPriority = priorityOrder[b.fields.priority] || 2;
            return aPriority - bPriority;
          });
          
          // Process tasks sequentially, highest priority first
          for (const task of newTasks) {
            const priority = task.fields.priority || 'P2';
            console.log(`📋 Processing ${task.fields.task_id} (Priority: ${priority})`);
            await this.routeTask(task);
            
            // Small delay to prevent API rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

      } catch (error) {
        console.error('🚨 Central Command polling error:', error.message);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, this.pollInterval));
    }
  }

  // Stop polling with cleanup
  stopPolling() {
    console.log('🛑 Stopping Central Command poller...');
    this.isPolling = false;
    console.log('✅ Central Command poller stopped');
  }
  
  // Health check for monitoring
  getStatus() {
    return {
      isPolling: this.isPolling,
      pollInterval: this.pollInterval,
      baseId: this.baseId,
      uptime: this.isPolling ? 'running' : 'stopped'
    };
  }
}

export default CentralCommandPoller;