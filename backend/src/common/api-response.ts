export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export const ok = <T>(data: T, message = '操作成功'): ApiResponse<T> => ({
  code: 200,
  message,
  data,
});

