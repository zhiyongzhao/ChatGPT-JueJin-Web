<script lang="ts" setup>
import { ref } from 'vue' // 引入ref对象
import { useRouter } from 'vue-router' // 引入router对象
import type { FormInst } from 'naive-ui' // 引入formInst变量类型
import { useLoadingBar, useMessage } from 'naive-ui' // 引入加载条，信息提示组件
import { t } from '@/locales' // 语言转译方法
import type { UserInfo } from '@/store/modules/user/helper' // 用户信息类型
import { useAuthStore, useUserStore } from '@/store' // 引入token信息， 用户信息
import { fetchVerify } from '@/api/login' // 验证接口

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
  <div class="login h-full w-full">
    <!-- 公众号二维码 -->
    <img alt="" class="qrCode" src="@/assets/qrcode.jpeg">
    <p class="qrCodeText">
      长按/扫描上方二维码，给公众号发送：邀请码，自动获取
    </p>
    <!-- 表单部分 -->
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
