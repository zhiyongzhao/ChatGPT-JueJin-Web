<script setup lang="ts">
import { defineComponent, h } from 'vue'
import {
  NDialogProvider, // 对话框 Dialog
  NLoadingBarProvider, // 加载条 Loading Bar
  NMessageProvider, // 信息 Message
  NNotificationProvider, // 通知 Notification
  useDialog, // 对话框 API
  useLoadingBar, // 加载条 API
  useMessage, // 信息 API
  useNotification, // 通知 API
} from 'naive-ui'

function registerNaiveTools() {
// 挂载到window对象上
  window.$loadingBar = useLoadingBar()
  window.$dialog = useDialog()
  window.$message = useMessage()
  window.$notification = useNotification()
}

// 创建组件
const NaiveProviderContent = defineComponent({
  name: 'NaiveProviderContent',
  setup() {
    registerNaiveTools()
  },
  render() {
    return h('div')
  },
})
</script>

<template>
  <NLoadingBarProvider>
    <NDialogProvider>
      <NNotificationProvider>
        <NMessageProvider>
          <slot />
          <NaiveProviderContent />
        </NMessageProvider>
      </NNotificationProvider>
    </NDialogProvider>
  </NLoadingBarProvider>
</template>
