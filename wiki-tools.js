/**
 * Unified Wiki Tools
 * Permission-aware wrappers for wiki operations
 * 
 * Usage:
 *   const { UnifiedWikiTools } = require('./wiki-tools.js');
 *   const wiki = new UnifiedWikiTools('/path/to/wiki', 'agent-id');
 *   
 *   // Read file with permission check
 *   const result = wiki.readFile('projects/marketing/file.md');
 *   if (result.success) {
 *     console.log(result.content);
 *   }
 * 
 * License: MIT
 */

const fs = require('fs');
const path = require('path');
const { WikiPermissionMiddleware } = require('./permission-middleware.js');

class UnifiedWikiTools {
  constructor(wikiPath, agentId = 'default-agent') {
    this.wikiPath = wikiPath || path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'wiki', 'main');
    this.agentId = agentId;
    this.permissions = new WikiPermissionMiddleware(this.wikiPath, agentId);
    this.permissions.loadPermissions();
  }

  /**
   * Get/set agent ID
   */
  getAgentId() {
    return this.agentId;
  }

  setAgentId(agentId) {
    this.agentId = agentId;
    this.permissions.agentId = agentId;
    return this;
  }

  /**
   * Filter search results by read permission
   */
  filterSearchResults(results, agentId = null) {
    const id = agentId || this.agentId;
    if (!Array.isArray(results)) return results;

    return results.filter(result => {
      const resultPath = result.path || result.Path || result;
      return this.permissions.canRead(resultPath, id);
    });
  }

  /**
   * Get a wiki page with read permission check
   */
  wikiGet(lookup, options = {}) {
    const agentId = options.agentId || this.agentId;
    const normalizedPath = this.normalizePath(lookup);

    if (!this.permissions.canRead(normalizedPath, agentId)) {
      return {
        error: 'permission_denied',
        message: `Agent '${agentId}' does not have read permission for: ${lookup}`,
        agentId,
        path: lookup
      };
    }

    return {
      instruction: 'call_wiki_get',
      lookup,
      options,
      agentId,
      permission: 'granted'
    };
  }

  /**
   * Apply changes with write permission check
   */
  wikiApply(op, agentId = null) {
    const id = agentId || this.agentId;
    const targetPath = this.getPathFromOp(op);

    if (!targetPath) {
      return {
        error: 'invalid_operation',
        message: 'Could not determine target path from operation',
        op
      };
    }

    if (!this.permissions.canWrite(targetPath, id)) {
      return {
        error: 'permission_denied',
        message: `Agent '${id}' does not have write permission for: ${targetPath}`,
        agentId: id,
        path: targetPath,
        op
      };
    }

    return {
      instruction: 'call_wiki_apply',
      op,
      agentId: id,
      permission: 'granted'
    };
  }

  /**
   * Read a wiki file directly with permission check
   */
  readFile(filePath, agentId = null) {
    const id = agentId || this.agentId;
    const normalizedPath = this.normalizePath(filePath);

    if (!this.permissions.canRead(normalizedPath, id)) {
      return {
        error: 'permission_denied',
        message: `Agent '${id}' does not have read permission for: ${filePath}`,
        agentId: id,
        path: filePath
      };
    }

    const fullPath = path.join(this.wikiPath, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return {
        error: 'file_not_found',
        message: `File not found: ${filePath}`,
        path: filePath
      };
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      return {
        success: true,
        path: filePath,
        content,
        agentId: id,
        permission: 'granted'
      };
    } catch (err) {
      return {
        error: 'read_error',
        message: err.message,
        path: filePath
      };
    }
  }

  /**
   * Write a wiki file directly with permission check
   */
  writeFile(filePath, content, agentId = null) {
    const id = agentId || this.agentId;
    const normalizedPath = this.normalizePath(filePath);

    if (!this.permissions.canWrite(normalizedPath, id)) {
      return {
        error: 'permission_denied',
        message: `Agent '${id}' does not have write permission for: ${filePath}`,
        agentId: id,
        path: filePath
      };
    }

    const fullPath = path.join(this.wikiPath, filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      fs.writeFileSync(fullPath, content, 'utf8');
      return {
        success: true,
        path: filePath,
        agentId: id,
        permission: 'granted',
        message: 'File written successfully'
      };
    } catch (err) {
      return {
        error: 'write_error',
        message: err.message,
        path: filePath
      };
    }
  }

  /**
   * List files in a directory with permission filter
   */
  listFiles(dirPath = '', agentId = null) {
    const id = agentId || this.agentId;
    const fullDirPath = path.join(this.wikiPath, dirPath);

    if (!fs.existsSync(fullDirPath)) {
      return {
        error: 'directory_not_found',
        message: `Directory not found: ${dirPath}`,
        path: dirPath
      };
    }

    try {
      const files = fs.readdirSync(fullDirPath);
      const accessibleFiles = files.filter(file => {
        const filePath = path.join(dirPath, file);
        return this.permissions.canRead(filePath, id);
      });

      return {
        success: true,
        path: dirPath,
        agentId: id,
        files: accessibleFiles,
        total: files.length,
        accessible: accessibleFiles.length
      };
    } catch (err) {
      return {
        error: 'list_error',
        message: err.message,
        path: dirPath
      };
    }
  }

  /**
   * Normalize a wiki path
   */
  normalizePath(wikiPath) {
    let normalized = wikiPath.replace(/^wiki\//, '');
    normalized = normalized.replace(/^\/+/, '');
    normalized = normalized.replace(/\.md$/, '');
    return normalized;
  }

  /**
   * Get path from wiki_apply operation
   */
  getPathFromOp(op) {
    if (!op) return null;

    if (op.op === 'create_synthesis' && op.title) {
      return `syntheses/${this.slugify(op.title)}`;
    }

    if (op.op === 'update_metadata' && op.lookup) {
      return op.lookup;
    }

    return null;
  }

  /**
   * Convert title to slug
   */
  slugify(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Get allowed paths for an agent
   */
  getAllowedPaths(agentId = null) {
    return this.permissions.getAllowedPaths(agentId || this.agentId);
  }

  /**
   * Check if agent can read a path
   */
  canRead(wikiPath, agentId = null) {
    return this.permissions.canRead(wikiPath, agentId || this.agentId);
  }

  /**
   * Check if agent can write to a path
   */
  canWrite(wikiPath, agentId = null) {
    return this.permissions.canWrite(wikiPath, agentId || this.agentId);
  }

  /**
   * Get audit log
   */
  getAuditLog() {
    return this.permissions.getAuditLog();
  }
}

module.exports = { UnifiedWikiTools };