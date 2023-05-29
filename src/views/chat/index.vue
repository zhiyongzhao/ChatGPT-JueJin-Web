<script lang="ts" setup>
import { computed, ref } from 'vue' // 聊天部分，聊天内容显示，聊天框操作
import Sider from './components/Sider.vue' // 侧边栏部分。用户头像。chatgpt聊天对象操作
import Chat from './components/Chat.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore } from '@/store'

const { isMobile } = useBasicLayout() // 是否移动端

const appStore = useAppStore()
const collapsed = computed(() => appStore.siderCollapsed)

const getMobileClass = computed(() => {
  if (isMobile.value)
    return ['rounded-none', 'shadow-none', 'border-0']
  return ['layout', 'rounded-lg', 'shadow-md']
})

const active = ref(false)
</script>

<!-- 页面布局 -->
<template>
  <div :class="[isMobile ? 'p-0' : 'p-4']" class="flex h-full">
    <div :class="getMobileClass" class=" flex h-full w-full border border-[#DCDFE6] dark:border-neutral-800">
      <n-layout has-sider>
        <!-- 侧边栏部分 -->
        <n-layout-sider
          :class="isMobile ? 'border-0' : 'border-r'"
          :collapsed-width="0"
          :show-trigger="isMobile ? false : 'arrow-circle'"
          :width="isMobile ? '100%' : '350px'"
          class="border-[#DCDFE6] dark:border-neutral-800"
        >
          <Sider />
        </n-layout-sider>
        <!-- 聊天内容部分 -->
        <n-layout v-if="!isMobile">
          <Chat />
        </n-layout>
        <n-layout v-if="isMobile">
          <n-drawer v-model:show="collapsed" placement="right" width="100%">
            <Chat />
          </n-drawer>
        </n-layout>
      </n-layout>
    </div>
  </div>
</template>

<style lang="less" scoped>
.layout {
	overflow: hidden;

	:deep(.n-layout-scroll-container) {
		overflow: visible;
	}

}
</style>
