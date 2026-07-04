import Taro from '@tarojs/taro'
import { BACKGROUND_OPTIONS, getPhotoSize } from '@/data/sizes'
import { logEvent, validatePhoto } from '@/services/api'
import { getAuthOpenid, getAuthSession, getAuthUserId } from '@/services/auth'
import { addUsageRecord } from '@/services/history'
import { syncUsageRecord } from '@/services/photo'
import { formatNow } from '@/utils/time'
import type { PhotoSizeId, UsageRecord } from '@/types'

export async function createPhotoRecord(input: { imagePath: string; sizeId: PhotoSizeId; sourceType: 'album' | 'camera' }) {
  const session = getAuthSession()
  if (!session) {
    throw new Error('请先登录后再制作证件照')
  }
  const selectedSize = getPhotoSize(input.sizeId)
  Taro.showLoading({ title: '检测并生成中' })
  let validation
  try {
    validation = await validatePhoto({
      session,
      filePath: input.imagePath,
      sizeId: input.sizeId,
      sourceType: input.sourceType
    })
  } finally {
    Taro.hideLoading()
  }
  if (!validation.ok || !validation.imagePath) {
    throw new Error(validation.message || '照片不符合证件照要求，请重新选择')
  }
  const defaultBg = BACKGROUND_OPTIONS[0]
  const record: UsageRecord = {
    id: `photo-${Date.now()}`,
    userId: getAuthUserId(),
    openid: getAuthOpenid(),
    sourceType: input.sourceType,
    sizeId: input.sizeId,
    sizeName: selectedSize.name,
    imagePath: validation.imagePath,
    originalImagePath: validation.originalUrl,
    backgroundId: defaultBg.id,
    backgroundColor: defaultBg.color,
    createdAt: formatNow(),
    status: 'completed'
  }

  addUsageRecord(record)
  await logEvent({
    event: 'photo.created',
    userId: record.userId,
    openid: record.openid,
    meta: {
      sourceType: input.sourceType,
      sizeId: input.sizeId,
      pixelWidth: selectedSize.pixelWidth,
      pixelHeight: selectedSize.pixelHeight
    }
  })
  try {
    await syncUsageRecord(record)
  } catch {
    Taro.showToast({ title: '后端同步失败，已保存在本机', icon: 'none' })
  }
  return record
}
