import Taro from '@tarojs/taro'
import type { AuthSession, UsageRecord } from '@/types'

export const API_BASE_URL = 'https://api.hgshouse.com/portrait'
const CLIENT_ID_KEY = 'lp_client_id'
const USER_CACHE_KEY = 'lp_user_cache'

export interface AppUser {
  id: string
  platform: string
  nickname?: string
  avatarUrl?: string
  openid?: string
  openaiUserId: string
  createdAt: string
  lastSeenAt: string
}

export interface UsageSummary {
  date: string
  used: number
  total: number
  remaining: number
  freeDailyQuota: number
  bonus: number
}

export interface IdentifyResponse {
  user: AppUser
  usage: UsageSummary
}

function createClientId() {
  return `weapp_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function getClientId() {
  let clientId = Taro.getStorageSync<string>(CLIENT_ID_KEY)
  if (!clientId) {
    clientId = createClientId()
    Taro.setStorageSync(CLIENT_ID_KEY, clientId)
  }
  return clientId
}

export function getCachedUser(): AppUser | null {
  try {
    return Taro.getStorageSync<AppUser>(USER_CACHE_KEY) || null
  } catch {
    return null
  }
}

export async function identifyUser(): Promise<IdentifyResponse> {
  const response = await Taro.request<IdentifyResponse>({
    url: `${API_BASE_URL}/api/users/identify`,
    method: 'POST',
    data: {
      clientId: getClientId(),
      platform: Taro.getEnv() === Taro.ENV_TYPE.WEAPP ? 'weapp' : 'h5'
    }
  })
  Taro.setStorageSync(USER_CACHE_KEY, response.data.user)
  return response.data
}

export async function getUsageSummary(userId: string) {
  const response = await Taro.request<{ usage: UsageSummary }>({
    url: `${API_BASE_URL}/api/users/${userId}/usage`,
    method: 'GET'
  })
  return response.data.usage
}

export async function rewardAd(userId: string, placement: 'quota' | 'download') {
  const response = await Taro.request<{ usage: UsageSummary }>({
    url: `${API_BASE_URL}/api/ads/reward`,
    method: 'POST',
    data: { userId, placement }
  })
  return response.data.usage
}

export async function updateUserProfile(session: AuthSession, input: { nickname?: string; avatarUrl?: string }) {
  const response = await Taro.request<{ user: AppUser }>({
    url: `${API_BASE_URL}/api/users/${session.user.id}/profile`,
    method: 'PATCH',
    data: input,
    header: {
      Authorization: `Bearer ${session.token}`,
      'content-type': 'application/json'
    }
  })
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error('用户资料更新失败')
  }
  return response.data.user
}

export async function uploadUserAvatar(session: AuthSession, avatarPath: string) {
  const response = await Taro.uploadFile({
    url: `${API_BASE_URL}/api/users/${session.user.id}/avatar`,
    filePath: avatarPath,
    name: 'file',
    header: {
      Authorization: `Bearer ${session.token}`
    }
  })
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`头像上传失败：${response.statusCode}`)
  }
  return JSON.parse(response.data || '{}') as { user: AppUser }
}

export async function fetchPhotoHistory(userId: string) {
  const response = await Taro.request<{ records: UsageRecord[] }>({
    url: `${API_BASE_URL}/api/users/${userId}/history?type=photo`,
    method: 'GET'
  })
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error('历史记录接口不可用')
  }
  return response.data.records || []
}

export async function logEvent(input: {
  event: string
  userId?: string
  openid?: string
  platform?: string
  meta?: Record<string, unknown>
}) {
  try {
    await Taro.request({
      url: `${API_BASE_URL}/api/logs`,
      method: 'POST',
      data: {
        platform: Taro.getEnv() === Taro.ENV_TYPE.WEAPP ? 'weapp' : 'h5',
        ...input
      },
      header: {
        'content-type': 'application/json'
      }
    })
  } catch {
    // Logging must never block the photo flow.
  }
}

export async function processImage(input: {
  userId: string
  filePath: string
  method: 'screenshot' | 'doodle' | 'selection'
  markerDataUrl?: string
}) {
  const response = await Taro.uploadFile({
    url: `${API_BASE_URL}/api/process/image`,
    filePath: input.filePath,
    name: 'image',
    formData: {
      userId: input.userId,
      method: input.method,
      markerDataUrl: input.markerDataUrl ?? '',
      rightsConfirmed: 'true'
    }
  })
  return JSON.parse(response.data)
}
