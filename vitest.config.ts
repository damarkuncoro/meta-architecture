import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.ts', 'examples/**/*.test.ts', 'examples/**/__tests__/**/*.test.ts'],
    alias: {
      '@': '/src',
      '@damarkuncoro/meta-architecture': '/src',
    },
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.node'],
  },
});
