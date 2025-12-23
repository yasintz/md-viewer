import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom plugin to resolve library's internal @/ imports
function resolveLibraryAliases() {
  const librarySrcPath = path.resolve(__dirname, '../src')
  const libraryRootPath = path.resolve(__dirname, '..')
  const exampleSrcPath = path.resolve(__dirname, './src')
  
  return {
    name: 'resolve-library-aliases',
    resolveId(id: string, importer?: string) {
      // Handle @/ imports - resolve based on importer context
      if (id.startsWith('@/')) {
        if (importer) {
          const normalizedImporter = path.normalize(importer)
          const normalizedLibraryRoot = path.normalize(libraryRootPath)
          
          // If importer is from the library (but not example), resolve relative to library src
          if (
            normalizedImporter.startsWith(normalizedLibraryRoot) &&
            !normalizedImporter.includes('/example/')
          ) {
            const targetPath = id.replace('@/', '')
            return path.resolve(librarySrcPath, targetPath)
          }
          // Otherwise, resolve relative to example src (handled by alias below)
        }
        // Fallback: resolve relative to example src
        return path.resolve(exampleSrcPath, id.replace('@/', ''))
      }
      return null
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    resolveLibraryAliases(),
  ],
  resolve: {
    alias: [
      // More specific patterns first
      {
        find: /^@md-viewer\/styles$/,
        replacement: path.resolve(__dirname, '../dist/index.css'),
      },
      {
        find: /^@md-viewer$/,
        replacement: path.resolve(__dirname, '../dist/index.mjs'),
      },
      // @/ alias for example app (will be overridden by plugin for library files)
      {
        find: /^@\/(.*)$/,
        replacement: path.resolve(__dirname, './src/$1'),
      },
    ],
    // Ensure React and peer dependencies are deduplicated - critical for avoiding "Invalid hook call" errors
    dedupe: [
      'react',
      'react-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
    ],
  },
  optimizeDeps: {
    // Ensure React and React-DOM are pre-bundled and shared
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
})
