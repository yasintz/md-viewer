import type { Comment } from '@/types';
import { normalizeText } from './normalizeText';
import { stripMarkdownFormatting } from './stripMarkdownFormatting';

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
    // Strip markdown formatting from the selected text to match rendered HTML
    const rawSearchText = stripMarkdownFormatting(comment.selectedText);
    const searchText = normalizeText(rawSearchText);
    if (!searchText) continue;

    // Skip if this comment is already highlighted
    if (tempDiv.querySelector(`[data-comment-id="${comment.id}"]`)) {
      continue;
    }

    // Get all text content from the HTML (excluding already highlighted spans)
    const getAllTextNodes = (): Text[] => {
      const textNodes: Text[] = [];
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

      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (node.nodeType === Node.TEXT_NODE) {
          textNodes.push(node as Text);
        }
      }
      return textNodes;
    };

    const textNodes = getAllTextNodes();
    
    // Try to find the search text, potentially spanning multiple nodes
    // First, try to find it within a single text node
    let foundNode: Text | null = null;
    let startNodeIndex = -1;
    let endNodeIndex = -1;
    let startOffset = -1;
    let endOffset = -1;
    
    // Try single node first
    for (let i = 0; i < textNodes.length; i++) {
      const textNode = textNodes[i];
      const nodeText = normalizeText(textNode.textContent || '');
      const index = nodeText.indexOf(searchText);
      if (index !== -1) {
        foundNode = textNode;
        startNodeIndex = i;
        endNodeIndex = i;
        startOffset = index;
        endOffset = index + searchText.length;
        break;
      }
    }

    // If not found in a single node, try concatenating adjacent nodes
    if (!foundNode) {
      // Try concatenating adjacent nodes to find text that spans multiple nodes
      for (let i = 0; i < textNodes.length; i++) {
        let accumulatedText = '';
        const nodesInRange: Text[] = [];
        
        // Try up to 10 adjacent nodes
        for (let j = i; j < Math.min(i + 10, textNodes.length); j++) {
          const node = textNodes[j];
          const nodeText = node.textContent || '';
          nodesInRange.push(node);
          accumulatedText += (accumulatedText ? ' ' : '') + nodeText;
          
          const normalizedAccumulated = normalizeText(accumulatedText);
          const searchIndex = normalizedAccumulated.indexOf(searchText);
          
          if (searchIndex !== -1) {
            // Found it! Now figure out which nodes contain the match
            // Calculate positions in normalized space
            let currentNormPos = 0;
            
            for (let k = 0; k < nodesInRange.length; k++) {
              const node = nodesInRange[k];
              const nodeNorm = normalizeText(node.textContent || '');
              const nodeStartNorm = currentNormPos;
              const nodeEndNorm = currentNormPos + nodeNorm.length;
              
              // Check if search starts in this node
              if (searchIndex >= nodeStartNorm && searchIndex < nodeEndNorm) {
                startNodeIndex = i + k;
                startOffset = searchIndex - nodeStartNorm;
                
                // Calculate end position
                const searchEndNorm = searchIndex + searchText.length;
                if (searchEndNorm <= nodeEndNorm) {
                  // Entire match is in this node
                  endNodeIndex = i + k;
                  endOffset = searchEndNorm - nodeStartNorm;
                } else {
                  // Match spans to next nodes
                  endNodeIndex = i + k;
                  endOffset = nodeNorm.length;
                  let remainingLength = searchText.length - (nodeNorm.length - startOffset);
                  
                  for (let m = k + 1; m < nodesInRange.length && remainingLength > 0; m++) {
                    const nextNode = nodesInRange[m];
                    const nextNodeNorm = normalizeText(nextNode.textContent || '');
                    endNodeIndex = i + m;
                    
                    if (remainingLength <= nextNodeNorm.length) {
                      endOffset = remainingLength;
                      remainingLength = 0;
                    } else {
                      remainingLength -= nextNodeNorm.length;
                      endOffset = nextNodeNorm.length;
                    }
                  }
                }
                
                foundNode = node;
                break;
              }
              
              currentNormPos = nodeEndNorm + 1; // +1 for space between nodes
            }
            
            if (foundNode) break;
          }
        }
        
        if (foundNode) break;
      }
    }

    if (!foundNode || startNodeIndex === -1) continue;

    // Handle highlighting - either single node or multiple nodes
    if (startNodeIndex === endNodeIndex) {
      // Single node case
      const textNode = textNodes[startNodeIndex];
      const originalText = textNode.textContent || '';
      const normalizedOriginal = normalizeText(originalText);
      
      // Map normalized offset back to original text position
      let normalizedPos = 0;
      let actualStartPos = 0;
      let actualEndPos = originalText.length;

      // Find start position
      for (let i = 0; i < originalText.length; i++) {
        const char = originalText[i];
        if (/\s/.test(char)) {
          if (normalizedPos === 0 || normalizedOriginal[normalizedPos - 1] !== ' ') {
            normalizedPos++;
          }
        } else {
          normalizedPos++;
        }
        
        if (normalizedPos > startOffset) {
          actualStartPos = i;
          break;
        }
      }

      // Find end position
      normalizedPos = startOffset;
      for (let i = actualStartPos; i < originalText.length; i++) {
        const char = originalText[i];
        if (/\s/.test(char)) {
          if (normalizedPos < normalizedOriginal.length && normalizedOriginal[normalizedPos] === ' ') {
            normalizedPos++;
          }
        } else {
          normalizedPos++;
        }
        
        if (normalizedPos >= startOffset + searchText.length) {
          actualEndPos = i + 1;
          break;
        }
      }

      // Extract text parts
      const beforeText = originalText.substring(0, actualStartPos);
      const highlightText = originalText.substring(actualStartPos, actualEndPos);
      const afterText = originalText.substring(actualEndPos);

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
    } else {
      // Multiple nodes case - wrap the nodes in a span
      const startNode = textNodes[startNodeIndex];
      const endNode = textNodes[endNodeIndex];
      
      // Helper to convert normalized offset to actual character position
      const normalizedToActualOffset = (node: Text, normalizedOffset: number): number => {
        const nodeText = node.textContent || '';
        const normalizedText = normalizeText(nodeText);
        let normalizedPos = 0;
        
        for (let i = 0; i < nodeText.length; i++) {
          const char = nodeText[i];
          if (/\s/.test(char)) {
            if (normalizedPos === 0 || normalizedText[normalizedPos - 1] !== ' ') {
              normalizedPos++;
            }
          } else {
            normalizedPos++;
          }
          
          if (normalizedPos > normalizedOffset) {
            return i;
          }
        }
        return nodeText.length;
      };
      
      // Split start node if needed
      if (startOffset > 0) {
        const actualStartPos = normalizedToActualOffset(startNode, startOffset);
        if (actualStartPos > 0) {
          const startNodeText = startNode.textContent || '';
          const beforeText = startNodeText.substring(0, actualStartPos);
          const beforeNode = document.createTextNode(beforeText);
          startNode.parentNode?.insertBefore(beforeNode, startNode);
          startNode.textContent = startNodeText.substring(actualStartPos);
        }
      }
      
      // Split end node if needed
      const endNodeText = endNode.textContent || '';
      const normalizedEndText = normalizeText(endNodeText);
      if (endOffset < normalizedEndText.length) {
        const actualEndPos = normalizedToActualOffset(endNode, endOffset);
        if (actualEndPos < endNodeText.length) {
          const afterText = endNodeText.substring(actualEndPos);
          const afterNode = document.createTextNode(afterText);
          endNode.parentNode?.insertBefore(afterNode, endNode.nextSibling);
          endNode.textContent = endNodeText.substring(0, actualEndPos);
        }
      }
      
      // Create range from start node to end node
      const range = document.createRange();
      range.setStartBefore(startNode);
      range.setEndAfter(endNode);
      
      // Wrap the range in a span
      const span = document.createElement('span');
      span.className = 'comment-highlight';
      span.setAttribute('data-comment-id', comment.id);
      
      try {
        range.surroundContents(span);
      } catch (e) {
        // If surroundContents fails, manually wrap the nodes
        const contents = Array.from(range.cloneContents().childNodes);
        contents.forEach(node => {
          span.appendChild(node.cloneNode(true));
        });
        
        range.deleteContents();
        range.insertNode(span);
      }
    }
  }

  return tempDiv.innerHTML;
}

