const path = require('path');

import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'lib/index.ts',
  output: {
    file: './dist/index.js',
    format: 'umd',
    name: "phax"
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          target: "ES5",
          declaration: false,
          outDir: "",
        }
      }
    })
  ]
};
