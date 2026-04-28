# MAP Wiki - Multi Agent Permissions Wiki

A permission system for multi-agent wiki collaboration. Control which agents can read and write to different sections of your wiki vault.

## What is MAP Wiki?

MAP Wiki provides:
- **Permission-based access control** - Define which agents can read/write to specific wiki sections
- **Multi-project support** - Separate permissions for different projects while sharing common knowledge
- **Audit logging** - Track all access attempts for compliance
- **OpenClaw integration** - Works with the built-in wiki tools and memory-wiki plugin

## How it Works

### 1. Agent Reads Wiki
```
AGENT READS WIKI
 └─> wiki_get("shared/competitor-analysis")
     └─> Permission middleware checks: can agent read /shared/?
     └─> Returns page content
```

### 2. Agent Writes to Wiki
```
AGENT WRITES TO WIKI
 └─> wiki_apply("syntheses/project-q2-roadmap", body="...")
     └─> Permission middleware checks: can agent write /syntheses/?
     └─> Writes page with frontmatter:
         ---
         author: agent:project-agent
         confidence: 0.85
         evidence:
           - source: sources/project-call-notes.md
             weight: 0.9
         updated: 2026-04-28
         ---
```

### 3. External Agent (Claude Code, Cursor, etc.)
```
EXTERNAL AGENT
 └─> Uses .skills/ from obsidian-wiki pattern
     └─> Reads SKILLS.md for instructions
     └─> Writes to /shared/ (only path it has access to)
     └─> Add to .manifest.json for delta tracking
```

### 4. Multi-Agent Collaboration
```
MULTI-AGENT COLLABORATION
 └─> Agent A reads /shared/entities/company.md
 └─> Agent B reads /projects/marketing/campaign.md
 └─> Agent C blocked from /projects/research/ (not authorized)
 └─> All agents can read /entities/ and /concepts/
 └─> Only authorized agents can write to project sections
```

## Use Cases

- **Multi-agent setups** - Different agents handle different domains while sharing common knowledge
- **Client projects** - Isolate project-specific knowledge while sharing team knowledge
- **Cross-team collaboration** - Share entities and concepts across teams, keep project or internal team work private

## Quick Start

### 1. Install

```bash
# Clone into your OpenClaw wiki directory
cd ~/.openclaw/wiki/main/.openclaw-wiki
git clone https://github.com/YOUR_ORG/map-wiki.git .
# Or copy the files manually
```

### 2. Configure Permissions

Create `.permissions.yaml` in your wiki root:

```yaml
version: 1

agents:
  main-agent:
    id: "agent:main-agent"
    role: admin
    description: "Main assistant agent"
    paths:
      read: ["*"]
      write: ["*"]

  marketing-agent:
    id: "agent:marketing-agent"
    role: contributor
    description: "Marketing agent"
    paths:
      read:
        - "shared/**"
        - "marketing/**"
        - "entities/**"
        - "concepts/**"
      write:
        - "shared/**"
        - "marketing/**"
        - "entities/**"

  research-agent:
    id: "agent:research-agent"
    role: contributor
    description: "Research agent"
    paths:
      read:
        - "shared/**"
        - "research/**"
        - "entities/**"
      write:
        - "shared/**"
        - "research/**"
```

### 3. Create Project Directories

```bash
mkdir -p ~/.openclaw/wiki/main/projects/marketing
mkdir -p ~/.openclaw/wiki/main/projects/research
mkdir -p ~/.openclaw/wiki/main/projects/shared
```

### 4. Use in Your Agent

```javascript
const { UnifiedWikiTools } = require('./.openclaw-wiki/wiki-tools.js');

// Initialize with agent ID
const wiki = new UnifiedWikiTools(wikiPath, 'marketing-agent');

// Check permissions before operations
if (wiki.canRead('projects/marketing/content.md')) {
  const result = wiki.readFile('projects/marketing/content.md');
  // ... process content
}

// Filter search results by permission
const allResults = [...]; // from wiki_search
const filteredResults = wiki.filterSearchResults(allResults, 'marketing-agent');
```

## Directory Structure

