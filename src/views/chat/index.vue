<script lang="ts" setup>
import Sider from './components/Sider.vue' // 侧边栏部分。用户头像。chatgpt聊天对象操作
import Chat from './components/Chat.vue' // 聊天部分，聊天内容显示，聊天框操作
</script>

<!-- 页面布局 -->
<template>
  <div class="flex h-full p-4">
    <div class="border flex h-full w-full">
      <n-layout has-sider>
        <!-- 侧边栏部分 -->
        <n-layout-sider width="350px">
          <Sider />
        </n-layout-sider>
        <!-- 聊天内容部分 -->
        <n-layout>
          <Chat />
        </n-layout>
      </n-layout>
    </div>
  </div>
</template>

<style lang="less" scoped>
.border {
	border: 2px solid #E0E0E0;
	border-radius: 20px;
	overflow: hidden;

	:deep(.n-layout-scroll-container) {
		overflow: visible;
	}

	.Sider {
		width: 350px;
		border-right: 2px solid #E0E0E0;
		box-sizing: border-box;
		position: relative;
	}

	.right {
		flex: 1;
		box-sizing: border-box;
		border-left: 2px solid #E0E0E0;
	}
}
</style>
