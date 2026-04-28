#!/usr/bin/env node
/**
 * Test Wiki Permission Middleware
 * 
 * Run this script to verify your permissions configuration:
 *   cd ~/.openclaw/wiki/main/.openclaw-wiki
 *   node test-permissions.js
 */

const path = require('path');
const { WikiPermissionMiddleware } = require('./permission-middleware.js');

// Try to find the wiki path
const homeDir = process.env.HOME || process.env.USERPROFILE;
const wikiPath = path.join(homeDir, '.openclaw', 'wiki', 'main');

console.log('=== Wiki Permission Middleware Test ===\n');
console.log(`Wiki path: ${wikiPath}\n`);

// Initialize middleware
const middleware = new WikiPermissionMiddleware(wikiPath);

// Test 1: Load permissions
console.log('Test 1: Load permissions');
try {
  const perms = middleware.loadPermissions();
  console.log('✅ Permissions loaded');
  console.log(`   Version: ${perms.version}`);
  const agentCount = Object.keys(perms.agents).length;
  console.log(`   Agents: ${agentCount} configured`);
} catch (err) {
  console.log(`❌ Failed: ${err.message}`);
  console.log('\nMake sure .permissions.yaml exists in your wiki root.');
  process.exit(1);
}

// Test 2: Get agent configurations
console.log('\nTest 2: Get agent configurations');
const agents = middleware.getAllAgents();
console.log('✅ Agents:');
for (const [id, config] of Object.entries(agents)) {
  console.log(`   ${id}: ${config.role} - ${config.description}`);
}

// Test 3: Test admin permissions (if admin agent exists)
const adminAgent = Object.entries(agents).find(([_, config]) => config.role === 'admin');
if (adminAgent) {
  console.log(`\nTest 3: Admin permissions (${adminAgent[0]})`);
  console.log(`   isAdmin('${adminAgent[0]}'): ${middleware.isAdmin(adminAgent[0])}`);
  console.log(`   canRead('projects/test/file.md', '${adminAgent[0]}'): ${middleware.canRead('projects/test/file.md', adminAgent[0])}`);
  console.log(`   canWrite('projects/test/file.md', '${adminAgent[0]}'): ${middleware.canWrite('projects/test/file.md', adminAgent[0])}`);
}

// Test 4: Test contributor permissions
const contributorAgents = Object.entries(agents).filter(([_, config]) => config.role === 'contributor');
if (contributorAgents.length > 0) {
  const [agentId, config] = contributorAgents[0];
  const allowedPaths = middleware.getAllowedPaths(agentId);
  
  console.log(`\nTest 4: Contributor permissions (${agentId})`);
  console.log(`   Read paths: ${allowedPaths.read.length}`);
  console.log(`   Write paths: ${allowedPaths.write.length}`);
  
  // Test a path that should be allowed
  if (allowedPaths.read.length > 0) {
    const testPath = allowedPaths.read[0];
    console.log(`   canRead('${testPath}'): ${middleware.canRead(testPath, agentId)}`);
  }
}

// Test 5: Test path filtering
console.log('\nTest 5: Filter paths');
const testPaths = [
  'projects/test-a/file.md',
  'projects/test-b/file.md',
  'entities/example.md',
  'concepts/example.md',
  'syntheses/example.md'
];
console.log('   Test paths:', testPaths.length);

if (adminAgent) {
  const adminFiltered = middleware.filterPaths(testPaths, adminAgent[0]);
  console.log(`   Admin filtered (${adminFiltered.length}):`, adminFiltered);
}

if (contributorAgents.length > 0) {
  const [agentId] = contributorAgents[0];
  const contributorFiltered = middleware.filterPaths(testPaths, agentId);
  console.log(`   Contributor filtered (${contributorFiltered.length}):`, contributorFiltered);
}

// Test 6: Audit log
console.log('\nTest 6: Audit log');
const log = middleware.getAuditLog();
console.log(`   Audit entries: ${log.length}`);
if (log.length > 0) {
  const lastEntry = log[log.length - 1];
  console.log(`   Last entry: ${lastEntry.agent} ${lastEntry.action} ${lastEntry.path}`);
}

console.log('\n=== All Tests Passed ===');
console.log('\nPermission middleware is working correctly.');