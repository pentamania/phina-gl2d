import typescript from 'rollup-plugin-typescript'
import { uglify } from 'rollup-plugin-uglify'
import licensePlugin from 'rollup-plugin-license';
import { libName, name, version, author, license as LICENSE_TYPE } from './package.json';

/* license banner */
const banner = `/*!
 * ${ name } v${version}
 * ${LICENSE_TYPE} Licensed
 *
 * Copyright (C) ${author}
 */`;

/* options */
const inputFile = 'src/index.ts';

/* plugin setting */
const commonPlugins = [
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
    plugins: commonPlugins.concat([
      licensePlugin({ banner: banner })
    ]),
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
    plugins: commonPlugins.concat([
      uglify(),
      licensePlugin({ banner: banner })
    ]),
  },
]