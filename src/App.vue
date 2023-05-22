<script lang="ts" setup>
import { NConfigProvider } from 'naive-ui' // 引入主题组件
import { NaiveProvider } from '@/components/common' // 引入自定义组件，对话框，加载条，信息，通知组件的集合
import { useTheme } from '@/hooks/useTheme' // 引入主题
import { useLanguage } from '@/hooks/useLanguage' // 引入语言包

const { theme, themeOverrides } = useTheme()
const { language } = useLanguage()
</script>

<template>
  <NConfigProvider
    :locale="language"
    :theme="theme"
    :theme-overrides="themeOverrides"
    class="h-full"
  >
    <NaiveProvider>
      <RouterView />
    </NaiveProvider>
  </NConfigProvider>
</template>
