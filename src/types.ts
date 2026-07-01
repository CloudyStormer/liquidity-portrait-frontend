export type PhotoSizeId = 'one-inch' | 'two-inch' | 'small-one-inch' | 'large-one-inch' | 'passport' | 'custom'

export interface PhotoSizeOption {
  id: PhotoSizeId
  name: string
  detail: string
  available: boolean
}

export interface UsageRecord {
  id: string
  userId?: string
  openid?: string
  sizeId: PhotoSizeId
  sizeName: string
  imagePath: string
  createdAt: string
  status: 'completed'
}

export interface ResultParams {
  id: string
}

export interface WechatUser {
  id: string
  nickname: string
  avatarUrl: string
  openid?: string
}

export interface AuthSession {
  token: string
  user: WechatUser
  loginAt: string
  source: 'wechat' | 'local-dev'
}
