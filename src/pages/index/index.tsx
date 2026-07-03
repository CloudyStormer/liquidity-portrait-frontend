import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BottomNav from '@/components/BottomNav'
import SizeSelector from '@/components/SizeSelector'
import WeChatLoginDialog from '@/components/WeChatLoginDialog'
import { BACKGROUND_OPTIONS, getPhotoSize } from '@/data/sizes'
import { requireLoggedIn } from '@/services/auth'
import { createPhotoRecord } from '@/services/records'
import type { PhotoSizeId } from '@/types'
import './index.css'

type ChooseMediaResult = {
  tempFiles?: Array<{ tempFilePath?: string }>
}

export default function IndexPage() {
  const [sizeId, setSizeId] = useState<PhotoSizeId>('two-inch')
  const [activeAction, setActiveAction] = useState<'album' | 'camera' | null>(null)
  const selectedSize = getPhotoSize(sizeId)

  const createRecord = async (sourceType: 'album' | 'camera') => {
    try {
      await requireLoggedIn('请先使用微信头像和昵称完成登录后继续制作证件照。')
      if (sourceType === 'camera') {
        Taro.navigateTo({ url: `/pages/camera/index?sizeId=${sizeId}` })
        return
      }

      setActiveAction(sourceType)
      const res = (await Taro.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album'],
        sizeType: ['original']
      })) as ChooseMediaResult
      const imagePath = res.tempFiles?.[0]?.tempFilePath
      if (!imagePath) return

      const record = await createPhotoRecord({ imagePath, sizeId, sourceType })
      Taro.navigateTo({ url: `/pages/result/index?id=${record.id}` })
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message && !message.includes('取消')) {
        Taro.showToast({ title: message, icon: 'none' })
      }
    } finally {
      setActiveAction(null)
    }
  }

  return (
    <View className='page index-page fade-in'>
      <View className='size-panel'>
        <Text className='section-title'>选择证件照类型</Text>
        <SizeSelector value={sizeId} onChange={setSizeId} />
      </View>

      <View className='shoot-actions'>
        <Button className='shoot-button shoot-button--ghost' loading={activeAction === 'album'} onClick={() => createRecord('album')}>
          相册选择
        </Button>
        <Button className='shoot-button shoot-button--primary' loading={activeAction === 'camera'} onClick={() => createRecord('camera')}>
          直接拍摄
        </Button>
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

      <View className='advice-card'>
        <Text className='advice-card__title'>拍照建议</Text>
        <View className='advice-row'>
          <Text className='advice-row__num'>1</Text>
          <Text className='advice-row__text'>表情自然，抬头挺胸，两眼平视前方</Text>
        </View>
        <View className='advice-row'>
          <Text className='advice-row__num'>2</Text>
          <Text className='advice-row__text'>保持面部清晰，避免强光、阴影和明显遮挡</Text>
        </View>
        <View className='advice-row'>
          <Text className='advice-row__num'>3</Text>
          <Text className='advice-row__text'>穿深色衣服，在白色或纯色背景墙前拍摄效果最佳</Text>
        </View>
      </View>

      <BottomNav current='home' />
      <WeChatLoginDialog />
    </View>
  )
}
