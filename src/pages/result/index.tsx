import { useMemo, useState } from 'react'
import { View, Text, Image, Button, Canvas } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { BACKGROUND_OPTIONS, getBackground, getPhotoSize } from '@/data/sizes'
import WeChatLoginDialog from '@/components/WeChatLoginDialog'
import { getAuthOpenid, getAuthUserId, requireLoggedIn } from '@/services/auth'
import { logEvent, rewardAd } from '@/services/api'
import { getUsageRecord } from '@/services/history'
import { useWechatShare } from '@/services/share'
import type { BackgroundOption, ResultMode, UsageRecord } from '@/types'
import './index.css'

const SINGLE_CANVAS_ID = 'singlePhotoCanvas'
const LAYOUT_CANVAS_ID = 'layoutPhotoCanvas'
const PRINT_SHEET = { width: 1200, height: 1800 }

function drawContain(
  ctx: Taro.CanvasContext,
  imagePath: string,
  imageWidth: number,
  imageHeight: number,
  targetX: number,
  targetY: number,
  targetWidth: number,
  targetHeight: number
) {
  const scale = Math.min(targetWidth / imageWidth, targetHeight / imageHeight)
  const drawWidth = imageWidth * scale
  const drawHeight = imageHeight * scale
  const drawX = targetX + (targetWidth - drawWidth) / 2
  const drawY = targetY + (targetHeight - drawHeight) / 2
  ctx.drawImage(imagePath, drawX, drawY, drawWidth, drawHeight)
}

function layoutRule(sizeId: string) {
  if (sizeId === 'one-inch' || sizeId === 'small-one-inch' || sizeId === 'social-security') {
    return { cols: 3, rows: sizeId === 'social-security' ? 3 : 4, gap: 30 }
  }
  return { cols: 2, rows: 2, gap: 42 }
}

async function canvasToFile(canvasId: string, width: number, height: number) {
  const result = await Taro.canvasToTempFilePath({
    canvasId,
    destWidth: width,
    destHeight: height,
    fileType: 'jpg',
    quality: 1
  })
  return result.tempFilePath
}

async function maybeWatchDownloadAd() {
  const adUnitId = ''
  if (!adUnitId || Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
    return true
  }

  return new Promise<boolean>((resolve) => {
    const rewardedAd = (Taro as unknown as {
      createRewardedVideoAd?: (input: { adUnitId: string }) => {
        load: () => Promise<void>
        show: () => Promise<void>
        onClose: (callback: (res: { isEnded?: boolean }) => void) => void
        offClose?: () => void
        onError: (callback: () => void) => void
      }
    }).createRewardedVideoAd?.({ adUnitId })

    if (!rewardedAd) {
      resolve(true)
      return
    }

    rewardedAd.onClose((res) => {
      resolve(Boolean(res?.isEnded))
    })
    rewardedAd.onError(() => {
      Taro.showToast({ title: '广告加载失败，请稍后再试', icon: 'none' })
      resolve(false)
    })
    rewardedAd.load().then(() => rewardedAd.show()).catch(() => {
      Taro.showToast({ title: '广告暂不可用，请稍后再试', icon: 'none' })
      resolve(false)
    })
  })
}

