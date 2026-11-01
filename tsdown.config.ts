import { defineConfig } from 'tsdown'

// NOTE: entries temporarily point at the 1.x file layout until the Phase 2 rewrite.
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    reactivity: 'src/reactivity.ts',
    vite: 'src/hmr/plugin.ts',
    hmr: 'src/hmr/hmr.ts',
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
