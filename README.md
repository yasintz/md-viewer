# MarkdownViewer

A standalone React component for viewing markdown files with commenting capabilities, built with Tailwind CSS and shadcn/ui.

## Features

- 📁 File tree navigation
- 📝 Markdown rendering with syntax highlighting
- 💬 Comment system with replies
- 📊 Table of contents
- 📤 Export comments functionality

## Installation

```bash
npm install @yt/md-viewer
```

## Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react react-dom @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-slot
```

## Usage

```tsx
import { MarkdownViewer } from '@yt/md-viewer';
import '@yt/md-viewer/styles'; // Import Tailwind styles
import type { FileTreeNode, Comment, CommentReply } from '@yt/md-viewer';

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

## Styling

This package uses Tailwind CSS. Make sure to include the styles in your application:

```tsx
import '@yt/md-viewer/styles';
```

Or import the CSS file directly:

```tsx
import '@yt/md-viewer/src/styles.css';
```

## License

ISC

