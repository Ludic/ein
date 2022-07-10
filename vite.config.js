// @ts-check
const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig(({command, mode})=>{

  const config = {
    build: {
      emptyOutDir: false,
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'ein',
        fileName: (format) => mode === 'development' ? `ein.dev.${format}.js` : `ein.${format}.js`
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
      // '__HOT__': 'import.meta.hot',
      __vite_process_env_NODE_ENV: JSON.stringify('process.env.NODE_ENV'),
      // 'import.meta.hot': 'import.meta.hot',
    },
  }

  if(mode === 'development') {
    config.define['import.meta.hot'] = 'import.meta.hot'
  }

  return config
})