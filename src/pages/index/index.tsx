import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BottomNav from '@/components/BottomNav'
import SizeSelector from '@/components/SizeSelector'
import { BACKGROUND_OPTIONS, getPhotoSize } from '@/data/sizes'
import { requireLoggedIn } from '@/services/auth'
import { createPhotoRecord } from '@/services/records'
import type { PhotoSizeId } from '@/types'
import './index.css'

export default function IndexPage() {
  const [sizeId, setSizeId] = useState<PhotoSizeId>('two-inch')
  const [creating, setCreating] = useState(false)
  const selectedSize = getPhotoSize(sizeId)

  const createRecord = async (sourceType: 'album' | 'camera') => {
    setCreating(true)
    try {
      await requireLoggedIn('请先使用微信头像和昵称完成登录后继续制作证件照。')
      if (sourceType === 'camera') {
        Taro.navigateTo({ url: `/pages/camera/index?sizeId=${sizeId}` })
        return
      }
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['original'],
        sourceType: ['album']
      })
      const imagePath = res.tempFilePaths[0]
      if (!imagePath) return

      const record = await createPhotoRecord({ imagePath, sizeId, sourceType })
      Taro.navigateTo({ url: `/pages/result/index?id=${record.id}` })
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message && !message.includes('取消')) {
        Taro.showToast({ title: message, icon: 'none' })
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <View className='page index-page fade-in'>
      <View className='topbar index-topbar'>
        <Text className='index-back'>‹</Text>
        <Text className='index-title'>证件照生成器</Text>
        <Text className='index-more'>•••</Text>
      </View>

      <View className='spec-card'>
        <Text className='spec-card__title'>证件照规格说明</Text>
        <View className='spec-row'>
          <Text className='spec-row__label'>规格名称：</Text>
          <Text className='spec-row__value'>{selectedSize.name}</Text>
        </View>
        <View className='spec-row'>
          <Text className='spec-row__label'>打印尺寸：</Text>
          <Text className='spec-row__value'>{selectedSize.printWidthMm} * {selectedSize.printHeightMm}mm</Text>
        </View>
        <View className='spec-row'>
          <Text className='spec-row__label'>像素尺寸：</Text>
          <Text className='spec-row__value'>{selectedSize.pixelWidth} * {selectedSize.pixelHeight}px</Text>
        </View>
        <View className='spec-row'>
          <Text className='spec-row__label'>文件大小：</Text>
          <Text className='spec-row__value'>{selectedSize.fileSizeLabel}</Text>
        </View>
        <View className='spec-row'>
          <Text className='spec-row__label'>分辨率：</Text>
          <Text className='spec-row__value'>{selectedSize.dpi}dpi</Text>
        </View>
        <View className='spec-row spec-row--colors'>
          <Text className='spec-row__label'>背景色：</Text>
          <View className='spec-swatches'>
            {BACKGROUND_OPTIONS.map((item) => (
              <View
                key={item.id}
                className='spec-swatch'
                style={{
                  background: item.gradient || item.color,
                  borderColor: item.borderColor || '#DFE3EB'
                }}
              />
            ))}
          </View>
        </View>
      </View>

      <View className='size-panel'>
        <Text className='section-title'>选择证件照类型</Text>
        <SizeSelector value={sizeId} onChange={setSizeId} />
      </View>

      <View className='advice-card'>
        <Text className='advice-card__title'>拍照建议</Text>
        <View className='advice-row'>
          <Text className='advice-row__num'>1</Text>
          <Text className='advice-row__text'>表情自然，抬头挺胸，两眼平视前方</Text>
        </View>
        <View className='advice-row'>
          <Text className='advice-row__num'>2</Text>
          <Text className='advice-row__text'>找他人协助，用后置摄像头拍摄更佳</Text>
        </View>
        <View className='advice-row'>
          <Text className='advice-row__num'>3</Text>
          <Text className='advice-row__text'>穿深色衣服，在白色或纯色背景墙前拍摄效果最佳</Text>
        </View>
      </View>

      <View className='shoot-actions'>
        <Button className='shoot-button shoot-button--ghost' loading={creating} onClick={() => createRecord('album')}>
          相册选择
        </Button>
        <Button className='shoot-button shoot-button--primary' loading={creating} onClick={() => createRecord('camera')}>
          直接拍摄
        </Button>
      </View>

      <BottomNav current='home' />
    </View>
  )
}
