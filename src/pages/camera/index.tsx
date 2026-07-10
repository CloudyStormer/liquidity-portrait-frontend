import { useState } from 'react'
import { Button, Camera, Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { getPhotoSize } from '@/data/sizes'
import { requireLoggedIn } from '@/services/auth'
import { createPhotoRecord } from '@/services/records'
import { useWechatShare, withWechatShare } from '@/services/share'
import type { PhotoSizeId } from '@/types'
import './index.css'

function CameraPage() {
  useWechatShare()

  const [sizeId, setSizeId] = useState<PhotoSizeId>('one-inch')
  const [taking, setTaking] = useState(false)

  useLoad((params) => {
    const nextSize = String(params.sizeId || 'one-inch') as PhotoSizeId
    setSizeId(nextSize)
  })

  const size = getPhotoSize(sizeId)
  const guideClass = sizeId === 'one-inch' ? 'body-guide--one-inch' : 'body-guide--two-inch'

  const takePhoto = async () => {
    setTaking(true)
    try {
      await requireLoggedIn('请先使用微信头像和昵称完成登录后继续拍摄证件照。')
      const camera = Taro.createCameraContext()
      const result = await new Promise<{ tempImagePath: string }>((resolve, reject) => {
        camera.takePhoto({
          quality: 'high',
          success: resolve,
          fail: reject
        } as unknown as Taro.CameraContext.TakePhotoOption)
      })
      const record = await createPhotoRecord({ imagePath: result.tempImagePath, sizeId, sourceType: 'camera' })
      Taro.redirectTo({ url: `/pages/result/index?id=${record.id}` })
    } catch (error) {
      const message = error instanceof Error ? error.message : '拍摄失败'
      if (!message.includes('取消')) {
        Taro.showToast({ title: message, icon: 'none' })
      }
    } finally {
      setTaking(false)
    }
  }

  return (
    <View className='camera-page'>
      <Camera className='camera-view' devicePosition='front' flash='off'>
        <View className={`body-guide ${guideClass}`}>
          <View className='crop-guide' />
          <View className='guide-line guide-line--top'>头顶线</View>
          <View className='guide-line guide-line--eye'>眼睛平视</View>
          <View className='guide-line guide-line--chin'>下巴参考</View>
          <View className='head-guide' />
          <View className='shoulder-guide' />
          <View className='shoulder-label'>肩部保持在框内</View>
        </View>
        <Text className='camera-tip'>让头顶贴近头顶线，眼睛对齐横线，肩部在框内</Text>
      </Camera>

      <View className='camera-footer'>
        <Text className='camera-size'>{size.name} · {size.pixelWidth} x {size.pixelHeight}px</Text>
        <Button className='camera-button' loading={taking} onClick={takePhoto}>
          拍摄
        </Button>
      </View>
    </View>
  )
}

export default withWechatShare(CameraPage)
