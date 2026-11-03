import { t } from './i18n';

export function escape(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}
export function button(label: string, action: string, className = '', extra = ''): string {
  if (className.split(' ').includes('primary') && ['select-pawn', 'resume', 'advance', 'next-career', 'epilogue'].includes(action)) className += ' progress-action';
  return `<button type="button" class="${className}" data-action="${action}" ${extra}>${escape(t(label))}</button>`;
}
export function richText(text: string): string { return escape(text).replaceAll('\n', '<br>'); }
