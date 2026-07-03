import type { BackgroundOption, PhotoSizeOption } from '@/types'

export const PHOTO_SIZES: PhotoSizeOption[] = [
  {
    id: 'one-inch',
    name: '一寸',
    printWidthMm: 25,
    printHeightMm: 35,
    pixelWidth: 295,
    pixelHeight: 413,
    dpi: 300,
    fileSizeLabel: '无要求',
    available: true
  },
  {
    id: 'two-inch',
    name: '二寸',
    printWidthMm: 35,
    printHeightMm: 49,
    pixelWidth: 413,
    pixelHeight: 579,
    dpi: 300,
    fileSizeLabel: '无要求',
    available: true
  },
  {
    id: 'small-one-inch',
    name: '小一寸',
    printWidthMm: 22,
    printHeightMm: 32,
    pixelWidth: 260,
    pixelHeight: 378,
    dpi: 300,
    fileSizeLabel: '无要求',
    available: false
  },
  {
    id: 'large-one-inch',
    name: '大一寸',
    printWidthMm: 33,
    printHeightMm: 48,
    pixelWidth: 390,
    pixelHeight: 567,
    dpi: 300,
    fileSizeLabel: '无要求',
    available: false
  },
  {
    id: 'passport',
    name: '护照',
    printWidthMm: 33,
    printHeightMm: 48,
    pixelWidth: 390,
    pixelHeight: 567,
    dpi: 300,
    fileSizeLabel: '30KB-80KB',
    available: false
  },
  {
    id: 'social-security',
    name: '社保照',
    printWidthMm: 26,
    printHeightMm: 32,
    pixelWidth: 358,
    pixelHeight: 441,
    dpi: 350,
    fileSizeLabel: '20KB-100KB',
    available: false
  }
]

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { id: 'blue', name: '证件蓝', color: '#438FDB', borderColor: '#3579C5' },
  { id: 'white', name: '纯白', color: '#FFFFFF', borderColor: '#DADDE5' },
  { id: 'red', name: '标准红', color: '#F51D22', borderColor: '#DF1116' },
  { id: 'light-blue', name: '浅蓝', color: '#61B4E8', borderColor: '#4BA2D8' },
  { id: 'gray', name: '高级灰', color: '#8C92A0', borderColor: '#777D8A' },
  {
    id: 'blue-gradient',
    name: '蓝白渐变',
    color: '#EAF6FF',
    borderColor: '#79BDF0',
    gradient: 'linear-gradient(180deg, #5AA9E8 0%, #F8FCFF 100%)'
  },
  { id: 'deep-blue', name: '深蓝', color: '#285D7F', borderColor: '#1D4B6A' }
]

export function getPhotoSize(id: string | undefined) {
  return PHOTO_SIZES.find((item) => item.id === id) ?? PHOTO_SIZES[0]
}

export function getBackground(id: string | undefined) {
  return BACKGROUND_OPTIONS.find((item) => item.id === id) ?? BACKGROUND_OPTIONS[0]
}
