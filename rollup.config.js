import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'


export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'commonjs',
      file: 'dist/ein.js',
      name: 'ein'
    },
    {
      format: 'es',
      file: 'dist/ein.es.js',
      name: 'ein'
    },
    {
      format: 'iife',
      file: 'dist/ein.iife.js',
      name: 'ein'
    },
    {
      format: 'umd',
      file: 'dist/ein.umd.js',
      name: 'ein'
    },
  ],
  plugins: [
    typescript(),
    resolve(),
  ]
};
