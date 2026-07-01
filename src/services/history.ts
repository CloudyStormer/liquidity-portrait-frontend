import Taro from '@tarojs/taro'
import type { UsageRecord } from '@/types'

const HISTORY_KEY = 'lp_usage_history'

export function getUsageHistory(): UsageRecord[] {
  try {
    const records = Taro.getStorageSync<UsageRecord[]>(HISTORY_KEY)
    return Array.isArray(records) ? records : []
  } catch {
    return []
  }
}

export function getUsageRecord(id: string) {
  return getUsageHistory().find((item) => item.id === id)
}

export function addUsageRecord(record: UsageRecord) {
  const records = getUsageHistory()
  Taro.setStorageSync(HISTORY_KEY, [record, ...records])
}
