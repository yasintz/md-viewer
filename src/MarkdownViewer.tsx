import { useState, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import { FolderOpen, PanelLeftClose, MessageSquare } from 'lucide-react';
import { FileTree } from '@/components/FileTree';
import { TableOfContents } from '@/components/TableOfContents';
import { Card } from '@/components/ui/card';
import { useTextSelection } from '@/hooks/useTextSelection';
import { useComments } from '@/hooks/useComments';
import { CommentDialog } from './components/CommentDialog';
import { CommentsSidebar } from './components/CommentsSidebar';
import { PreviewHeader } from './components/PreviewHeader';
import { FilePreview } from './components/FilePreview';
import { FixedToggleButton } from './components/FixedToggleButton';
import { ExportDialog } from './components/ExportDialog';
import { getMarkdownViewerGridClassName } from './utils';
import type { FileTreeNode, Comment, CommentReply } from './types';
import type { QuickComment } from './components/QuickComments';

// Export types
export type { FileTreeNode, Comment, CommentReply, QuickComment };

export interface ComponentVisibilityConfig {
  /** Whether the component is open/visible */
  open: boolean;
  /** Callback when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** Whether to show the close icon */
  showCloseIcon?: boolean;
}

export interface MarkdownViewerProps {
  /** File tree structure */
  folderTree: FileTreeNode[];
  /** Markdown content to display */
  markdownContent: string;
  /** Comments array */
  comments: Comment[];
  /** Callback when a comment is added */
  onCommentAdd: (comment: Comment) => void;
  /** Callback when a comment is deleted */
  onCommentDelete: (id: string) => void;
  /** Callback when a comment is updated */
  onCommentUpdate: (id: string, text: string) => void;
  /** Callback when a reply is added to a comment */
  onCommentReply: (commentId: string, reply: CommentReply) => void;
  /** Optional: Callback when a reply is updated */
  onReplyUpdate?: (commentId: string, replyId: string, text: string) => void;
  /** Optional: Callback when a reply is deleted */
  onReplyDelete?: (commentId: string, replyId: string) => void;
  /** Optional: Currently selected file path */
  selectedFilePath?: string | null;
  /** Optional: Callback when file is selected from tree */
  onFileSelect?: (filePath: string) => void;
  /** Optional: Callback to export comments */
  onExportComments?: (comments: Comment[]) => void;
  /** Optional: File tree visibility configuration */
  fileTreeConfig?: ComponentVisibilityConfig;
  /** Optional: Table of contents visibility configuration */
  tableOfContentsConfig?: ComponentVisibilityConfig;
  /** Optional: Comments sidebar visibility configuration */
  commentsSidebarConfig?: ComponentVisibilityConfig;
  /** Optional: Quick comments array for one-click commenting */
  quickComments?: QuickComment[];
}

export function MarkdownViewer({
  folderTree,
  markdownContent,
  comments,
  onCommentAdd,
  onCommentDelete,
  onCommentUpdate,
  onCommentReply,
  onReplyUpdate,
  onReplyDelete,
  selectedFilePath = null,
  onFileSelect,
  onExportComments,
  fileTreeConfig,
  tableOfContentsConfig,
  commentsSidebarConfig,
  quickComments = [],
}: MarkdownViewerProps) {
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [focusedCommentId, setFocusedCommentId] = useState<string | null>(null);
  const [shouldShakeCommentId, setShouldShakeCommentId] = useState<string | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(
    selectedFilePath
  );

  // Default configs if not provided
  const fileTreeOpen = fileTreeConfig?.open ?? true;
  const tableOfContentsOpen = tableOfContentsConfig?.open ?? true;
  const commentsSidebarOpen = commentsSidebarConfig?.open ?? true;

  // Update current file path when prop changes
  useEffect(() => {
    setCurrentFilePath(selectedFilePath);
  }, [selectedFilePath]);

  // Text selection hook
  const {
    previewRef: textSelectionRef,
    commentIconPosition,
    selectedText: hookSelectedText,
    selectionPosition: hookSelectionPosition,
    handleTextSelection,
    handleCommentIconClick,
    clearSelection,
  } = useTextSelection(() => {
    // Selection is handled internally by the hook
  }, markdownContent);

  const selectedText = hookSelectedText;
  const selectionPosition = hookSelectionPosition;

  // Comments hook
  const {
    editingCommentId,
    editingReplyId,
    editText,
    replyingToCommentId,
    replyText,
    setEditText,
    setReplyText,
    handleStartEdit,
    handleStartEditReply,
    handleSaveEdit,
    handleCancelEdit,
    handleStartReply,
    handleSaveReply,
    handleCancelReply,
  } = useComments();

  // Ensure all comments have replies array
  const normalizedComments = useMemo(() => {
    return comments.map((comment) => ({
      ...comment,
      replies: comment.replies || [],
    }));
  }, [comments]);

  const handleCommentIconClickWithDialog = (e: React.MouseEvent) => {
    handleCommentIconClick(e);
    setShowCommentDialog(true);
  };

  const handleQuickCommentClick = (quickComment: QuickComment) => {
    if (selectedText && selectionPosition) {
      const existingComment = normalizedComments.find(
        (c) =>
          c.selectedText === selectedText &&
          c.line === selectionPosition.line &&
          c.column === selectionPosition.column
      );

      if (existingComment) {
        // Add as reply to existing comment
        const reply: CommentReply = {
          id: Date.now().toString(),
          text: quickComment.commentText,
          timestamp: Date.now(),
        };
        onCommentReply(existingComment.id, reply);
      } else {
        // Add as new comment
        const newComment: Comment = {
          id: Date.now().toString(),
          text: quickComment.commentText,
          selectedText: selectedText,
          line: selectionPosition.line,
          column: selectionPosition.column,
          timestamp: Date.now(),
          replies: [],
        };
        onCommentAdd(newComment);
      }

      clearSelection();
    }
  };

  const handleAddComment = () => {
    if (commentText.trim() && selectedText && selectionPosition) {
      const existingComment = normalizedComments.find(
        (c) =>
          c.selectedText === selectedText &&
          c.line === selectionPosition.line &&
          c.column === selectionPosition.column
      );

      if (existingComment) {
        // Add as reply to existing comment
        const reply: CommentReply = {
          id: Date.now().toString(),
          text: commentText,
          timestamp: Date.now(),
        };
        onCommentReply(existingComment.id, reply);
      } else {
        // Add as new comment
        const newComment: Comment = {
          id: Date.now().toString(),
          text: commentText,
          selectedText: selectedText,
          line: selectionPosition.line,
          column: selectionPosition.column,
          timestamp: Date.now(),
          replies: [],
        };
        onCommentAdd(newComment);
      }

      setShowCommentDialog(false);
      setCommentText('');
      clearSelection();
    }
  };

  const handleExportComments = () => {
    if (onExportComments) {
      onExportComments(normalizedComments);
    } else {
      setShowExportDialog(true);
    }
  };

  const handleDeleteComment = (id: string) => {
    onCommentDelete(id);
  };

  const handleDeleteReply = (commentId: string, replyId: string) => {
    if (onReplyDelete) {
      onReplyDelete(commentId, replyId);
    } else {
      // Fallback: Find the comment and remove the reply, then update the comment
      // This is a workaround if onReplyDelete is not provided
      const comment = normalizedComments.find((c) => c.id === commentId);
      if (comment) {
        // Note: This won't actually update the replies array in the parent
        // The parent should provide onReplyDelete callback for proper handling
        console.warn(
          'onReplyDelete callback not provided. Reply deletion may not work correctly.'
        );
      }
    }
  };

  const handleUpdateComment = (id: string, text: string) => {
    onCommentUpdate(id, text);
  };

  const handleUpdateReply = (
    commentId: string,
    replyId: string,
    text: string
  ) => {
    if (onReplyUpdate) {
      onReplyUpdate(commentId, replyId, text);
    } else {
      // Fallback: This won't actually update the reply
      // The parent should provide onReplyUpdate callback for proper handling
      console.warn(
        'onReplyUpdate callback not provided. Reply update may not work correctly.'
      );
    }
  };

  const handleAddReplyToComment = (commentId: string, reply: CommentReply) => {
    onCommentReply(commentId, reply);
  };

  // Convert markdown to HTML
  const htmlContent = useMemo(() => {
    if (!markdownContent) return '';
    return marked.parse(markdownContent) as string;
  }, [markdownContent]);

  const handleFileSelect = (filePath: string) => {
    setCurrentFilePath(filePath);
    if (onFileSelect) {
      onFileSelect(filePath);
    }
  };

  const handleFileTreeOpenChange = (open: boolean) => {
    fileTreeConfig?.onOpenChange(open);
  };

  const handleTableOfContentsOpenChange = (open: boolean) => {
    tableOfContentsConfig?.onOpenChange(open);
  };

  const handleCommentsSidebarOpenChange = (open: boolean) => {
    commentsSidebarConfig?.onOpenChange(open);
  };

  return (
    <>
      <div
        className={getMarkdownViewerGridClassName(
          folderTree.length > 0 && fileTreeOpen,
          !!markdownContent,
          tableOfContentsOpen,
          !commentsSidebarOpen
        )}
      >
        {folderTree.length > 0 && fileTreeOpen && (
          <div className="h-full overflow-hidden">
            <FileTree
              fileTree={folderTree}
              currentFilePath={currentFilePath}
              onFileSelect={handleFileSelect}
              onToggleFileTree={fileTreeConfig ? () => handleFileTreeOpenChange(false) : undefined}
              showCloseIcon={fileTreeConfig?.showCloseIcon ?? true}
            />
          </div>
        )}

        {markdownContent && tableOfContentsOpen && (
          <div className="h-full overflow-hidden">
            <TableOfContents
              htmlContent={htmlContent}
              previewRef={textSelectionRef}
              onToggleTableOfContents={tableOfContentsConfig ? () => handleTableOfContentsOpenChange(false) : undefined}
              showCloseIcon={tableOfContentsConfig?.showCloseIcon ?? true}
            />
          </div>
        )}

        <Card className="bg-white rounded-lg p-6 shadow-sm flex flex-col overflow-hidden h-full">
          <PreviewHeader
            commentsCount={normalizedComments.length}
            onExportComments={handleExportComments}
          />
          <FilePreview
            fileContent={markdownContent}
            htmlContent={htmlContent}
            textSelectionRef={textSelectionRef}
            handleTextSelection={handleTextSelection}
            commentIconPosition={commentIconPosition}
            handleCommentIconClickWithDialog={handleCommentIconClickWithDialog}
            configId={null}
            fileTreeLength={folderTree.length}
            comments={normalizedComments}
            focusedCommentId={focusedCommentId}
            quickComments={quickComments}
            onQuickCommentClick={handleQuickCommentClick}
            onCommentHighlightClick={(commentId) => {
              setFocusedCommentId(commentId);
              setShouldShakeCommentId(commentId);
              // Clear focus after animation completes (1s for pulse animation)
              setTimeout(() => {
                setFocusedCommentId(null);
                setShouldShakeCommentId(null);
              }, 1000);
            }}
          />
        </Card>

        {commentsSidebarOpen && (
          <div className="h-full overflow-hidden">
            <CommentsSidebar
            comments={normalizedComments}
            commentHistory={[]}
            selectedHistoryId={null}
            isViewingHistory={false}
            selectedFilePath={currentFilePath}
            editingCommentId={editingCommentId}
            editingReplyId={editingReplyId}
            editText={editText}
            replyingToCommentId={replyingToCommentId}
            replyText={replyText}
            onSelectedHistoryIdChange={() => {}}
            onEditTextChange={setEditText}
            onReplyTextChange={setReplyText}
            onStartEdit={handleStartEdit}
            onStartEditReply={handleStartEditReply}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={(updateComment, updateReply) => {
              handleSaveEdit(
                (id, text) => {
                  handleUpdateComment(id, text);
                  updateComment(id, text);
                },
                (commentId, replyId, text) => {
                  handleUpdateReply(commentId, replyId, text);
                  updateReply(commentId, replyId, text);
                }
              );
            }}
            onStartReply={handleStartReply}
            onCancelReply={handleCancelReply}
            onSaveReply={(commentId, addReply) => {
              handleSaveReply(commentId, (id, reply) => {
                handleAddReplyToComment(id, reply);
                addReply(id, reply);
              });
            }}
            onDeleteComment={handleDeleteComment}
            onDeleteReply={handleDeleteReply}
            updateComment={handleUpdateComment}
            updateReply={handleUpdateReply}
            addReplyToComment={handleAddReplyToComment}
            onToggleCommentsSidebar={commentsSidebarConfig ? () => handleCommentsSidebarOpenChange(false) : undefined}
            showCloseIcon={commentsSidebarConfig?.showCloseIcon ?? true}
            focusedCommentId={focusedCommentId}
            shouldShakeCommentId={shouldShakeCommentId}
            onCommentClick={(commentId) => {
              setFocusedCommentId(commentId);
              // Don't shake when clicking from sidebar, only pulse highlight
              // Clear focus after animation completes (1s for pulse animation)
              setTimeout(() => setFocusedCommentId(null), 1000);
            }}
          />
          </div>
        )}
      </div>
      {folderTree.length > 0 && !fileTreeOpen && fileTreeConfig && (
        <FixedToggleButton
          onClick={() => handleFileTreeOpenChange(true)}
          title="Show Files"
          icon={FolderOpen}
          position="left"
          index={0}
          className="left-0"
        />
      )}
      {!tableOfContentsOpen && tableOfContentsConfig && (
        <FixedToggleButton
          onClick={() => handleTableOfContentsOpenChange(true)}
          title="Show Table of Contents"
          icon={PanelLeftClose}
          position="left"
          index={1}
          className={
            folderTree.length > 0 && fileTreeOpen ? 'left-[300px]' : 'left-0'
          }
        />
      )}
      {!commentsSidebarOpen && commentsSidebarConfig && (
        <button
          onClick={() => handleCommentsSidebarOpenChange(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-l-lg shadow-lg border border-gray-200 border-r-0 px-2 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
          title="Show Comments"
        >
          <MessageSquare className="size-4 text-gray-600" />
        </button>
      )}
      <CommentDialog
        open={showCommentDialog}
        onOpenChange={setShowCommentDialog}
        selectedText={selectedText || ''}
        selectionPosition={selectionPosition}
        commentText={commentText}
        onCommentTextChange={setCommentText}
        onSave={handleAddComment}
        onCancel={() => {
          setShowCommentDialog(false);
          setCommentText('');
          clearSelection();
        }}
      />
      {showExportDialog && (
        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          comments={normalizedComments}
        />
      )}
    </>
  );
}
