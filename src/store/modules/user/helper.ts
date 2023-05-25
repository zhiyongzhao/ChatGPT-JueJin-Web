import { ss } from '@/utils/storage'
// 语言转译方法

const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  avatar: string
  name: string
  description: string
}

export interface UserState {
  userInfo: UserInfo
}

export function defaultSetting(): UserState {
  return {
    userInfo: {
      avatar: 'https://static.fotor.com.cn/assets/stickers/18531/77a12b1f-90d4-41ff-92d3-e134a081e18c_medium_thumb.jpg',
      name: 'userName',
      description: '',
    },
  }
}

export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}
