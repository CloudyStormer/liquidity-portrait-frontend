import Taro from '@tarojs/taro'

export const API_BASE_URL = process.env.TARO_APP_API_BASE || 'http://localhost:8787'
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
