import { View, Text } from '@tarojs/components'
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
          className={`size-card ${value === item.id ? 'size-card--active' : ''} ${!item.available ? 'size-card--disabled' : ''}`}
          onClick={() => {
            if (item.available) onChange(item.id)
          }}
        >
          <Text className='size-card__name'>{item.name}</Text>
          <Text className='size-card__detail'>
            {item.printWidthMm} x {item.printHeightMm}mm
          </Text>
          <Text className='size-card__px'>
            {item.pixelWidth} x {item.pixelHeight}px
          </Text>
          {!item.available && <Text className='size-card__soon'>暂未开放</Text>}
        </View>
      ))}
    </View>
  )
}
