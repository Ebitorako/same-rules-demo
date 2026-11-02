import { LEGACY_STAT_NAMES, STAT_NAMES, type CopyData, type EndingRecap, type RecapStep } from '../game/types';
import { escape, richText } from './dom';

const number = (value: number): string => new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value);
const change = (value: number): string => `${value > 0 ? '+' : ''}${number(value)}`;
const reportStats = (report: EndingRecap) => (report.finalStats?.Skill !== undefined || report.finalStats?.Money !== undefined ? LEGACY_STAT_NAMES : STAT_NAMES).filter(stat => typeof report.finalStats?.[stat] === 'number');
const text = (value: string): string => richText(value.replace(/\r\n?/g, '\n'));

export function finalValues(report: EndingRecap): string {
  if (!report.finalStats) return '<section class="ending-values"><h3>Final values</h3><p class="recap-note">Final values were not saved for this earlier career.</p></section>';
  return `<section class="ending-values" aria-label="Final career values"><h3>Final values</h3>
    <p class="recap-note">${report.bounds ? `Scale: ${number(report.bounds.minimum)}–${number(report.bounds.maximum)}. ` : ''}Your values at the end of this career.</p>
    <dl class="ending-stats">${reportStats(report).map(stat => `<div><dt>${stat}</dt><dd>${number(report.finalStats![stat]!)}</dd></div>`).join('')}</dl></section>`;
}

function choiceChanges(step: RecapStep): string {
  if (!step.before || !step.after || !step.requestedDelta || !step.actualDelta) return '<p class="recap-note">The numerical changes for this choice were not recorded and cannot be verified.</p>';
  const affected = LEGACY_STAT_NAMES.filter(stat => (step.requestedDelta![stat] ?? 0) !== 0 || (step.actualDelta![stat] ?? 0) !== 0);
  if (!affected.length) return '<p class="recap-note">No ability values changed.</p>';
  return `<ul class="recap-changes">${affected.map(stat => {
    const requested = step.requestedDelta![stat] ?? 0, actual = step.actualDelta![stat] ?? 0;
    const limit = Math.abs(requested - actual) > 1e-9
      ? `<small>Choice effect: ${change(requested)}. ${requested > actual ? 'Upper' : 'Lower'} limit reached; actual change: ${change(actual)}.</small>` : '';
    return `<li><span>${stat}</span><strong>${number(step.before![stat]!)} → ${number(step.after![stat]!)} <span class="recap-delta">(${change(actual)})</span></strong>${limit}</li>`;
  }).join('')}</ul>`;
}

export function numericalReview(report: EndingRecap, copy: CopyData): string {
  const note = report.status === 'reconstructed'
    ? 'Earlier changes were reconstructed from the current story data and match your saved final values.'
    : report.status === 'partial'
      ? 'This career has an incomplete numerical record. Available steps are shown below; missing changes are not estimated.'
      : report.status === 'unavailable'
        ? 'This earlier career has no recoverable step-by-step numerical record.' : '';
  const summary = report.finalStats ? `<table class="recap-totals"><caption>From the start to the ending</caption><thead><tr><th scope="col">Value</th><th scope="col">Start</th><th scope="col">Final</th><th scope="col">Net</th></tr></thead><tbody>${reportStats(report).map(stat => `<tr><th scope="row">${stat}</th><td>${report.initialStats ? number(report.initialStats[stat]!) : '—'}</td><td>${number(report.finalStats![stat]!)}</td><td>${report.initialStats ? change(report.finalStats![stat]! - report.initialStats[stat]!) : '—'}</td></tr>`).join('')}</tbody></table>` : '';
  const definitions = STAT_NAMES.filter(stat => copy.statDescriptions?.[stat]?.trim());
  return `<section class="ending-reading-section numerical-review"><h3>Numerical review</h3>
    <p class="recap-note">Follow how your choices and the workplace rules changed your career values.</p>
    ${note ? `<p class="recap-notice">${note}${report.issues.includes('legacy-initial-values') ? ' Starting values use the current defaults; reconstructed steps are not an exact historical record.' : ''}</p>` : ''}${summary}
    ${definitions.length ? `<details class="recap-definitions"><summary>What these values mean</summary><dl>${definitions.map(stat => `<div><dt>${stat}</dt><dd>${text(copy.statDescriptions![stat]!)}</dd></div>`).join('')}</dl></details>` : ''}
    ${report.steps.length ? `<ol class="recap-steps">${report.steps.map(step => `<li><p class="recap-step-label">${step.kind === 'system' ? 'WORKPLACE RULE' : `CHOICE ${String(step.order).padStart(2, '0')}`} · ${escape(step.cardId)}${step.source === 'reconstructed' ? ' · RECONSTRUCTED' : ''}</p>
      <h4>${escape(step.title || 'Recorded choice')}</h4><p class="recap-option">${step.kind === 'system' ? 'Applied when the chapter began' : `Option ${step.choice === 4 && step.cardId === 'C2-03' ? 'D' : step.choice}`}${step.optionText ? ` · ${text(step.optionText)}` : ''}</p>${choiceChanges(step)}${step.resultText ? `<details class="recap-result"><summary>What followed</summary><p>${text(step.resultText)}</p></details>` : ''}</li>`).join('')}</ol>` : ''}
  </section>`;
}
