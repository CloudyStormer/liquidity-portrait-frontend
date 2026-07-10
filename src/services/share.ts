import Taro, { useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'

const SHARE_TITLE = '\u8bc1\u4ef6\u7167\u751f\u6210\u5668'
const SHARE_PATH = '/pages/index/index'
const SHARE_MENU_OPTIONS = {
  withShareTicket: true,
  menus: ['shareAppMessage', 'shareTimeline'],
  showShareItems: ['shareAppMessage', 'shareTimeline', 'wechatFriends', 'wechatMoment']
}

type WeappShareMenuApi = {
  showShareMenu?: (option: {
    withShareTicket?: boolean
    menus?: string[]
    showShareItems?: string[]
    success?: () => void
    fail?: () => void
    complete?: () => void
  }) => void
}

type ShareOptions = {
  title?: string
  path?: string
  query?: string
  imageUrl?: string
}

export function useWechatShare(options: ShareOptions = {}) {
  const title = options.title || SHARE_TITLE
  const path = options.path || SHARE_PATH
  const query = options.query || ''
  const imageUrl = options.imageUrl

  useDidShow(() => {
    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) return
    const wxApi = (globalThis as typeof globalThis & { wx?: WeappShareMenuApi }).wx

    wxApi?.showShareMenu?.({
      ...SHARE_MENU_OPTIONS,
      fail: () => undefined
    })

    Taro.showShareMenu(SHARE_MENU_OPTIONS as Taro.showShareMenu.Option).catch(() => undefined)
  })

  useShareAppMessage(() => ({
    title,
    path,
    ...(imageUrl ? { imageUrl } : {})
  }))

  useShareTimeline(() => ({
    title,
    query,
    ...(imageUrl ? { imageUrl } : {})
  }))
}
