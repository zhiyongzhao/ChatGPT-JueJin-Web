<script lang="ts" setup>
import { ChatboxEllipsesOutline, CreateOutline, SettingsOutline, TrashOutline } from '@vicons/ionicons5'
</script>

<template>
  <div>
    <div class="tx">
      <NAvatar
        round
        size="large"
        src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
      />
      <div>
        <span class="text-sm font-bold text-blue-500">userName</span>
        <span>Personal signature</span>
      </div>
      <NIcon size="20">
        <SettingsOutline />
      </NIcon>
    </div>
    <div class="gpt-list">
      <div class="item">
        <NIcon size="40">
          <ChatboxEllipsesOutline />
        </NIcon>
        <p class="chat-name text-sm font-bold">
          new chat
        </p>
        <NIcon class="mr-2" size="20">
          <CreateOutline />
        </NIcon>
        <NIcon size="20">
          <TrashOutline />
        </NIcon>
      </div>
    </div>
    <div class="foot">
      <n-button size="large" style="width: 310px;margin-bottom: 20px" type="info">
        新建聊天
      </n-button>
      <n-button size="large" tertiary type="info">
        提示词商店
      </n-button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tx {
	display: flex;
	height: 60px;
	align-items: center;
	border-bottom: 2px solid #E0E0E0;
	padding: 0 20px 0 20px;
	box-sizing: border-box;

	> div {
		display: flex;
		flex-direction: column;
		margin-left: 20px;
		flex: 1;
	}
}

.gpt-list {
	width: 100%;
	display: flex;
	flex-direction: column;

	.item {
		display: flex;
		align-items: center;
		padding: 0 20px 0 20px;
		box-sizing: border-box;
		height: 60px;
		border-bottom: 1px solid #E0E0E0;
		transition: 0.3s;

		&:hover {
			background: #D2D2D2;
		}

		.chat-name {
			flex: 1;
			margin-left: 20px;
		}
	}
}

.foot {
	position: absolute;
	bottom: 20px;
	padding: 0 20px;
	display: flex;
	flex-direction: column;
}
</style>
