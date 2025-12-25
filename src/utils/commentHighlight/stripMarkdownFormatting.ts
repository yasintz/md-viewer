/**
 * Strips markdown formatting from text to match rendered HTML content.
 * Removes markdown syntax like **, __, *, _, `, etc., but preserves the actual text.
 * This handles cases where markdown markers might not be perfectly paired.
 */
export function stripMarkdownFormatting(str: string): string {
  // First, try to remove properly paired markdown (more accurate)
  let result = str
    // Remove bold/italic markers (**, __, *, _) - handle word boundaries
    .replace(/\*\*([^*\s][^*]*?[^*\s])\*\*/g, '$1')  // **text** -> text
    .replace(/\*\*([^*]+)\*\*/g, '$1')               // **text** -> text (fallback)
    .replace(/__([^_\s][^_]*?[^_\s])__/g, '$1')      // __text__ -> text
    .replace(/__([^_]+)__/g, '$1')                    // __text__ -> text (fallback)
    .replace(/\*([^*\s][^*]*?[^*\s])\*/g, '$1')      // *text* -> text
    .replace(/\*([^*]+)\*/g, '$1')                    // *text* -> text (fallback)
    .replace(/_([^_\s][^_]*?[^_\s])_/g, '$1')        // _text_ -> text
    .replace(/_([^_]+)_/g, '$1')                      // _text_ -> text (fallback)
    // Remove code markers
    .replace(/`([^`]+)`/g, '$1')                      // `code` -> code
    // Remove strikethrough
    .replace(/~~([^~]+)~~/g, '$1');                   // ~~text~~ -> text
  
  // Then remove any remaining isolated markdown markers (handles unpaired markers)
  result = result
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/\*/g, '')
    .replace(/_/g, '')
    .replace(/`/g, '')
    .replace(/~~/g, '');
  
  return result;
}

