import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileWatcherGridClassName(
  configId: string | null,
  hasFileTree: boolean,
  hasFileContent: boolean,
  isTocExpanded: boolean,
  commentsSidebarCollapsed: boolean
): string {
  return cn(
    'flex-1 grid gap-6 p-6 overflow-hidden',
    // Config with FileTree visible
    configId &&
      hasFileTree &&
      hasFileContent &&
      isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[300px_250px_1fr_400px]',
    configId &&
      hasFileTree &&
      hasFileContent &&
      isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[300px_250px_1fr]',
    configId &&
      hasFileTree &&
      hasFileContent &&
      !isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[300px_1fr_400px]',
    configId &&
      hasFileTree &&
      hasFileContent &&
      !isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[300px_1fr]',
    configId &&
      hasFileTree &&
      !hasFileContent &&
      isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[300px_250px_1fr_400px]',
    configId &&
      hasFileTree &&
      !hasFileContent &&
      isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[300px_250px_1fr]',
    configId &&
      hasFileTree &&
      !hasFileContent &&
      !isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[300px_1fr_400px]',
    configId &&
      hasFileTree &&
      !hasFileContent &&
      !isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[300px_1fr]',
    // Config with FileTree hidden
    configId &&
      !hasFileTree &&
      hasFileContent &&
      isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[250px_1fr_400px]',
    configId &&
      !hasFileTree &&
      hasFileContent &&
      isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[250px_1fr]',
    configId &&
      !hasFileTree &&
      hasFileContent &&
      !isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[1fr_400px]',
    configId &&
      !hasFileTree &&
      hasFileContent &&
      !isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[1fr]',
    configId &&
      !hasFileTree &&
      !hasFileContent &&
      isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[250px_1fr_400px]',
    configId &&
      !hasFileTree &&
      !hasFileContent &&
      isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[250px_1fr]',
    configId &&
      !hasFileTree &&
      !hasFileContent &&
      !isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[1fr_400px]',
    configId &&
      !hasFileTree &&
      !hasFileContent &&
      !isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[1fr]',
    // No config
    !configId &&
      hasFileContent &&
      isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[250px_1fr_400px]',
    !configId &&
      hasFileContent &&
      isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[250px_1fr]',
    !configId &&
      hasFileContent &&
      !isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[1fr_400px]',
    !configId &&
      hasFileContent &&
      !isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[1fr]',
    !configId &&
      !hasFileContent &&
      isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[250px_1fr_400px]',
    !configId &&
      !hasFileContent &&
      isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[250px_1fr]',
    !configId &&
      !hasFileContent &&
      !isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-1',
    !configId &&
      !hasFileContent &&
      !isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[1fr_400px]'
  )
}
