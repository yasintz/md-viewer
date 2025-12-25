import { describe, it, expect } from 'vitest';
import { normalizeText } from '../normalizeText';

describe('normalizeText', () => {
  it('should collapse multiple spaces into a single space', () => {
    expect(normalizeText('hello    world')).toBe('hello world');
    expect(normalizeText('hello     world')).toBe('hello world');
  });

  it('should trim leading and trailing whitespace', () => {
    expect(normalizeText('  hello world  ')).toBe('hello world');
    expect(normalizeText('\t\nhello world\n\t')).toBe('hello world');
  });

  it('should handle tabs and newlines', () => {
    expect(normalizeText('hello\t\tworld')).toBe('hello world');
    expect(normalizeText('hello\n\nworld')).toBe('hello world');
    expect(normalizeText('hello\n\tworld')).toBe('hello world');
  });

  it('should handle mixed whitespace', () => {
    expect(normalizeText('hello   \t\n  world')).toBe('hello world');
  });

  it('should return empty string for whitespace-only input', () => {
    expect(normalizeText('   ')).toBe('');
    expect(normalizeText('\t\n')).toBe('');
  });

  it('should return empty string for empty input', () => {
    expect(normalizeText('')).toBe('');
  });

  it('should preserve single spaces between words', () => {
    expect(normalizeText('hello world')).toBe('hello world');
    expect(normalizeText('hello  world')).toBe('hello world');
  });
});


