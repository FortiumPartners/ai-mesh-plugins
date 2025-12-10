/**
 * AI-Mesh Full Plugin Bundle
 * @fortium/ai-mesh-full
 *
 * Meta-package that includes all AI-Mesh plugins
 */

const path = require('path');

// Re-export all plugins
const plugins = {
  // Core
  core: () => require('@fortium/ai-mesh-core'),

  // Testing Frameworks
  jest: () => require('@fortium/ai-mesh-jest'),
  pytest: () => require('@fortium/ai-mesh-pytest'),
  rspec: () => require('@fortium/ai-mesh-rspec'),
  xunit: () => require('@fortium/ai-mesh-xunit'),
  exunit: () => require('@fortium/ai-mesh-exunit'),
  e2eTesting: () => require('@fortium/ai-mesh-e2e-testing'),

  // Web Frameworks
  react: () => require('@fortium/ai-mesh-react'),
  nestjs: () => require('@fortium/ai-mesh-nestjs'),
  blazor: () => require('@fortium/ai-mesh-blazor'),
  phoenix: () => require('@fortium/ai-mesh-phoenix'),
  rails: () => require('@fortium/ai-mesh-rails'),

  // Workflow
  git: () => require('@fortium/ai-mesh-git'),
  quality: () => require('@fortium/ai-mesh-quality'),
  development: () => require('@fortium/ai-mesh-development'),
  infrastructure: () => require('@fortium/ai-mesh-infrastructure'),

  // Management
  product: () => require('@fortium/ai-mesh-product'),
  metrics: () => require('@fortium/ai-mesh-metrics'),

  // Monitoring
  paneViewer: () => require('@fortium/ai-mesh-pane-viewer')
};

const skill = {
  name: 'AI-Mesh Full Bundle',
  version: '4.0.0',
  description: 'Complete AI-Mesh plugin ecosystem with all frameworks, testing, and workflow tools',

  includedPlugins: Object.keys(plugins),

  capabilities: [
    'framework-detection',
    'test-generation',
    'code-review',
    'documentation',
    'deployment',
    'metrics',
    'real-time-monitoring'
  ]
};

/**
 * Get a specific plugin
 * @param {string} name - Plugin name
 * @returns {Object} Plugin module
 */
function getPlugin(name) {
  const loader = plugins[name];
  if (!loader) {
    throw new Error(`Unknown plugin: ${name}. Available: ${Object.keys(plugins).join(', ')}`);
  }
  return loader();
}

/**
 * List all available plugins
 * @returns {Array<string>} Plugin names
 */
function listPlugins() {
  return Object.keys(plugins);
}

module.exports = {
  skill,
  plugins,
  getPlugin,
  listPlugins
};
