import type { GlobalThemeOverrides } from 'naive-ui' // 引入官方主题自定义类型
import { computed, watch } from 'vue'	// 引入计算属性和监听属性
import { darkTheme, useOsTheme } from 'naive-ui' // 引入暗色主题 和 主题判断方法
import { useAppStore } from '@/store' // 引入vuex

export function useTheme() {
  const appStore = useAppStore()

  const OsTheme = useOsTheme()

  const isDark = computed(() => {
    if (appStore.theme === 'auto')
      return OsTheme.value === 'dark'
    else
      return appStore.theme === 'dark'
  })

  const theme = computed(() => {
    return isDark.value ? darkTheme : undefined
  })

  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    if (isDark.value) {
      return {
        common: {},
      }
    }
    return {}
  })

  watch(
    () => isDark.value,
    (dark) => {
      if (dark)
        document.documentElement.classList.add('dark')
      else
        document.documentElement.classList.remove('dark')
    },
    { immediate: true },
  )

  return { theme, themeOverrides }
}
