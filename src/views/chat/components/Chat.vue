<script lang="ts" setup>
import { ChevronBack, Send, TimeOutline, TrashOutline } from '@vicons/ionicons5' // 引入icon
import { computed, ref, watch } from 'vue' // 引入计算属性和ref
import { useDialog } from 'naive-ui'
import Message from './Message/index.vue' // 引入消息组件
import { useChat } from './hooks/useChat' // 操作消息的方法
import { useScroll } from './hooks/useScroll' // 屏幕滚动的方法
import { useUsingContext } from './hooks/useUsingContext' // 发送消息模式
import { useAppStore, useChatStore } from '@/store' // 聊天对象信息
import { useBasicLayout } from '@/hooks/useBasicLayout' // 监听是否是移动端
import { fetchChatAPIProcess } from '@/api' // 消息发送接口
import { t } from '@/locales' // 语言

const { usingContext, toggleUsingContext } = useUsingContext() // 消息模式

const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'

const loading = ref<boolean>(false)

const { isMobile } = useBasicLayout() // 是否移动端

const prompt = ref<string>('') // 输入框内容

let controller = new AbortController() // 控制器对象

const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat() // 操作方法

const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll() // 滚动条操作方法

const chatStore = useChatStore() // 聊天对象信息

const uuid = ref(chatStore.active || '')
watch(
  () => chatStore.active,
  (news) => {
    uuid.value = `${chatStore.active}` // 获取当前选中的聊天对象id
  },
)

const dataSources = computed(() => chatStore.getChatByUuid(uuid.value)) // 聊天对象list

const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !!item.conversationOptions))) // 聊天记录

const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive) // 当前选中的聊天对象信息

// 发送
function handleSubmit() {
  onConversation()
}

// 发送消息接口
async function onConversation() {
  // 获取消息
  let message = prompt.value

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  controller = new AbortController()
  // 记录用户新增消息
  addChat(
    uuid.value,
    {
      dateTime: new Date().toLocaleString(),
      text: message,
      inversion: true,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: null },
    },
  )
  // 滚动条置底
  scrollToBottom()

  loading.value = true
  prompt.value = ''

  let options: Chat.ConversationRequest = {}

  const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions // 获取父消息id：parentMessageId ，对话保持id：conversationId

  // 父消息存在，并且是携带之前的聊天记录的模式
  if (lastContext && usingContext.value)
    options = { ...lastContext }

  // 记录chatgpt回复消息
  addChat(
    uuid.value,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      loading: true,
      inversion: false,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )
  // 滚动条置底
  scrollToBottom()

  try {
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      // 执行接口
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          // 持续相应的回调函数
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)

          try {
            const data = JSON.parse(chunk)
            // 更新chat回复消息
            updateChat(
              uuid.value,
              dataSources.value.length - 1,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (data.text ?? ''),
                inversion: false,
                error: false,
                loading: true,
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
                requestOptions: { prompt: message, options: { ...options } },
              },
            )

            if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
              options.parentMessageId = data.id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }

            scrollToBottomIfAtBottom()
          }
          catch (error) {
            //
          }
        },
      })
      updateChatSome(uuid.value, dataSources.value.length - 1, { loading: false })
    }

    await fetchChatAPIOnce()
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      updateChatSome(
        uuid.value,
        dataSources.value.length - 1,
        {
          loading: false,
        },
      )
      scrollToBottomIfAtBottom()
      return
    }

    const currentChat = getChatByUuidAndIndex(uuid.value, dataSources.value.length - 1)

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(
        uuid.value,
        dataSources.value.length - 1,
        {
          text: `${currentChat.text}\n[${errorMessage}]`,
          error: false,
          loading: false,
        },
      )
      return
    }

    updateChat(
      uuid.value,
      dataSources.value.length - 1,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
    scrollToBottomIfAtBottom()
  }
  finally {
    loading.value = false
  }
}

