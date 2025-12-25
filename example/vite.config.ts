import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { spawn } from 'child_process'
import chokidar from 'chokidar'

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

// Plugin to watch ../src and run tsdown on changes
function watchLibrarySource() {
  const librarySrcPath = path.resolve(__dirname, '../src')
  const libraryRootPath = path.resolve(__dirname, '..')
  let watcher: ReturnType<typeof chokidar.watch> | null = null
  let buildTimeout: NodeJS.Timeout | null = null

  const runTsdown = () => {
    // Clear any pending build
    if (buildTimeout) {
      clearTimeout(buildTimeout)
    }

    // Debounce builds to avoid multiple rapid builds
    buildTimeout = setTimeout(() => {
      console.log('[vite-plugin-tsdown] Building library...')
      const process = spawn('pnpm', ['run', 'build'], {
        cwd: libraryRootPath,
        stdio: 'inherit',
        shell: true,
      })

      process.on('close', (code) => {
        if (code === 0) {
          console.log('[vite-plugin-tsdown] Library build completed')
        } else {
          console.error(`[vite-plugin-tsdown] Library build failed with code ${code}`)
        }
      })
    }, 300)
  }

  const startWatching = () => {
    // Initial build
    runTsdown()

    // Watch ../src for changes
    watcher = chokidar.watch(librarySrcPath, {
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    })

    watcher.on('change', (filePath) => {
      console.log(`[vite-plugin-tsdown] File changed: ${filePath}`)
      runTsdown()
    })

    watcher.on('add', (filePath) => {
      console.log(`[vite-plugin-tsdown] File added: ${filePath}`)
      runTsdown()
    })

    watcher.on('unlink', (filePath) => {
      console.log(`[vite-plugin-tsdown] File deleted: ${filePath}`)
      runTsdown()
    })
  }

  const stopWatching = () => {
    if (watcher) {
      watcher.close()
      watcher = null
    }
    if (buildTimeout) {
      clearTimeout(buildTimeout)
      buildTimeout = null
    }
  }

  return {
    name: 'watch-library-source',
    configureServer() {
      // Start watching when dev server starts
      startWatching()
    },
    buildStart() {
      // Also watch during build
      startWatching()
    },
    buildEnd() {
      stopWatching()
    },
    closeBundle() {
      stopWatching()
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    resolveLibraryAliases(),
    watchLibrarySource(),
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
