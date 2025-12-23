import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FileTreeNode } from '@/types';

interface FileTreeProps {
  fileTree: FileTreeNode[];
  currentFilePath: string | null;
  onFileSelect: (filePath: string) => void;
  onToggleFileTree?: () => void;
  showCloseIcon?: boolean;
}

export function FileTree({ fileTree, currentFilePath, onFileSelect, onToggleFileTree, showCloseIcon = true }: FileTreeProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const renderNode = (node: FileTreeNode, level: number = 0) => {
    const isExpanded = expandedPaths.has(node.path);
    const isSelected = currentFilePath === node.path;
    const isDirectory = node.type === 'directory';
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1 px-2 py-1.5 text-sm cursor-pointer rounded transition-colors ${
            isSelected
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (isDirectory) {
              toggleExpand(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
        >
          {isDirectory ? (
            <>
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )
              ) : (
                <div className="w-4" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 flex-shrink-0 text-blue-600" />
              ) : (
                <Folder className="w-4 h-4 flex-shrink-0 text-blue-600" />
              )}
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className="w-4 h-4 flex-shrink-0 text-gray-500" />
            </>
          )}
          <span className="truncate flex-1" title={node.name}>
            {node.name}
          </span>
        </div>
        {isDirectory && isExpanded && hasChildren && (
          <div>
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (fileTree.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No files
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Files</h3>
        {showCloseIcon && onToggleFileTree && (
          <Button
            onClick={onToggleFileTree}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {fileTree.map((node) => renderNode(node))}
      </div>
    </div>
  );
}

