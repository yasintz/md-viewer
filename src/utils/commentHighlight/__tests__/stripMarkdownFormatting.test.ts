import { describe, it, expect } from 'vitest';
import { stripMarkdownFormatting } from '../stripMarkdownFormatting';

describe('stripMarkdownFormatting', () => {
  it('should remove bold markers (**)', () => {
    expect(stripMarkdownFormatting('**bold**')).toBe('bold');
    expect(stripMarkdownFormatting('This is **bold** text')).toBe('This is bold text');
  });

  it('should remove italic markers (*)', () => {
    expect(stripMarkdownFormatting('*italic*')).toBe('italic');
    expect(stripMarkdownFormatting('This is *italic* text')).toBe('This is italic text');
  });

  it('should remove bold markers (__)', () => {
    expect(stripMarkdownFormatting('__bold__')).toBe('bold');
    expect(stripMarkdownFormatting('This is __bold__ text')).toBe('This is bold text');
  });

  it('should remove italic markers (_)', () => {
    expect(stripMarkdownFormatting('_italic_')).toBe('italic');
    expect(stripMarkdownFormatting('This is _italic_ text')).toBe('This is italic text');
  });

  it('should remove code markers (`)', () => {
    expect(stripMarkdownFormatting('`code`')).toBe('code');
    expect(stripMarkdownFormatting('This is `code` text')).toBe('This is code text');
  });

  it('should remove strikethrough markers (~~)', () => {
    expect(stripMarkdownFormatting('~~strikethrough~~')).toBe('strikethrough');
    expect(stripMarkdownFormatting('This is ~~strikethrough~~ text')).toBe('This is strikethrough text');
  });

  it('should handle nested formatting', () => {
    expect(stripMarkdownFormatting('**bold *italic* bold**')).toBe('bold italic bold');
    expect(stripMarkdownFormatting('`code **bold** code`')).toBe('code bold code');
  });

  it('should handle multiple formatting markers', () => {
    expect(stripMarkdownFormatting('**bold** and *italic* and `code`')).toBe('bold and italic and code');
  });

  it('should handle unpaired markers', () => {
    expect(stripMarkdownFormatting('**unpaired')).toBe('unpaired');
    expect(stripMarkdownFormatting('unpaired**')).toBe('unpaired');
    expect(stripMarkdownFormatting('*unpaired')).toBe('unpaired');
    expect(stripMarkdownFormatting('`unpaired')).toBe('unpaired');
  });

  it('should handle isolated markers', () => {
    expect(stripMarkdownFormatting('hello ** world')).toBe('hello  world');
    expect(stripMarkdownFormatting('hello * world')).toBe('hello  world');
    expect(stripMarkdownFormatting('hello ` world')).toBe('hello  world');
  });

  it('should preserve text without markdown', () => {
    expect(stripMarkdownFormatting('plain text')).toBe('plain text');
    expect(stripMarkdownFormatting('hello world')).toBe('hello world');
  });

  it('should handle empty string', () => {
    expect(stripMarkdownFormatting('')).toBe('');
  });

  it('should handle complex markdown combinations', () => {
    expect(stripMarkdownFormatting('**bold** *italic* `code` ~~strike~~')).toBe('bold italic code strike');
  });

  it('should handle markdown with spaces', () => {
    // Note: The function preserves spaces inside markdown markers
    expect(stripMarkdownFormatting('** bold **')).toBe(' bold ');
    expect(stripMarkdownFormatting('* italic *')).toBe(' italic ');
  });
});


