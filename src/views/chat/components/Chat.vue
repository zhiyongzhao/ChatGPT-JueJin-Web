<script lang="ts" setup>
import { ChevronBack, Close, RadioButtonOn, Send } from '@vicons/ionicons5' // 引入icon
import { computed, ref, watch } from 'vue' // 引入计算属性和ref
import { useDialog, useMessage } from 'naive-ui'
import html2canvas from 'html2canvas'
import Message from './Message/index.vue' // 引入消息组件
import { useChat } from './hooks/useChat' // 操作消息的方法
import { useScroll } from './hooks/useScroll' // 屏幕滚动的方法
import { useUsingContext } from './hooks/useUsingContext' // 发送消息模式
import { useAppStore, useChatStore } from '@/store' // 聊天对象信息
import { useBasicLayout } from '@/hooks/useBasicLayout' // 监听是否是移动端
import { fetchChatAPIProcess } from '@/api' // 消息发送接口
import { t } from '@/locales' // 语言
import uesPromptJson from '@/assets/prompt.json'
import { HoverButton, SvgIcon } from '@/components/common'

const promptJson: Record<string, any> = uesPromptJson.prompts

const { usingContext, toggleUsingContext } = useUsingContext() // 消息模式

const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'

const loading = ref<boolean>(false)

const { isMobile } = useBasicLayout() // 是否移动端

const prompt = ref<string>('') // 输入框内容

let controller = new AbortController() // 控制器对象

const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat() // 操作方法

const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll() // 滚动条操作方法

const chatStore = useChatStore() // 聊天对象信息

const ms = useMessage()

const uuid = ref(chatStore.active || '')
watch(
  () => chatStore.active,
  (news) => {
    uuid.value = `${news}` // 获取当前选中的聊天对象id
  },
)

const dataSources = computed(() => {
  return chatStore.getChatByUuid(uuid.value)
}) // 聊天对象list

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
    const errorMessage = error?.msg ?? t('common.wrong')

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

    const errorMessage = error?.msg ?? t('common.wrong')

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

const promptsJson: Record<string, any> = uesPromptJson.prompts

const promptType = [
  {
    value: 'programPrompt',
    label: '编程',
  },
  {
    value: 'translatePrompt',
    label: '翻译',
  },
  {
    value: 'actPrompt',
    label: '充当',
  },
  {
    value: 'playPrompt',
    label: '扮演',
  },
]

const searchOptions = computed(() => {
  if (prompt.value.startsWith('/')) {
    return promptType.flatMap(({ value, label }) => {
      const children = (promptsJson[value] ?? []).map(({ promptName, promptVule }: {
        promptName: string
        promptVule: string
      }) => ({
        promptName,
        value: promptVule,
        key: promptVule,
        label: promptVule,
      }))

      return {
        type: 'group',
        label,
        key: label,
        children,
      }
    })
  }
  else {
    return []
  }
})

// value反渲染key
const renderLabel = (option: { promptName: string; label: string }) => {
  return [option.promptName || option.label]
}

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}

function handleExport() {
  if (loading.value)
    return

  const d = dialog.warning({
    title: t('chat.exportImage'),
    content: t('chat.exportImageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: async () => {
      try {
        d.loading = true
        const ele = document.getElementById('image-wrapper')
        const canvas = await html2canvas(ele as HTMLDivElement, {
          useCORS: true,
        })
        const imgUrl = canvas.toDataURL('image/png')
        const tempLink = document.createElement('a')
        tempLink.style.display = 'none'
        tempLink.href = imgUrl
        tempLink.setAttribute('download', 'chat-shot.png')
        if (typeof tempLink.download === 'undefined')
          tempLink.setAttribute('target', '_blank')

        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
        window.URL.revokeObjectURL(imgUrl)
        d.loading = false
        ms.success(t('chat.exportSuccess'))
        Promise.resolve()
      }
      catch (error: any) {
        ms.error(t('chat.exportFailed'))
      }
      finally {
        d.loading = false
      }
    },
  })
}

const showModal = ref(false)
</script>

