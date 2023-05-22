<script lang='ts' setup>
import { computed, ref } from 'vue'
import { NModal } from 'naive-ui'
import General from './General.vue'
import { useAuthStore } from '@/store'

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const authStore = useAuthStore()

const isChatGPTAPI = computed<boolean>(() => !!authStore.isChatGPTAPI)

const active = ref('General')

const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})
</script>

<template>
  <NModal v-model:show="show" :auto-focus="false" preset="card" style="width: 95%; max-width: 640px">
    <div>
      <div class="min-h-[100px]">
        <General />
      </div>
      <!--      <NTabs v-model:value="active" animated type="line"> -->
      <!--        <NTabPane name="General" tab="General"> -->
      <!--          <template #tab> -->
      <!--            <SvgIcon class="text-lg" icon="ri:file-user-line" /> -->
      <!--            <span class="ml-2">{{ $t('setting.general') }}</span> -->
      <!--          </template> -->
      <!--          -->
      <!--        </NTabPane> -->
      <!--        <NTabPane v-if="isChatGPTAPI" name="Advanced" tab="Advanced"> -->
      <!--          <template #tab> -->
      <!--            <SvgIcon class="text-lg" icon="ri:equalizer-line" /> -->
      <!--            <span class="ml-2">{{ $t('setting.advanced') }}</span> -->
      <!--          </template> -->
      <!--          <div class="min-h-[100px]"> -->
      <!--            <Advanced /> -->
      <!--          </div> -->
      <!--        </NTabPane> -->
      <!--        <NTabPane name="Config" tab="Config"> -->
      <!--          <template #tab> -->
      <!--            <SvgIcon class="text-lg" icon="ri:list-settings-line" /> -->
      <!--            <span class="ml-2">{{ $t('setting.config') }}</span> -->
      <!--          </template> -->
      <!--          <About /> -->
      <!--        </NTabPane> -->
      <!--      </NTabs> -->
    </div>
  </NModal>
</template>
