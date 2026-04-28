# Wiki Skills

This vault supports multi-agent collaboration with permission-based access control.

## Available Skills

### wiki-ingest
Import content into the wiki with permission checks.

**Usage:**
```
/wiki-ingest <source-path> [--target <wiki-path>]
```

**Permission check:** Agent must have write access to target path.

**Process:**
1. Read source file (markdown, PDF, JSONL, image)
2. Extract concepts, entities, claims
3. Merge into existing wiki pages
4. Update .manifest.json for delta tracking

### wiki-query
Search wiki with permission-filtered results.

**Usage:**
```
/wiki-query <search-text> [--section <section>]
```

**Permission check:** Results filtered by agent's read permissions.

**Process:**
1. Search wiki pages using semantic or keyword matching
2. Filter results by agent's allowed paths
3. Return relevant pages with snippets

### wiki-synthesize
Create a synthesis page from multiple sources.

**Usage:**
```
/wiki-synthesize <topic> [--sources <source-ids>]
```

**Permission check:** Agent must have write access to /syntheses/.

**Process:**
1. Identify relevant source pages
2. Extract key information
3. Create structured synthesis with claims and evidence
4. Link back to sources

### wiki-claim
Add a structured claim with evidence.

**Usage:**
```
/wiki-claim <entity> --claim "<text>" --evidence <source-id>
```

**Permission check:** Agent must have write access to target entity/concept.

**Process:**
1. Validate claim text
2. Link to evidence source
3. Add confidence score
4. Update entity page with claim

### wiki-status
Show wiki health and statistics.

**Usage:**
```
/wiki-status
```

**Permission check:** All agents can run this.

**Output:**
- Page counts by section
- Orphan pages
- Stale pages
- Contradiction alerts

## Permission System

Each skill checks `.permissions.yaml` before executing:

1. **Identify agent** - From OpenClaw config or SKILLS.md context
2. **Check path permission** - Read/write access to target
3. **Filter results** - Remove unauthorized content from responses
4. **Log action** - Record agent, action, path, timestamp

## Vault Structure

```
wiki/
├── .manifest.json          # Delta tracking
├── .permissions.yaml      # Agent permissions
├── AGENTS.md              # Agent bootstrap guide
├── SKILLS.md              # This file
├── sources/               # Raw imported content
├── entities/              # People, companies, systems
├── concepts/              # Ideas, patterns, policies
├── syntheses/             # Compiled summaries
├── reports/               # Auto-generated dashboards
├── projects/              # Project-specific knowledge
│   ├── shared/            # Common to all projects
│   └── ...                # Project directories
├── _attachments/          # Binary attachments
├── _views/                # Obsidian view configurations
└── .openclaw-wiki/        # OpenClaw compiled digests
```

## Programmatic Usage

```javascript
const { UnifiedWikiTools } = require('./.openclaw-wiki/wiki-tools.js');

const wiki = new UnifiedWikiTools(wikiPath, 'my-agent-id');

// Check permissions before operations
if (wiki.canRead('projects/my-project/file.md')) {
  const result = wiki.readFile('projects/my-project/file.md');
  if (result.success) {
    console.log(result.content);
  }
}

// Filter search results by permission
const filteredResults = wiki.filterSearchResults(results);

// Get audit log
const auditLog = wiki.getAuditLog();
```