import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import ein from '../src/vite/index.ts'

const src = (p: string): string => fileURLToPath(new URL(`../src/${p}`, import.meta.url))

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [ein()],
  resolve: {
    alias: {
      '@ludic/ein/reactivity': src('reactivity/index.ts'),
      '@ludic/ein/vite': src('vite/index.ts'),
      '@ludic/ein/hmr': src('hmr/index.ts'),
      '@ludic/ein': src('index.ts'),
    },
  },
})
