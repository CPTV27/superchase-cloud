# SuperChase Test Digest — Claude Indexing

## Projects

### Band1_TestReel
- Artist: The Echoes
- Goals: Promote new single, Capture behind-the-scenes vibe, Make a 30s Instagram reel
- Director: Ethan Cole
- Producer: Ava Chen
- Style: Vintage Glow
- Constraints: budget=low, security_mode=LOCAL_ONLY
- Expected Artifacts: brief, treatment, graphics plan, timeline, approval packet, distribution meta

### Band2_HighEnergyReel
- Artist: Voltage Kids
- Goals: Create a hype teaser, Show off stage energy, Target TikTok trends
- Director: Mia Torres
- Producer: Riley Quinn
- Style: Neon Pulse
- Constraints: budget=medium, security_mode=LOCAL_ONLY
- Expected Artifacts: brief, treatment, graphics plan, timeline, approval packet, distribution meta

### Band3_StoryDrivenClip
- Artist: The Midnight Ramblers
- Goals: Tell a gritty backstory, Highlight dialogue moments, Make a cinematic IG Reel
- Director: Lucas Reid
- Producer: Lila Foster
- Style: Epic Tale
- Constraints: budget=high, security_mode=LOCAL_ONLY
- Expected Artifacts: brief, treatment, graphics plan, timeline, approval packet, distribution meta

## Tagging & Indexing Guidance
- Use project name, artist, director, producer, style, and constraints as primary keys.
- Track deltas by comparing timeline, graphics, and approval packets across runs.
- Retrieval prompt: "Summarize all SuperChase test projects and list key differences in style, director, and deliverables."

## Schema Keys
- kind, payload, project, artist, goals, chosen_director, chosen_producer, style, constraints, expected_artifacts

## Delta Tracking
- Compare approval packets and distribution meta for changes week-to-week.
- Note any new deliverables or changes in constraints.

---
Ready for Claude ingestion and retrieval.
