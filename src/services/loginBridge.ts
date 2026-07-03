export interface WeChatProfileDraft {
  nickname: string
  avatarPath?: string
  avatarUrl?: string
}

interface LoginPromptPayload {
  reason?: string
  resolve: (profile: WeChatProfileDraft) => void
  reject: (error: Error) => void
}

type LoginPromptListener = (payload: LoginPromptPayload) => void

const listeners = new Set<LoginPromptListener>()

export function subscribeLoginPrompt(listener: LoginPromptListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function requestWeChatProfile(reason?: string) {
  return new Promise<WeChatProfileDraft>((resolve, reject) => {
    const activeListener = Array.from(listeners).at(-1)
    if (!activeListener) {
      reject(new Error('登录组件未初始化'))
      return
    }
    activeListener({ reason, resolve, reject })
  })
}
