import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const SOURCE_DATE = '2026-11-05';
export const chapterTabs = ['ch1', 'ch2', 'ch3', 'ch4'];
export const normaliseCompany = text => String(text ?? '').replace(/\bfreedom\b/gi, 'FreeDom');

export function endingColumns(rows) {
  const header = rows.find(row => row[0] === '编号' && row[1] === '结局名称');
  if (!header) throw new Error('Missing ending table header.');
  return Object.fromEntries(header.map((label, index) => [String(label).trim(), index]));
}

export function endingCell(row, columns, label) {
  const index = columns[label];
  return index === undefined ? '' : String(row[index] ?? '');
}

export function loadTeamSources(root) {
  const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
  const previousEnglish = read('docs/source/2026-11-03-team-sheet.json');
  const previousChinese = read('docs/source/2026-11-03-chinese-sheet.json');
  const refreshed = read(`docs/source/${SOURCE_DATE}-sheet-formatting.json`);
  const merge = (old, names) => ({ ...old, retrievedDate: refreshed.retrievedDate,
    sheets: { ...old.sheets, ...Object.fromEntries(names.map(name => {
      if (!refreshed.sheets[name]?.values) throw new Error(`Refreshed source is missing ${name}.`);
      return [name, refreshed.sheets[name]];
    })) } });
  const english = merge(previousEnglish, chapterTabs);
  const chinese = merge(previousChinese, chapterTabs.map(name => name + '中文版'));
  // This refresh is editorial only; new mechanical changes must be reviewed separately.
  for (const tab of chapterTabs) {
    const before = previousEnglish.sheets[tab].values;
    const after = english.sheets[tab].values;
    for (let row = 0; row < Math.max(before.length, after.length); row++) {
      if (!/^C[1-4]-/.test(String(before[row]?.[0] ?? after[row]?.[0] ?? ''))) continue;
      for (const col of [0, 1, 2, 3, 8, 9, 10, 14, 15, 16, 17]) {
        if (String(before[row]?.[col] ?? '') !== String(after[row]?.[col] ?? '')) {
          throw new Error(`${tab}!${String.fromCharCode(65 + col)}${row + 1}: mechanics changed; review before importing.`);
        }
      }
    }
  }
  return { english, chinese, previousEnglish, previousChinese };
}
