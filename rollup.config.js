import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'


export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'commonjs',
      file: 'dist/index.js',
      name: 'ein'
    },
    {
      format: 'es',
      file: 'dist/index.es.js',
      name: 'ein'
    },
    {
      format: 'iife',
      file: 'dist/index.iife.js',
      name: 'ein'
    },
    {
      format: 'umd',
      file: 'dist/index.umd.js',
      name: 'ein'
    },
  ],
  plugins: [
    typescript(),
    resolve(),
  ]
};
