import type { Locale } from '../game/types';

export type { Locale } from '../game/types';
let locale: Locale = 'en';
let storyTranslations: Record<string, string> = {};

const labels: Record<string, string> = {
  'Gallery': '结局收藏', 'Settings': '设置', 'Resume': '继续游戏', 'Back': '返回',
  'Continue': '继续', 'Next': '下一步', 'Close': '关闭', 'Got it': '知道了',
  'Continue career': '继续本次生涯', 'Start a career': '开始职业生涯', 'Next career': '下一段生涯',
  'Enter the studio': '进入工作室', 'Choose a pawn': '选择棋子', 'Female pawn': '女性棋子', 'Male pawn': '男性棋子',
  'female pawn': '女性棋子', 'male pawn': '男性棋子', 'Female': '女性', 'Male': '男性',
  'NMC5369 · MEDIA PROJECT': 'NMC5369 · 媒体项目', 'PLAYABLE PROTOTYPE / 01': '可玩原型 / 01',
  'A CAREER IN THE CREATIVE INDUSTRIES': '创意产业中的一段职业生涯',
  'ONE CAREER AT A TIME · EVERY CHOICE STAYS': '每次一段生涯 · 每个选择都会留下痕迹',
  'NEW HIRE → CREATIVE DIRECTOR → ?': '新员工 → 创意总监 → ？',
  '01 / BREAKING IN': '01 / 入行', '02 / GETTING AHEAD': '02 / 晋升',
  '03 / THE CAREER CLIFF': '03 / 职业悬崖', '04 / THE OTHER SIDE': '04 / 另一边',
  'PRESS ENTER TO BEGIN': '按回车键开始', 'CAREER': '职业生涯', 'Career': '职业生涯', 'career': '职业生涯',
  'YOUR EXPERIENCE': '游戏体验', 'Reduced motion': '减少动态效果',
  'Your device preference is also respected.': '也会遵循你的设备动态效果偏好。', 'Sound': '声音',
  'Play the music and effects supplied with this game.': '播放游戏背景音乐和音效。',
  'Audio is ready to connect; add the prepared files to assets/audio.': '声音功能已就绪，等待接入音频素材。',
  'A fresh start': '重新开始', "Reset removes this browser's current career, past careers, gallery and settings.": '重置会清除这个浏览器中的当前生涯、历史生涯、结局收藏和设置。',
  'Reset all progress': '重置全部进度', 'Reset all progress?': '重置全部进度？',
  'All saved careers and endings in this browser will be removed.': '这个浏览器中保存的全部生涯和结局都将被清除。',
  'Keep my progress': '保留进度', 'Reset everything': '全部重置',
  'ART PLACEHOLDER': '美术占位', 'Art placeholder: {label}': '美术占位：{label}',
  'title illustration': '标题插画', 'card back': '卡背', 'gallery frame': '收藏框', 'ending {id}': '结局 {id}',
  'neutral': '中性', 'pleased': '满意', 'appraising': '打量', 'frowning': '皱眉', 'awkward': '尴尬', 'cold': '冷淡',
  'New Hire': '新员工', 'Creative Director': '创意总监', 'Junior Producer': '初级制片人', 'Producer': '制片人',
  'Acting Senior': '代理高级职位', 'Production Management': '制作管理',
  'THE GATEKEEPER': '守门人', "OLD BOYS' NETWORK": '老男孩网络', 'THE IDEAL WORKER': '理想员工',
  'THE SYSTEM': '系统', 'CREATIVE DIRECTOR': '创意总监', 'START': '起点', 'NEW HIRE': '新员工',
  'Recorded choice': '已记录的选择', 'Review choice {number}: {title}': '查看第 {number} 次选择：{title}',
  'Waiting for your first card': '等待你的第一次选择', 'CARDS': '张卡牌', 'Career board, 22 spaces': '职业生涯棋盘，共 22 格',
  'CHAPTER': '章节', 'Ch1': '第 1 章', 'Ch2': '第 2 章', 'Ch3': '第 3 章', 'Ch4': '第 4 章',
  ', current position': '，当前位置', ', visited': '，已经过', 'YOU': '你',
  'THE STUDIO': '工作室', 'EST. EVERY DAY': '日复一日', 'THE CREATIVE CAREER GAME': '创意职业生涯游戏',
  'Face-down card pile {number}': '背面朝上的第 {number} 叠卡牌', 'YOUR CHOICES': '你的选择', 'Your recorded choices': '已记录的选择',
  'ONE STEP FORWARD': '向前一步', 'ENTER · NEXT': '回车 · 下一步', 'NUMBER KEYS · CHOOSE': '数字键 · 选择',
  'Progress is saved in this browser after every choice.': '每次选择后，进度会自动保存在这个浏览器中。',
  'AT THE THRESHOLD': '关卡考验', 'IN THE STUDIO': '工作室内', 'YOUR CHOICE HAS BEEN MADE': '你已作出选择', 'MAKE YOUR NEXT MOVE': '作出下一步选择',
  'Why does this happen?': '为什么会发生这种情况？', 'ENTER TO CONTINUE': '按回车键继续', 'Not available': '暂不可选',
  'Read your thoughts about option {option}': '查看关于选项 {option} 的内心想法',
  'NO TAKE-BACKS. JUST THE NEXT STEP.': '选择无法撤回，继续向前。', 'CHOICE RECORDED': '选择已记录', 'KEYS': '按键',
  'The Guide': '指引人', 'Your studio companion': '你的工作室伙伴', 'THE RULEBOOK': '规则书',
  'Open the rulebook': '打开规则书', 'Industry context': '行业背景', 'Theory': '理论解释', 'References': '参考文献',
  'Ask the guide': '询问指引人', 'Hide advice': '隐藏建议', 'BEFORE YOU CHOOSE': '在你选择之前', 'BESIDE THE BOARD': '棋盘旁的提示',
  'Advice is optional. The choice is yours.': '建议仅供参考，选择由你决定。',
  'Take a moment to read the scene. I can offer some context, but you decide what to do. You can hide my advice and ask for it again whenever you like.': '先读一读当前情境吧。我可以提供一些背景，但由你决定怎么做。你可以随时隐藏建议，需要时再来问我。',
  'Move with Next. Read the situation and choose an available option. After the result, Continue takes you back to the board.': '点击“下一步”前进，阅读情境后选择一个可用选项。看完结果后，点击“继续”回到棋盘。',
  'The text for this recorded choice is currently unavailable.': '暂时无法读取这次选择的文字记录。',
  'The candidate information for this recorded choice is currently unavailable.': '暂时无法读取这次选择的候选人信息。',
  'The policy information for this recorded choice is currently unavailable.': '暂时无法读取这次选择的政策信息。',
  'The result text for this recorded choice is currently unavailable.': '暂时无法读取这次选择的结果文字。',
  'CHOICE': '选择', 'Recorded scene, choice and result': '已记录的情境、选择和结果', 'The scene': '当时的情境',
  'Your choice · Option': '你的选择 · 选项', 'What followed': '后续结果', 'Reviewing this choice does not change your career.': '查看过往选择不会改变你的生涯进度。',
  'Recorded choice navigation': '过往选择导航', 'Previous choice': '上一次选择', 'Next choice': '下一次选择',
  'Final values': '最终数值', 'Final career values': '生涯最终数值', 'Final values were not saved for this earlier career.': '这段早期生涯没有保存最终数值。',
  'Scale: {minimum}–{maximum}. ': '范围：{minimum}–{maximum}。', 'Your values at the end of this career.': '这段职业生涯结束时的能力值。',
  'Creativity': '创造力', 'Communication': '沟通能力', 'Network': '人脉', 'Reputation': '声誉', 'Availability': '工作可用性', 'Energy': '精力', 'Skill': '技能', 'Money': '金钱',
  'The numerical changes for this choice were not recorded and cannot be verified.': '这次选择的数值变化未被记录，无法核实。', 'No ability values changed.': '没有能力值发生变化。',
  'Choice effect: {requested}. {limit} limit reached; actual change: {actual}.': '选择效果：{requested}。已达到{limit}，实际变化：{actual}。',
  'Upper': '上限', 'Lower': '下限',
  'Earlier changes were reconstructed from the current story data and match your saved final values.': '较早的数值变化根据当前剧情资料重建，与保存的最终数值一致。',
  'This career has an incomplete numerical record. Available steps are shown below; missing changes are not estimated.': '这段生涯的数值记录不完整。下方展示现有记录，不推算缺失的变化。',
  'This earlier career has no recoverable step-by-step numerical record.': '这段早期生涯没有可恢复的逐步数值记录。',
  'From the start to the ending': '从起点到结局', 'Value': '能力值', 'Start': '初始', 'Final': '最终', 'Net': '净变化',
  'Numerical review': '数值复盘', 'Follow how your choices and the workplace rules changed your career values.': '回顾你的选择与职场规则如何改变了各项能力值。',
  ' Starting values use the current defaults; reconstructed steps are not an exact historical record.': '初始值采用当前默认值；重建的步骤并非精确的历史记录。',
  'What these values mean': '这些数值代表什么', 'WORKPLACE RULE': '职场规则', ' · RECONSTRUCTED': ' · 重建记录',
  'Applied when the chapter began': '进入本章时生效', 'Option': '选项',
  'A CHAPTER MILESTONE': '章节里程碑', 'A CAREER REMEMBERED': '一段被记住的生涯', 'BEHIND THE CAREER': '生涯背后',
  'Theory, references and numerical review for {ending}': '“{ending}”的理论解释、参考文献和数值复盘',
  'References have not been added to this card yet.': '这张卡片尚未补充参考文献。', 'Your final decision': '你的最后一个决定',
  'See the front': '查看正面', 'Turn the card over': '翻到背面', 'Turn over': '翻面',
  'THIS CAREER IS NOW PART OF THE STUDIO.': '这段生涯已成为工作室历史的一部分。', 'YOUR CAREER CONTINUES': '你的职业生涯仍在继续',
  'Continue to the next chapter': '继续下一章', 'AFTER THE CAREER': '生涯之后', 'Career reviews': '生涯复盘', 'Career values': '生涯数值',
  'THE CAREERS WE KEEP': '我们留下的职业生涯', 'DISCOVERED': '已发现', 'Locked ending': '尚未解锁的结局', 'ANOTHER CAREER, ANOTHER STORY.': '另一段生涯，另一个故事。',
  '{pawn} pawn’s ending': '{pawn}棋子的结局', '{pawn} pawn': '{pawn}棋子',
  'Earlier prototype records': '早期原型记录',
  'These careers used the earlier eight-value prototype. Their records are kept separately because the story, ending numbers and rules have changed.': '这些生涯来自早期的八项能力值原型。由于剧情、结局编号和规则已更新，这些记录单独保留。',
  'Unfinished prototype career': '尚未完成的原型生涯',
  'Saved at board space {position}, with {count} choices recorded. Start a new career to play the team’s completed story.': '保存位置为棋盘第 {position} 格，已记录 {count} 次选择。开始新生涯即可体验团队完成的正式剧情。',
  'Prototype career': '原型生涯', 'Detailed numerical records were not saved for this earlier career.': '这段早期生涯未保存详细数值记录。',
  'The team’s completed story is ready.': '团队完成的正式剧情已就绪。',
  'This version uses six values and new story branches. Your earlier prototype records are preserved in Gallery. Start a new career to play the updated story.': '此版本采用六项能力值和新的剧情分支。早期原型记录保留在结局收藏中，开始新生涯即可体验更新后的剧情。',
  'Main navigation': '主导航', 'PROTOTYPE': '游戏原型',
  'This browser could not save progress. Keep this tab open; refreshing may lose this career.': '此浏览器无法保存进度。请保持页面开启，刷新可能丢失本次生涯。',
  'Opening the studio…': '正在打开工作室……',
};

export function setLocale(value: Locale): void { locale = value; }
export function getLocale(): Locale { return locale; }
export function setStoryTranslations(values: Record<string, string>): void { storyTranslations = values; }
export function t(english: string, chinese?: string): string {
  if (locale === 'en') return english;
  return chinese ?? (Object.hasOwn(labels, english) ? labels[english]
    : Object.hasOwn(storyTranslations, english) ? storyTranslations[english] : english);
}
export function tf(english: string, values: Record<string, string | number>): string {
  return t(english).replace(/\{(\w+)\}/g, (placeholder, key: string) => String(values[key] ?? placeholder));
}
