import type { Router } from 'vue-router'

import { useAuthStoreWithout } from '@/store/modules/auth'
import { useAppStore } from '@/store'

export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const appStore = useAppStore()
    appStore.setSiderCollapsed(true)
    const authStore = useAuthStoreWithout()
    if (!authStore.session) {
      try {
        const data = await authStore.getSession()
        if (data.auth && !authStore.token) {
          // 需要邀请码，跳转至邀请码页面
          next({ name: 'login' })
        }
        else if (data.auth && authStore.token) {
          // 存在token，跳转chat
          next({ name: 'chat' })
        }
        else {
          // 不需要邀请码，直接跳转聊天界面
          next({ name: 'chat' })
        }
        // if (String(data.auth) === 'false' && authStore.token)
        //   authStore.removeToken()
        // if (to.path === '/500')
        //   next({ name: 'Root' })
        // else
        //   next()
      }
      catch (error) {
        if (to.path !== '/500')
          next({ name: '500' })
        else
          next()
      }
    }
    else {
      next()
    }
  })
}
