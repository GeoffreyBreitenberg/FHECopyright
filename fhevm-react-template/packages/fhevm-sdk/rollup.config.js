import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

const external = ['react', 'ethers', 'fhevmjs'];

export default [
  // Main bundle
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      })
    ]
  },
  // React hooks bundle
  {
    input: 'src/hooks.ts',
    output: [
      {
        file: 'dist/hooks.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/hooks.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      })
    ]
  },
  // Type definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm'
    },
    plugins: [dts()]
  },
  {
    input: 'src/hooks.ts',
    output: {
      file: 'dist/hooks.d.ts',
      format: 'esm'
    },
    plugins: [dts()]
  }
];
