import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  lib: [
    {
      format: 'esm',
      dts: true,
      syntax: 'es2022',
    },
  ],
  output: {
    target: 'web',
    autoExternal: {
      dependencies: true,
      peerDependencies: true,
    },
  },
});
