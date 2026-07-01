import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import BottomNav from '@/components/BottomNav'
import RecordCard from '@/components/RecordCard'
import { getUsageHistory } from '@/services/history'
import type { UsageRecord } from '@/types'
import './index.css'

export default function OrdersPage() {
  const [records, setRecords] = useState<UsageRecord[]>([])

  useDidShow(() => {
    setRecords(getUsageHistory())
  })

  return (
    <View className='page fade-in'>
      <View className='topbar orders-topbar'>
        <View>
          <Text className='eyebrow'>历史记录</Text>
          <Text className='title'>订单</Text>
          <Text className='subtitle'>这里只记录历史使用记录</Text>
        </View>
      </View>

      <View className='orders-note card'>
        <Text className='orders-note__title'>订单说明</Text>
        <Text className='orders-note__text'>当前页面只展示已生成的历史使用记录。</Text>
      </View>

      {records.length > 0 ? (
        <View className='orders-list'>
          {records.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </View>
      ) : (
        <View className='orders-empty card'>
          <Text className='orders-empty__title'>暂无历史记录</Text>
          <Text className='orders-empty__desc'>生成 1 寸或 2 寸证件照后，会自动记录在这里。</Text>
          <Button className='primary-button orders-empty__button' onClick={() => Taro.redirectTo({ url: '/pages/index/index' })}>
            去制作
          </Button>
        </View>
      )}

      <BottomNav current='orders' />
    </View>
  )
}