async function onRegenerate(index: number) {
  if (loading.value)
    return

  controller = new AbortController()

  const { requestOptions } = dataSources.value[index]

  let message = requestOptions?.prompt ?? ''

  let options: Chat.ConversationRequest = {}

  if (requestOptions.options)
    options = { ...requestOptions.options }

  loading.value = true

  updateChat(
    uuid.value,
    index,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      inversion: false,
      error: false,
      loading: true,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )

  try {
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            updateChat(
              uuid.value,
              index,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (data.text ?? ''),
                inversion: false,
                error: false,
                loading: true,
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
                requestOptions: { prompt: message, options: { ...options } },
              },
            )

            if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
              options.parentMessageId = data.id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }
          }
          catch (error) {
            //
          }
        },
      })
      updateChatSome(uuid.value, index, { loading: false })
    }
    await fetchChatAPIOnce()
  }
  catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(
        uuid.value,
        index,
        {
          loading: false,
        },
      )
      return
    }

    const errorMessage = error?.message ?? t('common.wrong')

    updateChat(
      uuid.value,
      index,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
  }
  finally {
    loading.value = false
  }
}

function handleEnter(event: KeyboardEvent) {
  if (!isMobile.value) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
  else {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
}

const dialog = useDialog()

function handleDelete(index: number) {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.deleteChatByUuid(uuid.value, index)
    },
  })
}

function handleClear() {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.clearChat'),
    content: t('chat.clearChatConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.clearChatByUuid(uuid.value)
    },
  })
}

const appStore = useAppStore()
const handelBack = () => {
  appStore.setSiderCollapsed(false)
}
</script>

<template>
  <div class="right h-full bg-[#F3F3F3] dark:bg-[#111111] transition-all">
    <NIcon v-if="isMobile" class="back" size="20" @click="handelBack">
      <ChevronBack />
    </NIcon>
    <div :class="isMobile ? 'justify-center' : ''" class="top text-sm font-bold w-full">
      {{ currentChatHistory?.title ?? '' }}
    </div>
    <div ref="scrollRef" class="chat-content">
      <Message
        v-for="(item, index) of dataSources"
        :key="index"
        :date-time="item.dateTime"
        :error="item.error"
        :inversion="item.inversion"
        :loading="item.loading"
        :text="item.text"
        @delete="handleDelete(index)"
        @regenerate="onRegenerate(index)"
      />
    </div>
    <div :style="isMobile ? 'height:100px' : 'height:200px'" class="chat-input">
      <div class="chat-input-top">
        <div>
          <NIcon
            :color="usingContext ? '#4b9e5f' : '#a8071a'"
            class="mr-3" size="24"
            @click="toggleUsingContext"
          >
            <TimeOutline />
          </NIcon>
          <NIcon color="#606266" size="24" @click="handleClear">
            <TrashOutline />
          </NIcon>
        </div>
        <n-input
          v-if="isMobile"
          v-model:value="prompt"
          :placeholder="t('chat.placeholderMobile')"
          class="input phoneInput"
          rows="1"
          style="width: 210px"
          type="textarea"
          @keypress="handleEnter"
        />
        <n-button size="small" type="primary" @click="handleSubmit">
          <template #icon>
            <n-icon>
              <Send />
            </n-icon>
          </template>
          <span v-if="!isMobile">{{ t('chat.sending') }}</span>
        </n-button>
      </div>
      <div v-if="!isMobile">
        <n-input
          v-model:value="prompt"
          :placeholder="t('chat.placeholder')"
          class="input"
          rows="6"
          type="textarea"
          @keypress="handleEnter"
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

	.back {
		position: absolute;
		top: 20px;
		left: 20px;
	}

	.top {
		display: flex;
		height: 60px;
		align-items: center;
		border-bottom: 1px solid #4b5563;
		padding: 0 20px 0 20px;
		box-sizing: border-box;

	}

	.chat-content {
		flex: 1;
		width: 100%;
		padding: 20px;
		box-sizing: border-box;
		overflow: hidden;
		overflow-y: auto;
	}

	.chat-input {
		width: 100%;
		border-top: 1px solid #4b5563;

		.chat-input-top {
			width: 100%;
			display: flex;
			padding: 10px 20px;
			box-sizing: border-box;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid #4b5563;
		}

		.input {
			border: none !important;
			transition: 0s !important;
		}

		.phoneInput {
			font-size: 12px;
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
