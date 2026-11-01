import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const src = (path: string): string => fileURLToPath(new URL(`./src/${path}`, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@ludic/ein/reactivity': src('reactivity/index.ts'),
      '@ludic/ein/vite': src('vite/index.ts'),
      '@ludic/ein/hmr': src('hmr/index.ts'),
      '@ludic/ein': src('index.ts'),
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
