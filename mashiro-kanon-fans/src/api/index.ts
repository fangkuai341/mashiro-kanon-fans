import { BilibiliStatsItem, NewsItem, QuotesItem, TimelineItem } from '../type'
import httpService from './request'

export function getNewApi(): Promise<NewsItem[]>{
  return httpService.get(`/api/news`)
}

export function getQuotesApi(): Promise<QuotesItem[]>{
  return httpService.get(`/api/quotes`)
}
export function getTimelineApi(): Promise<TimelineItem[]>{
  return httpService.get(`/api/timeline`)
}
export function getBilibiliStatsApi(): Promise<BilibiliStatsItem[]>{
  return httpService.get(`/api/bilibili/stats`)
}
