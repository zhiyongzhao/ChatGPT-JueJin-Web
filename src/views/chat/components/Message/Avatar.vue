<script lang="ts" setup>
import { computed } from 'vue'
import { NAvatar } from 'naive-ui'
import { useUserStore } from '@/store'
import { isString } from '@/utils/is'
import defaultAvatar from '@/assets/avatar.png'

interface Props {
  image?: boolean
}

defineProps<Props>()

const userStore = useUserStore()
const avatar = computed(() => userStore.userInfo.avatar)
</script>

<template>
  <template v-if="image">
    <NAvatar v-if="isString(avatar) && avatar.length > 0" :fallback-src="defaultAvatar" :src="avatar" />
    <NAvatar v-else :src="defaultAvatar" round />
  </template>
  <img v-else src="src/assets/logo.png">
</template>
