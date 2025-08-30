// SuperChase Creative Pipeline - Producer → Director → Designer → Editor
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log('🚀 SuperChase — Creative Pipeline Runner');

// Parse command line arguments
const args = process.argv.slice(2);
let briefPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--file' && args[i + 1]) {
    briefPath = args[i + 1];
    break;
  }
}

if (!briefPath) {
  console.log('Usage: node index.js --file path/to/brief.json');
  process.exit(1);
}

// Main pipeline execution
async function runBrief(briefPath) {
  console.log('🎯 runBrief called with:', briefPath);
  console.log('🎯 Brief exists:', fs.existsSync(briefPath));
  
  if (!fs.existsSync(briefPath)) {
    console.error('❌ Brief file not found:', briefPath);
    process.exit(1);
  }

  const brief = JSON.parse(fs.readFileSync(briefPath, 'utf-8'));
  console.log('📋 Loaded brief:', brief.project_name);
  
  // Extract project name for output directory
  const projectName = brief.project_name.toLowerCase().replace(/\s+/g, '_');
  const outputDir = `./data/docs/runs/${projectName}`;
  
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('📁 Output directory:', outputDir);

  // Pipeline stages
  const stages = ['producer', 'director', 'designer', 'editor', 'approver', 'distributor'];
  let currentOutput = brief;

  for (const stage of stages) {
    console.log(`\n🎬 Running ${stage.toUpperCase()} stage...`);
    currentOutput = await runStage(stage, currentOutput, outputDir);
  }

  console.log(`\n✅ Pipeline complete! Check ${outputDir} for results.`);
}

async function runStage(stage, input, outputDir) {
  const stagePrompts = {
    producer: `As the PRODUCER, analyze this project brief and create a comprehensive production plan. Focus on scope, timeline, resources, and deliverables. Output structured production specifications.`,
    
    director: `As the DIRECTOR, take this production plan and create detailed creative direction. Define the vision, user experience, and creative requirements. Output comprehensive creative brief.`,
    
    designer: `As the DESIGNER, take this creative brief and create detailed design specifications. Define UI/UX, technical architecture, and visual design. Output design system and specifications.`,
    
    editor: `As the EDITOR, review and refine all previous work. Ensure consistency, quality, and completeness. Output polished, production-ready specifications.`,
    
    approver: `As the APPROVER, conduct final quality review and sign-off. Identify any gaps or improvements needed. Output approval report and next steps.`,
    
    distributor: `As the DISTRIBUTOR, create deployment and distribution plan. Define launch strategy, rollout phases, and success metrics. Output distribution strategy.`
  };

  const prompt = `${stagePrompts[stage]}\n\nInput:\n${JSON.stringify(input, null, 2)}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.7
    });

    const result = {
      stage,
      timestamp: new Date().toISOString(),
      input: stage === 'producer' ? input : `Previous stage output`,
      output: completion.choices[0].message.content,
      usage: completion.usage
    };

    // Save stage output
    const filename = `${stage}_output.json`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
    
    console.log(`💾 Saved ${stage} output to ${filename}`);
    return result;

  } catch (error) {
    console.error(`❌ ${stage} stage failed:`, error.message);
    throw error;
  }
}

// Run the pipeline
if (briefPath) {
  runBrief(briefPath).catch(console.error);
}