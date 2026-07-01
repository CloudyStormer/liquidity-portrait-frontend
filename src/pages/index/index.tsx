import { useState } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import AdBanner from '@/components/AdBanner'
import BottomNav from '@/components/BottomNav'
import SizeSelector from '@/components/SizeSelector'
import { getPhotoSize } from '@/data/sizes'
import { getAuthOpenid, getAuthSession, getAuthUserId } from '@/services/auth'
import { addUsageRecord } from '@/services/history'
import { syncUsageRecord } from '@/services/photo'
import { formatNow } from '@/utils/time'
import type { PhotoSizeId } from '@/types'
import './index.css'

export default function IndexPage() {
  const [sizeId, setSizeId] = useState<PhotoSizeId>('one-inch')
  const [imagePath, setImagePath] = useState('')
  const [creating, setCreating] = useState(false)

  const pickImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      setImagePath(res.tempFilePaths[0] ?? '')
    } catch {
      // User cancelled.
    }
  }

  const createPhoto = async () => {
    const selectedSize = getPhotoSize(sizeId)
    if (!selectedSize?.available) {
      Taro.showToast({ title: '该规格暂未开放', icon: 'none' })
      return
    }
    if (!imagePath) {
      Taro.showToast({ title: '请先上传照片', icon: 'none' })
      return
    }
    if (!getAuthSession()) {
      Taro.showModal({
        title: '需要登录',
        content: '请先完成微信登录，再生成并同步订单记录。',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/profile/index' })
          }
        }
      })
      return
    }

    setCreating(true)
    Taro.showLoading({ title: '生成中' })
    setTimeout(async () => {
      const record = {
        id: `photo-${Date.now()}`,
        userId: getAuthUserId(),
        openid: getAuthOpenid(),
        sizeId,
        sizeName: selectedSize.name,
        imagePath,
        createdAt: formatNow(),
        status: 'completed' as const
      }
      addUsageRecord(record)
      try {
        await syncUsageRecord(record)
      } catch {
        Taro.showToast({ title: '后端同步失败，已保存在本地', icon: 'none' })
      }
      Taro.hideLoading()
      setCreating(false)
      Taro.navigateTo({ url: `/pages/result/index?id=${record.id}` })
    }, 700)
  }

  return (
    <View className='page fade-in'>
      <View className='topbar'>
        <View>
          <Text className='eyebrow'>AI 证件照</Text>
          <Text className='title'>制作标准证件照</Text>
          <Text className='subtitle'>目前仅开放 1 寸和 2 寸规格</Text>
        </View>
        <View className='brand-mark' />
      </View>

      <AdBanner label='首页广告位' />

      <View className='upload-card card' onClick={pickImage}>
        {imagePath ? (
          <Image className='upload-card__preview' src={imagePath} mode='aspectFill' />
        ) : (
          <View className='upload-card__empty'>
            <Text className='upload-card__icon'>+</Text>
            <Text className='upload-card__title'>上传或拍摄照片</Text>
            <Text className='upload-card__desc'>建议使用正面半身照，背景清晰</Text>
          </View>
        )}
      </View>

      <View className='panel card'>
        <Text className='section-title'>选择规格</Text>
        <SizeSelector value={sizeId} onChange={setSizeId} />
      </View>

      <View className='flow card'>
        <Text className='section-title'>处理内容</Text>
        <View className='flow__row'>
          <Text className='flow__step'>1</Text>
          <Text className='flow__text'>上传正面照片</Text>
        </View>
        <View className='flow__row'>
          <Text className='flow__step'>2</Text>
          <Text className='flow__text'>选择 1 寸或 2 寸规格</Text>
        </View>
        <View className='flow__row'>
          <Text className='flow__step'>3</Text>
          <Text className='flow__text'>生成后自动写入历史记录</Text>
        </View>
      </View>

      <View className='danger-note'>
        请确保上传照片为本人或已获授权素材，生成结果仅供合法用途使用。
      </View>

      <Button className='primary-button create-button' loading={creating} onClick={createPhoto}>
        生成证件照
      </Button>

      <BottomNav current='home' />
    </View>
  )
}
