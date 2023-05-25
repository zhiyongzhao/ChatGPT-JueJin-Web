<script lang="ts" setup>
import { ref } from 'vue' // 引入ref对象
import { useRouter } from 'vue-router' // 引入router对象
import type { FormInst } from 'naive-ui' // 引入formInst变量类型
import { useLoadingBar, useMessage } from 'naive-ui' // 引入加载条，信息提示组件
import { t } from '@/locales' // 语言转译方法
import type { UserInfo } from '@/store/modules/user/helper' // 用户信息类型
import { useAuthStore, useUserStore } from '@/store' // 引入token信息， 用户信息
import { fetchVerify } from '@/api/login'// 验证接口
import { useBasicLayout } from '@/hooks/useBasicLayout'

const { isMobile } = useBasicLayout() // 是否移动端

const router = useRouter() // router对象

const message = useMessage() // 信息提示组件api

const loadingBar = useLoadingBar() // loading组件api

const authStore = useAuthStore() // token信息

const userStore = useUserStore() // 用户信息

// 表单组件ref
const formRef = ref<FormInst | null>(null)

// 表单默认值对象
const model = ref({
  name: '',
  invitationCode: '',
})

// 表单提交规则
const rules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: t('setting.namePlaceholder'),
  },
  invitationCode: {
    required: true,
    trigger: ['blur', 'input'],
    message: t('setting.invitationCodePlaceholder'),
  },
}

// 更新用户信息
const updateUserInfo = (options: Partial<UserInfo>) => {
  userStore.updateUserInfo(options)
  message.success(t('common.success'))
}

// 验证方法
const handleSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loadingBar.start()
      try {
        // 验证接口
        await fetchVerify(model.value.invitationCode)
        // 成功后更新用户信息
        updateUserInfo({ name: model.value.name })
        // 成功后更新token信息
        authStore.setToken(model.value.invitationCode)
        // 跳转聊天页面
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
  <div class="login h-full w-full p-3">
    <!-- 公众号二维码 -->
    <img alt="" class="qrCode" src="@/assets/qrcode.jpeg">
    <p class="qrCodeText">
      {{ t('setting.QRCode') }}
    </p>
    <!-- 表单部分 -->
    <n-form
      ref="formRef"
      :label-placement="isMobile ? 'top' : 'left'"
      :model="model"
      :rules="rules"
      :style="{
        width: isMobile ? '100%' : '600px',
      }"
      label-width="auto"
      require-mark-placement="right-hanging"
    >
      <n-form-item :label="`${t('setting.name')}:`" path="name">
        <n-input v-model:value="model.name" :placeholder="t('setting.namePlaceholder')" />
      </n-form-item>
      <n-form-item :label="`${t('setting.invitationCode')}:`" path="invitationCode">
        <n-input v-model:value="model.invitationCode" :placeholder="t('setting.invitationCodePlaceholder')" />
      </n-form-item>
    </n-form>
    <n-button
      :style="{
        width: isMobile ? '70%' : '300px',
      }"
      type="primary"
      @click="handleSubmit"
    >
      {{ t('common.verify') }}
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
