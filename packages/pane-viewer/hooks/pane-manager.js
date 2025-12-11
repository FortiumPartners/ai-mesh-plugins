/**
 * Pane Manager
 *
 * Manages the lifecycle of viewer panes across sessions.
 * Handles pane creation, reuse, and cleanup.
 *
 * Responsibilities:
 * 1. Track active panes in state file (~/.ai-mesh-pane-viewer/panes.json)
 * 2. Spawn new panes or reuse existing ones
 * 3. Send messages to viewer panes
 * 4. Clean up stale panes
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { MultiplexerDetector } = require('./adapters');

/**
 * Pane state manager
 */
class PaneManager {
  constructor() {
    this.stateDir = path.join(os.homedir(), '.ai-mesh-pane-viewer');
    this.statePath = path.join(this.stateDir, 'panes.json');
    this.detector = new MultiplexerDetector();
    this.adapter = null;
    this.initialized = false;
  }

  /**
   * Initialize state directory
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) return;

    // Create state directory
    await fs.mkdir(this.stateDir, { recursive: true });

    // Detect multiplexer
    this.adapter = await this.detector.autoSelect();
    if (!this.adapter) {
      throw new Error('No terminal multiplexer detected');
    }

    this.initialized = true;
  }

  /**
   * Load pane state from file
   * @returns {Promise<Object>} Pane state
   */
  async loadState() {
    try {
      const content = await fs.readFile(this.statePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { panes: {}, lastUpdated: null };
    }
  }

  /**
   * Save pane state to file
   * @param {Object} state - State to save
   * @returns {Promise<void>}
   */
  async saveState(state) {
    state.lastUpdated = new Date().toISOString();
    await fs.writeFile(this.statePath, JSON.stringify(state, null, 2));
  }

  /**
   * Get or create a viewer pane
   * @param {Object} config - Configuration options
   * @returns {Promise<string>} Pane ID
   */
  async getOrCreatePane(config = {}) {
    await this.init();

    const {
      direction = 'right',
      percent = 40,
      taskId,
      agentType = 'unknown',
      description = '',
      transcriptPath = '',
      autoCloseTimeout = 0  // 0 = disabled (manual close)
    } = config;
    const state = await this.loadState();

    // Generate signal file path for this task
    const signalFile = taskId
      ? path.join(os.tmpdir(), `agent-signal-${taskId}`)
      : path.join(os.tmpdir(), `agent-signal-${Date.now()}`);

    // Get transcript directory for watching agent files
    const transcriptDir = transcriptPath ? path.dirname(transcriptPath) : '';

    // Spawn new pane with agent-monitor script
    const monitorPath = path.join(__dirname, 'agent-monitor.sh');
    const shortTaskId = taskId ? taskId.substring(0, 12) : Date.now().toString();
    const command = [monitorPath, agentType, description, signalFile, transcriptDir, shortTaskId, String(autoCloseTimeout)];

    const paneId = await this.adapter.splitPane({
      direction,
      percent,
      command
    });

    // Track pane by taskId so completion hook can find it
    if (taskId) {
      state.panes[taskId] = {
        paneId,
        signalFile,
        multiplexer: this.adapter.name,
        agentType,
        description,
        createdAt: new Date().toISOString()
      };
      await this.saveState(state);
    }

    return paneId;
  }

  /**
   * Send a message to a viewer pane
   * @param {string} paneId - Pane ID
   * @param {string} message - Message string
   * @returns {Promise<void>}
   */
  async sendMessage(paneId, message) {
    await this.init();
    // Send plain text followed by newline
    await this.adapter.sendKeys(paneId, `${message}\n`);
  }

  /**
   * Close a viewer pane
   * @param {string} paneId - Pane ID
   * @returns {Promise<void>}
   */
  async closePane(paneId) {
    await this.init();
    await this.adapter.closePane(paneId);

    // Remove from state
    const state = await this.loadState();
    for (const key of Object.keys(state.panes)) {
      if (state.panes[key].paneId === paneId) {
        delete state.panes[key];
      }
    }
    await this.saveState(state);
  }

  /**
   * Clean up stale panes
   * @returns {Promise<number>} Number of panes cleaned up
   */
  async cleanup() {
    await this.init();
    const state = await this.loadState();
    let cleaned = 0;

    for (const key of Object.keys(state.panes)) {
      const pane = state.panes[key];
      const info = await this.adapter.getPaneInfo(pane.paneId);
      if (!info) {
        delete state.panes[key];
        cleaned++;
      }
    }

    if (cleaned > 0) {
      await this.saveState(state);
    }
    return cleaned;
  }
}

module.exports = { PaneManager };
