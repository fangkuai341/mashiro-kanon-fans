import httpService from './request'

export interface FanartItem {
  id?: number
  author?: string
  title?: string
  img_url: string
  source_link?: string
}

export interface CreateFanartRequest {
  author?: string
  title?: string
  img_url: string
  source_link?: string
}

// 获取所有同人图
export function getFanarts(): Promise<FanartItem[]> {
  return httpService.get<FanartItem[]>(`${httpService.apiBase}/fanarts`)
}

// 创建同人图
export function createFanart(data: CreateFanartRequest): Promise<any> {
  return httpService.post(`${httpService.apiBase}/fanarts`, data)
}

// 删除同人图
export function deleteFanart(id: number): Promise<any> {
  return httpService.delete(`${httpService.apiBase}/fanarts/${id}`)
}

// 获取上传 URL
export function getUploadUrl(): string {
  return `${httpService.apiBase}/upload/image`
}

// 获取完整图片 URL
export function getImageFullUrl(imgUrl: string): string {
  if (!imgUrl) return ''
  if (imgUrl.startsWith('http')) return imgUrl
  return `${httpService.baseUrl}${imgUrl}`
}
