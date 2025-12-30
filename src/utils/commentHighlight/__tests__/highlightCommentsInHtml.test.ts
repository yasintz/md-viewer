import { describe, it, expect } from 'vitest';
import { highlightCommentsInHtml } from '../highlightCommentsInHtml';
import type { Comment } from '@/types';

describe('highlightCommentsInHtml', () => {
  const createComment = (id: string, selectedText: string): Comment => ({
    id,
    text: 'Test comment',
    selectedText,
    line: 1,
    column: 1,
    timestamp: Date.now(),
    replies: [],
  });

  it('should return original HTML when no comments provided', () => {
    const html = '<p>Hello world</p>';
    expect(highlightCommentsInHtml(html, [])).toBe(html);
  });

  it('should return original HTML when HTML is empty', () => {
    expect(highlightCommentsInHtml('', [createComment('1', 'test')])).toBe('');
  });

  it('should highlight simple text in single paragraph', () => {
    const html = '<p>Hello world</p>';
    const comments = [createComment('1', 'Hello')];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
    expect(result).toContain('comment-highlight');
    expect(result).toContain('Hello');
  });

  it('should highlight text spanning multiple words', () => {
    const html = '<p>Hello world test</p>';
    const comments = [createComment('1', 'Hello world')];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
    expect(result).toContain('Hello world');
  });

  it('should handle multiple comments', () => {
    const html = '<p>Hello world test</p>';
    const comments = [
      createComment('1', 'Hello'),
      createComment('2', 'world'),
    ];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
    expect(result).toContain('data-comment-id="2"');
  });

  it('should skip already highlighted comments', () => {
    const html = '<p>Hello <span class="comment-highlight" data-comment-id="1">world</span></p>';
    const comments = [createComment('1', 'world')];
    const result = highlightCommentsInHtml(html, comments);
    
    // Should not duplicate the highlight
    const matches = (result.match(/data-comment-id="1"/g) || []).length;
    expect(matches).toBe(1);
  });

  it('should handle markdown-formatted selected text', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    const comments = [createComment('1', '**world**')];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
    expect(result).toContain('world');
  });

  it('should handle text with extra whitespace', () => {
    const html = '<p>Hello   world</p>';
    const comments = [createComment('1', 'Hello   world')];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
  });

  it('should handle text in multiple paragraphs', () => {
    const html = '<p>Hello</p><p>world</p>';
    const comments = [createComment('1', 'Hello')];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
    expect(result).toContain('Hello');
  });

  it('should handle nested HTML elements', () => {
    const html = '<div><p>Hello <em>world</em></p></div>';
    const comments = [createComment('1', 'Hello')];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
    expect(result).toContain('Hello');
  });

  it('should handle text that spans multiple text nodes', () => {
    const html = '<p>Hello <em>world</em> test</p>';
    const comments = [createComment('1', 'Hello world')];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
  });

  it('should handle empty selected text', () => {
    const html = '<p>Hello world</p>';
    const comments = [createComment('1', '')];
    const result = highlightCommentsInHtml(html, comments);
    
    // Should not add any highlights
    expect(result).not.toContain('data-comment-id="1"');
  });

  it('should handle whitespace-only selected text', () => {
    const html = '<p>Hello world</p>';
    const comments = [createComment('1', '   ')];
    const result = highlightCommentsInHtml(html, comments);
    
    // Should not add any highlights
    expect(result).not.toContain('data-comment-id="1"');
  });

  it('should handle text not found in HTML', () => {
    const html = '<p>Hello world</p>';
    const comments = [createComment('1', 'Not found')];
    const result = highlightCommentsInHtml(html, comments);
    
    // Should not add any highlights
    expect(result).not.toContain('data-comment-id="1"');
    expect(result).toBe(html);
  });

  it('should preserve HTML structure', () => {
    const html = '<div><p>Hello <strong>world</strong></p></div>';
    const comments = [createComment('1', 'Hello')];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('<div>');
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });

  it('should handle case-insensitive matching after normalization', () => {
    const html = '<p>Hello World</p>';
    const comments = [createComment('1', 'Hello')];
    const result = highlightCommentsInHtml(html, comments);
    
    // Should match exact case after normalization
    expect(result).toContain('data-comment-id="1"');
  });

  it('should not match when case differs', () => {
    const html = '<p>Hello World</p>';
    const comments = [createComment('1', 'hello')];
    const result = highlightCommentsInHtml(html, comments);
    
    // Normalization doesn't change case, so lowercase won't match uppercase
    expect(result).not.toContain('data-comment-id="1"');
  });

  it('should handle complex HTML with lists', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const comments = [createComment('1', 'Item 1')];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
    expect(result).toContain('Item 1');
  });

  it('should handle text with special characters', () => {
    const html = '<p>Hello &amp; world!</p>';
    const comments = [createComment('1', 'Hello & world!')];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
  });

  it('should handle overlapping comments correctly', () => {
    const html = '<p>Hello world test</p>';
    const comments = [
      createComment('1', 'Hello world'),
      createComment('2', 'world test'),
    ];
    const result = highlightCommentsInHtml(html, comments);
    
    // First comment should be highlighted
    expect(result).toContain('data-comment-id="1"');
    // Second comment won't be highlighted because the text is already inside a highlight span
    // This is expected behavior - once text is highlighted, it's skipped
    expect(result).not.toContain('data-comment-id="2"');
  });

  it('should handle non-overlapping comments', () => {
    const html = '<p>Hello world test example</p>';
    const comments = [
      createComment('1', 'Hello world'),
      createComment('2', 'test example'),
    ];
    const result = highlightCommentsInHtml(html, comments);
    
    // Both should be highlighted since they don't overlap
    expect(result).toContain('data-comment-id="1"');
    expect(result).toContain('data-comment-id="2"');
  });

  it('should handle markdown formatting in selected text', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    const comments = [
      createComment('1', '**world**'),
      createComment('2', '*world*'),
    ];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
  });

  it('should handle text nodes with only whitespace', () => {
    const html = '<p>Hello <span> </span>world</p>';
    const comments = [createComment('1', 'Hello world')];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
  });

  it('should handle very long text', () => {
    const longText = 'a'.repeat(1000);
    const html = `<p>${longText}</p>`;
    const comments = [createComment('1', longText.substring(100, 200))];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
  });

  it('should handle text with newlines and tabs in HTML', () => {
    const html = '<p>Hello\n\tworld</p>';
    const comments = [createComment('1', 'Hello world')];
    const result = highlightCommentsInHtml(html, comments);
    
    expect(result).toContain('data-comment-id="1"');
  });
});