<template>
  <div class="right h-full bg-[#F3F3F3] dark:bg-[#111111] transition-all">
    <NIcon v-if="isMobile" class="back" size="20" @click="handelBack">
      <ChevronBack />
    </NIcon>
    <div
      :class="isMobile ? 'justify-center' : ''"
      class="top text-sm font-bold w-full  border-b border-[#DCDFE6] dark:border-neutral-800"
    >
      <span :class="isMobile ? 'text-center' : ''" class="w-1/3 line-clamp-1">{{
        currentChatHistory?.title ?? ''
      }}</span>
    </div>
    <div ref="scrollRef" class="chat-content">
      <div class="flex items-center justify-center my-4 text-center text-stone-500 dark:text-neutral-300">
        <n-button round tertiary type="warning" @click="showModal = true">
          每日免费使用5次，点击这里获取更多使用机会
        </n-button>
      </div>
      <template v-if="!dataSources.length">
        <div class="flex items-center justify-center mt-4 text-center text-stone-500 dark:text-neutral-300">
          <SvgIcon class="mr-2 text-3xl" icon="ri:bubble-chart-fill" />
          <span>开始和ChatGPT对话吧~</span>
        </div>
      </template>
      <template v-else>
        <div id="image-wrapper" class="chat-msg">
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
          <div class="sticky bottom-0 left-0 flex justify-center">
            <NButton v-if="loading" type="primary" @click="handleStop">
              <template #icon>
                <n-icon>
                  <RadioButtonOn />
                </n-icon>
              </template>
              停止响应
            </NButton>
          </div>
        </div>
      </template>
    </div>
    <div
      :style="isMobile ? 'height:100px' : 'height:200px'"
      class="chat-input border-t  border-[#DCDFE6] dark:border-neutral-800"
    >
      <div class="chat-input-top border-b border-[#DCDFE6] dark:border-neutral-800">
        <div class="flex">
          <HoverButton @click="handleClear">
            <span class="text-xl text-[#4f555e] dark:text-white">
              <SvgIcon icon="ri:delete-bin-line" />
            </span>
          </HoverButton>
          <HoverButton @click="handleExport">
            <span class="text-xl text-[#4f555e] dark:text-white">
              <SvgIcon icon="ri:download-2-line" />
            </span>
          </HoverButton>
          <HoverButton @click="toggleUsingContext">
            <span :class="{ 'text-[#4b9e5f]': usingContext, 'text-[#a8071a]': !usingContext }" class="text-xl">
              <SvgIcon icon="ri:chat-history-line" />
            </span>
          </HoverButton>
        </div>
        <NAutoComplete
          v-if="isMobile"
          v-model:value="prompt"
          :options="searchOptions" :render-label="renderLabel" style="width: 65%"
        >
          <template #default="{ handleInput, handleBlur, handleFocus, value: slotValue }">
            <NInput
              :placeholder="t('chat.placeholderMobile')"
              :value="slotValue"
              rows="1"
              type="textarea"
              @blur="handleBlur"
              @focus="handleFocus"
              @input="handleInput"
              @keypress="handleEnter"
            />
          </template>
        </NAutoComplete>
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
        <NAutoComplete
          v-model:value="prompt" :options="searchOptions" :render-label="renderLabel"
        >
          <template #default="{ handleInput, handleBlur, handleFocus, value: slotValue }">
            <NInput
              ref="inputRef"
              :placeholder="t('chat.placeholder')"
              :value="slotValue"
              rows="6"
              type="textarea"
              @blur="handleBlur"
              @focus="handleFocus"
              @input="handleInput"
              @keypress="handleEnter"
            />
          </template>
        </NAutoComplete>
      </div>
    </div>

    <n-modal v-model:show="showModal">
      <n-card
        :bordered="false"
        aria-modal="true"
        role="dialog"
        size="huge"
        style="width: 600px"
        title="获取更多使用机会"
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
          扫码/长按识别二维码，添加微信，获取更多体检机会～
        </template>
      </n-card>
    </n-modal>
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
		padding: 0 20px 0 20px;
		box-sizing: border-box;

	}

	.chat-content {
		flex: 1;
		width: 100%;
		padding: 20px;
		box-sizing: border-box;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.chat-msg {
		width: 100%;
		flex: 1;
		overflow: hidden;
		overflow-y: auto;
	}

	.chat-input {
		width: 100%;

		.chat-input-top {
			width: 100%;
			display: flex;
			padding: 10px 20px;
			box-sizing: border-box;
			justify-content: space-between;
			align-items: center;
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