```
your-wiki/
├── .permissions.yaml          # Agent permissions configuration
├── .manifest.json             # Delta tracking
├── AGENTS.md                  # Guide for agents
├── WIKI.md                    # Wiki documentation
├── PERMISSIONS.md             # Human-readable permission guide
├── SKILLS.md                  # Available wiki skills
├── entities/                  # People, companies, systems (shared)
├── concepts/                  # Ideas, patterns, policies (shared)
├── syntheses/                 # Compiled summaries (shared)
├── projects/                  # Project-specific knowledge
│   ├── shared/                # Common to all projects
│   ├── marketing/             # Marketing team knowledge
│   ├── research/              # Research team knowledge
│   └── ...                    # Other project directories
└── .openclaw-wiki/
    ├── permission-middleware.js
    ├── wiki-tools.js
    └── test-permissions.js
```

## Permission Levels

| Level | Description |
|-------|-------------|
| `admin` | Full access to all sections |
| `contributor` | Can read shared sections, write to assigned projects |
| `read` | Can read shared sections only |
| `blocked` | No access to section |

## Section Permissions

### Shared Sections (Default)

| Section | Read | Write |
|---------|------|-------|
| `entities/` | All agents | All agents |
| `concepts/` | All agents | All agents |
| `syntheses/` | All agents | All agents |
| `projects/shared/` | All agents | All agents |

### Project Sections (Permission-Gated)

| Section | Permission | Description |
|---------|------------|-------------|
| `projects/marketing/` | Configurable | Marketing team knowledge |
| `projects/research/` | Configurable | Research team knowledge |

Configure in `.permissions.yaml` per agent.

## Skills

MAP Wiki provides reusable skills for agents:

### wiki-ingest
Import content into the wiki with permission checks.

### wiki-query
Search wiki with permission-filtered results.

### wiki-synthesize
Create synthesis pages from multiple sources.

### wiki-claim
Add structured claims with evidence.

See `skills/` directory for skill definitions.

## Testing

Run the test suite to verify your setup:

```bash
cd ~/.openclaw/wiki/main/.openclaw-wiki
node test-permissions.js
node test-wiki-tools.js
```

## API Reference

### WikiPermissionMiddleware

```javascript
const middleware = new WikiPermissionMiddleware(wikiPath, 'agent-id');

// Check permissions
middleware.canRead('projects/marketing/file.md');
middleware.canWrite('projects/marketing/file.md');

// Filter paths
middleware.filterPaths(['/path1', '/path2'], 'agent-id');

// Get agent info
middleware.isAdmin('agent-id');
middleware.getAllowedPaths('agent-id');
```

### UnifiedWikiTools

```javascript
const wiki = new UnifiedWikiTools(wikiPath, 'agent-id');

// Direct file operations with permission checks
wiki.readFile('path/to/file.md');
wiki.writeFile('path/to/file.md', 'content');

// List files with permission filter
wiki.listFiles('projects');

// Filter search results
wiki.filterSearchResults(results);

// Permission checks
wiki.canRead('path');
wiki.canWrite('path');

// Get audit log
wiki.getAuditLog();
```

## Roadmap

### Future: Agent Identity & Cryptographic Verification (Phase 4)

The current implementation uses agent IDs defined in configuration files. For single-user setups where all agents are controlled by the same person, this is sufficient.

**Future work for multi-user scenarios:**

- **Cryptographic Agent Identity** - Each agent has a verifiable cryptographic identity
- **Signed Operations** - Wiki operations signed by agent's private key
- **Verification Layer** - Middleware verifies agent signatures before operations
- **Cross-Organization Trust** - Trust agents from different organizations
- **External Agent Verification** - Verify identity of external agents (Claude Code, Cursor, etc.)

This would enable:
- Multi-user wiki sharing with verified agent identities
- Cross-organization collaboration
- Compliance and audit trails with cryptographic proof
- Trusted external agent contributions

**Status:** Deferred until needed for multi-user/cross-org scenarios.

## Contributing

Contributions welcome! See `CONTRIBUTING.md` for guidelines.

## License

MIT License - See `LICENSE` for details.