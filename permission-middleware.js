/**
 * Wiki Permission Middleware
 * Checks agent permissions before wiki operations
 * 
 * Usage:
 *   const { WikiPermissionMiddleware } = require('./permission-middleware.js');
 *   const middleware = new WikiPermissionMiddleware('/path/to/wiki', 'agent-id');
 *   
 *   // Check permissions
 *   if (middleware.canRead('projects/marketing/file.md')) {
 *     // Agent can read this path
 *   }
 * 
 * License: MIT
 */

const fs = require('fs');
const path = require('path');

class WikiPermissionMiddleware {
  constructor(wikiPath, agentId = 'default-agent') {
    this.wikiPath = wikiPath || path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'wiki', 'main');
    this.agentId = agentId;
    this.permissions = null;
    this.auditLog = [];
  }

  /**
   * Simple YAML parser for the permissions file
   * Handles the specific structure of .permissions.yaml
   */
  parseYamlSimple(content) {
    const result = { agents: {}, version: 1 };
    let currentAgent = null;
    let inRead = false;
    let inWrite = false;

    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('#') || line.trim() === '') continue;

      const trimmed = line.trimStart();
      const indent = line.length - trimmed.length;

      if (trimmed.startsWith('version:')) {
        result.version = parseInt(trimmed.split(':')[1].trim()) || 1;
        continue;
      }

      // Agent definitions (2 spaces indent)
      if (indent === 2 && trimmed.startsWith('id:') === false && 
          trimmed.startsWith('role:') === false && trimmed.startsWith('description:') === false &&
          trimmed.startsWith('paths:') === false && trimmed.startsWith('read:') === false &&
          trimmed.startsWith('write:') === false && trimmed.startsWith('contexts:') === false &&
          !trimmed.startsWith('-')) {
        currentAgent = trimmed.replace(/:$/, '').trim();
        result.agents[currentAgent] = {
          id: '',
          role: 'contributor',
          description: '',
          paths: { read: [], write: [] },
          contexts: []
        };
        inRead = false;
        inWrite = false;
        continue;
      }

      if (!currentAgent) continue;

      // Agent properties (4 spaces indent)
      if (indent === 4) {
        if (trimmed.startsWith('id:')) {
          result.agents[currentAgent].id = trimmed.split(':')[1].trim().replace(/"/g, '');
        } else if (trimmed.startsWith('role:')) {
          result.agents[currentAgent].role = trimmed.split(':')[1].trim();
        } else if (trimmed.startsWith('description:')) {
          result.agents[currentAgent].description = trimmed.split(':')[1].trim().replace(/"/g, '');
        }
        continue;
      }

      // Paths section (6 spaces indent)
      if (indent === 6) {
        if (trimmed.startsWith('read:')) {
          inRead = true;
          inWrite = false;
          result.agents[currentAgent].paths.read = [];
        } else if (trimmed.startsWith('write:')) {
          inRead = false;
          inWrite = true;
          result.agents[currentAgent].paths.write = [];
        }
        continue;
      }

      // Path entries (8 spaces indent, starts with -)
      if (indent === 8 && trimmed.startsWith('-')) {
        const value = trimmed.substring(1).trim().replace(/"/g, '');
        if (inRead) {
          result.agents[currentAgent].paths.read.push(value);
        } else if (inWrite) {
          result.agents[currentAgent].paths.write.push(value);
        }
      }
    }

    return result;
  }

  /**
   * Load permissions from .permissions.yaml
   */
  loadPermissions() {
    const permPath = path.join(this.wikiPath, '.permissions.yaml');
    if (!fs.existsSync(permPath)) {
      throw new Error(`Permissions file not found: ${permPath}`);
    }
    const content = fs.readFileSync(permPath, 'utf8');
    this.permissions = this.parseYamlSimple(content);
    return this.permissions;
  }

  /**
   * Get agent configuration
   */
  getAgentConfig(agentId = null) {
    if (!this.permissions) this.loadPermissions();
    const id = agentId || this.agentId;
    return this.permissions.agents[id] || null;
  }

  /**
   * Check if agent has admin role
   */
  isAdmin(agentId = null) {
    const config = this.getAgentConfig(agentId);
    return config?.role === 'admin';
  }

  /**
   * Match path against pattern (supports glob patterns)
   */
  matchPath(pattern, testPath) {
    const regexPattern = pattern
      .replace(/\*\*/g, '<<DOUBLESTAR>>')
      .replace(/\*/g, '[^/]*')
      .replace(/<<DOUBLESTAR>>/g, '.*')
      .replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(testPath);
  }

  /**
   * Check if agent can read a path
   */
  canRead(wikiPath, agentId = null) {
    const config = this.getAgentConfig(agentId);
    if (!config) return false;

    if (config.role === 'admin') {
      this.log('read', wikiPath, true, agentId);
      return true;
    }

    const normalizedPath = wikiPath.replace(/^\/+/, '').replace(/^projects\//, '');
    const readPatterns = config.paths?.read || [];
    
    for (const pattern of readPatterns) {
      if (this.matchPath(pattern, normalizedPath)) {
        this.log('read', wikiPath, true, agentId);
        return true;
      }
    }

    this.log('read', wikiPath, false, agentId);
    return false;
  }

  /**
   * Check if agent can write to a path
   */
  canWrite(wikiPath, agentId = null) {
    const config = this.getAgentConfig(agentId);
    if (!config) return false;

    if (config.role === 'admin') {
      this.log('write', wikiPath, true, agentId);
      return true;
    }

    const normalizedPath = wikiPath.replace(/^\/+/, '').replace(/^projects\//, '');
    const writePatterns = config.paths?.write || [];
    
    for (const pattern of writePatterns) {
      if (this.matchPath(pattern, normalizedPath)) {
        this.log('write', wikiPath, true, agentId);
        return true;
      }
    }

    this.log('write', wikiPath, false, agentId);
    return false;
  }

  /**
   * Filter an array of paths by read permissions
   */
  filterPaths(paths, agentId = null) {
    return paths.filter(p => this.canRead(p, agentId));
  }

  /**
   * Log access attempt
   */
  log(action, wikiPath, granted, agentId = null) {
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      agent: agentId || this.agentId,
      action,
      path: wikiPath,
      granted
    });
  }

  /**
   * Get audit log
   */
  getAuditLog() {
    return this.auditLog;
  }

  /**
   * Get all allowed paths for an agent
   */
  getAllowedPaths(agentId = null) {
    const config = this.getAgentConfig(agentId);
    if (!config) return { read: [], write: [] };
    return {
      read: config.paths?.read || [],
      write: config.paths?.write || []
    };
  }

  /**
   * Get all agents and their roles
   */
  getAllAgents() {
    if (!this.permissions) this.loadPermissions();
    const agents = {};
    for (const [id, config] of Object.entries(this.permissions.agents || {})) {
      agents[id] = {
        role: config.role,
        description: config.description
      };
    }
    return agents;
  }
}

module.exports = { WikiPermissionMiddleware };