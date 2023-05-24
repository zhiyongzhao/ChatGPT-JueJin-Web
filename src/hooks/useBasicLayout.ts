import { breakpointsTailwind, useBreakpoints } from '@vueuse/core' // 工具库引入动态检测屏幕尺寸

export function useBasicLayout() {
  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('sm')
  // 判断是否是移动端
  return { isMobile }
}
