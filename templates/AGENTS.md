# Wiki Agent Guide

This vault is a unified knowledge base supporting multi-agent collaboration with permission-based access control.

## For All Agents

### Core Principles

1. **Treat generated blocks as plugin-owned.**
   - Content inside `<!-- openclaw:... -->` markers is managed by the wiki system.
   - Preserve human notes outside managed markers.

2. **Prefer source-backed claims.**
   - Always cite sources when making claims.
   - Use structured `claims` with evidence rather than burying beliefs in prose.

3. **Check permissions before operations.**
   - Verify read/write access to paths.
   - Respect permission boundaries between projects.

### Vault Structure

```
wiki/
├── sources/               # Raw content (ingested, not edited directly)
├── entities/               # People, companies, projects, systems
├── concepts/               # Ideas, patterns, policies, abstractions
├── syntheses/               # Compiled summaries and maintained rollups
├── reports/               # Auto-generated dashboards
├── projects/               # Project-specific knowledge (permission-gated)
│   ├── shared/            # Common knowledge
│   ├── project-a/         # Project A (specific agents)
│   └── project-b/         # Project B (specific agents)
└── .openclaw-wiki/        # Compiled digests and cache
```

### Permission System

- Check `.permissions.yaml` for your allowed paths.
- Shared sections (`entities/`, `concepts/`, `syntheses/`) are readable by all agents.
- Project sections are permission-gated.
- Reports are read-only for all agents.

### Permission Levels

| Level | Description |
|-------|-------------|
| `admin` | Full access to all sections |
| `contributor` | Can read shared sections, write to assigned projects |
| `read` | Can read shared sections only |
| `blocked` | No access to section |

## Using the Permission Middleware

```javascript
const { UnifiedWikiTools } = require('./.openclaw-wiki/wiki-tools.js');

// Initialize with your agent ID
const wiki = new UnifiedWikiTools(wikiPath, 'my-agent-id');

// Check permissions before operations
if (wiki.canRead('projects/my-project/file.md')) {
  const result = wiki.readFile('projects/my-project/file.md');
  // Process content...
}

// Filter results by permission
const filteredResults = wiki.filterSearchResults(results, 'my-agent-id');
```

## Making Claims

When adding knowledge:

```yaml
---
title: Entity Name
claims:
  - id: claim-001
    text: "The entity has this property."
    confidence: 0.85
    evidence:
      - source: sources/meeting-notes.md
        weight: 0.9
    updated: 2026-04-28
---
```

## Contradiction Handling

If you find contradictory claims:
1. Check the confidence scores.
2. Check the evidence dates.
3. Prefer newer, higher-confidence claims.
4. Flag the contradiction for human review.

## Notes
<!-- openclaw:human:start -->
<!-- openclaw:human:end -->