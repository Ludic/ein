import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    reactivity: 'src/reactivity/index.ts',
    vite: 'src/vite/index.ts',
    hmr: 'src/hmr/index.ts',
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
