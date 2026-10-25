export function escape(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}
export function button(label: string, action: string, className = '', extra = ''): string {
  return `<button type="button" class="${className}" data-action="${action}" ${extra}>${escape(label)}</button>`;
}
export function richText(text: string): string { return escape(text).replaceAll('\n', '<br>'); }
