<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInst } from 'naive-ui'
import { useLoadingBar, useMessage } from 'naive-ui'
import { t } from '@/locales'
import type { UserInfo } from '@/store/modules/user/helper'
import { useAuthStore, useUserStore } from '@/store'
import { fetchVerify } from '@/api/login'

const router = useRouter()
const message = useMessage()
const loadingBar = useLoadingBar()
const userStore = useUserStore()

const formRef = ref<FormInst | null>(null)

const model = ref({
  name: '',
  invitationCode: '',
})
const rules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入用户名',
  },
  invitationCode: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入邀请码',
  },
}

// 更新用户信息
const updateUserInfo = (options: Partial<UserInfo>) => {
  userStore.updateUserInfo(options)
  message.success(t('common.success'))
}

const authStore = useAuthStore()
// 验证方法
const handleSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loadingBar.start()
      try {
        const data = await fetchVerify(model.value.invitationCode)
        updateUserInfo({ name: model.value.name })
        authStore.setToken(model.value.invitationCode)
        router.push('/chat')
      }
      catch (error: any) {
        message.error(error.msg)
      }
      finally {
        loadingBar.finish()
      }
    }
    else {
      message.error('验证失败')
    }
  })
}
</script>

<template>
  <div class="login h-full w-full">
    <img alt="" class="qrCode" src="@/assets/qrcode.jpeg">
    <p class="qrCodeText">
      长按/扫描上方二维码，给公众号发送：邀请码，自动获取
    </p>

    <n-form
      ref="formRef"
      :model="model"
      :rules="rules"
      :style="{
        width: '600px',
      }"
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
    >
      <n-form-item label="用户名" path="name">
        <n-input v-model:value="model.name" placeholder="请输入用户名" />
      </n-form-item>
      <n-form-item label="邀请码" path="invitationCode">
        <n-input v-model:value="model.invitationCode" placeholder="请输入邀请码" />
      </n-form-item>
    </n-form>
    <n-button
      :style="{
        width: '300px',
      }"
      type="primary"
      @click="handleSubmit"
    >
      验 证
    </n-button>
  </div>
</template>

<style lang="less" scoped>
.login {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	padding-bottom: 200px;

	.qrCode {
		width: 150px;
		height: 150px;
		margin-bottom: 10px;
	}

	.qrCodeText {
		margin-bottom: 30px;
		color: #A8ABB2;
	}
}
</style>
