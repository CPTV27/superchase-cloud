# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SuperChase is an OpenAI-powered agentic system for music video/reel production orchestration. It routes creative tasks between multiple AI models (GPT-4o, Claude, Gemini, Grok) and manages a multi-agent workflow from Producer → Director → Designer → Editor → Approver → Distributor.

## Essential Commands

```bash
# Install dependencies
npm install

# Run the main orchestration system
node index.js

# Generate system status report
node generate_status.js

# Set OpenAI API key (required)
export OPENAI_API_KEY=sk-...
```

## Architecture

### Core Components

- **index.js**: Main bootstrap and orchestration entry point
- **super_chase_agents.manifest.json**: Complete system configuration including agents, tools, workflows, and creative personas
- **generate_status.js**: System health and status reporting utility

### Data Organization

```
data/
├── docs/
│   ├── routed/           # External LLM routing outputs
│   ├── briefings/        # Project briefings and templates
│   ├── tests/            # Test data and sample briefs
│   └── system/           # System documentation and configs
└── sessions/             # Session media storage
```

### Agent Framework

The manifest defines 8 specialized agents:
- **orchestrator**: Main coordination agent (GPT-4o)
- **router**: Routes tasks to external LLMs (GPT-4o-mini)
- **claude_librarian**: Manages Claude documentation digests
- **producer**: Artist interviews and brief generation
- **director**: Treatment and shot list creation
- **designer**: Graphics and asset planning
- **editor**: Timeline assembly and deliverables
- **approver**: Artist approval workflow
- **distributor**: Social media packaging and distribution

### Tools & Capabilities

Key tools defined in manifest:
- `route_to_external_llm`: Route tasks to Claude/Gemini/Grok
- `send_email`: Email with attachments (currently disabled)
- `save_doc`: Persist Markdown/JSON to NAS storage
- `dispatch_task`: Send to external systems (Notion/Jira)
- `schedule_cron`: Create recurring schedules
- `metrics_fetch`: Pull platform engagement data

## Configuration

### Environment Variables
- `OPENAI_API_KEY`: Required for GPT models
- `MANIFEST_PATH`: Path to manifest file (defaults to ./super_chase_agents.manifest.json)
- `SMTP_URL`: For email functionality (currently disabled)

### Creative Personas

The system includes 5 director personas (Ethan Cole, Mia Torres, Lucas Reid, Nora Blake, Jayden Park) and 5 producer personas (Sam Rivera, Ava Chen, Riley Quinn, Owen Hayes, Lila Foster), each with distinct creative styles.

### Security & Storage

- **Local-only policy**: Raw media stays on NAS
- **Cloud-allowed**: Briefs and metadata only
- **Blocked exports**: raw_audio, raw_video, multitracks
- **Storage paths**: Configured for Windows (C:\SuperChase_OpenAI-Agentic\data)

## Workflows

1. **External Question Routing**: router → orchestrator
2. **Claude Documentation Digest**: Scheduled Mon/Thu 14:00 UTC
3. **Production Pipeline**: Full 6-stage creative workflow

## Development Notes

- Uses ES modules (`"type": "module"`)
- Minimal dependencies: openai, nodemailer
- Bootstrap system seeds initial docs and schedules
- All agents output JSON handoffs for traceability
- System generates status reports in system_status.json

## Testing

The system includes test briefs in `data/docs/tests/` for various scenarios including music projects and authentication systems.