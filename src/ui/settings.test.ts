import { afterEach, describe, expect, it, vi } from 'vitest';
import { settingsScreen } from './settings';
import { setLocale } from './i18n';

vi.mock('./audio', () => ({ hasAudio: () => false }));
afterEach(() => setLocale('en'));

describe('language preference in Settings', () => {
  it('offers both language names and defaults older saves to English', () => {
    const html = settingsScreen({ sound: false, reducedMotion: false }, false);
    expect(html).toContain('aria-labelledby="setting-language"');
    expect(html).toContain('data-locale="en" lang="en" aria-pressed="true">English');
    expect(html).toContain('data-locale="zh-CN" lang="zh-CN" aria-pressed="false">中文');
  });

  it('keeps both options identifiable when Chinese is selected', () => {
    setLocale('zh-CN');
    const html = settingsScreen({ sound: true, reducedMotion: false, locale: 'zh-CN' }, false);
    expect(html).toContain('id="setting-language">语言');
    expect(html).toContain('data-locale="en" lang="en" aria-pressed="false">English');
    expect(html).toContain('data-locale="zh-CN" lang="zh-CN" aria-pressed="true">中文');
  });
});
