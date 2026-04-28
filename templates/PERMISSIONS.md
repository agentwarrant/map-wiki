# Wiki Permissions Guide

This document explains the permission system for the multi-agent wiki vault.

## Overview

The wiki vault is shared by multiple AI agents, each with different access levels. Permissions control which sections each agent can read and write.

## Permission Levels

| Level | Description |
|-------|-------------|
| `admin` | Full access to all sections |
| `contributor` | Can read shared sections, write to assigned projects |
| `read` | Can read shared sections only |
| `blocked` | No access to section |

## Section Permissions

### Shared Sections (All Agents)

| Section | Read | Write | Description |
|---------|------|-------|-------------|
| `entities/` | ✅ All | ✅ All | People, companies, systems |
| `concepts/` | ✅ All | ✅ All | Ideas, patterns, policies |
| `syntheses/` | ✅ All | ✅ All | Compiled summaries |
| `sources/` | ✅ All | ✅ All | Raw imported content |
| `projects/shared/` | ✅ All | ✅ All | Common project knowledge |

### Project Sections (Permission-Gated)

Project sections are configured per-agent in `.permissions.yaml`. Example:

| Section | Marketing Agent | Research Agent | Dev Agent |
|---------|----------------|-----------------|-----------|
| `projects/marketing/` | ✅ R/W | ❌ Blocked | ❌ Blocked |
| `projects/research/` | ❌ Blocked | ✅ R/W | ❌ Blocked |
| `projects/development/` | ❌ Blocked | ❌ Blocked | ✅ R/W |

### Auto-Generated Sections

| Section | Permission | Description |
|---------|------------|-------------|
| `reports/` | Read-only | Auto-generated dashboards |
| `index.md` | Read-only | Auto-generated index |

## Configuration

Permissions are defined in `.permissions.yaml`. To modify:

1. Edit `.permissions.yaml`
2. Add or modify agent entries
3. Specify read/write paths for each agent

Example:
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
      write:
        - "shared/**"
        - "my-project/**"
        - "entities/**"
```

## Path Patterns

Patterns use glob syntax:
- `*` matches any single path segment
- `**` matches any number of path segments
- `shared/**` matches all files under shared/
- `projects/my-project/*` matches direct children only

## Audit Trail

All wiki operations are logged with:
- Agent identity
- Action type (read/write)
- Path accessed
- Timestamp

This enables compliance and debugging.