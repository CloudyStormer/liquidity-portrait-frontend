import { useState } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import AdBanner from '@/components/AdBanner'
import { getUsageRecord } from '@/services/history'
import type { UsageRecord } from '@/types'
import './index.css'

export default function ResultPage() {
  const [record, setRecord] = useState<UsageRecord | undefined>()

  useLoad((params) => {
    const current = getUsageRecord(String(params.id ?? ''))
    setRecord(current)
  })

  const saveImage = async () => {
    if (!record?.imagePath) return
    try {
      await Taro.saveImageToPhotosAlbum({ filePath: record.imagePath })
      Taro.showToast({ title: '已保存到相册', icon: 'success' })
    } catch {
      Taro.showToast({ title: '保存失败，请检查权限', icon: 'none' })
    }
  }

  if (!record) {
    return (
      <View className='page result-empty'>
        <Text className='title'>记录不存在</Text>
        <Text className='subtitle'>请返回首页重新生成证件照</Text>
        <Button className='primary-button result-action' onClick={() => Taro.redirectTo({ url: '/pages/index/index' })}>
          返回首页
        </Button>
      </View>
    )
  }

  return (
    <View className='page fade-in'>
      <View className='result-header'>
        <View>
          <Text className='eyebrow'>生成完成</Text>
          <Text className='title'>{record.sizeName}证件照</Text>
          <Text className='subtitle'>已自动保存到订单历史记录</Text>
        </View>
        <Text className='result-header__badge'>已完成</Text>
      </View>

      <View className='result-card card'>
        <Image className='result-card__image' src={record.imagePath} mode='aspectFill' />
        <View className='result-card__meta'>
          <Text className='result-card__name'>{record.sizeName}标准证件照</Text>
          <Text className='result-card__time'>{record.createdAt}</Text>
        </View>
      </View>

      <AdBanner label='结果页广告位' />

      <Button className='primary-button result-action' onClick={saveImage}>
        保存到相册
      </Button>
      <Button className='ghost-button result-action' onClick={() => Taro.redirectTo({ url: '/pages/orders/index' })}>
        查看订单记录
      </Button>
      <Button className='secondary-button result-action' onClick={() => Taro.redirectTo({ url: '/pages/index/index' })}>
        再做一张
      </Button>
    </View>
  )
}
