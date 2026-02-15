import httpService from './request'

export interface SongItem {
  id?: number
  title: string
  artist: string
  chinese_name?: string
  last_song: string
  link?: string
}

export interface CreateSongRequest {
  title: string
  artist: string
  chinese_name?: string
  last_song: string
  link?: string
}

export interface UpdateSongRequest extends CreateSongRequest {
  id: number
}

// 获取所有歌曲（支持搜索）
export function getSongs(keyword?: string): Promise<SongItem[]> {
  const params = keyword ? { q: keyword } : undefined
  return httpService.get<SongItem[]>(`${httpService.apiBase}/songs`, { params })
}

// 创建歌曲
export function createSong(data: CreateSongRequest): Promise<any> {
  return httpService.post(`${httpService.apiBase}/songs`, data)
}

// 更新歌曲
export function updateSong(id: number, data: CreateSongRequest): Promise<any> {
  return httpService.put(`${httpService.apiBase}/songs/${id}`, data)
}

// 删除歌曲
export function deleteSong(id: number): Promise<any> {
  return httpService.delete(`${httpService.apiBase}/songs/${id}`)
}

// 上传音乐文件
export function uploadMusic(file: File): Promise<{ success: boolean; url: string }> {
  const formData = new FormData()
  formData.append('music', file)
  return httpService.post(`${httpService.apiBase}/upload/music`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
