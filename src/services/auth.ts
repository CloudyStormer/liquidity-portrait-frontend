import Taro from '@tarojs/taro'
import type { AuthSession } from '@/types'
import { API_BASE_URL, getClientId, logEvent, updateUserProfile, uploadUserAvatar } from '@/services/api'
import { requestWeChatProfile, type WeChatProfileDraft } from '@/services/loginBridge'
import { formatNow } from '@/utils/time'

const AUTH_KEY = 'lp_auth_session'
const DEFAULT_NICKNAME = '微信用户'

interface WechatProfile {
  nickName?: string
  nickname?: string
  avatarUrl?: string
}

interface ServerLoginResponse {
  token: string
  user: {
    id: string
    platform?: string
    nickname?: string
    nickName?: string
    avatarUrl?: string
    openid?: string
    unionid?: string
  }
}

function getPlatform() {
  return Taro.getEnv() === Taro.ENV_TYPE.WEAPP ? 'weapp' : 'h5'
}

function normalizeSession(data: ServerLoginResponse): AuthSession {
  return {
    token: data.token,
    loginAt: formatNow(),
    source: 'wechat',
    user: {
      id: data.user.id,
      nickname: data.user.nickname || data.user.nickName || DEFAULT_NICKNAME,
      avatarUrl: data.user.avatarUrl || '',
      openid: data.user.openid
    }
  }
}

function createLocalSession(profile?: WechatProfile): AuthSession {
  return {
    token: `local-session-${Date.now()}`,
    loginAt: formatNow(),
    source: 'local-dev',
    user: {
      id: `local-user-${Date.now()}`,
      nickname: profile?.nickName || profile?.nickname || DEFAULT_NICKNAME,
      avatarUrl: profile?.avatarUrl || ''
    }
  }
}

export function getAuthSession(): AuthSession | null {
  try {
    const session = Taro.getStorageSync<AuthSession>(AUTH_KEY)
    return session?.token ? session : null
  } catch {
    return null
  }
}

export function getAuthOpenid() {
  return getAuthSession()?.user.openid || ''
}

export function getAuthUserId() {
  return getAuthSession()?.user.id || ''
}

export function getAuthHeader() {
  const session = getAuthSession()
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {}
}

export function setAuthSession(session: AuthSession) {
  Taro.setStorageSync(AUTH_KEY, session)
}

export function clearAuthSession() {
  Taro.removeStorageSync(AUTH_KEY)
}

export async function ensureWechatSession() {
  if (getPlatform() !== 'weapp') {
    return Boolean(getAuthSession())
  }

  try {
    await Taro.checkSession()
    return true
  } catch {
    clearAuthSession()
    return false
  }
}

function hasCompleteProfile(session: AuthSession | null) {
  return Boolean(
    session?.token &&
      session.user.nickname &&
      session.user.nickname !== DEFAULT_NICKNAME &&
      session.user.avatarUrl
  )
}

async function exchangeCode(code: string, profile?: WechatProfile) {
  if (!API_BASE_URL) {
    return createLocalSession(profile)
  }

  const response = await Taro.request<ServerLoginResponse>({
    url: `${API_BASE_URL}/api/auth/wechat/login`,
    method: 'POST',
    data: {
      code,
      clientId: getClientId(),
      platform: getPlatform(),
      userInfo: profile
        ? {
            nickName: profile.nickName || profile.nickname,
            nickname: profile.nickname || profile.nickName,
            avatarUrl: profile.avatarUrl
          }
        : undefined
    },
    header: {
      'content-type': 'application/json'
    }
  })

  if (response.statusCode < 200 || response.statusCode >= 300 || !response.data?.token) {
    const errorMessage = (response.data as unknown as { error?: string })?.error || '微信登录失败'
    throw new Error(errorMessage)
  }

  return normalizeSession(response.data)
}

async function completeProfile(session: AuthSession, profile: WeChatProfileDraft) {
  let nextSession: AuthSession = {
    ...session,
    user: {
      ...session.user,
      nickname: profile.nickname
    }
  }

  if (profile.avatarPath) {
    const avatarResult = await uploadUserAvatar(nextSession, profile.avatarPath)
    nextSession = {
      ...nextSession,
      user: {
        ...nextSession.user,
        avatarUrl: avatarResult.user.avatarUrl || nextSession.user.avatarUrl
      }
    }
  } else if (profile.avatarUrl) {
    nextSession.user.avatarUrl = profile.avatarUrl
  }

  const profileResult = await updateUserProfile(nextSession, {
    nickname: nextSession.user.nickname,
    avatarUrl: nextSession.user.avatarUrl
  })
  nextSession = {
    ...nextSession,
    user: {
      ...nextSession.user,
      nickname: profileResult.nickname || nextSession.user.nickname,
      avatarUrl: profileResult.avatarUrl || nextSession.user.avatarUrl
    }
  }
  setAuthSession(nextSession)
  return nextSession
}

export async function loginWithWechat(profile?: WeChatProfileDraft) {
  const profileForLogin = profile
    ? {
        nickname: profile.nickname,
        avatarUrl: profile.avatarUrl
      }
    : undefined

  if (getPlatform() !== 'weapp') {
    const session = createLocalSession(profileForLogin)
    setAuthSession(session)
    await logEvent({
      event: 'auth.local.login',
      userId: session.user.id,
      meta: { source: session.source }
    })
    return session
  }

  const loginResult = await Taro.login()
  if (!loginResult.code) {
    throw new Error('未获取到微信登录凭证')
  }

  let session = await exchangeCode(loginResult.code, profileForLogin)
  setAuthSession(session)
  if (profile) {
    session = await completeProfile(session, profile)
  }
  await logEvent({
    event: 'auth.wechat.login.client',
    userId: session.user.id,
    openid: session.user.openid
  })
  return session
}

export async function requireLoggedIn(reason?: string) {
  const cached = getAuthSession()
  if (hasCompleteProfile(cached)) {
    return cached
  }

  const profile = await requestWeChatProfile(reason || '请先使用微信头像和昵称完成登录后继续。')
  const session = await loginWithWechat(profile)
  if (!hasCompleteProfile(session)) {
    throw new Error('微信头像和昵称缺失，无法完成登录')
  }
  Taro.showToast({ title: '登录成功', icon: 'success' })
  return session
}
