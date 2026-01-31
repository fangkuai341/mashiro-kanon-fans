export interface NewsItem {
  date: string;
  cat: string;
  text: string;
  id: number;
}
export interface QuotesItem {
  text: string
}
export interface TimelineItem {
  year: string;
  date: string;
  event: string;
  type: string;
  created_at: string;
  id: number;
  remark: string;
  text: string;
}
export interface BilibiliStatsItem {
  follower: number;
  record_time: string;
}

// 商店商品
export interface ShopItem {
  name: string;
  jumpUrl: string;
  price: string;
  pricePrefix: string;
  itemsImg: string;
  itemsId: number;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  lastSung: string;
  link: string;
  chineseName?: string; // 中文名称
}

// 后端 API 返回的歌曲数据格式
export interface SongApiItem {
  id: number;
  title: string;
  artist: string;
  last_song: string; // 后端返回的字段名
  link: string;
  chinese_name?: string; // 中文名称（可选）
}

/** 常驻歌手偏好：歌手名 + 演唱次数（前 30 天，artist 已按 '/' 拆分） */
export interface ArtistPreferenceItem {
  artist: string;
  count: number;
}

// 前端使用的类型（字符串字面量）
export type FrontendLiveType = 'song' | 'game' | 'chat' | 'reaction' | 'other';

export interface ScheduleItem {
  day: number;
  type: FrontendLiveType;
}

// 整个数据库的结构
export interface Database {
  news: NewsItem[];
  quotes: string[];
  timeline: TimelineItem[];
  songs: Song[];
  schedule: ScheduleItem[];
}
export  enum LiveType {
  song = '1',
  game = '2',
  chat = '3',
  reaction='4',
  other = '5'
}
export const LiveTypeMap = {
  [LiveType.song]:  { label: '歌回 (Singing)', color: '#F472B6' },
  [LiveType.game]:  { label: '游戏 (Game)', color: '#60A5FA' },
  [LiveType.chat]:  { label: '杂谈 (Chat)', color: '#FBBF24' },
  [LiveType.reaction]: { label: 'reaction', color: '#A855F7' },
  [LiveType.other]: { label: '其他', color: '#9CA3AF' }
}

// 将后端返回的 LiveType 枚举值转换为前端类型
export function convertApiTypeToLiveType(apiType: LiveType): FrontendLiveType {
  const typeMap: Record<LiveType, FrontendLiveType> = {
    [LiveType.song]: 'song',
    [LiveType.game]: 'game',
    [LiveType.chat]: 'chat',
    [LiveType.reaction]: 'reaction', // reaction 映射为 collab
    [LiveType.other]: 'other'      // other 映射为 collab
  };
  return typeMap[apiType] || 'chat'; // 默认返回 'chat'
}

// 前端的类型元数据映射（基于 LiveTypeMap）
export const liveTypeMeta: Record<FrontendLiveType, { label: string; color: string }> = {
  song: LiveTypeMap[LiveType.song],
  game: LiveTypeMap[LiveType.game],
  chat: LiveTypeMap[LiveType.chat],
  reaction: LiveTypeMap[LiveType.reaction],
  other: LiveTypeMap[LiveType.other]
};
// 后端返回的日程数据格式：{date, name, liveTime, type, link}
export interface ScheduleApiItem {
  date: string; // 日期字符串，如 '2024-04-01'
  name: string; // 直播标题/名字
  liveTime: string; // 直播时间段，如 '20:00 - 22:00'
  type: LiveType; // 直播类型
  link: string; // 回放链接
}

// 反馈类型
export type FeedbackType = 'bug' | '需求' | '其他';

// 反馈项
export interface FeedbackItem {
  id: number;
  type: FeedbackType;
  content: string;
  created_at: string;
  updated_at: string;
}

// 创建反馈请求
export interface CreateFeedbackRequest {
  type: FeedbackType;
  content: string;
}