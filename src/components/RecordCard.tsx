import { View, Text } from '@tarojs/components'
import type { UsageRecord } from '@/types'
import './RecordCard.css'

interface RecordCardProps {
  record: UsageRecord
}

function sourceLabel(sourceType?: UsageRecord['sourceType']) {
  return sourceType === 'camera' ? '直接拍摄' : '相册选择'
}

export default function RecordCard({ record }: RecordCardProps) {
  return (
    <View className='record-card'>
      <View className='record-card__main'>
        <Text className='record-card__title'>{record.sizeName}</Text>
        <Text className='record-card__type'>{sourceLabel(record.sourceType)}</Text>
      </View>
      <Text className='record-card__time'>{record.createdAt}</Text>
    </View>
  )
}
