import { forwardRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CommentReply } from './CommentReply';
import type { Comment as CommentType } from '@/types';

interface CommentItemProps {
  comment: CommentType;
  isEditing: boolean;
  isEditingReply: boolean;
  editingReplyId: string | null;
  editText: string;
  replyingToCommentId: string | null;
  replyText: string;
  isViewingHistory: boolean;
  selectedFilePath: string | null;
  onEditTextChange: (value: string) => void;
  onReplyTextChange: (value: string) => void;
  onStartEdit: (id: string, text: string) => void;
  onStartEditReply: (commentId: string, replyId: string, text: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (updateComment: (id: string, text: string) => void, updateReply: (commentId: string, replyId: string, text: string) => void) => void;
  onStartReply: (commentId: string) => void;
  onCancelReply: () => void;
  onSaveReply: (commentId: string, addReply: (commentId: string, reply: { id: string; text: string; timestamp: number }) => void) => void;
  onDelete: (id: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
  updateComment: (id: string, text: string, filePath?: string) => void;
  updateReply: (commentId: string, replyId: string, text: string, filePath?: string) => void;
  addReplyToComment: (commentId: string, reply: { id: string; text: string; timestamp: number }, filePath?: string) => void;
  isFocused?: boolean;
}

export const CommentItem = forwardRef<HTMLDivElement, CommentItemProps>(({
  comment,
  isEditing,
  isEditingReply,
  editingReplyId,
  editText,
  replyingToCommentId,
  replyText,
  isViewingHistory,
  selectedFilePath,
  onEditTextChange,
  onReplyTextChange,
  onStartEdit,
  onStartEditReply,
  onCancelEdit,
  onSaveEdit,
  onStartReply,
  onCancelReply,
  onSaveReply,
  onDelete,
  onDeleteReply,
  updateComment,
  updateReply,
  addReplyToComment,
  isFocused = false,
}, ref) => {
  const [shouldShake, setShouldShake] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isFocused]);

  return (
    <div 
      ref={ref}
      className={`border border-gray-200 rounded-md p-4 bg-gray-50 transition-shadow hover:shadow-md ${shouldShake ? 'comment-item-shake' : ''}`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-600 font-semibold bg-blue-100 px-2 py-1 rounded">
          Line {comment.line}, Col {comment.column}
        </span>
        {!isViewingHistory && (
          <button
            className="bg-transparent border-none text-xl text-gray-400 cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded transition-all hover:bg-red-50 hover:text-red-600"
            onClick={() => onDelete(comment.id)}
            title="Delete comment"
          >
            ×
          </button>
        )}
      </div>
      <div className="text-sm text-gray-700 italic mb-2 px-2 py-2 bg-white border-l-4 border-blue-600 rounded">
        "{comment.selectedText}"
      </div>

      {isEditing && !isEditingReply ? (
        <div className="mt-2">
          <textarea
            className="w-full min-h-20 p-2 border border-gray-300 rounded text-sm resize-y mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (editText.trim()) {
                  onSaveEdit(
                    (id, text) => updateComment(id, text, selectedFilePath || undefined),
                    (commentId, replyId, text) => updateReply(commentId, replyId, text, selectedFilePath || undefined)
                  );
                }
              }
            }}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button onClick={onCancelEdit} variant="ghost" size="sm">Cancel</Button>
            <Button
              onClick={() => onSaveEdit(
                (id, text) => updateComment(id, text, selectedFilePath || undefined),
                (commentId, replyId, text) => updateReply(commentId, replyId, text, selectedFilePath || undefined)
              )}
              disabled={!editText.trim()}
              size="sm"
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-800 mb-2 leading-relaxed">
            {comment.text}
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">
              {new Date(comment.timestamp).toLocaleString()}
            </span>
            {!isViewingHistory && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStartEdit(comment.id, comment.text)}
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStartReply(comment.id)}
                >
                  💬 Reply
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {comment.replies.length > 0 && (
        <div className="mt-4 pl-4 border-l-4 border-blue-100">
          {comment.replies.map((reply) => (
            <div
              key={reply.id}
              className="p-3 bg-gray-50 rounded mb-2 last:mb-0"
            >
              <CommentReply
                reply={reply}
                commentId={comment.id}
                isEditing={isEditing && editingReplyId === reply.id}
                editText={editText}
                onEditTextChange={onEditTextChange}
                onStartEdit={() => onStartEditReply(comment.id, reply.id, reply.text)}
                onCancelEdit={onCancelEdit}
                onSaveEdit={() => onSaveEdit(
                  (id, text) => updateComment(id, text, selectedFilePath || undefined),
                  (commentId, replyId, text) => updateReply(commentId, replyId, text, selectedFilePath || undefined)
                )}
                onDelete={() => onDeleteReply(comment.id, reply.id)}
                isViewingHistory={isViewingHistory}
              />
            </div>
          ))}
        </div>
      )}

      {!isViewingHistory && replyingToCommentId === comment.id && (
        <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
          <textarea
            className="w-full min-h-20 p-2 border border-gray-300 rounded text-sm resize-y mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (replyText.trim()) {
                  onSaveReply(
                    comment.id,
                    (commentId, reply) => addReplyToComment(commentId, reply, selectedFilePath || undefined)
                  );
                }
              }
            }}
            placeholder="Write a reply..."
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button onClick={onCancelReply} variant="ghost" size="sm">Cancel</Button>
            <Button
              onClick={() => onSaveReply(
                comment.id,
                (commentId, reply) => addReplyToComment(commentId, reply, selectedFilePath || undefined)
              )}
              disabled={!replyText.trim()}
              size="sm"
            >
              Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

CommentItem.displayName = 'CommentItem';

