/** Pinia 是 Vue 的存储库，它允许跨组件/页面共享状态。**/
import { defineStore } from 'pinia'
import type { AppState, Language, Theme } from './helper' // 引入自定义类型
import { getLocalSetting, setLocalSetting } from './helper' // 引入获取本地存储和写入本地存储方法
import { store } from '@/store'

export const useAppStore = defineStore('app-store', {
  state: (): AppState => getLocalSetting(), // 获取本地存储的state
  actions: {
    setSiderCollapsed(collapsed: boolean) {
      this.siderCollapsed = collapsed
      this.recordState()
    },

    setTheme(theme: Theme) {
      this.theme = theme
      this.recordState()
    },

    setLanguage(language: Language) {
      if (this.language !== language) {
        this.language = language
        this.recordState()
      }
    },

    recordState() {
      setLocalSetting(this.$state)
    },
  },
})

export function useAppStoreWithOut() {
  return useAppStore(store)
}
