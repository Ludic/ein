import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'

export default [
  {
    input: 'src/Ein.ts',
    plugins: [
      typescript({
        tsconfig: "tsconfig.build.json"
      }),
      commonjs(),
    ],
    output: {
      file: 'dist/iife/Ein.js',
      name: "Ein",
      format: 'iife'
    }
  },
  {
    input: 'src/Ein.ts',
    plugins: [
      typescript({
        tsconfig: "tsconfig.build.json"
      }),
      commonjs(),
    ],
    output: {
      file: 'dist/cjs/Ein.js',
      name: "Ein",
      format: 'cjs'
    }
  }
]
