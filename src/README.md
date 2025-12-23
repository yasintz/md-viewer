# MarkdownViewer Module

A standalone React component for viewing markdown files with commenting capabilities.

## Features

- 📁 File tree navigation
- 📝 Markdown rendering with syntax highlighting
- 💬 Comment system with replies
- 📊 Table of contents
- 📤 Export comments functionality

## Usage

```tsx
import { MarkdownViewer } from './modules/MarkdownViewer';
import type { FileTreeNode, Comment, CommentReply } from './modules/MarkdownViewer';

function App() {
  const [comments, setComments] = useState<Comment[]>([]);
  const folderTree: FileTreeNode[] = [
    {
      name: 'example.md',
      path: 'example.md',
      type: 'file',
    },
  ];

  const handleCommentAdd = (comment: Comment) => {
    setComments([...comments, comment]);
  };

  const handleCommentDelete = (id: string) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  const handleCommentUpdate = (id: string, text: string) => {
    setComments(
      comments.map((c) => (c.id === id ? { ...c, text } : c))
    );
  };

  const handleCommentReply = (commentId: string, reply: CommentReply) => {
    setComments(
      comments.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c
      )
    );
  };

  return (
    <MarkdownViewer
      folderTree={folderTree}
      markdownContent="# Hello World\n\nThis is markdown content."
      comments={comments}
      onCommentAdd={handleCommentAdd}
      onCommentDelete={handleCommentDelete}
      onCommentUpdate={handleCommentUpdate}
      onCommentReply={handleCommentReply}
    />
  );
}
```

## Props

### Required Props

- `folderTree: FileTreeNode[]` - File tree structure for navigation
- `markdownContent: string` - Markdown content to display
- `comments: Comment[]` - Array of comments
- `onCommentAdd: (comment: Comment) => void` - Callback when a comment is added
- `onCommentDelete: (id: string) => void` - Callback when a comment is deleted
- `onCommentUpdate: (id: string, text: string) => void` - Callback when a comment is updated
- `onCommentReply: (commentId: string, reply: CommentReply) => void` - Callback when a reply is added

### Optional Props

- `onReplyUpdate?: (commentId: string, replyId: string, text: string) => void` - Callback when a reply is updated
- `onReplyDelete?: (commentId: string, replyId: string) => void` - Callback when a reply is deleted
- `selectedFilePath?: string | null` - Currently selected file path
- `onFileSelect?: (filePath: string) => void` - Callback when file is selected from tree
- `onExportComments?: (comments: Comment[]) => void` - Custom callback for exporting comments

## Types

### FileTreeNode

```typescript
interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}
```

### Comment

```typescript
interface Comment {
  id: string;
  text: string;
  selectedText: string;
  line: number;
  column: number;
  timestamp: number;
  replies: CommentReply[];
}
```

### CommentReply

```typescript
interface CommentReply {
  id: string;
  text: string;
  timestamp: number;
}
```

## Features

### Comment System

- Select text in the markdown preview to add comments
- Comments are anchored to specific lines and columns
- Support for replies to comments
- Edit and delete comments/replies
- Comments are highlighted in the markdown preview

### File Tree

- Navigate through files in a folder structure
- Click files to view their content (requires `onFileSelect` callback)
- Collapsible folder structure

### Table of Contents

- Automatically generated from markdown headings
- Click to navigate to sections
- Collapsible sidebar

### Export

- Export comments as markdown
- Copy to clipboard or download as file
- Custom export handler via `onExportComments` prop

