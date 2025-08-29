# SuperChase Agent Workflow Templates

## Template: Full Feature Development
```json
{
  "name": "full_feature_development",
  "sequence": ["nova", "claude", "copilot"],
  "description": "Complete feature from research to implementation",
  "stages": {
    "nova": {
      "deliverables": ["market_research", "technical_requirements", "competitive_analysis"],
      "handoff_criteria": "research_complete_with_recommendations"
    },
    "claude": {
      "deliverables": ["system_architecture", "ui_components", "technical_specs", "artifacts"],
      "handoff_criteria": "architecture_approved_components_previewed"
    },
    "copilot": {
      "deliverables": ["working_implementation", "tests", "deployment_ready"],
      "handoff_criteria": "code_complete_tested_deployed"
    }
  }
}
```

## Template: UI/UX Focus
```json
{
  "name": "ui_ux_focus", 
  "sequence": ["claude", "nova"],
  "description": "Design-first approach with validation",
  "stages": {
    "claude": {
      "deliverables": ["wireframes", "components", "interactive_artifacts", "design_specs"],
      "handoff_criteria": "design_complete_with_artifacts"
    },
    "nova": {
      "deliverables": ["usability_analysis", "accessibility_audit", "design_validation"],
      "handoff_criteria": "validation_complete_with_recommendations"
    }
  }
}
```

## Template: Research Deep-Dive
```json
{
  "name": "research_deep_dive",
  "sequence": ["nova", "claude"],
  "description": "Research-heavy tasks with documentation",
  "stages": {
    "nova": {
      "deliverables": ["comprehensive_research", "data_analysis", "insights_summary"],
      "handoff_criteria": "research_validated_insights_extracted"
    },
    "claude": {
      "deliverables": ["structured_documentation", "actionable_recommendations", "decision_framework"],
      "handoff_criteria": "documentation_complete_decisions_ready"
    }
  }
}
```

## Template: Quick Implementation
```json
{
  "name": "quick_implementation",
  "sequence": ["copilot", "claude"],
  "description": "Fast coding with architecture review",
  "stages": {
    "copilot": {
      "deliverables": ["rapid_prototype", "working_code", "basic_tests"],
      "handoff_criteria": "prototype_functional"
    },
    "claude": {
      "deliverables": ["architecture_review", "code_improvements", "documentation"],
      "handoff_criteria": "code_reviewed_documented"
    }
  }
}
```

## Auto-Selection Logic

### Task Analysis Keywords
- **Architecture/Design**: `["system", "architecture", "design", "component", "ui", "ux", "wireframe"]` → Start with Claude
- **Research/Analysis**: `["research", "analyze", "compare", "study", "investigate", "market"]` → Start with Nova  
- **Implementation/Code**: `["build", "implement", "code", "deploy", "fix", "debug"]` → Start with Copilot
- **Content/Documentation**: `["write", "document", "create", "content", "copy"]` → Start with Claude

### Priority Routing
- **High Priority**: Direct to best agent, parallel processing where possible
- **Medium Priority**: Standard sequential workflow
- **Low Priority**: Queue for batch processing

### Human Intervention Triggers
- Conflicting agent recommendations
- Budget/timeline constraints detected  
- Creative direction needed
- Strategic decisions required