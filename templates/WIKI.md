# Multi-Agent Permissions Wiki

This vault supports multi-agent collaboration with permission-based access control.

## Vault Modes

- **Vault mode:** `bridge` (imports from active memory)
- **Render mode:** `native` (Obsidian-compatible markdown)
- **Search corpus default:** `wiki`

## Architecture

- **Raw sources** remain the evidence layer (`sources/`)
- **Wiki pages** are the human-readable synthesis layer
- **Compiled digest** is agent-facing (`.openclaw-wiki/cache/agent-digest.json`)
- **Structured claims** for LCM integration (`claims.jsonl`)

## Sections

### Shared Knowledge (All Agents)

| Directory | Purpose |
|-----------|---------|
| `sources/` | Raw imported content and bridge pages |
| `entities/` | People, companies, projects, systems |
| `concepts/` | Ideas, patterns, policies, abstractions |
| `syntheses/` | Compiled summaries and maintained rollups |
| `reports/` | Auto-generated dashboards (read-only) |

### Project-Specific (Permission-Gated)

Project directories are permission-gated based on agent roles.

| Directory | Permission |
|-----------|------------|
| `projects/shared/` | All agents with contributor role |
| `projects/[project]/` | Agents with explicit read/write access |

## Permission System

See `.permissions.yaml` for agent permissions.

**Quick reference:**
- **admin** - Full access to everything
- **contributor** - Read shared sections, write to assigned projects
- **read** - Read shared sections only
- **blocked** - No access

## Multi-Agent Compatibility

### Using Permission Middleware

```javascript
const { UnifiedWikiTools } = require('./.openclaw-wiki/wiki-tools.js');

const wiki = new UnifiedWikiTools(wikiPath, 'my-agent-id');

// Check permissions before operations
if (wiki.canRead('projects/my-project/file.md')) {
  const result = wiki.readFile('projects/my-project/file.md');
}
```

## Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Agent bootstrap guide |
| `SKILLS.md` | Wiki skills documentation |
| `PERMISSIONS.md` | Human-readable permission guide |
| `.permissions.yaml` | Machine-readable permissions |
| `.manifest.json` | Delta tracking |
| `.openclaw-wiki/` | Compiled digests and tools |

## Notes
<!-- openclaw:human:start -->
<!-- openclaw:human:end -->