export default function ResultPage() {
  useWechatShare()

  const [record, setRecord] = useState<UsageRecord | undefined>()
  const [mode, setMode] = useState<ResultMode>('single')
  const [background, setBackground] = useState<BackgroundOption>(BACKGROUND_OPTIONS[0])
  const [saving, setSaving] = useState(false)

  useLoad((params) => {
    const current = getUsageRecord(String(params.id ?? ''), getAuthUserId())
    setRecord(current)
    setBackground(getBackground(current?.backgroundId))
    Taro.setNavigationBarTitle({ title: '选择底色' })
  })

  const size = useMemo(() => getPhotoSize(record?.sizeId), [record?.sizeId])
  const previewRatio = `${size.pixelWidth} / ${size.pixelHeight}`
  const layout = layoutRule(size.id)
  const layoutItems = useMemo(() => {
    const totalWidth = layout.cols * size.pixelWidth + (layout.cols - 1) * layout.gap
    const totalHeight = layout.rows * size.pixelHeight + (layout.rows - 1) * layout.gap
    const startX = Math.round((PRINT_SHEET.width - totalWidth) / 2)
    const startY = Math.round((PRINT_SHEET.height - totalHeight) / 2)
    const items: Array<{ left: string; top: string; width: string; height: string }> = []
    for (let row = 0; row < layout.rows; row += 1) {
      for (let col = 0; col < layout.cols; col += 1) {
        const x = startX + col * (size.pixelWidth + layout.gap)
        const y = startY + row * (size.pixelHeight + layout.gap)
        items.push({
          left: `${(x / PRINT_SHEET.width) * 100}%`,
          top: `${(y / PRINT_SHEET.height) * 100}%`,
          width: `${(size.pixelWidth / PRINT_SHEET.width) * 100}%`,
          height: `${(size.pixelHeight / PRINT_SHEET.height) * 100}%`
        })
      }
    }
    return items
  }, [layout.cols, layout.gap, layout.rows, size.pixelHeight, size.pixelWidth])

  const generateSinglePhoto = async () => {
    if (!record?.imagePath) throw new Error('PHOTO_NOT_FOUND')
    const imageInfo = await Taro.getImageInfo({ src: record.imagePath })
    const ctx = Taro.createCanvasContext(SINGLE_CANVAS_ID)
    ctx.setFillStyle(background.color)
    ctx.fillRect(0, 0, size.pixelWidth, size.pixelHeight)
    drawContain(ctx, imageInfo.path, imageInfo.width, imageInfo.height, 0, 0, size.pixelWidth, size.pixelHeight)
    await new Promise<void>((resolve) => ctx.draw(false, () => resolve()))
    return canvasToFile(SINGLE_CANVAS_ID, size.pixelWidth, size.pixelHeight)
  }

  const generateLayoutPhoto = async () => {
    const singlePath = await generateSinglePhoto()
    const ctx = Taro.createCanvasContext(LAYOUT_CANVAS_ID)
    ctx.setFillStyle('#FFFFFF')
    ctx.fillRect(0, 0, PRINT_SHEET.width, PRINT_SHEET.height)
    ctx.setStrokeStyle('#D8DCE5')
    ctx.setLineWidth(2)

    const totalWidth = layout.cols * size.pixelWidth + (layout.cols - 1) * layout.gap
    const totalHeight = layout.rows * size.pixelHeight + (layout.rows - 1) * layout.gap
    const startX = Math.round((PRINT_SHEET.width - totalWidth) / 2)
    const startY = Math.round((PRINT_SHEET.height - totalHeight) / 2)

    for (let row = 0; row < layout.rows; row += 1) {
      for (let col = 0; col < layout.cols; col += 1) {
        const x = startX + col * (size.pixelWidth + layout.gap)
        const y = startY + row * (size.pixelHeight + layout.gap)
        ctx.drawImage(singlePath, x, y, size.pixelWidth, size.pixelHeight)
        ctx.strokeRect(x, y, size.pixelWidth, size.pixelHeight)
      }
    }

    ctx.setFillStyle('#1F2937')
    ctx.setFontSize(24)
    ctx.fillText('请使用六寸相纸打印', PRINT_SHEET.width - 300, PRINT_SHEET.height - 60)
    ctx.fillText(`${size.name} ${size.pixelWidth}x${size.pixelHeight}px`, 56, PRINT_SHEET.height - 60)
    await new Promise<void>((resolve) => ctx.draw(false, () => resolve()))
    return canvasToFile(LAYOUT_CANVAS_ID, PRINT_SHEET.width, PRINT_SHEET.height)
  }

  const saveImage = async () => {
    if (!record?.imagePath) return
    await requireLoggedIn('请先使用微信头像和昵称完成登录后下载证件照。')

    Taro.showModal({
      title: '下载需观看广告',
      content: '观看完整激励广告后即可保存，无水印原图会写入相册。',
      confirmText: '观看广告',
      cancelText: '暂不下载',
      success: async (res) => {
        if (!res.confirm) return
        setSaving(true)
        try {
          await logEvent({
            event: 'download.ad.prompt.confirm',
            userId: getAuthUserId(),
            openid: getAuthOpenid(),
            meta: { recordId: record.id, mode }
          })
          const adOk = await maybeWatchDownloadAd()
          if (!adOk) {
            Taro.showToast({ title: '需要完整观看广告后下载', icon: 'none' })
            return
          }
          if (getAuthUserId()) {
            await rewardAd(getAuthUserId(), 'download')
          }
          Taro.showLoading({ title: '生成原图中' })
          const filePath = mode === 'single' ? await generateSinglePhoto() : await generateLayoutPhoto()
          await Taro.saveImageToPhotosAlbum({ filePath })
          await logEvent({
            event: 'photo.download.saved',
            userId: getAuthUserId(),
            openid: getAuthOpenid(),
            meta: {
              recordId: record.id,
              mode,
              background: background.id,
              outputWidth: mode === 'single' ? size.pixelWidth : PRINT_SHEET.width,
              outputHeight: mode === 'single' ? size.pixelHeight : PRINT_SHEET.height
            }
          })
          Taro.showToast({ title: '已保存无水印原图', icon: 'success' })
        } catch (error) {
          const message = error instanceof Error ? error.message : '保存失败，请检查相册权限'
          Taro.showToast({ title: message, icon: 'none' })
        } finally {
          Taro.hideLoading()
          setSaving(false)
        }
      }
    })
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
    <View className='result-page fade-in'>
      <View className='result-tabs'>
        <View className={`result-tab ${mode === 'single' ? 'result-tab--active' : ''}`} onClick={() => setMode('single')}>
          电子照片
        </View>
        <View className={`result-tab ${mode === 'layout' ? 'result-tab--active' : ''}`} onClick={() => setMode('layout')}>
          <Text className='gift-text'>（赠）</Text>排版电子照
        </View>
      </View>

      <View className='preview-zone'>
        {mode === 'single' ? (
          <View className='single-preview-wrap'>
            <Text className='measure measure--top'>{size.pixelWidth}px</Text>
            <Text className='measure measure--left'>{size.pixelHeight}px</Text>
            <Text className='measure measure--right'>{size.printHeightMm}mm</Text>
            <Text className='measure measure--bottom'>{size.printWidthMm}mm</Text>
            <View className='single-preview-frame'>
              <View className='photo-preview' style={{ background: background.gradient || background.color, aspectRatio: previewRatio }}>
                <Image className='photo-preview__image' src={record.imagePath || ''} mode='aspectFit' />
                <View className='preview-watermark'>下载后无水印</View>
              </View>
            </View>
          </View>
        ) : (
          <View className='layout-preview-card'>
            <View className='layout-paper'>
              {layoutItems.map((style, index) => (
                <View key={index} className='layout-photo' style={{ ...style, background: background.gradient || background.color }}>
                  <Image className='layout-photo__image' src={record.imagePath || ''} mode='aspectFit' />
                  {index === layoutItems.length - 1 && <View className='preview-watermark preview-watermark--layout'>下载后无水印</View>}
                </View>
              ))}
              <Text className='layout-tip'>请使用六寸相纸打印</Text>
            </View>
          </View>
        )}
      </View>

      <View className='color-panel'>
        <Text className='color-panel__title'>▱ 选择底色</Text>
        <View className='color-list'>
          {BACKGROUND_OPTIONS.map((item) => (
            <View
              key={item.id}
              className={`color-dot ${background.id === item.id ? 'color-dot--active' : ''}`}
              style={{
                background: item.gradient || item.color,
                borderColor: item.borderColor || '#DFE3EB'
              }}
              onClick={() => setBackground(item)}
            >
              {background.id === item.id && <Text className='color-dot__check'>✓</Text>}
            </View>
          ))}
        </View>
      </View>

      <View className='result-actions'>
        <Button className='result-button result-button--ghost' onClick={() => Taro.redirectTo({ url: '/pages/index/index' })}>
          重新拍摄
        </Button>
        <Button className='result-button result-button--primary' loading={saving} onClick={saveImage}>
          下载证件照
        </Button>
      </View>

      <Canvas canvasId={SINGLE_CANVAS_ID} className='hidden-canvas' style={{ width: `${size.pixelWidth}px`, height: `${size.pixelHeight}px` }} />
      <Canvas canvasId={LAYOUT_CANVAS_ID} className='hidden-canvas' style={{ width: `${PRINT_SHEET.width}px`, height: `${PRINT_SHEET.height}px` }} />
      <WeChatLoginDialog />
    </View>
  )
}
