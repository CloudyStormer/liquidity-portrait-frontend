import type { PhotoSizeOption } from '@/types'

export const PHOTO_SIZES: PhotoSizeOption[] = [
  {
    id: 'one-inch',
    name: '1寸',
    detail: '25mm x 35mm',
    available: true
  },
  {
    id: 'two-inch',
    name: '2寸',
    detail: '35mm x 49mm',
    available: true
  },
  {
    id: 'small-one-inch',
    name: '小1寸',
    detail: '22mm x 32mm',
    available: false
  },
  {
    id: 'large-one-inch',
    name: '大1寸',
    detail: '33mm x 48mm',
    available: false
  },
  {
    id: 'passport',
    name: '护照',
    detail: '33mm x 48mm',
    available: false
  },
  {
    id: 'custom',
    name: '自定义',
    detail: '即将开放',
    available: false
  }
]

export function getPhotoSize(id: string | undefined) {
  return PHOTO_SIZES.find((item) => item.id === id)
}
