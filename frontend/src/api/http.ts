import axios, { AxiosError } from 'axios';
import { message } from 'antd';

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

const recentMessages = new Set<string>();

export const showError = (content: string) => {
  if (!content || recentMessages.has(content)) return;
  recentMessages.add(content);
  message.error({ content, key: content, duration: 2.5 });
  window.setTimeout(() => recentMessages.delete(content), 2000);
};

export const showSuccess = (content: string) => {
  message.success({ content, key: content, duration: 1.8 });
};

export const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('gas_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    const result = response.data as ApiResult<any>;
    if (typeof result?.code === 'number' && result.code !== 200) {
      showError(result.message || '操作失败');
      const error = new Error(result.message || '操作失败') as Error & { _isBusinessError?: boolean };
      error._isBusinessError = true;
      return Promise.reject(error);
    }
    return result?.data ?? response.data;
  },
  (error: AxiosError<ApiResult<null>> & { _isBusinessError?: boolean }) => {
    if (error._isBusinessError) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;
    let content = backendMessage || '服务器错误，请稍后重试';

    if (!error.response) {
      content = '网络错误，请检查网络连接';
    }
    if (status === 401) {
      content = backendMessage || '登录已过期，请重新登录';
      localStorage.removeItem('gas_token');
      localStorage.removeItem('gas_user');
      window.dispatchEvent(new Event('auth:expired'));
    }
    if (status === 403) {
      content = backendMessage || '当前账号无权执行该操作';
    }

    showError(content);
    return Promise.reject(error);
  },
);

