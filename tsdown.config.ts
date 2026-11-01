import { defineConfig } from 'tsdown'

// NOTE: the reactivity, vite and hmr entries are added in Phase 3.
export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm'],
  platform: 'neutral',
  target: 'es2022',
  dts: true,
  sourcemap: true,
  clean: true,
  publint: true,
  attw: true,
})
