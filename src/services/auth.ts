import Taro from '@tarojs/taro'
import type { AuthSession } from '@/types'
import { API_BASE_URL, getClientId } from '@/services/api'
import { formatNow } from '@/utils/time'

const AUTH_KEY = 'lp_auth_session'

interface WechatProfile {
  nickName?: string
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
      nickname: data.user.nickname || data.user.nickName || '微信用户',
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
      nickname: profile?.nickName || '微信用户',
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

async function getWechatProfile(): Promise<WechatProfile | undefined> {
  if (getPlatform() !== 'weapp') {
    return undefined
  }

  try {
    const profile = await Taro.getUserProfile({
      desc: '用于展示头像和昵称'
    })
    return profile.userInfo
  } catch {
    return undefined
  }
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

export async function loginWithWechat() {
  const profile = await getWechatProfile()

  if (getPlatform() !== 'weapp') {
    const session = createLocalSession(profile)
    setAuthSession(session)
    return session
  }

  const loginResult = await Taro.login()
  if (!loginResult.code) {
    throw new Error('未获取到微信登录凭证')
  }

  const session = await exchangeCode(loginResult.code, profile)
  setAuthSession(session)
  return session
}
