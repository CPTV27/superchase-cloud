#!/usr/bin/env node

/**
 * Test script for SuperChase intake system
 * Tests various task types and routing scenarios
 */

const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

const testTasks = [
  {
    name: "Email Follow-up Test",
    payload: {
      id: "TEST_EMAIL_001",
      goal: "Follow up with Utopia about the reel selects from last week",
      deliverables: ["email draft"],
      email_to: "me@chasepierson.tv",
      constraints: ["tone: professional", "keep concise"],
      priority: "high"
    }
  },
  {
    name: "Calendar Event Test", 
    payload: {
      id: "TEST_CALENDAR_001",
      goal: "Schedule client review meeting for Ardent project",
      deliverables: ["calendar event"],
      calendar_start: "2025-01-30T14:00:00-05:00",
      calendar_end: "2025-01-30T15:00:00-05:00",
      email_to: "client@ardentcreative.com",
      priority: "medium"
    }
  },
  {
    name: "Full Task Test",
    payload: {
      id: "TEST_FULL_001", 
      goal: "Confirm upcoming TechCon proposal presentation",
      deliverables: ["email draft", "calendar event", "analysis"],
      email_to: "events@techcon.com",
      calendar_start: "2025-02-01T10:00:00-05:00", 
      calendar_end: "2025-02-01T11:30:00-05:00",
      constraints: ["tone: professional"],
      context_links: ["https://drive.google.com/proposal-deck"],
      priority: "high"
    }
  },
  {
    name: "Analysis Only Test",
    payload: {
      id: "TEST_ANALYSIS_001",
      goal: "Research best practices for client onboarding in creative agencies",
      deliverables: ["analysis"],
      priority: "low"
    }
  }
];

async function testIntake() {
  console.log('🚀 Testing SuperChase Native Intake System\n');
  
  const serverUrl = 'http://localhost:3000';
  
  for (const test of testTasks) {
    console.log(`📋 Running: ${test.name}`);
    console.log(`   Goal: ${test.payload.goal}`);
    console.log(`   Deliverables: ${test.payload.deliverables.join(', ')}\n`);
    
    try {
      const curlCommand = `curl -X POST '${serverUrl}/api/intake' ` +
        `-H 'Content-Type: application/json' ` +
        `-d '${JSON.stringify(test.payload)}'`;
      
      const { stdout, stderr } = await execAsync(curlCommand);
      
      if (stderr) {
        console.log(`   ❌ Error: ${stderr}\n`);
      } else {
        const response = JSON.parse(stdout);
        console.log(`   ✅ Success: Task ${response.taskId} routed to ${response.routing.primaryAgent}`);
        console.log(`   📊 Estimated completion: ${response.estimatedCompletion}`);
        console.log(`   🎯 Deliverables: ${response.deliverables.join(', ')}\n`);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
    }
  }
  
  // Test status endpoint
  console.log('📊 Checking system status...\n');
  try {
    const { stdout } = await execAsync(`curl -s ${serverUrl}/api/status`);
    const status = JSON.parse(stdout);
    console.log(`   📈 Active Tasks: ${status.activeTasks}`);
    console.log(`   ✅ Completed Tasks: ${status.completedTasks}`);
    console.log(`   ❌ Failed Tasks: ${status.failedTasks}`);
    console.log(`   ⏱️  System Uptime: ${Math.round(status.uptime)} seconds\n`);
  } catch (error) {
    console.log(`   ❌ Status check failed: ${error.message}\n`);
  }
  
  console.log('🎉 Testing complete! Check the /routed/claude/ directory for generated outputs.');
}

// Simple Python script generator for quick tasks
function generatePythonScript() {
  const script = `#!/usr/bin/env python3
"""
SuperChase Quick Task Capture
Usage: python3 quick-task.py "Your task description here"
"""

import requests
import sys
import json
import datetime as dt

ENDPOINT = "http://localhost:3000/api/intake"

def send_task(goal, deliverables=None, priority="medium"):
    if deliverables is None:
        # Smart default based on goal content
        deliverables = []
        if any(word in goal.lower() for word in ['email', 'follow up', 'contact']):
            deliverables.append('email draft')
        if any(word in goal.lower() for word in ['meeting', 'schedule', 'call']):
            deliverables.append('calendar event')
        if not deliverables:
            deliverables = ['analysis']
    
    payload = {
        "id": f"QUICK_{int(dt.datetime.now().timestamp())}",
        "goal": goal,
        "deliverables": deliverables,
        "email_to": "me@chasepierson.tv",
        "priority": priority,
        "constraints": ["tone: professional"]
    }
    
    if 'calendar event' in deliverables:
        tomorrow = dt.datetime.now() + dt.timedelta(days=1)
        payload["calendar_start"] = tomorrow.strftime("%Y-%m-%dT14:00:00-05:00")
        payload["calendar_end"] = (tomorrow + dt.timedelta(hours=1)).strftime("%Y-%m-%dT15:00:00-05:00")
    
    try:
        response = requests.post(ENDPOINT, json=payload, timeout=10)
        response.raise_for_status()
        result = response.json()
        
        print(f"✅ Task queued: {result['taskId']}")
        print(f"📍 Routed to: {result['routing']['primaryAgent']}")
        print(f"⏱️  ETA: {result['estimatedCompletion']}")
        print(f"📝 Deliverables: {', '.join(result['deliverables'])}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
    except json.JSONDecodeError:
        print(f"❌ Invalid response from server")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 quick-task.py \\"Your task description\\"")
        print("\\nExamples:")
        print('  python3 quick-task.py "Follow up with client about proposal"')
        print('  python3 quick-task.py "Schedule meeting with design team"')
        print('  python3 quick-task.py "Research competitor pricing"')
        sys.exit(1)
    
    task_goal = " ".join(sys.argv[1:])
    priority = "medium"
    
    # Check for priority keywords
    if any(word in task_goal.lower() for word in ['urgent', 'asap', 'critical']):
        priority = "high"
    elif any(word in task_goal.lower() for word in ['someday', 'when possible', 'low priority']):
        priority = "low"
    
    send_task(task_goal, priority=priority)
`;

  return script;
}

// Generate the Python script file
async function createPythonScript() {
  const script = generatePythonScript();
  const fs = require('fs').promises;
  const path = require('path');
  
  const scriptPath = path.join(__dirname, 'quick-task.py');
  await fs.writeFile(scriptPath, script);
  
  // Make executable on Unix systems
  try {
    await execAsync(`chmod +x ${scriptPath}`);
  } catch (e) {
    // Windows doesn't need chmod
  }
  
  console.log(`✅ Created quick-task.py script at ${scriptPath}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--create-script')) {
    await createPythonScript();
    return;
  }
  
  if (args.includes('--help')) {
    console.log(`
SuperChase Intake Testing Tool

Usage:
  node test-intake.js                Run all test scenarios
  node test-intake.js --create-script Create quick-task.py helper script
  node test-intake.js --help         Show this help

Prerequisites:
  1. Start the SuperChase server: node enhanced-coordinator.js --server
  2. Ensure curl is available in your PATH
`);
    return;
  }
  
  await testIntake();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testIntake, generatePythonScript };