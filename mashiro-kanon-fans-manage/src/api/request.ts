import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'

class HttpService {
  private http: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = 'http://124.222.238.165:3000'
    this.http = axios.create({
      baseURL: this.baseURL,
      timeout: 80000,
    })

    this.addInterceptors()
  }

  get baseUrl(): string {
    return this.baseURL
  }

  get apiBase(): string {
    return `${this.baseURL}/api`
  }

  private addInterceptors() {
    // 请求拦截器
    this.http.interceptors.request.use(
      (config) => {
        // 可以在这里添加 token 等
        // config.headers['token'] = 'your-token'
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.http.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        // 统一错误处理
        if (error.response) {
          const { status } = error.response
          switch (status) {
            case 401:
              message.error('用户信息过期，请重新登录')
              break
            case 404:
              message.error('请求的资源不存在')
              break
            case 500:
              message.error('服务器错误')
              break
            default:
              message.error(error.response.data?.message || '请求失败')
          }
        } else if (error.request) {
          message.error('网络错误，请检查网络连接')
        } else {
          message.error('请求配置错误')
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.put<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.delete<T>(url, config)
    return response.data
  }

  // 用于文件上传等需要原始响应的场景
  getInstance(): AxiosInstance {
    return this.http
  }
}

export default new HttpService()
