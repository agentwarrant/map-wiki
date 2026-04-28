# Using MAP Wiki with OpenClaw

## Integration Steps

### 1. Install MAP Wiki

```bash
cd ~/.openclaw/wiki/main/.openclaw-wiki
git clone https://github.com/YOUR_ORG/map-wiki.git .
```

Or copy files manually:
```bash
cp permission-middleware.js ~/.openclaw/wiki/main/.openclaw-wiki/
cp wiki-tools.js ~/.openclaw/wiki/main/.openclaw-wiki/
cp test-permissions.js ~/.openclaw/wiki/main/.openclaw-wiki/
cp test-wiki-tools.js ~/.openclaw/wiki/main/.openclaw-wiki/
```

### 2. Configure Permissions

Create `.permissions.yaml` in your wiki root:
```bash
cp templates/permissions.yaml ~/.openclaw/wiki/main/.permissions.yaml
```

Edit the file to match your agent setup:
```yaml
agents:
  my-agent:
    id: "agent:my-agent"
    role: contributor
    paths:
      read: ["shared/**", "my-project/**"]
      write: ["shared/**", "my-project/**"]
```

### 3. Create Project Directories

```bash
mkdir -p ~/.openclaw/wiki/main/projects/shared
mkdir -p ~/.openclaw/wiki/main/projects/my-project
```

### 4. Use in Your Agent

Add to your agent's AGENTS.md or MEMORY.md:
```markdown
## Wiki Permissions

Your agent has access to:
- shared/** - Read and write
- my-project/** - Read and write
- entities/** - Read and write
- concepts/** - Read and write

Use `wiki-tools.js` to check permissions before operations.
```

### 5. Use in Skills

Create a skill that uses the permission middleware:
```javascript
// In your skill file
const { UnifiedWikiTools } = require('/path/to/.openclaw-wiki/wiki-tools.js');

module.exports = {
  name: 'my-wiki-skill',
  description: 'My wiki skill with permission checks',
  execute: async (params) => {
    const wiki = new UnifiedWikiTools(wikiPath, 'my-agent-id');
    
    if (!wiki.canWrite('projects/my-project/file.md')) {
      return 'Permission denied';
    }
    
    const result = wiki.writeFile('projects/my-project/file.md', params.content);
    return result;
  }
};
```

## Agent Configuration

### Main Agent (Admin)

Your main agent should have admin access:
```yaml
agents:
  my-main-agent:
    id: "agent:my-main-agent"
    role: admin
    paths:
      read: ["*"]
      write: ["*"]
```

### Project Agents

Project-specific agents should have limited access:
```yaml
agents:
  my-project-agent:
    id: "agent:my-project-agent"
    role: contributor
    paths:
      read:
        - "shared/**"
        - "my-project/**"
        - "entities/**"
        - "concepts/**"
      write:
        - "shared/**"
        - "my-project/**"
        - "entities/**"
```

## Testing

Run tests after installation:
```bash
cd ~/.openclaw/wiki/main/.openclaw-wiki
node test-permissions.js
node test-wiki-tools.js
```

## Troubleshooting

### "Permissions file not found"

Make sure `.permissions.yaml` exists in your wiki root:
```bash
ls -la ~/.openclaw/wiki/main/.permissions.yaml
```

### "Permission denied" for admin agent

Check that your admin agent has `role: admin`:
```yaml
agents:
  my-admin:
    role: admin  # This gives full access
```

### Filtered results are empty

Make sure the path patterns match:
- Use `**` for recursive matching
- Use `*` for single segment matching
- Pattern `my-project/**` matches `my-project/dir/file.md`