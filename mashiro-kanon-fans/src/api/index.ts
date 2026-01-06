import httpService from './request'

export function getNewApi() {
  return httpService.get(`/api/news`)
}
