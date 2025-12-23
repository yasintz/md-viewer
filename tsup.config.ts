import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@radix-ui/react-dialog',
    '@radix-ui/react-select',
    '@radix-ui/react-slot',
  ],
  treeshake: true,
  esbuildOptions(options) {
    options.alias = {
      '@': './src',
    };
  },
});

