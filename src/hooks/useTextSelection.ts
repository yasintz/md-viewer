import { useState, useRef, useCallback, useLayoutEffect } from 'react';
import { normalizeText } from '@/utils/commentHighlight/normalizeText';

interface SelectionPosition {
  line: number;
  column: number;
}

interface CommentIconPosition {
  top: number;
  left: number;
}

interface UseTextSelectionResult {
  previewRef: React.RefObject<HTMLDivElement | null>;
  commentIconPosition: CommentIconPosition | null;
  selectedText: string;
  selectionPosition: SelectionPosition | null;
  handleTextSelection: () => void;
  handleCommentIconClick: (e: React.MouseEvent) => void;
  clearSelection: () => void;
}

// Find all occurrences of a search string in content
function findAllOccurrences(searchText: string, content: string): number[] {
  const occurrences: number[] = [];
  let index = content.indexOf(searchText);
  while (index !== -1) {
    occurrences.push(index);
    index = content.indexOf(searchText, index + 1);
  }
  return occurrences;
}

// Get context before and after selection from HTML
function getSelectionContext(
  range: Range,
  previewElement: HTMLDivElement
): { before: string; after: string } {
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(previewElement);
  preCaretRange.setEnd(range.startContainer, range.startOffset);
  const textBeforeSelection = preCaretRange.toString();

  const postCaretRange = range.cloneRange();
  postCaretRange.selectNodeContents(previewElement);
  postCaretRange.setStart(range.endContainer, range.endOffset);
  const textAfterSelection = postCaretRange.toString();

  return {
    before: textBeforeSelection,
    after: textAfterSelection,
  };
}

// Find the occurrence closest to estimated HTML line position
function findClosestOccurrence(
  occurrences: number[],
  markdownContent: string,
  estimatedHtmlLine: number
): number {
  let closestOccurrence = occurrences[0];
  let minDistance = Infinity;

  for (const occurrence of occurrences) {
    const textBeforeOcc = markdownContent.substring(0, occurrence);
    const occLine = textBeforeOcc.split('\n').length;
    const distance = Math.abs(occLine - estimatedHtmlLine);
    if (distance < minDistance) {
      minDistance = distance;
      closestOccurrence = occurrence;
    }
  }

  return closestOccurrence;
}

// Find unique match by expanding context progressively
function findUniqueMatch(
  searchText: string,
  contextBefore: string,
  contextAfter: string,
  htmlTextBefore: string,
  markdownContent: string,
  maxContextLines: number = 10
): number | null {
  const occurrences = findAllOccurrences(searchText, markdownContent);
  if (occurrences.length === 1) {
    return occurrences[0];
  }
  if (occurrences.length === 0) {
    return null;
  }

  // Normalize context from HTML
  const normalizedBefore = normalizeText(contextBefore);
  const normalizedAfter = normalizeText(contextAfter);

  // Split context into words for matching
  const beforeWords = normalizedBefore.split(/\s+/).filter((w) => w.length > 0);
  const afterWords = normalizedAfter.split(/\s+/).filter((w) => w.length > 0);

  // Try expanding context progressively
  for (
    let contextSize = 1;
    contextSize <= Math.max(beforeWords.length, afterWords.length, maxContextLines);
    contextSize++
  ) {
    // Get context words (take last N words before, first N words after)
    const contextBeforeWords = beforeWords.slice(-contextSize);
    const contextAfterWords = afterWords.slice(0, contextSize);

    const contextBeforeText = contextBeforeWords.join(' ');
    const contextAfterText = contextAfterWords.join(' ');

    // Try to find unique match by checking context around each occurrence
    let uniqueMatch: number | null = null;
    let matchCount = 0;

    for (const occurrence of occurrences) {
      // Get surrounding text from markdown at this occurrence
      const textBeforeOccurrence = markdownContent.substring(
        Math.max(0, occurrence - 1000),
        occurrence
      );
      const textAfterOccurrence = markdownContent.substring(
        occurrence + searchText.length,
        Math.min(markdownContent.length, occurrence + searchText.length + 1000)
      );

      const normalizedBeforeOcc = normalizeText(textBeforeOccurrence);
      const normalizedAfterOcc = normalizeText(textAfterOccurrence);

      // Check if context matches
      const beforeWordsOcc = normalizedBeforeOcc.split(/\s+/).filter((w) => w.length > 0);
      const afterWordsOcc = normalizedAfterOcc.split(/\s+/).filter((w) => w.length > 0);

      const contextBeforeOccWords = beforeWordsOcc.slice(-contextSize);
      const contextAfterOccWords = afterWordsOcc.slice(0, contextSize);

      const contextBeforeOccText = contextBeforeOccWords.join(' ');
      const contextAfterOccText = contextAfterOccWords.join(' ');

      // Check if contexts match (allow partial matches)
      const beforeMatches =
        contextBeforeText &&
        (contextBeforeOccText.includes(contextBeforeText) ||
          contextBeforeText.includes(contextBeforeOccText) ||
          (contextBeforeOccWords.length > 0 &&
            contextBeforeWords.length > 0 &&
            contextBeforeOccWords
              .slice(-Math.min(contextBeforeWords.length, contextBeforeOccWords.length))
              .join(' ') === contextBeforeWords.join(' ')));

      const afterMatches =
        contextAfterText &&
        (contextAfterOccText.includes(contextAfterText) ||
          contextAfterOccText.includes(contextAfterText) ||
          (contextAfterOccWords.length > 0 &&
            contextAfterWords.length > 0 &&
            contextAfterOccWords
              .slice(0, Math.min(contextAfterWords.length, contextAfterOccWords.length))
              .join(' ') === contextAfterWords.join(' ')));

      // If we have context, require at least one match; if no context, accept all
      const matches =
        (!contextBeforeText && !contextAfterText) ||
        (contextBeforeText && beforeMatches) ||
        (contextAfterText && afterMatches);

      if (matches) {
        if (uniqueMatch === null) {
          uniqueMatch = occurrence;
          matchCount = 1;
        } else if (uniqueMatch !== occurrence) {
          matchCount++;
          break; // Multiple matches, need more context
        }
      }
    }

    // If we found exactly one match, return it
    if (matchCount === 1 && uniqueMatch !== null) {
      return uniqueMatch;
    }
  }

  // If still multiple matches, try to use the one closest to the HTML position estimate
  const htmlLines = htmlTextBefore.split('\n');
  const estimatedHtmlLine = htmlLines.length;
  return findClosestOccurrence(occurrences, markdownContent, estimatedHtmlLine);
}

