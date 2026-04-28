# Installing MAP Wiki

## Prerequisites

- Node.js 18+ installed
- An existing OpenClaw installation with wiki vault

## Quick Install

```bash
# Navigate to your wiki vault
cd ~/.openclaw/wiki/main/.openclaw-wiki

# Download MAP Wiki
curl -L https://github.com/YOUR_ORG/map-wiki/archive/main.tar.gz | tar xz --strip-components=1

# Or clone with git
git clone https://github.com/YOUR_ORG/map-wiki.git .
```

## Manual Install

1. **Copy the permission modules:**
```bash
mkdir -p ~/.openclaw/wiki/main/.openclaw-wiki
cp permission-middleware.js ~/.openclaw/wiki/main/.openclaw-wiki/
cp wiki-tools.js ~/.openclaw/wiki/main/.openclaw-wiki/
```

2. **Copy the test scripts:**
```bash
cp test-permissions.js ~/.openclaw/wiki/main/.openclaw-wiki/
cp test-wiki-tools.js ~/.openclaw/wiki/main/.openclaw-wiki/
```

3. **Create the permissions configuration:**
```bash
cp templates/permissions.yaml ~/.openclaw/wiki/main/.permissions.yaml
# Edit with your agent configurations
```

4. **Create the manifest file:**
```bash
cp templates/manifest.json ~/.openclaw/wiki/main/.manifest.json
```

5. **Create project directories:**
```bash
mkdir -p ~/.openclaw/wiki/main/projects/shared
mkdir -p ~/.openclaw/wiki/main/projects/your-project-name
```

6. **Add documentation:**
```bash
cp templates/AGENTS.md ~/.openclaw/wiki/main/AGENTS.md
cp templates/PERMISSIONS.md ~/.openclaw/wiki/main/PERMISSIONS.md
cp templates/SKILLS.md ~/.openclaw/wiki/main/SKILLS.md
cp templates/WIKI.md ~/.openclaw/wiki/main/WIKI.md
```

## Verify Installation

```bash
cd ~/.openclaw/wiki/main/.openclaw-wiki
node test-permissions.js
```

Expected output:
```
=== Wiki Permission Middleware Test ===
✅ Permissions loaded
✅ Agents configured
=== All Tests Passed ===
```

## Configure Your Agents

Edit `.permissions.yaml` to define your agents and their permissions:

```yaml
agents:
  my-agent:
    id: "agent:my-agent"
    role: contributor
    description: "My agent"
    paths:
      read:
        - "shared/**"
        - "my-project/**"
      write:
        - "shared/**"
        - "my-project/**"
```

## Next Steps

1. Add your agents to the configuration
2. Create project directories under `projects/`
3. Use the UnifiedWikiTools in your agents
4. Test permissions before operations

See the README.md for full documentation.