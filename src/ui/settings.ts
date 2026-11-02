import type { Settings } from '../game/types';
import { button } from './dom';
import { hasAudio } from './audio';
import { t } from './i18n';
export function settingsScreen(settings: Settings, confirming: boolean): string {
  const languages = (['en', 'zh-CN'] as const).map(locale => `<button type="button" data-action="set-language" data-locale="${locale}" lang="${locale}" aria-pressed="${(settings.locale ?? 'en') === locale}">${locale === 'en' ? 'English' : '中文'}</button>`).join('');
  return `<section class="settings-screen paper-card">
    <p class="eyebrow">${t('YOUR EXPERIENCE')}</p><h1>${t('Settings')}</h1>
    <div class="setting language-setting" role="group" aria-labelledby="setting-language"><span><strong id="setting-language">${t('Language', '语言')}</strong><small>${t('Choose the language for the interface and story.', '选择界面和剧情语言。')}</small></span><div class="language-options">${languages}</div></div>
    <label class="setting"><span><strong>${t('Reduced motion')}</strong><small>${t('Your device preference is also respected.')}</small></span><input type="checkbox" data-setting="reducedMotion" ${settings.reducedMotion ? 'checked' : ''}></label>
    <label class="setting"><span><strong>${t('Sound')}</strong><small>${t(hasAudio() ? 'Play the music and effects supplied with this game.' : 'Audio is ready to connect; add the prepared files to assets/audio.')}</small></span><input type="checkbox" data-setting="sound" ${settings.sound ? 'checked' : ''}></label>
    <div class="reset-area"><h2>${t('A fresh start')}</h2><p>${t("Reset removes this browser's current career, past careers, gallery and settings.")}</p>${button('Reset all progress','confirm-reset','reset-button')}</div>${button('Back', 'back')}
    ${confirming ? `<div class="reset-confirm" role="alertdialog" aria-modal="true" aria-labelledby="reset-heading" tabindex="-1"><h2 id="reset-heading">${t('Reset all progress?')}</h2><p>${t('All saved careers and endings in this browser will be removed.')}</p><div>${button('Keep my progress','cancel-reset','primary')}${button('Reset everything','reset')}</div></div>` : ''}
  </section>`;
}