// Calculate line and column position from character index
function calculatePositionFromIndex(
  index: number,
  content: string
): SelectionPosition {
  const textBeforeMatch = content.substring(0, index);
  const lines = textBeforeMatch.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

// Calculate position from HTML text (fallback)
function calculatePositionFromHTML(textBeforeSelection: string): SelectionPosition {
  const lines = textBeforeSelection.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

export function useTextSelection(
  onSelectionChange: (text: string, position: SelectionPosition) => void,
  markdownContent?: string
): UseTextSelectionResult {
  const previewRef = useRef<HTMLDivElement>(null);
  const [commentIconPosition, setCommentIconPosition] = useState<CommentIconPosition | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<SelectionPosition | null>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const handleTextSelection = useCallback(() => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim().length === 0) {
        setCommentIconPosition(null);
        setSelectedText('');
        setSelectionPosition(null);
        return;
      }

      const text = selection.toString().trim();
      const range = selection.getRangeAt(0);

      if (!previewRef.current) {
        return;
      }

      let position: SelectionPosition;

      if (markdownContent) {
        // Get context from HTML to help disambiguate multiple matches
        const { before: textBeforeSelection, after: textAfterSelection } =
          getSelectionContext(range, previewRef.current);

        // Try to find unique match in markdown
        const matchIndex = findUniqueMatch(
          text,
          textBeforeSelection,
          textAfterSelection,
          textBeforeSelection,
          markdownContent
        );

        if (matchIndex !== null && matchIndex !== -1) {
          position = calculatePositionFromIndex(matchIndex, markdownContent);
        } else {
          // Fallback: use HTML-based calculation
          position = calculatePositionFromHTML(textBeforeSelection);
        }
      } else {
        // Fallback: use HTML-based calculation if no markdown content
        const { before: textBeforeSelection } = getSelectionContext(
          range,
          previewRef.current
        );
        position = calculatePositionFromHTML(textBeforeSelection);
      }

      // Calculate comment icon position
      const rect = range.getBoundingClientRect();
      const previewRect = previewRef.current.getBoundingClientRect();

      // Preserve the range before state updates that might cause re-render
      savedRangeRef.current = range.cloneRange();

      setSelectedText(text);
      setSelectionPosition(position);
      setCommentIconPosition({
        top: rect.top - previewRect.top - 40,
        left: rect.right - previewRect.left,
      });
      onSelectionChange(text, position);
    }, 10);
  }, [onSelectionChange, markdownContent]);

  const handleCommentIconClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCommentIconPosition(null);
  }, []);

  const clearSelection = useCallback(() => {
    setCommentIconPosition(null);
    setSelectedText('');
    setSelectionPosition(null);
    savedRangeRef.current = null;
  }, []);

  // Restore selection after React re-render if it was lost
  useLayoutEffect(() => {
    if (commentIconPosition && savedRangeRef.current && previewRef.current && selectedText) {
      try {
        const selection = window.getSelection();
        if (selection && previewRef.current) {
          selection.removeAllRanges();
          
          // Check if the saved range is still valid (nodes are in document)
          const savedRange = savedRangeRef.current;
          const rangeValid = savedRange.startContainer && 
                            document.contains(savedRange.startContainer) && 
                            document.contains(savedRange.endContainer);
          
          if (rangeValid) {
            // Try to restore the saved range directly
            try {
              selection.addRange(savedRange);
              // Verify the selection actually worked
              const restoredText = selection.toString().trim();
              
              // If the restored text doesn't match (using normalized comparison), fall back to text search
              if (normalizeText(restoredText) !== normalizeText(selectedText)) {
                throw new Error('Restored text does not match');
              }
            } catch (e) {
              // Range restore failed or didn't match, fall through to text-based restore
            }
          }
          
          // If range wasn't valid or restore failed, use text-based search
          const currentSelectionText = selection.toString().trim();
          if (!rangeValid || normalizeText(currentSelectionText) !== normalizeText(selectedText)) {
            selection.removeAllRanges();
            
            // Normalize the search text for comparison
            const normalizedSearchText = normalizeText(selectedText);
            if (!normalizedSearchText) return;
            
            // Find the text in the DOM and select it
            // Get all text nodes, excluding those inside comment-highlight spans
            const getAllTextNodes = (): Text[] => {
              const textNodes: Text[] = [];
              const walker = document.createTreeWalker(
                previewRef.current!,
                NodeFilter.SHOW_TEXT,
                {
                  acceptNode: (node) => {
                    // Skip text nodes that are inside comment-highlight spans
                    let parent = node.parentNode;
                    while (parent && parent !== previewRef.current) {
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
            
            // Try to find the text, potentially spanning multiple nodes
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
              const index = nodeText.indexOf(normalizedSearchText);
              if (index !== -1) {
                foundNode = textNode;
                startNodeIndex = i;
                endNodeIndex = i;
                startOffset = index;
                endOffset = index + normalizedSearchText.length;
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
                  const searchIndex = normalizedAccumulated.indexOf(normalizedSearchText);
                  
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
                        const searchEndNorm = searchIndex + normalizedSearchText.length;
                        if (searchEndNorm <= nodeEndNorm) {
                          // Entire match is in this node
                          endNodeIndex = i + k;
                          endOffset = searchEndNorm - nodeStartNorm;
                        } else {
                          // Match spans to next nodes
                          endNodeIndex = i + k;
                          endOffset = nodeNorm.length;
                          let remainingLength = normalizedSearchText.length - (nodeNorm.length - startOffset);
                          
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

            if (foundNode && startNodeIndex !== -1) {
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

              // Handle highlighting - either single node or multiple nodes
              if (startNodeIndex === endNodeIndex) {
                // Single node case
                const textNode = textNodes[startNodeIndex];
                const actualStartPos = normalizedToActualOffset(textNode, startOffset);
                const actualEndPos = normalizedToActualOffset(textNode, endOffset);
                
                const range = document.createRange();
                range.setStart(textNode, actualStartPos);
                range.setEnd(textNode, actualEndPos);
                selection.addRange(range);
              } else {
                // Multiple nodes case
                const startNode = textNodes[startNodeIndex];
                const endNode = textNodes[endNodeIndex];
                
                const actualStartPos = normalizedToActualOffset(startNode, startOffset);
                const actualEndPos = normalizedToActualOffset(endNode, endOffset);
                
                const range = document.createRange();
                range.setStart(startNode, actualStartPos);
                range.setEnd(endNode, actualEndPos);
                selection.addRange(range);
              }
            }
          }
        }
      } catch (e) {
        // Silently fail if restoration doesn't work
      }
    }
  }, [commentIconPosition, selectedText]);

  return {
    previewRef,
    commentIconPosition,
    selectedText,
    selectionPosition,
    handleTextSelection,
    handleCommentIconClick,
    clearSelection,
  };
}

