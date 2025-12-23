import { defineConfig } from 'tsdown';
import { tailwindPlugin } from '@bosh-code/tsdown-plugin-tailwindcss';

export default defineConfig([
  {
    entry: ['src/index.tsx'],
    format: 'cjs',
    dts: true,
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
    plugins: [
      tailwindPlugin(),
    ],
    outExtensions() {
      return {
        js: '.js',
        dts: '.d.ts',
      };
    },
  },
  {
    entry: ['src/index.tsx'],
    format: 'esm',
    dts: true,
    sourcemap: true,
    external: [
      'react',
      'react-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
    ],
    treeshake: true,
    plugins: [
      tailwindPlugin(),
    ],
    outExtensions() {
      return {
        js: '.mjs',
        dts: '.d.ts',
      };
    },
  },
]);

