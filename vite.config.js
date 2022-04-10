// @ts-check
const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ein',
      fileName: (format) => `ein.${format}.js`
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      // external: ['vue'],
      // output: {
      //   // Provide global variables to use in the UMD build
      //   // for externalized deps
      //   globals: {
      //     vue: 'Vue'
      //   }
      // }
    }
  },
  define: {
    '__HOT__': 'import.meta.hot',
  },
})