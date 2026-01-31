import { ArtistPreferenceItem, BilibiliStatsItem, CreateFeedbackRequest, FeedbackItem, NewsItem, QuotesItem, ScheduleApiItem, ShopItem, SongApiItem, TimelineItem } from '../type'
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


// 获取商店商品
export function getShopApi(): Promise<ShopItem[]> {
  return httpService.get(`/api/shop`)
}

// 获取 B 站系列稿件列表（回放）
export function getBilibiliArchivesApi(params?: { ps?: number; pn?: number }) {
  const ps = params?.ps ?? 3
  const pn = params?.pn ?? 1
  return httpService.get(`/api/bilibili/archives?ps=${ps}&pn=${pn}`)
}

//上传图片
export function uploadImageApi(file: File): Promise<{ success: boolean; url: string; filename: string; originalname: string; size: number }> {
  const formData = new FormData()
  formData.append('image', file)
  return httpService.post('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取歌曲列表
export function getSongsApi(q?: string): Promise<SongApiItem[]> {
  const query = q ? `?q=${encodeURIComponent(q)}` : ''
  return httpService.get(`/api/songs${query}`)
}

// 获取前 30 天常驻歌手偏好（歌手名 + 演唱次数，artist 已按 '/' 拆分）
export function getArtistPreferencesApi(): Promise<ArtistPreferenceItem[]> {
  return httpService.get('/api/songs/artist-preferences')
}

// 反馈相关 API
export function getFeedbacksApi(): Promise<FeedbackItem[]> {
  return httpService.get('/api/feedbacks')
}

export function createFeedbackApi(data: CreateFeedbackRequest): Promise<{ id: number; success: boolean }> {
  return httpService.post('/api/feedbacks', data)
}