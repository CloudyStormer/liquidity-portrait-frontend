export type PhotoSizeId = 'one-inch' | 'two-inch' | 'small-one-inch' | 'large-one-inch' | 'passport' | 'social-security'

export interface PhotoSizeOption {
  id: PhotoSizeId
  name: string
  printWidthMm: number
  printHeightMm: number
  pixelWidth: number
  pixelHeight: number
  dpi: number
  fileSizeLabel: string
  available: boolean
}

export interface BackgroundOption {
  id: string
  name: string
  color: string
  borderColor?: string
  gradient?: string
}

export type ResultMode = 'single' | 'layout'

export interface UsageRecord {
  id: string
  userId?: string
  openid?: string
  sourceType?: 'album' | 'camera'
  sizeId: PhotoSizeId
  sizeName: string
  imagePath: string
  backgroundId?: string
  backgroundColor?: string
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
