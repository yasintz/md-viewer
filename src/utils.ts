import { cn } from '@/lib/utils';

export function getMarkdownViewerGridClassName(
  hasFileTree: boolean,
  hasFileContent: boolean,
  isTocExpanded: boolean,
  commentsSidebarCollapsed: boolean
): string {
  return cn(
    'flex-1 grid gap-6 p-6 overflow-hidden',
    // With FileTree visible
    hasFileTree &&
      hasFileContent &&
      isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[300px_250px_1fr_400px]',
    hasFileTree &&
      hasFileContent &&
      isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[300px_250px_1fr]',
    hasFileTree &&
      hasFileContent &&
      !isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[300px_1fr_400px]',
    hasFileTree &&
      hasFileContent &&
      !isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[300px_1fr]',
    hasFileTree &&
      !hasFileContent &&
      isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[300px_250px_1fr_400px]',
    hasFileTree &&
      !hasFileContent &&
      isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[300px_250px_1fr]',
    hasFileTree &&
      !hasFileContent &&
      !isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[300px_1fr_400px]',
    hasFileTree &&
      !hasFileContent &&
      !isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[300px_1fr]',
    // With FileTree hidden
    !hasFileTree &&
      hasFileContent &&
      isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[250px_1fr_400px]',
    !hasFileTree &&
      hasFileContent &&
      isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[250px_1fr]',
    !hasFileTree &&
      hasFileContent &&
      !isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[1fr_400px]',
    !hasFileTree &&
      hasFileContent &&
      !isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[1fr]',
    !hasFileTree &&
      !hasFileContent &&
      isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[250px_1fr_400px]',
    !hasFileTree &&
      !hasFileContent &&
      isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-[250px_1fr]',
    !hasFileTree &&
      !hasFileContent &&
      !isTocExpanded &&
      commentsSidebarCollapsed &&
      'grid-cols-1',
    !hasFileTree &&
      !hasFileContent &&
      !isTocExpanded &&
      !commentsSidebarCollapsed &&
      'grid-cols-[1fr_400px]'
  );
}

