import { PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import './app.css'

const DISCLAIMER_KEY = 'lp_disclaimer_agreed'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    const agreed = Taro.getStorageSync(DISCLAIMER_KEY)
    if (!agreed) {
      Taro.showModal({
        title: '使用前提示',
        content:
          '本工具仅供制作本人或已获授权的证件照素材。请勿上传、处理或传播违法及未授权内容。',
        confirmText: '我已知晓',
        showCancel: false,
        success: () => {
          Taro.setStorageSync(DISCLAIMER_KEY, '1')
        }
      })
    }
  })

  return children
}

export default App
