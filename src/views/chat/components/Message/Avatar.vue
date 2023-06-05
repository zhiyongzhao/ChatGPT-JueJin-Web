<script lang="ts" setup>
import { computed } from 'vue'
import { NAvatar } from 'naive-ui'
import { useUserStore } from '@/store'
import { isString } from '@/utils/is'

defineProps<Props>()

const defaultAvatar = new URL('@/assets/avatar.png', import.meta.url).href

interface Props {
  image?: boolean
}

const userStore = useUserStore()
const avatar = computed(() => userStore.userInfo.avatar)
</script>

<template>
  <div>
    <template v-if="image">
      <NAvatar
        v-if="isString(avatar) && avatar.length > 0" :fallback-src="defaultAvatar"
        :src="avatar"
      />
      <NAvatar v-else :src="defaultAvatar" round />
    </template>
    <img v-else src="@/assets/logo.png">
  </div>
</template>
