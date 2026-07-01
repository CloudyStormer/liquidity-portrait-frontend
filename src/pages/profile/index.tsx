import { useState } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import BottomNav from '@/components/BottomNav'
import {
  clearAuthSession,
  ensureWechatSession,
  getAuthSession,
  loginWithWechat
} from '@/services/auth'
import type { AuthSession } from '@/types'
import './index.css'

const policyText =
  '本应用仅在本机保存历史使用记录。上传照片用于生成证件照预览，后续接入服务端处理时应在完成后清理临时文件。请勿上传未获授权的他人照片。'

export default function ProfilePage() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  useDidShow(() => {
    setSession(getAuthSession())
    ensureWechatSession().then((valid) => {
      if (!valid) {
        setSession(null)
      }
    })
  })

  const handleWechatLogin = async () => {
    setLoggingIn(true)
    Taro.showLoading({ title: '登录中' })
    try {
      const nextSession = await loginWithWechat()
      setSession(nextSession)
      Taro.showToast({ title: '登录成功', icon: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败'
      Taro.showToast({ title: message, icon: 'none' })
    } finally {
      Taro.hideLoading()
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '退出后仍可继续制作证件照，历史记录会保留在当前设备。',
      confirmText: '退出',
      success: (res) => {
        if (res.confirm) {
          clearAuthSession()
          setSession(null)
          Taro.showToast({ title: '已退出登录', icon: 'none' })
        }
      }
    })
  }

  const showPolicy = () => {
    Taro.showModal({
      title: '隐私说明',
      content: policyText,
      confirmText: '知道了',
      showCancel: false
    })
  }

  const showTerms = () => {
    Taro.showModal({
      title: '用户协议',
      content: '使用本工具即表示您承诺仅制作本人或已获授权的证件照，产生的使用责任由使用者自行承担。',
      confirmText: '知道了',
      showCancel: false
    })
  }

  return (
    <View className='page fade-in'>
      <View className='topbar profile-topbar'>
        <View>
          <Text className='eyebrow'>本地账户</Text>
          <Text className='title'>我的</Text>
          <Text className='subtitle'>数据记录保存在当前设备</Text>
        </View>
      </View>

      <View className='profile-card card'>
        {session?.user.avatarUrl ? (
          <Image className='profile-card__avatar-image' src={session.user.avatarUrl} mode='aspectFill' />
        ) : (
          <View className='profile-card__avatar'>微</View>
        )}
        <View>
          <Text className='profile-card__name'>{session?.user.nickname || '未登录'}</Text>
          <Text className='profile-card__desc'>
            {session ? `微信登录 · ${session.loginAt}` : '登录后可同步会员身份'}
          </Text>
          {session?.source === 'local-dev' && (
            <Text className='profile-card__tip'>当前为本地调试会话，接入后端后会换取真实 OpenID。</Text>
          )}
        </View>
      </View>

      <View className='login-panel card'>
        {session ? (
          <Button className='ghost-button login-panel__button' onClick={handleLogout}>
            退出登录
          </Button>
        ) : (
          <Button
            className='primary-button login-panel__button'
            loading={loggingIn}
            onClick={handleWechatLogin}
          >
            微信登录
          </Button>
        )}
      </View>

      <View className='menu card'>
        <View className='menu__item' onClick={showPolicy}>
          <Text className='menu__label'>隐私说明</Text>
          <Text className='menu__arrow'>›</Text>
        </View>
        <View className='menu__item' onClick={showTerms}>
          <Text className='menu__label'>用户协议</Text>
          <Text className='menu__arrow'>›</Text>
        </View>
        <View className='menu__item'>
          <Text className='menu__label'>版本信息</Text>
          <Text className='menu__value'>v1.0.0</Text>
        </View>
      </View>

      <Text className='profile-footer'>证件照助手 · 仅供合法用途</Text>

      <BottomNav current='profile' />
    </View>
  )
}
