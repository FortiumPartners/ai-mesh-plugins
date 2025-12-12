import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.test.js'
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 85,
        lines: 80
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000
  }
});
