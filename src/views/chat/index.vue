<script lang="ts" setup>
import left from './components/left.vue'
import right from './components/right.vue'
</script>

<template>
  <div class="flex h-full p-4">
    <div class="border flex h-full w-full">
      <n-layout has-sider>
        <n-layout-sider width="350px">
          <left />
        </n-layout-sider>
        <n-layout>
          <right />
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

	.left {
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
