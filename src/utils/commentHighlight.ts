import type { Comment } from '../store';

/**
 * Normalizes text by collapsing whitespace for comparison
 */
function normalizeText(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Highlights comment text in HTML by wrapping matching text with spans.
 * Uses DOM manipulation to safely handle HTML structure.
 */
export function highlightCommentsInHtml(
  htmlContent: string,
  comments: Comment[]
): string {
  if (!htmlContent || comments.length === 0) {
    return htmlContent;
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Process each comment
  for (const comment of comments) {
    const searchText = normalizeText(comment.selectedText);
    if (!searchText) continue;

    // Skip if this comment is already highlighted
    if (tempDiv.querySelector(`[data-comment-id="${comment.id}"]`)) {
      continue;
    }

    // Find all text nodes (excluding those inside already highlighted spans)
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip text nodes that are inside comment-highlight spans
          let parent = node.parentNode;
          while (parent && parent !== tempDiv) {
            if (parent instanceof HTMLElement && parent.classList.contains('comment-highlight')) {
              return NodeFilter.FILTER_REJECT;
            }
            parent = parent.parentNode;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let textNode: Text | null = null;
    let node: Node | null;
    
    // Find first text node that contains the search text
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nodeText = normalizeText(node.textContent || '');
        if (nodeText.includes(searchText)) {
          textNode = node as Text;
          break;
        }
      }
    }

    if (!textNode) continue;

    const originalText = textNode.textContent || '';
    const normalizedOriginal = normalizeText(originalText);
    const searchIndex = normalizedOriginal.indexOf(searchText);
    
    if (searchIndex === -1) continue;

    // Find character positions by mapping normalized positions back to original
    // We'll find the start by counting characters, treating whitespace sequences as single spaces
    let normalizedPos = 0;
    let startPos = 0;
    let endPos = originalText.length;

    // Find start position
    for (let i = 0; i < originalText.length; i++) {
      const char = originalText[i];
      if (/\s/.test(char)) {
        // Whitespace: only advance normalized pos if we're not already on whitespace
        if (normalizedPos === 0 || normalizedOriginal[normalizedPos - 1] !== ' ') {
          normalizedPos++;
        }
      } else {
        normalizedPos++;
      }
      
      if (normalizedPos > searchIndex) {
        startPos = i;
        break;
      }
    }

    // Find end position
    normalizedPos = searchIndex;
    for (let i = startPos; i < originalText.length; i++) {
      const char = originalText[i];
      if (/\s/.test(char)) {
        if (normalizedPos < normalizedOriginal.length && normalizedOriginal[normalizedPos] === ' ') {
          normalizedPos++;
        }
      } else {
        normalizedPos++;
      }
      
      if (normalizedPos >= searchIndex + searchText.length) {
        endPos = i + 1;
        break;
      }
    }

    // Extract text parts
    const beforeText = originalText.substring(0, startPos);
    const highlightText = originalText.substring(startPos, endPos);
    const afterText = originalText.substring(endPos);

    // Create the highlighted span
    const span = document.createElement('span');
    span.className = 'comment-highlight';
    span.setAttribute('data-comment-id', comment.id);
    span.textContent = highlightText;

    // Replace the text node
    const parent = textNode.parentNode;
    if (!parent) continue;

    // Insert before text
    if (beforeText) {
      parent.insertBefore(document.createTextNode(beforeText), textNode);
    }

    // Insert highlight span
    parent.insertBefore(span, textNode);

    // Insert after text
    if (afterText) {
      parent.insertBefore(document.createTextNode(afterText), textNode);
    }

    // Remove original text node
    parent.removeChild(textNode);
  }

  return tempDiv.innerHTML;
}
