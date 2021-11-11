import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
export default [
  {
    input: 'src/index.ts',
    plugins: [
      resolve(),
      typescript(),
      terser(),
    ],
    output: [
      {
        file: 'dist/obiusm-dom-ems.min.js',
        format: 'es',
      },
      {
        file: 'dist/obiusm-dom-iife.min.js',
        format: 'iife',
        name: 'ObiusmDom',
      },
      {
        file: 'dist/obiusm-dom-umd.min.js',
        format: 'umd',
        name: 'ObiusmDom',
      },
    ],
  },
];
