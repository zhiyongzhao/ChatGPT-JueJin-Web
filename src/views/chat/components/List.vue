<script lang='ts' setup>
import { computed } from 'vue' // 引入监听属性
import { NScrollbar } from 'naive-ui' // 滚动条组件
import { CheckmarkSharp, CreateOutline, TrashOutline } from '@vicons/ionicons5' // 引入icon
import { SvgIcon } from '@/components/common' // svgicon组件
import { useAppStore, useChatStore } from '@/store' // token信息，聊天对象
import { useBasicLayout } from '@/hooks/useBasicLayout' // // 监测是否是移动端的工具
import { debounce } from '@/utils/functions/debounce' // 防抖方法

const { isMobile } = useBasicLayout() // 是否移动端

const appStore = useAppStore() // token信息

const chatStore = useChatStore() // 聊天对象

const uuid = `${chatStore.active}` // 获取当前选中的聊天对象id

const dataSources = computed(() => chatStore.history) // 聊天对象list

const list = computed(() => chatStore.getChatByUuid(uuid)) // 聊天对象list

// 判断是否当前是已选中的
function isActive(uuid: string) {
  return chatStore.active === uuid
}

// 选中聊天对象
async function handleSelect({ uuid }: Chat.History) {
  if (isActive(uuid) && !isMobile)
    return
  if (chatStore.active)
    chatStore.updateHistory(chatStore.active, { isEdit: false })
  await chatStore.setActive(uuid)
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

// 聊天对象信息编辑
function handleEdit({ uuid }: Chat.History, isEdit: boolean, event?: MouseEvent) {
  event?.stopPropagation()
  chatStore.updateHistory(uuid, { isEdit })
}

// 删除聊天对象
function handleDelete(index: number, event?: MouseEvent | TouchEvent) {
  event?.stopPropagation()
  chatStore.deleteHistory(index)
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

const handleDeleteDebounce = debounce(handleDelete, 100)

// 保存修改
function handleEnter({ uuid }: Chat.History, isEdit: boolean, event: KeyboardEvent) {
  event?.stopPropagation()
  if (event.key === 'Enter')
    chatStore.updateHistory(uuid, { isEdit })
}

const getMobileClass = (uuid: string) => {
  if (isActive(uuid) && !isMobile.value)
    return ['bg-[#DEDEDE]', 'dark:bg-[#303030]']
  return ['']
}
</script>

<template>
  <NScrollbar>
    <div class="flex flex-col  text-sm">
      <!--			暂无聊天对象展示 -->
      <template v-if="!dataSources.length">
        <div class="flex flex-col items-center mt-4 text-center text-neutral-300">
          <SvgIcon class="mb-2 text-3xl" icon="ri:inbox-line" />
          <span>{{ $t('common.noData') }}</span>
        </div>
      </template>

      <!--			聊天对象展示 -->
      <template v-else>
        <div
          v-for="(item, index) of dataSources" :key="index"
          class="gpt-list hover:bg-[#DEDEDE] dark:bg-[#191919] dark:hover:bg-[#303030] "
          @click.prevent="handleSelect(item)"
        >
          <div :class="getMobileClass(item.uuid)" class="item border-b border-[#DCDFE6] dark:border-neutral-800">
            <!-- 头像 -->
            <img
              class="logo"
              src="http://aijuejin01-x-com.img.abc188.com/static/upload/image/20230526/1685084598202783.png"
            >

            <!-- title编辑输入框 -->
            <NInput
              v-if="item.isEdit"
              v-model:value="item.title"
              size="tiny" @keypress="handleEnter(item, false, $event)"
              @click.stop
            />
            <div v-else class="chat-name">
              <span class="w-48 flex text-base font-bold truncate">{{ item.title }}</span>
              <p class="text-xs text-[#A8ABB2] mt-0.5 truncate w-48">
                {{ chatStore.getChatLastText(item.uuid) }}
              </p>
            </div>

            <!-- 保存按钮 -->
            <NIcon v-if="item.isEdit" class="mr-2" size="20">
              <CheckmarkSharp @click.stop="handleEdit(item, false, $event)" />
            </NIcon>

            <!-- 编辑按钮 -->
            <NIcon v-if="!item.isEdit" class="mr-2 text-[#606266] dark:text-[#e4e4e7]" size="20">
              <CreateOutline @click.stop="handleEdit(item, true, $event)" />
            </NIcon>

            <!-- 删除按钮 -->
            <NPopconfirm v-if="!item.isEdit" placement="bottom" @positive-click="handleDeleteDebounce(index, $event)">
              <template #trigger>
                <NIcon class="text-[#606266] dark:text-[#e4e4e7]" size="20">
                  <TrashOutline />
                </NIcon>
              </template>
              {{ $t('chat.deleteHistoryConfirm') }}
            </NPopconfirm>
          </div>
        </div>
      </template>
    </div>
  </NScrollbar>
</template>

<style lang="less" scoped>
.logo {
	width: 30px;
	height: 30px;
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
		transition: 0.3s;

		.chat-name {
			flex: 1;
			margin-left: 20px;
		}
	}

}

.isActive {
	background: #DEDEDE !important;
}
</style>
