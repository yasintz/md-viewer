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
    <button
      className="absolute w-9 h-9 rounded-full bg-blue-600 text-white border-2 border-white shadow-lg cursor-pointer flex items-center justify-center text-xl transition-all z-10 animate-in fade-in zoom-in hover:bg-blue-700 hover:scale-110 hover:shadow-xl active:scale-95"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      title="Add comment"
    >
      💬
    </button>
  );
}

