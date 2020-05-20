import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'

import vite from './vite-plugin'

import path from 'path'

const serve = process.env.npm_config_serve == 'true'

const viteConfig = {
  port: 8080,
  root: 'examples',
  resolvers: [
    {
      requestToFile(publicPath, root){
        if(publicPath.includes('/dist')){
          return path.join(__dirname, publicPath)
        }
        return undefined
      },
      fileToRequest(){},
    }
  ],
}

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'iife',
      file: 'dist/index.js',
      name: 'ein'
    },
    {
      format: 'es',
      file: 'dist/index.es.js',
      name: 'ein'
    },
  ],
  plugins: [
    typescript(),
    resolve(),
    ...(serve
      ? [ vite(viteConfig) ]
      : []),
  ]
};
