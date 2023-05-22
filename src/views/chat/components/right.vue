<script lang="ts" setup>
import { Send, TimeOutline, TrashOutline } from '@vicons/ionicons5'
</script>

<template>
  <div class="right h-full light:bg-[#F3F3F3] dark:bg-[#111111] transition-all">
    <div class="top text-sm font-bold text-gray-900">
      new Chat
    </div>
    <div class="chat-input">
      <div class="chat-input-top">
        <div>
          <NIcon class="mr-4" size="25">
            <TimeOutline />
          </NIcon>
          <NIcon class="mr-4" size="25">
            <TrashOutline />
          </NIcon>
        </div>
        <n-button size="small" type="primary">
          <template #icon>
            <n-icon>
              <Send />
            </n-icon>
          </template>
          发 送
        </n-button>
      </div>
      <div>
        <n-input
          v-model:value="value"
          class="input"
          placeholder="基本的 Textarea"
          rows="6"
          type="textarea"
        />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.right {
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	.top {
		display: flex;
		height: 60px;
		align-items: center;
		border-bottom: 2px solid #E0E0E0;
		padding: 0 20px 0 20px;
		box-sizing: border-box;
	}

	.chat-input {
		width: 100%;
		height: 200px;
		border-top: 2px solid #E0E0E0;

		.chat-input-top {
			width: 100%;
			display: flex;
			padding: 10px 20px;
			box-sizing: border-box;
			justify-content: space-between;
			align-items: center;
		}

		.input {
			background: #F3F3F3;
			border: none !important;
			transition: 0s !important;

		}

		:deep(.n-input) {
			--n-border: 0px !important;
			--n-border-hover: 0px solid #F3F3F3 !important;
			--n-border-focus: none !important;
			--n-caret-color: #000 !important;
			--n-box-shadow-focus: 0 #F3F3F3 !important;
			border: none !important;
			transition: 0s !important;
		}

		:deep(.n-input__border) {
			display: none;

		}

	}
}
</style>
