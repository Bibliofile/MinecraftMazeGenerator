
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'

export default {
  input: 'src/index.ts',
  output: {
    file: 'bundle.js',
    format: 'iife'
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
  ]
}
