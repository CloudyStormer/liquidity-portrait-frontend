import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { UsageRecord } from '@/types'
import './RecordCard.css'

interface RecordCardProps {
  record: UsageRecord
}

export default function RecordCard({ record }: RecordCardProps) {
  return (
    <View
      className='record-card'
      onClick={() => Taro.navigateTo({ url: `/pages/result/index?id=${record.id}` })}
    >
      <Image className='record-card__image' src={record.imagePath} mode='aspectFill' />
      <View className='record-card__body'>
        <View className='record-card__top'>
          <Text className='record-card__title'>{record.sizeName}证件照</Text>
          <Text className='record-card__status'>已完成</Text>
        </View>
        <Text className='record-card__time'>{record.createdAt}</Text>
        <Text className='record-card__hint'>历史使用记录</Text>
      </View>
    </View>
  )
}
