import { useEffect } from 'react'
import Taro, { useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'

const SHARE_TITLE = '\u8bc1\u4ef6\u7167\u751f\u6210\u5668'
const SHARE_PATH = '/pages/index/index'
const SHARE_QUERY = 'from=share'

type ShareOptions = {
  title?: string
  path?: string
  query?: string
  imageUrl?: string
}

type SharePageComponent<T> = T & {
  enableShareAppMessage?: boolean
  enableShareTimeline?: boolean
  onShareAppMessage?: () => ReturnType<typeof buildShareAppMessage>
  onShareTimeline?: () => ReturnType<typeof buildShareTimeline>
}

function normalizePath(path?: string, query = SHARE_QUERY) {
  const basePath = path || SHARE_PATH
  if (!query || basePath.includes('?')) return basePath
  return `${basePath}?${query}`
}

function buildShareAppMessage(options: ShareOptions = {}) {
  const title = options.title || SHARE_TITLE
  const query = options.query ?? SHARE_QUERY
  const path = normalizePath(options.path, query)
  return {
    title,
    path,
    ...(options.imageUrl ? { imageUrl: options.imageUrl } : {})
  }
}

function buildShareTimeline(options: ShareOptions = {}) {
  const title = options.title || SHARE_TITLE
  const query = options.query ?? SHARE_QUERY
  return {
    title,
    query,
    ...(options.imageUrl ? { imageUrl: options.imageUrl } : {})
  }
}

export function useWechatShare(options: ShareOptions = {}) {
  const query = options.query ?? SHARE_QUERY

  useDidShow(() => {
    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP || !Taro.showShareMenu) return
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    } as Parameters<typeof Taro.showShareMenu>[0] & { menus: string[] }).catch(() => {
      // Sharing availability is controlled by the WeChat runtime/version.
    })
  })

  useShareAppMessage(() => buildShareAppMessage(options))

  useShareTimeline(() => buildShareTimeline(options))

  useEffect(() => {
    const shareApi = Taro as typeof Taro & {
      onCopyUrl?: typeof Taro.onCopyUrl
      offCopyUrl?: typeof Taro.offCopyUrl
    }

    if (typeof shareApi.onCopyUrl !== 'function' || typeof shareApi.offCopyUrl !== 'function') {
      return undefined
    }

    const copyUrlHandler = (() => ({
      query
    })) as unknown as Parameters<typeof Taro.onCopyUrl>[0]

    shareApi.onCopyUrl(copyUrlHandler)

    return () => {
      shareApi.offCopyUrl?.(copyUrlHandler)
    }
  }, [query])
}

export function withWechatShare<T>(PageComponent: T, options: ShareOptions = {}) {
  const sharePage = PageComponent as SharePageComponent<T>
  sharePage.enableShareAppMessage = true
  sharePage.enableShareTimeline = true
  sharePage.onShareAppMessage = () => buildShareAppMessage(options)
  sharePage.onShareTimeline = () => buildShareTimeline(options)
  return sharePage
}
