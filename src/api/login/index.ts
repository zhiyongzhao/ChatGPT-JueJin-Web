import { post } from '@/utils/request'

// 是否加载邀请码页面判断
export function fetchSession<T = any>() {
  return post<T>({
    url: '/session',
  })
}

// 验证邀请码
export function fetchVerify<T = any>(invitationCode: string) {
  return post<T>({
    url: '/verify',
    data: {
      invitationCode,
    },
  })
}
