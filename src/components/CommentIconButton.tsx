import { MessageSquare } from 'lucide-react';

interface CommentIconPosition {
  top: number;
  left: number;
}

interface CommentIconButtonProps {
  position: CommentIconPosition;
  onClick: (e: React.MouseEvent) => void;
}

export function CommentIconButton({ position, onClick }: CommentIconButtonProps) {
  return (
    <div
      className="absolute z-10 animate-in fade-in zoom-in"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="bg-white rounded-lg border border-gray-200 shadow-md p-1">
        <button
          className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 cursor-pointer flex items-center justify-center transition-all hover:bg-blue-100 hover:scale-105 active:scale-95"
          onClick={onClick}
          onMouseDown={(e) => e.preventDefault()}
          title="Add comment"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

