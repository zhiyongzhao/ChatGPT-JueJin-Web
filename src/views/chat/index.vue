<script lang="ts" setup>
import left from './components/left.vue'
import right from './components/right.vue'
</script>

<template>
  <div class="flex h-full p-4">
    <div class="border flex h-full w-full">
      <div class="left">
        <left />
      </div>
      <div class="right">
        <right />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.border {
	border: 2px solid #E0E0E0;
	border-radius: 20px;
	overflow: hidden;

	.left {
		width: 350px;
		border-right: 2px solid #E0E0E0;
		box-sizing: border-box;
		position: relative;
	}

	.right {
		flex: 1;
		box-sizing: border-box;
		background: #F3F3F3;
	}
}
</style>
