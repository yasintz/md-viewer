// Export types for the package
export interface CommentReply {
  id: string;
  text: string;
  timestamp: number;
}

export interface Comment {
  id: string;
  text: string;
  selectedText: string;
  line: number;
  column: number;
  timestamp: number;
  replies: CommentReply[];
}

export interface CommentHistory {
  id: string;
  fileName: string;
  filePath?: string;
  comments: Comment[];
  savedAt: number;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

export interface FileComments {
  [filePath: string]: Comment[];
}
