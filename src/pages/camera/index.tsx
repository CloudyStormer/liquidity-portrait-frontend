import { useState } from 'react'
import { Button, Camera, Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { getPhotoSize } from '@/data/sizes'
import { requireLoggedIn } from '@/services/auth'
import { createPhotoRecord } from '@/services/records'
import type { PhotoSizeId } from '@/types'
import './index.css'

export default function CameraPage() {
  const [sizeId, setSizeId] = useState<PhotoSizeId>('two-inch')
  const [taking, setTaking] = useState(false)

  useLoad((params) => {
    const nextSize = String(params.sizeId || 'two-inch') as PhotoSizeId
    setSizeId(nextSize)
  })

  const size = getPhotoSize(sizeId)

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
      <View className='camera-header'>
        <Text className='camera-back' onClick={() => Taro.navigateBack()}>‹</Text>
        <Text className='camera-title'>直接拍摄</Text>
        <Text className='camera-placeholder' />
      </View>

      <Camera className='camera-view' devicePosition='back' flash='off'>
        <View className='body-guide'>
          <View className='head-guide' />
          <View className='shoulder-guide' />
        </View>
        <Text className='camera-tip'>保持头肩在框线内，正视镜头</Text>
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
