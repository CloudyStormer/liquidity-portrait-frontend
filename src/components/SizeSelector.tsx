import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { PhotoSizeId } from '@/types'
import { PHOTO_SIZES } from '@/data/sizes'
import './SizeSelector.css'

interface SizeSelectorProps {
  value: PhotoSizeId
  onChange: (value: PhotoSizeId) => void
}

export default function SizeSelector({ value, onChange }: SizeSelectorProps) {
  return (
    <View className='size-grid'>
      {PHOTO_SIZES.map((item) => (
        <View
          key={item.id}
          className={[
            'size-card',
            value === item.id ? 'size-card--active' : '',
            item.available ? '' : 'size-card--disabled'
          ].join(' ')}
          onClick={() => {
            if (!item.available) {
              Taro.showToast({ title: '该规格暂未开放', icon: 'none' })
              return
            }
            onChange(item.id)
          }}
        >
          <View>
            <Text className='size-card__name'>{item.name}</Text>
            <Text className='size-card__detail'>{item.detail}</Text>
          </View>
          {!item.available && <Text className='size-card__soon'>暂未开放</Text>}
        </View>
      ))}
    </View>
  )
}
