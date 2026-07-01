import { View, Text } from '@tarojs/components'
import './AdBanner.css'

interface AdBannerProps {
  label?: string
}

export default function AdBanner({ label = '广告位' }: AdBannerProps) {
  return (
    <View className='ad-banner'>
      <View>
        <Text className='ad-banner__label'>{label}</Text>
        <Text className='ad-banner__text'>后续可接入流量主广告</Text>
      </View>
      <Text className='ad-banner__tag'>AD</Text>
    </View>
  )
}
