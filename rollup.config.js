import typescript from '@rollup/plugin-typescript';

export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [typescript({ tsconfig: './tsconfig.json' })]
  },
  // Browser build (UMD)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/browser.js',
      format: 'umd',
      name: 'NotiBoost',
      sourcemap: true
    },
    plugins: [typescript({ tsconfig: './tsconfig.json' })]
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [typescript({ tsconfig: './tsconfig.json' })]
  }
];

