import { Button } from '@/components/ui/button';
import type { CommentReply as CommentReplyType } from '@/types';

interface CommentReplyProps {
  reply: CommentReplyType;
  commentId: string;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  isViewingHistory: boolean;
}

export function CommentReply({
  reply,
  commentId: _commentId,
  isEditing,
  editText,
  onEditTextChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  isViewingHistory,
}: CommentReplyProps) {
  if (isEditing) {
    return (
      <div>
        <textarea
          className="w-full min-h-20 p-2 border border-gray-300 rounded text-sm resize-y mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (editText.trim()) {
                onSaveEdit();
              }
            }
          }}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onCancelEdit} variant="ghost" size="sm">Cancel</Button>
          <Button onClick={onSaveEdit} size="sm">Save</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-sm text-gray-800 leading-relaxed mb-2">
        {reply.text}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {new Date(reply.timestamp).toLocaleString()}
        </span>
        {!isViewingHistory && (
          <div className="flex gap-1">
            <button
              className="bg-transparent border-none p-1 cursor-pointer text-sm opacity-60 transition-opacity hover:opacity-100"
              onClick={onStartEdit}
            >
              ✏️
            </button>
            <button
              className="bg-transparent border-none p-1 cursor-pointer text-sm opacity-60 transition-opacity hover:opacity-100"
              onClick={onDelete}
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </>
  );
}

