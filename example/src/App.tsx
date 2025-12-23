import { useState } from 'react';
import { MarkdownViewer } from '@md-viewer';
import type { FileTreeNode, Comment, CommentReply } from '@md-viewer';

const sampleMarkdown = `# Welcome to Markdown Viewer

This is a **sample markdown** file to demonstrate the MarkdownViewer component.

## Features

- File tree navigation
- Markdown rendering
- Comment system
- Table of contents

## Getting Started

You can select text and add comments to this markdown file.

\`\`\`typescript
const example = "Hello, World!";
console.log(example);
\`\`\`

## More Content

This is a longer section to demonstrate scrolling and the table of contents functionality.

### Subsection

Some more content here to make the document longer.
`;

const sampleFileTree: FileTreeNode[] = [
  {
    name: 'docs',
    path: 'docs',
    type: 'directory',
    children: [
      {
        name: 'getting-started.md',
        path: 'docs/getting-started.md',
        type: 'file',
      },
      {
        name: 'api.md',
        path: 'docs/api.md',
        type: 'file',
      },
    ],
  },
  {
    name: 'README.md',
    path: 'README.md',
    type: 'file',
  },
];

function App() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(
    'README.md'
  );

  const handleCommentAdd = (comment: Comment) => {
    setComments((prev) => [...prev, comment]);
  };

  const handleCommentDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCommentUpdate = (id: string, text: string) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
  };

  const handleCommentReply = (commentId: string, reply: CommentReply) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c
      )
    );
  };

  const handleReplyUpdate = (
    commentId: string,
    replyId: string,
    text: string
  ) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: c.replies?.map((r) =>
                r.id === replyId ? { ...r, text } : r
              ),
            }
          : c
      )
    );
  };

  const handleReplyDelete = (commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: c.replies?.filter((r) => r.id !== replyId),
            }
          : c
      )
    );
  };

  const handleFileSelect = (filePath: string) => {
    setSelectedFilePath(filePath);
  };

  const handleExportComments = (comments: Comment[]) => {
    console.log('Exporting comments:', comments);
    // You can implement actual export logic here
  };

  return (
    <div className="h-screen w-screen">
      <MarkdownViewer
        folderTree={sampleFileTree}
        markdownContent={sampleMarkdown}
        comments={comments}
        onCommentAdd={handleCommentAdd}
        onCommentDelete={handleCommentDelete}
        onCommentUpdate={handleCommentUpdate}
        onCommentReply={handleCommentReply}
        onReplyUpdate={handleReplyUpdate}
        onReplyDelete={handleReplyDelete}
        selectedFilePath={selectedFilePath}
        onFileSelect={handleFileSelect}
        onExportComments={handleExportComments}
      />
    </div>
  );
}

export default App;
