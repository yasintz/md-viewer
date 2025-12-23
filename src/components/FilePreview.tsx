import { useMemo, useEffect, useRef } from 'react';
import { CardContent } from '@/components/ui/card';
import { CommentIconButton } from './CommentIconButton';
import type { Comment } from '@/types';
import { highlightCommentsInHtml } from '@/utils/commentHighlight';

interface CommentIconPosition {
  top: number;
  left: number;
}

interface FilePreviewProps {
  fileContent: string;
  htmlContent: string;
  textSelectionRef: React.RefObject<HTMLDivElement | null>;
  handleTextSelection: (e: React.MouseEvent<HTMLDivElement>) => void;
  commentIconPosition: CommentIconPosition | null;
  handleCommentIconClickWithDialog: (e: React.MouseEvent) => void;
  configId: string | null;
  fileTreeLength: number;
  comments: Comment[];
  onCommentHighlightClick?: (commentId: string) => void;
  focusedCommentId?: string | null;
}

export function FilePreview({
  fileContent,
  htmlContent,
  textSelectionRef,
  handleTextSelection,
  commentIconPosition,
  handleCommentIconClickWithDialog,
  configId,
  fileTreeLength,
  comments,
  onCommentHighlightClick,
  focusedCommentId,
}: FilePreviewProps) {
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Highlight comments in HTML
  const highlightedHtml = useMemo(() => {
    return highlightCommentsInHtml(htmlContent, comments);
  }, [htmlContent, comments]);

  // Scroll to highlighted text and add pulse animation when comment is focused
  useEffect(() => {
    if (focusedCommentId && previewContainerRef.current) {
      const highlightSpan = previewContainerRef.current.querySelector(
        `[data-comment-id="${focusedCommentId}"]`
      ) as HTMLElement;
      
      if (highlightSpan) {
        // Add focused class for pulse animation
        highlightSpan.classList.add('focused');
        
        // Scroll to highlight
        highlightSpan.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Remove focused class after animation completes
        const timer = setTimeout(() => {
          highlightSpan.classList.remove('focused');
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [focusedCommentId]);

  // Handle click on highlighted comment text
  const handleHighlightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const highlightSpan = target.closest('.comment-highlight') as HTMLElement;
    if (highlightSpan && onCommentHighlightClick) {
      const commentId = highlightSpan.getAttribute('data-comment-id');
      if (commentId) {
        e.preventDefault();
        e.stopPropagation();
        onCommentHighlightClick(commentId);
      }
    }
  };

  return (
    <CardContent className="flex-1 overflow-auto p-0">
      {fileContent ? (
        <div className="flex-1 relative overflow-auto">
          <div
            ref={(node) => {
              if (textSelectionRef && 'current' in textSelectionRef) {
                textSelectionRef.current = node;
              }
              previewContainerRef.current = node;
            }}
            className="flex-1 overflow-auto p-4 leading-relaxed select-text cursor-text prose prose-sm max-w-none [&_h1]:mt-6 [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:border-b [&_h1]:border-gray-200 [&_h1]:pb-1 [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-1 [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mt-4 [&_h4]:mb-1 [&_h4]:text-base [&_h5]:mt-4 [&_h5]:mb-1 [&_h5]:text-sm [&_h6]:mt-4 [&_h6]:mb-1 [&_h6]:text-xs [&_h6]:text-gray-500 [&_p]:mb-4 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600 [&_blockquote]:my-4 [&_ul]:pl-8 [&_ul]:mb-4 [&_ul]:list-disc [&_ol]:pl-8 [&_ol]:mb-4 [&_ol]:list-decimal [&_li]:mb-1 [&_a]:text-blue-600 [&_a]:no-underline hover:[&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_table]:border-collapse [&_table]:w-full [&_table]:mb-4 [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:bg-gray-100 [&_th]:font-semibold [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-2 [&_hr]:border-0 [&_hr]:border-t-2 [&_hr]:border-gray-200 [&_hr]:my-8 [&_::selection]:bg-blue-200"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            onMouseUp={handleTextSelection}
            onClick={handleHighlightClick}
          />
          {commentIconPosition && (
            <CommentIconButton
              position={commentIconPosition}
              onClick={handleCommentIconClickWithDialog}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 italic">
          <p>
            {configId
              ? fileTreeLength > 0
                ? 'Select a file from the file tree to start reviewing'
                : 'No files match the filter pattern'
              : 'Create a configuration to start watching files'}
          </p>
        </div>
      )}
    </CardContent>
  );
}

