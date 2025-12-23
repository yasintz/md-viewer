import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText: string;
  selectionPosition: { line: number; column: number } | null;
  commentText: string;
  onCommentTextChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function CommentDialog({
  open,
  onOpenChange,
  selectedText,
  selectionPosition,
  commentText,
  onCommentTextChange,
  onSave,
  onCancel,
}: CommentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
        </DialogHeader>
        <div className="mb-4 p-3 bg-gray-50 rounded border-l-4 border-blue-600">
          <strong className="block mb-2 text-sm text-gray-600">Selected text:</strong>
          <p className="m-0 italic text-gray-800">"{selectedText}"</p>
        </div>
        <div className="text-sm text-gray-600 mb-4 font-medium">
          Position: Line {selectionPosition?.line}, Column {selectionPosition?.column}
        </div>
        <textarea
          className="w-full min-h-[120px] p-3 border border-gray-300 rounded text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          value={commentText}
          onChange={(e) => onCommentTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (commentText.trim()) {
                onSave();
              }
            }
          }}
          placeholder="Enter your comment..."
          autoFocus
        />
        <DialogFooter>
          <Button onClick={onCancel} variant="ghost">Cancel</Button>
          <Button
            onClick={onSave}
            disabled={!commentText.trim()}
          >
            Save Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

