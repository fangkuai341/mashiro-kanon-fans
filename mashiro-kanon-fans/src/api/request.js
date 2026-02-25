
import { message } from 'ant-design-vue'
import axios from 'axios'

class HttpService {
  constructor() {
    this.http = axios.create({
      timeout: 80000,
      baseURL:'http://124.222.238.165:3000'
    })

    // axiosRetry(this.http, {
    //   retries: 3,
    //   shouldResetTimeout: true,
    //   // 重复请求延迟
    //   retryDelay: (retryCount) => {
    //     return retryCount * 1000
    //   },
    //   retryCondition: (error) => {
    //     if (error.message.includes('timeout')) {
    //       return true
    //     }

    //     return !error.response || error.response.status !== 401
    //   }
    // })

    this.addInterceptors(this.http)
  }

  get(url, config) {
    return this.handleErrorWrapper(this.http.get(url, config))
  }

  post(url, params, config) {
    return this.handleErrorWrapper(this.http.post(url, params, config))
  }

  // postDownload(url, params) {
  //   return this.handleErrorWrapper(this.http.post(url, params, { responseType: 'arraybuffer' }))
  // }

  put(url, params, config) {
    return this.handleErrorWrapper(this.http.put(url, params, config))
  }

  delete(url, params, config) {
    return this.handleErrorWrapper(this.http.delete(url, { data: params, ...config }))
  }

  addInterceptors(http) {
    // 一、请求拦截器
    http.interceptors.request.use((config) => {
      // 1、添加token
      // config.headers['token'] = 'Thy+uLN1T+qgkvcn8qJ2fhO33n8=';
      // 2、验证请求状态码
      config.validateStatus = (status) => {
        switch (status) {
          case 401:
            setTimeout(() => {
              // showFailToast('用户信息过期，请重新登录')
              message.error('用户信息过期，请重新登录')
            }, 1000)
            break
          case 404:
            // showFailToast('请求的资源不存在')
            message.error('请求的资源不存在')
            break
          default:
            break
        }
        return status >= 200 && status < 400
      }
      return config
    })

    // 二、响应拦截器
    http.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  async handleErrorWrapper(p) {
    return p
      .then((response) => {
        // 500错弹出提示
        if (response.data.code === 500) {
          // showToast(response.data.msg)
          message.error(response.data.msg)
        }
        return response.data
      })
      .catch((error) => {
        return {
          ...error.response
        }
      })
  }
}
// const httpService = new HttpService();

export default new HttpService()
