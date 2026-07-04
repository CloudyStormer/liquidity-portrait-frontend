import { useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import BottomNav from '@/components/BottomNav'
import RecordCard from '@/components/RecordCard'
import { fetchPhotoHistory } from '@/services/api'
import { getAuthSession } from '@/services/auth'
import { getUsageHistory } from '@/services/history'
import type { UsageRecord } from '@/types'
import './index.css'

export default function OrdersPage() {
  const [records, setRecords] = useState<UsageRecord[]>([])
  const [loading, setLoading] = useState(false)

  useDidShow(() => {
    const session = getAuthSession()
    if (!session) {
      setRecords([])
      return
    }
    setRecords(getUsageHistory(session.user.id))

    setLoading(true)
    fetchPhotoHistory(session)
      .then((nextRecords) => {
        setRecords(nextRecords)
      })
      .catch(() => {
        Taro.showToast({ title: '历史接口暂不可用', icon: 'none' })
      })
      .finally(() => setLoading(false))
  })

  return (
    <View className='page orders-page fade-in'>
      <View className='orders-topbar fixed-header'>
        <Text className='orders-eyebrow'>拍摄生成记录</Text>
        <Text className='orders-title'>历史记录</Text>
      </View>

      <View className='orders-scroll'>
        {records.length > 0 ? (
          <View className='orders-list'>
            {records.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </View>
        ) : (
          <View className='orders-empty card'>
            <Text className='orders-empty__title'>{loading ? '正在加载' : '暂无历史记录'}</Text>
            <Text className='orders-empty__desc'>相册选择或直接拍摄生成证件照后，会记录在这里。</Text>
            <Button className='primary-button orders-empty__button' onClick={() => Taro.redirectTo({ url: '/pages/index/index' })}>
              去制作
            </Button>
          </View>
        )}
      </View>

      <BottomNav current='orders' />
    </View>
  )
}
