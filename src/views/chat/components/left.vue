<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from 'vue'
import { SettingsOutline } from '@vicons/ionicons5'
import List from './List.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useChatStore, useUserStore } from '@/store'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const show = ref(false)
const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))

const chatStore = useChatStore()
const isMobile = useBasicLayout()
const appStore = useAppStore()

function handleAdd() {
  chatStore.addHistory({ title: 'New Chat', uuid: Date.now(), isEdit: false })
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}
</script>

<template>
  <div class="h-full dark:bg-[#191919] transition-all chatList">
    <div class="tx">
      <NAvatar
        :src="userInfo.avatar"
        round
        size="large"
      />
      <div>
        <span class="text-base font-bold text-green-500">{{ userInfo.name }}</span>
        <span class="text-xs" v-html="userInfo.description" />
      </div>
      <NIcon size="20" @click="show = true">
        <SettingsOutline />
      </NIcon>
    </div>
    <div class="gpt-list">
      <List />
      <!--      <div class="item"> -->
      <!--        <NIcon size="40"> -->
      <!--          <ChatboxEllipsesOutline /> -->
      <!--        </NIcon> -->
      <!--        <p class="chat-name text-sm font-bold"> -->
      <!--          new chat -->
      <!--        </p> -->
      <!--        <NIcon class="mr-2" size="20"> -->
      <!--          <CreateOutline /> -->
      <!--        </NIcon> -->
      <!--        <NIcon size="20"> -->
      <!--          <TrashOutline /> -->
      <!--        </NIcon> -->
      <!--      </div> -->
    </div>
    <div class="foot">
      <n-button
        secondary size="large" strong style="width: 310px;margin-bottom: 20px" type="primary"
        @click="handleAdd"
      >
        新建聊天
      </n-button>
      <n-button size="large" tertiary type="primary">
        旧版入口
      </n-button>
    </div>
    <Setting v-if="show" v-model:visible="show" />
  </div>
</template>

<style lang="less" scoped>
.chatList {
	width: 100%;
	display: flex;
	flex-direction: column;
}

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
	flex: 1;
	overflow: hidden;
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
	padding: 20px;
	display: flex;
	flex-direction: column;
}
</style>
