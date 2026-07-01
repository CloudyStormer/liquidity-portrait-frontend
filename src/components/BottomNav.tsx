import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './BottomNav.css'

interface BottomNavProps {
  current: 'home' | 'orders' | 'profile'
}

const items = [
  { id: 'home', label: '首页', path: '/pages/index/index', icon: '◎' },
  { id: 'orders', label: '订单', path: '/pages/orders/index', icon: '▤' },
  { id: 'profile', label: '我的', path: '/pages/profile/index', icon: '○' }
] as const

export default function BottomNav({ current }: BottomNavProps) {
  return (
    <View className='bottom-nav'>
      {items.map((item) => (
        <View
          key={item.id}
          className={`bottom-nav__item ${current === item.id ? 'bottom-nav__item--active' : ''}`}
          onClick={() => {
            if (current !== item.id) {
              Taro.redirectTo({ url: item.path })
            }
          }}
        >
          <Text className='bottom-nav__icon'>{item.icon}</Text>
          <Text className='bottom-nav__label'>{item.label}</Text>
        </View>
      ))}
    </View>
  )
}
