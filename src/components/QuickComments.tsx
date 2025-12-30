import * as LucideIcons from 'lucide-react';

interface CommentIconPosition {
  top: number;
  left: number;
}

export interface QuickComment {
  id: string;
  commentText: string;
  icon: string; // lucide icon name
}

interface QuickCommentsProps {
  position: CommentIconPosition;
  quickComments: QuickComment[];
  onQuickCommentClick: (quickComment: QuickComment) => void;
  onCommentIconClick: (e: React.MouseEvent) => void;
}

export function QuickComments({
  position,
  quickComments,
  onQuickCommentClick,
  onCommentIconClick,
}: QuickCommentsProps) {
  // Get the icon component from lucide-react dynamically
  const getIconComponent = (iconName: string) => {
    // Convert kebab-case to PascalCase (e.g., 'message-square' -> 'MessageSquare', 'trash-2' -> 'Trash2')
    // Remove dashes and capitalize each word
    const pascalCaseName = iconName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    // Get the icon component from lucide-react
    const IconComponent = (LucideIcons as any)[pascalCaseName] as React.ComponentType<{ className?: string }>;
    
    // Fallback to MessageSquare if icon not found
    if (!IconComponent) {
      console.warn(`Icon "${iconName}" (resolved as "${pascalCaseName}") not found in lucide-react. Using MessageSquare as fallback.`);
      return LucideIcons.MessageSquare;
    }
    
    return IconComponent;
  };

  return (
    <div
      className="absolute z-10 animate-in fade-in zoom-in"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 shadow-md p-1">
        {/* Regular comment icon */}
        <button
          className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 cursor-pointer flex items-center justify-center transition-all hover:bg-blue-100 hover:scale-105 active:scale-95"
          onClick={onCommentIconClick}
          onMouseDown={(e) => e.preventDefault()}
          title="Add comment"
        >
          <LucideIcons.MessageSquare className="w-4 h-4" />
        </button>

        {/* Quick comment buttons */}
        {quickComments.map((quickComment) => {
          const IconComponent = getIconComponent(quickComment.icon);
          return (
            <button
              key={quickComment.id}
              className="w-8 h-8 rounded-md text-gray-600 cursor-pointer flex items-center justify-center transition-all hover:bg-gray-100 hover:scale-105 active:scale-95"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickCommentClick(quickComment);
              }}
              onMouseDown={(e) => e.preventDefault()}
              title={quickComment.commentText}
            >
              <IconComponent className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

