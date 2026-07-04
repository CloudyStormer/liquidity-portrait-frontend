import Taro from '@tarojs/taro'
import type { UsageRecord } from '@/types'

const HISTORY_KEY = 'lp_usage_history'

function scopedHistoryKey(userId?: string) {
  return userId ? `${HISTORY_KEY}:${userId}` : HISTORY_KEY
}

export function getUsageHistory(userId?: string): UsageRecord[] {
  if (!userId) return []
  try {
    const records = Taro.getStorageSync<UsageRecord[]>(scopedHistoryKey(userId))
    return Array.isArray(records) ? records.filter((record) => record.userId === userId) : []
  } catch {
    return []
  }
}

export function getUsageRecord(id: string, userId?: string) {
  return getUsageHistory(userId).find((item) => item.id === id)
}

export function addUsageRecord(record: UsageRecord) {
  if (!record.userId) return
  const records = getUsageHistory(record.userId)
  Taro.setStorageSync(scopedHistoryKey(record.userId), [record, ...records])
}

export function mergeUsageHistory(userId: string, records: UsageRecord[]) {
  Taro.setStorageSync(scopedHistoryKey(userId), records.filter((record) => record.userId === userId))
}
