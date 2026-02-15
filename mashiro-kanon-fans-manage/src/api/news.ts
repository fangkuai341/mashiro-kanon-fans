import httpService from './request'

export interface NewsItem {
  id?: number
  cat: string
  date: string
  text: string
}

export interface CreateNewsRequest {
  cat: string
  date: string
  text: string
}

export interface UpdateNewsRequest extends CreateNewsRequest {
  id: number
}

// 获取所有动态
export function getNews(): Promise<NewsItem[]> {
  return httpService.get<NewsItem[]>(`${httpService.apiBase}/news`)
}

// 创建动态
export function createNews(data: CreateNewsRequest): Promise<any> {
  return httpService.post(`${httpService.apiBase}/news`, data)
}

// 更新动态
export function updateNews(id: number, data: CreateNewsRequest): Promise<any> {
  return httpService.put(`${httpService.apiBase}/news/${id}`, data)
}

// 删除动态
export function deleteNews(id: number): Promise<any> {
  return httpService.delete(`${httpService.apiBase}/news/${id}`)
}
