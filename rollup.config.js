import typescript from 'rollup-plugin-typescript'
import { uglify } from 'rollup-plugin-uglify'
import { libName } from './package.json'

/* options */
const inputFile = 'src/index.ts';

/* plugin setting */
const plugins = [
  typescript()
];

export default [
  {
    input: inputFile,
    output: {
      file: `dist/${libName}.js`,
      format: 'umd',
      globals: {
        'phina.js': 'phina',
      },
    },
    external: ['phina.js'],
    plugins: plugins,
  },
  {
    input: inputFile,
    output: {
      file: `dist/${libName}.min.js`,
      format: 'umd',
      globals: {
        'phina.js': 'phina',
      },
    },
    external: ['phina.js'],
    plugins: plugins.concat([uglify()]),
  },
]