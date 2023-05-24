<script lang='ts' setup>
import { computed, ref } from 'vue'
import { NDropdown, useMessage } from 'naive-ui' // 下拉菜单 和 消息提示组件
import AvatarComponent from './Avatar.vue' // 头像组件
import TextComponent from './Text.vue' // 文本组件
import { SvgIcon } from '@/components/common' // icon组件
import { useIconRender } from '@/hooks/useIconRender' // icon组件
import { t } from '@/locales' // 语言
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { copyToClip } from '@/utils/copy' // 复制文本方法

// 定义组件参数
interface Props {
  dateTime?: string // 时间
  text?: string // 文本
  inversion?: boolean // 判断是否是用户文本
  error?: boolean
  loading?: boolean
}

// 定于组件事件
interface Emit {
  (ev: 'regenerate'): void // chatgpt消息重新获取
  (ev: 'delete'): void // 删除文本事件
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const { isMobile } = useBasicLayout() // 判断是否是移动端

const { iconRender } = useIconRender() // 创建 icon

const message = useMessage() // 消息提示

const textRef = ref<HTMLElement>() // 文本组件ref

const asRawText = ref(props.inversion)

const messageRef = ref<HTMLElement>() // 当前组件ref

// 计算属性
const options = computed(() => {
  // 文本操作提示options
  const common = [
    {
      label: t('chat.copy'),
      key: 'copyText',
      icon: iconRender({ icon: 'ri:file-copy-2-line' }),
    },
    {
      label: t('common.delete'),
      key: 'delete',
      icon: iconRender({ icon: 'ri:delete-bin-line' }),
    },
  ]

  if (!props.inversion) {
    // chatgpt回答的文本，添加显示原文和预览功能
    common.unshift({
      label: asRawText.value ? t('chat.preview') : t('chat.showRawText'),
      key: 'toggleRenderType',
      icon: iconRender({ icon: asRawText.value ? 'ic:outline-code-off' : 'ic:outline-code' }),
    })
  }

  return common
})

// 操作
function handleSelect(key: 'copyText' | 'delete' | 'toggleRenderType') {
  switch (key) {
    case 'copyText':
      // 复制文本
      handleCopy()
      return
    case 'toggleRenderType':
      // 显示原文和预览功能
      asRawText.value = !asRawText.value
      return
    case 'delete':
      // 删除文本
      emit('delete')
  }
}

// 重新获取chatgpt回答
function handleRegenerate() {
  messageRef.value?.scrollIntoView()
  emit('regenerate')
}

// 复制事件
async function handleCopy() {
  try {
    await copyToClip(props.text || '')
    message.success('复制成功')
  }
  catch {
    message.error('复制失败')
  }
}
</script>

<template>
  <div
    ref="messageRef"
    :class="[{ 'flex-row-reverse': inversion }]"
    class="flex w-full mb-6 overflow-hidden"
  >
    <div
      :class="[inversion ? 'ml-2' : 'mr-2']"
      class="flex items-center justify-center flex-shrink-0 h-8 overflow-hidden rounded-full basis-8"
    >
      <AvatarComponent :image="inversion" />
    </div>
    <div :class="[inversion ? 'items-end' : 'items-start']" class="overflow-hidden text-sm ">
      <p :class="[inversion ? 'text-right' : 'text-left']" class="text-xs text-[#b4bbc4]">
        {{ dateTime }}
      </p>
      <div
        :class="[inversion ? 'flex-row-reverse' : 'flex-row']"
        class="flex items-end gap-1 mt-2"
      >
        <TextComponent
          ref="textRef"
          :as-raw-text="asRawText"
          :error="error"
          :inversion="inversion"
          :loading="loading"
          :text="text"
        />
        <div class="flex flex-col">
          <button
            v-if="!inversion"
            class="mb-2 transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300"
            @click="handleRegenerate"
          >
            <SvgIcon icon="ri:restart-line" />
          </button>
          <NDropdown
            :options="options"
            :placement="!inversion ? 'right' : 'left'"
            :trigger="isMobile ? 'click' : 'hover'"
            @select="handleSelect"
          >
            <button class="transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200">
              <SvgIcon icon="ri:more-2-fill" />
            </button>
          </NDropdown>
        </div>
      </div>
    </div>
  </div>
</template>
