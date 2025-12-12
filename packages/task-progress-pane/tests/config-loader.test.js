/**
 * Tests for config-loader.js
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock fs module
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn()
  },
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn()
}));

// Import after mocking
const {
  loadConfig,
  saveConfig,
  resetConfig,
  getConfigValue,
  setConfigValue,
  DEFAULT_CONFIG
} = await import('../lib/config-loader.js');

describe('config-loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DEFAULT_CONFIG', () => {
    it('should have all required properties', () => {
      expect(DEFAULT_CONFIG).toHaveProperty('enabled', true);
      expect(DEFAULT_CONFIG).toHaveProperty('multiplexer', 'auto');
      expect(DEFAULT_CONFIG).toHaveProperty('direction', 'right');
      expect(DEFAULT_CONFIG).toHaveProperty('percent', 25);
      expect(DEFAULT_CONFIG).toHaveProperty('debounceMs', 50);
      expect(DEFAULT_CONFIG).toHaveProperty('useInotify', true);
      expect(DEFAULT_CONFIG).toHaveProperty('pollingIntervalMs', 200);
      expect(DEFAULT_CONFIG).toHaveProperty('collapseCompletedThreshold', 5);
    });
  });

  describe('loadConfig', () => {
    it('should return default config when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const config = loadConfig();

      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should merge user config with defaults', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ percent: 30, colors: false }));

      const config = loadConfig();

      expect(config.percent).toBe(30);
      expect(config.colors).toBe(false);
      expect(config.enabled).toBe(true); // From default
    });

    it('should return defaults on parse error', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json');

      const config = loadConfig();

      expect(config).toEqual(DEFAULT_CONFIG);
    });
  });

  describe('saveConfig', () => {
    it('should merge config with defaults before saving', () => {
      fs.existsSync.mockReturnValue(false);

      const result = saveConfig({ percent: 35 });

      expect(result.percent).toBe(35);
      expect(result.enabled).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should create config directory if needed', () => {
      fs.existsSync.mockReturnValue(false);

      saveConfig({});

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.any(String),
        { recursive: true }
      );
    });
  });

  describe('resetConfig', () => {
    it('should save default config', () => {
      fs.existsSync.mockReturnValue(false);

      const result = resetConfig();

      expect(result).toEqual(DEFAULT_CONFIG);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('getConfigValue', () => {
    it('should return specific config value', () => {
      fs.existsSync.mockReturnValue(false);

      const value = getConfigValue('percent');

      expect(value).toBe(25); // Default
    });

    it('should return default value for missing key', () => {
      fs.existsSync.mockReturnValue(false);

      const value = getConfigValue('nonexistent', 'fallback');

      expect(value).toBe('fallback');
    });
  });

  describe('setConfigValue', () => {
    it('should update specific config value', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({}));

      const result = setConfigValue('percent', 40);

      expect(result.percent).toBe(40);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });
});
