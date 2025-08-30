// generate_status.js — Dynamic system status generator for SuperChase
import fs from 'fs';
import path from 'path';

function fileExists(p) {
  try { return fs.existsSync(p); } catch { return false; }
}
function getLatestFile(dir) {
  if (!fileExists(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => ({ name: f, time: fs.statSync(path.join(dir, f)).mtimeMs }));
  if (!files.length) return null;
  files.sort((a, b) => b.time - a.time);
  return files[0].name;
}

const status = {
  date: new Date().toISOString(),
  manifest_exists: fileExists('./super_chase_agents.manifest.json'),
  routed_folder_exists: fileExists('./data/docs/routed'),
  latest_routed_file: getLatestFile('./data/docs/routed'),
  agents_enabled: ['orchestrator'],
  errors: [],
  last_run_command: process.env.LAST_RUN_COMMAND || '',
  last_exit_code: process.env.LAST_EXIT_CODE || ''
};

fs.writeFileSync('./system_status.json', JSON.stringify(status, null, 2));
console.log('System status written to system_status.json');
