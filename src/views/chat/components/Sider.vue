<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from 'vue' // 引入计算属性，创建组件对象，ref对象
import { Close, SettingsOutline } from '@vicons/ionicons5' // 引入icon
import List from './List.vue' // chat聊天对象list组件
import { t } from '@/locales' // 语言转译方法
import defaultAvatar from '@/assets/avatar.png'

import { useBasicLayout } from '@/hooks/useBasicLayout' // 监测是否是移动端的工具
import { useAppStore, useChatStore, useUserStore } from '@/store' // 引入token，聊天对象list，用户信息。

const appStore = useAppStore() // token信息

const userStore = useUserStore() // 用户信息

const isMobile = useBasicLayout() // 是否移动端

const userInfo = computed(() => userStore.userInfo) // 计算用户信息

const show = ref(false) // 弹窗显示隐藏判断

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))// 弹窗组件

const chatStore = useChatStore() // 聊天对象list

// 新建聊天的方法
function handleAdd() {
  chatStore.addHistory({ title: 'New Chat', uuid: `${Date.now()}`, isEdit: false })
  if (isMobile)
    appStore.setSiderCollapsed(true)
}

const showModal = ref<boolean>(false)
const handelPopup = () => {
  showModal.value = true
}
</script>

<template>
  <div class="h-full  transition-all chatList">
    <!--		用户信息部分 -->
    <div class="tx border-b dark:border-neutral-800">
      <NAvatar
        v-if="userInfo.avatar"
        :src="userInfo.avatar"
        round
        size="large"
      />
      <NAvatar
        v-else
        :src="defaultAvatar"
        round
        size="large"
      />
      <div>
        <span class="text-base font-bold text-green-500">{{ userInfo.name }}</span>
        <span class="text-xs">{{ t('setting.problemFeedback') }}
          <span
            class="text-blue-500"
            @click="handelPopup"
          >{{ t('setting.wechat') }}</span>
        </span>
      </div>
      <NIcon size="20" @click="show = true">
        <SettingsOutline />
      </NIcon>
    </div>

    <!--    聊天对象list部分 -->
    <div class="gpt">
      <List />
    </div>

    <!--		操作按钮部分 -->
    <div class="foot">
      <n-button
        secondary size="large" strong type="primary"
        @click="handleAdd"
      >
        {{ t('chat.newChatButton') }}
      </n-button>
      <!--      <n-button size="large" tertiary type="primary"> -->
      <!--        {{ t('chat.oldVersion') }} -->
      <!--      </n-button> -->
    </div>

    <!--		弹窗组件 -->
    <Setting v-if="show" v-model:visible="show" />

    <n-modal v-model:show="showModal">
      <n-card
        :bordered="false"
        aria-modal="true"
        role="dialog"
        size="huge"
        style="width: 600px"
        title="问题反馈"
      >
        <template #header-extra>
          <NIcon size="30" @click="showModal = false">
            <Close />
          </NIcon>
        </template>
        <div class="popup-img">
          <img src="https://aijuejin01-x-com.img.abc188.com/static/upload/image/20230526/1685088357789526.png">
        </div>
        <template #footer>
          扫码/长按识别二维码，添加微信，反馈问题，谢谢！
        </template>
      </n-card>
    </n-modal>
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
	padding: 0 20px 0 20px;
	box-sizing: border-box;

	> div {
		display: flex;
		flex-direction: column;
		margin-left: 20px;
		flex: 1;
	}
}

.gpt {
	width: 100%;
	flex: 1;
	overflow: hidden;
	display: flex;
	flex-direction: column;

}

.foot {
	padding: 20px;
	display: flex;
	flex-direction: column;
}

.popup-img {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;

	img {
		width: 200px;
		height: 200px;
		border: 1px solid #DCDFE6;
	}
}
</style>
