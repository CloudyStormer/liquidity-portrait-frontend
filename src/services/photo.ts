import Taro from '@tarojs/taro'
import type { UsageRecord } from '@/types'
import { getAuthHeader, getAuthOpenid, getAuthUserId } from '@/services/auth'
import { API_BASE_URL } from '@/services/api'

export async function syncUsageRecord(record: UsageRecord) {
  if (!API_BASE_URL) {
    return
  }

  const openid = record.openid || getAuthOpenid()
  const userId = record.userId || getAuthUserId()

  await Taro.request({
    url: `${API_BASE_URL}/api/photo/usage-records`,
    method: 'POST',
    data: {
      ...record,
      sourceType: record.sourceType,
      userId,
      openid
    },
    header: {
      'content-type': 'application/json',
      ...getAuthHeader()
    }
  })
}
