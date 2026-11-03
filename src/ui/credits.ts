import { button } from './dom';
import { t } from './i18n';

export function creditsScreen(): string {
  return `<section class="credits-screen" aria-labelledby="credits-heading">
    <h1 id="credits-heading">${t('Credits', '制作名单')}</h1>
    <div class="credits-card paper-card" lang="en">
      <header class="credits-presented">
        <p class="credits-role">Presented by</p>
        <p class="credits-group credits-name">Group 9</p>
        <p class="credits-team credits-name">The FreeDOM project Team</p>
      </header>
      <section class="credits-section" aria-labelledby="credits-stories">
        <h2 class="credits-role" id="credits-stories">Stories</h2>
        <ul class="credits-names">
          <li class="credits-name">JIANG, JINGYI</li>
          <li class="credits-name">HUANG YILIN</li>
          <li class="credits-name">YANG YIWEI</li>
        </ul>
      </section>
      <section class="credits-section" aria-labelledby="credits-game">
        <h2 class="credits-role" id="credits-game">Game and Visuals</h2>
        <p class="credits-name credits-collaboration">ShiJia Zhang <span class="credits-ampersand">&amp;</span> GPT Codex</p>
      </section>
      <section class="credits-section" aria-labelledby="credits-sound">
        <h2 class="credits-role" id="credits-sound">Sound</h2>
        <p class="credits-name">HUANG YILIN</p>
      </section>
      <section class="credits-section credits-thanks" aria-labelledby="credits-thanks">
        <h2 class="credits-role" id="credits-thanks">Special Thanks</h2>
        <p class="credits-name credits-teacher">Dr Shobha Avadhani</p>
        <ul class="credits-thanks-row credits-thanks-three">
          <li class="credits-name">Hazel Yang</li>
          <li class="credits-name">Michelle Han</li>
          <li class="credits-name">Yang XuQi</li>
        </ul>
        <ul class="credits-thanks-row credits-thanks-two">
          <li class="credits-name">Wang Lu</li>
          <li class="credits-name">Nagi</li>
        </ul>
      </section>
    </div>
    <div class="credits-actions">${button('Back', 'back')}</div>
  </section>`;
}
