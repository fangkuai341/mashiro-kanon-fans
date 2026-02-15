import httpService from './request'

export interface QuoteItem {
  id?: number
  text: string
}

export interface CreateQuoteRequest {
  text: string
}

// 获取所有语录
export function getQuotes(): Promise<QuoteItem[]> {
  return httpService.get<QuoteItem[]>(`${httpService.apiBase}/allQuotes`)
}

// 创建语录
export function createQuote(data: CreateQuoteRequest): Promise<any> {
  return httpService.post(`${httpService.apiBase}/quotes`, data)
}

// 更新语录
export function updateQuote(id: number, data: CreateQuoteRequest): Promise<any> {
  return httpService.put(`${httpService.apiBase}/quotes/${id}`, data)
}

// 删除语录
export function deleteQuote(id: number): Promise<any> {
  return httpService.delete(`${httpService.apiBase}/quotes/${id}`)
}
