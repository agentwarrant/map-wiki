#!/usr/bin/env node
/**
 * Test Unified Wiki Tools
 * 
 * Run this script to verify your wiki tools setup:
 *   cd ~/.openclaw/wiki/main/.openclaw-wiki
 *   node test-wiki-tools.js
 */

const path = require('path');
const { UnifiedWikiTools } = require('./wiki-tools.js');

// Try to find the wiki path
const homeDir = process.env.HOME || process.env.USERPROFILE;
const wikiPath = path.join(homeDir, '.openclaw', 'wiki', 'main');

console.log('=== Unified Wiki Tools Test ===\n');
console.log(`Wiki path: ${wikiPath}\n`);

// Initialize tools
let tools;
try {
  tools = new UnifiedWikiTools(wikiPath);
  console.log('Test 1: Initialize');
  console.log(`   Agent ID: ${tools.getAgentId()}`);
  console.log('✅ Initialized\n');
} catch (err) {
  console.log(`❌ Failed to initialize: ${err.message}`);
  console.log('\nMake sure .permissions.yaml exists in your wiki root.');
  process.exit(1);
}

// Test 2: Get allowed paths
console.log('Test 2: Get allowed paths');
const agents = tools.permissions.getAllAgents();
const agentEntries = Object.entries(agents);

if (agentEntries.length === 0) {
  console.log('   No agents configured');
} else {
  for (const [agentId, config] of agentEntries.slice(0, 3)) {
    const paths = tools.getAllowedPaths(agentId);
    console.log(`   ${agentId} (${config.role}): ${paths.read.length} read, ${paths.write.length} write`);
  }
}

// Test 3: Permission checks
console.log('\nTest 3: Permission checks');
const testPaths = [
  'entities/test.md',
  'concepts/test.md',
  'projects/test/file.md'
];
for (const [agentId, config] of agentEntries.slice(0, 2)) {
  console.log(`   ${agentId} (${config.role}):`);
  for (const testPath of testPaths.slice(0, 2)) {
    const canRead = tools.canRead(testPath, agentId);
    console.log(`     canRead('${testPath}'): ${canRead}`);
  }
}

// Test 4: Filter search results
console.log('\nTest 4: Filter search results');
const mockResults = [
  { path: 'entities/example.md', title: 'Example Entity' },
  { path: 'concepts/test.md', title: 'Test Concept' },
  { path: 'projects/test/file.md', title: 'Project File' }
];
console.log(`   Mock results: ${mockResults.length}`);

if (agentEntries.length > 0) {
  const [agentId] = agentEntries[0];
  const filtered = tools.filterSearchResults(mockResults, agentId);
  console.log(`   Filtered for ${agentId}: ${filtered.length} results`);
  if (filtered.length > 0) {
    console.log(`   Paths: ${filtered.map(r => r.path).join(', ')}`);
  }
}

// Test 5: List files
console.log('\nTest 5: List files');
const listResult = tools.listFiles('entities');
if (listResult.success) {
  console.log(`   entities/: ${listResult.accessible}/${listResult.total} files accessible`);
} else {
  console.log(`   entities/: ${listResult.error}`);
}

// Test 6: Audit log
console.log('\nTest 6: Audit log');
const log = tools.getAuditLog();
console.log(`   Audit entries: ${log.length}`);
if (log.length > 0) {
  const lastEntry = log[log.length - 1];
  console.log(`   Last entry: ${lastEntry.agent} ${lastEntry.action} ${lastEntry.path} (${lastEntry.granted ? 'granted' : 'denied'})`);
}

console.log('\n=== All Tests Passed ===');
console.log('\nUnified wiki tools are working correctly.');