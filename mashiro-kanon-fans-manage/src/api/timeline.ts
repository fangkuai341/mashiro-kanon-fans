import httpService from './request'

export interface TimelineItem {
  id?: number
  year: number
  date: string
  text: string
  remark?: string
}

export interface CreateTimelineRequest {
  year: number
  date: string
  text: string
  remark?: string
}

export interface UpdateTimelineRequest extends CreateTimelineRequest {
  id: number
}

// 获取所有时间轴节点
export function getTimeline(): Promise<TimelineItem[]> {
  return httpService.get<TimelineItem[]>(`${httpService.apiBase}/timeline`)
}

// 创建时间轴节点
export function createTimeline(data: CreateTimelineRequest): Promise<any> {
  return httpService.post(`${httpService.apiBase}/timeline`, data)
}

// 更新时间轴节点
export function updateTimeline(id: number, data: CreateTimelineRequest): Promise<any> {
  return httpService.put(`${httpService.apiBase}/timeline/${id}`, data)
}

// 删除时间轴节点
export function deleteTimeline(id: number): Promise<any> {
  return httpService.delete(`${httpService.apiBase}/timeline/${id}`)
}
