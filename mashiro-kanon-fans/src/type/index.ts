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

export interface Song {
  id: number;
  title: string;
  artist: string;
  lastSung: string;
  link: string;
}

export interface ScheduleItem {
  day: number;
  type: 'song' | 'game' | 'chat' | 'collab';
}

// 整个数据库的结构
export interface Database {
  news: NewsItem[];
  quotes: string[];
  timeline: TimelineItem[];
  songs: Song[];
  schedule: ScheduleItem[];
}