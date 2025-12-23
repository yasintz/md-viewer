import { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { CommentItem } from './CommentItem';
import type { Comment, CommentHistory } from '@/types';

interface CommentsSidebarProps {
  comments: Comment[];
  commentHistory: CommentHistory[];
  selectedHistoryId: string | null;
  isViewingHistory: boolean;
  selectedFilePath: string | null;
  editingCommentId: string | null;
  editingReplyId: string | null;
  editText: string;
  replyingToCommentId: string | null;
  replyText: string;
  onSelectedHistoryIdChange: (value: string | null) => void;
  onEditTextChange: (value: string) => void;
  onReplyTextChange: (value: string) => void;
  onStartEdit: (id: string, text: string) => void;
  onStartEditReply: (commentId: string, replyId: string, text: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (updateComment: (id: string, text: string) => void, updateReply: (commentId: string, replyId: string, text: string) => void) => void;
  onStartReply: (commentId: string) => void;
  onCancelReply: () => void;
  onSaveReply: (commentId: string, addReply: (commentId: string, reply: { id: string; text: string; timestamp: number }) => void) => void;
  onDeleteComment: (id: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
  updateComment: (id: string, text: string, filePath?: string) => void;
  updateReply: (commentId: string, replyId: string, text: string, filePath?: string) => void;
  addReplyToComment: (commentId: string, reply: { id: string; text: string; timestamp: number }, filePath?: string) => void;
  onToggleCommentsSidebar?: () => void;
  focusedCommentId?: string | null;
}

export function CommentsSidebar({
  comments,
  commentHistory,
  selectedHistoryId,
  isViewingHistory,
  selectedFilePath,
  editingCommentId,
  editingReplyId,
  editText,
  replyingToCommentId,
  replyText,
  onSelectedHistoryIdChange,
  onEditTextChange,
  onReplyTextChange,
  onStartEdit,
  onStartEditReply,
  onCancelEdit,
  onSaveEdit,
  onStartReply,
  onCancelReply,
  onSaveReply,
  onDeleteComment,
  onDeleteReply,
  updateComment,
  updateReply,
  addReplyToComment,
  onToggleCommentsSidebar,
  focusedCommentId,
}: CommentsSidebarProps) {
  const commentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll to focused comment
  useEffect(() => {
    if (focusedCommentId) {
      const commentRef = commentRefs.current.get(focusedCommentId);
      if (commentRef) {
        commentRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [focusedCommentId]);

  const setCommentRef = (commentId: string, element: HTMLDivElement | null) => {
    if (element) {
      commentRefs.current.set(commentId, element);
    } else {
      commentRefs.current.delete(commentId);
    }
  };
  return (
    <Card className="bg-white rounded-lg p-6 shadow-sm flex flex-col overflow-hidden">
      <CardHeader className="p-0 pb-4">
        <div className="flex justify-between items-center border-b-2 border-blue-600 pb-2">
          <CardTitle className="text-lg text-gray-800 m-0">
            Comments
          </CardTitle>
          <div className="flex items-center gap-2">
            {commentHistory.length > 0 && (
              <Select
                value={selectedHistoryId || 'current'}
                onValueChange={(value) => {
                  if (value === 'current') {
                    onSelectedHistoryIdChange(null);
                  } else {
                    onSelectedHistoryIdChange(value);
                  }
                }}
              >
                <SelectTrigger className="w-[200px] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    Current ({comments.length})
                  </SelectItem>
                  {commentHistory
                    .sort((a, b) => b.savedAt - a.savedAt)
                    .map((history) => (
                      <SelectItem key={history.id} value={history.id}>
                        {new Date(history.savedAt).toLocaleString()} (
                        {history.comments.length})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
            {onToggleCommentsSidebar && (
              <Button
                onClick={onToggleCommentsSidebar}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col p-0 pt-4">
        {isViewingHistory && (
          <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-3 py-2 rounded mb-4 text-sm text-center">
            📜 Viewing history - Comments are read-only
          </div>
        )}

        {comments.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 italic">
            <p>
              {isViewingHistory
                ? 'No comments in this history.'
                : 'No comments yet. Select text in the preview to add comments.'}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                ref={(el) => setCommentRef(comment.id, el)}
                comment={comment}
                isEditing={editingCommentId === comment.id}
                isEditingReply={!!editingReplyId}
                editingReplyId={editingReplyId}
                editText={editText}
                replyingToCommentId={replyingToCommentId}
                replyText={replyText}
                isViewingHistory={isViewingHistory}
                selectedFilePath={selectedFilePath}
                onEditTextChange={onEditTextChange}
                onReplyTextChange={onReplyTextChange}
                onStartEdit={onStartEdit}
                onStartEditReply={onStartEditReply}
                onCancelEdit={onCancelEdit}
                onSaveEdit={onSaveEdit}
                onStartReply={onStartReply}
                onCancelReply={onCancelReply}
                onSaveReply={onSaveReply}
                onDelete={onDeleteComment}
                onDeleteReply={onDeleteReply}
                updateComment={updateComment}
                updateReply={updateReply}
                addReplyToComment={addReplyToComment}
                isFocused={focusedCommentId === comment.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

