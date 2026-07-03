import Taro from '@tarojs/taro'
import { BACKGROUND_OPTIONS, getPhotoSize } from '@/data/sizes'
import { logEvent } from '@/services/api'
import { getAuthOpenid, getAuthUserId } from '@/services/auth'
import { addUsageRecord } from '@/services/history'
import { syncUsageRecord } from '@/services/photo'
import { formatNow } from '@/utils/time'
import type { PhotoSizeId, UsageRecord } from '@/types'

export async function createPhotoRecord(input: { imagePath: string; sizeId: PhotoSizeId; sourceType: 'album' | 'camera' }) {
  const selectedSize = getPhotoSize(input.sizeId)
  const defaultBg = BACKGROUND_OPTIONS[0]
  const record: UsageRecord = {
    id: `photo-${Date.now()}`,
    userId: getAuthUserId(),
    openid: getAuthOpenid(),
    sourceType: input.sourceType,
    sizeId: input.sizeId,
    sizeName: selectedSize.name,
    imagePath: input.imagePath,
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
