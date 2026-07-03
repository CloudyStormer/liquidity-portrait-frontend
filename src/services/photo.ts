import Taro from '@tarojs/taro'
import type { UsageRecord } from '@/types'
import { getAuthHeader, getAuthUserId } from '@/services/auth'
import { API_BASE_URL } from '@/services/api'

export async function syncUsageRecord(record: UsageRecord) {
  if (!API_BASE_URL) {
    return
  }

  const userId = record.userId || getAuthUserId()

  await Taro.request({
    url: `${API_BASE_URL}/api/photo/usage-records`,
    method: 'POST',
    data: {
      id: record.id,
      sourceType: record.sourceType,
      userId,
      sizeId: record.sizeId,
      sizeName: record.sizeName,
      createdAt: record.createdAt,
      status: record.status
    },
    header: {
      'content-type': 'application/json',
      ...getAuthHeader()
    }
  })
}
