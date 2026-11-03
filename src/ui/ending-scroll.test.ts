import { describe, expect, it } from 'vitest';
import { hasMoreEndingContent } from './ending-scroll';

describe('ending reading cue', () => {
  it('shows for an overflowing recap, including after content is expanded', () => {
    expect(hasMoreEndingContent({ scrollHeight: 2000, clientHeight: 400, scrollTop: 0 })).toBe(true);
    expect(hasMoreEndingContent({ scrollHeight: 2400, clientHeight: 400, scrollTop: 1600 })).toBe(true);
  });

  it('hides for a short card, a hidden region, and the fractional bottom of a recap', () => {
    expect(hasMoreEndingContent({ scrollHeight: 220, clientHeight: 220, scrollTop: 0 })).toBe(false);
    expect(hasMoreEndingContent({ scrollHeight: 2000, clientHeight: 0, scrollTop: 0 })).toBe(false);
    expect(hasMoreEndingContent({ scrollHeight: 2000, clientHeight: 400, scrollTop: 1599.5 })).toBe(false);
    expect(hasMoreEndingContent({ scrollHeight: 2000, clientHeight: 400, scrollTop: 1605 })).toBe(false);
  });

  it('does not mistake mobile overscroll at the top for more content in a short card', () => {
    expect(hasMoreEndingContent({ scrollHeight: 220, clientHeight: 220, scrollTop: -40 })).toBe(false);
  });
});
