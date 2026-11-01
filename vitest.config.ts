import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@ludic/ein/reactivity': new URL('./src/reactivity/index.ts', import.meta.url).pathname,
      '@ludic/ein/vite': new URL('./src/vite/index.ts', import.meta.url).pathname,
      '@ludic/ein/hmr': new URL('./src/hmr/index.ts', import.meta.url).pathname,
      '@ludic/ein': new URL('./src/index.ts', import.meta.url).pathname,
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    typecheck: {
      enabled: true,
      include: ['tests/**/*.test-d.ts'],
      tsconfig: './tests/tsconfig.json',
    },
    benchmark: {
      include: ['bench/**/*.bench.ts'],
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
    },
  },
})
