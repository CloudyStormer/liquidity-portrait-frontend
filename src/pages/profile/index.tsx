import { useState } from 'react'
import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import BottomNav from '@/components/BottomNav'
import { clearAuthSession, ensureWechatSession, getAuthSession, requireLoggedIn } from '@/services/auth'
import { logEvent } from '@/services/api'
import type { AuthSession } from '@/types'
import './index.css'

const policyText =
  '本应用通过微信登录获取用户标识，用于绑定用户、生成记录、下载记录和必要的安全日志。用户标识仅用于后端识别，不在页面展示。图片仅用于证件照预览、生成和保存。'

export default function ProfilePage() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  useDidShow(() => {
    const cached = getAuthSession()
    setSession(cached)
    ensureWechatSession().then((valid) => {
      if (!valid) setSession(null)
    })
  })

  const handleWechatLogin = async () => {
    setLoggingIn(true)
    Taro.showLoading({ title: '登录中' })
    try {
      const nextSession = await requireLoggedIn('请使用微信头像和昵称完成登录。')
      setSession(nextSession)
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败'
      if (!message.includes('取消')) {
        Taro.showToast({ title: message, icon: 'none' })
      }
    } finally {
      Taro.hideLoading()
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '退出后需要重新获取微信头像和昵称才能继续使用功能。',
      confirmText: '退出',
      success: async (res) => {
        if (!res.confirm) return
        await logEvent({
          event: 'auth.logout',
          userId: session?.user.id,
          openid: session?.user.openid
        })
        clearAuthSession()
        setSession(null)
        Taro.showToast({ title: '已退出登录', icon: 'none' })
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
      content: '使用本工具即表示你承诺仅制作本人或已获授权的证件照，下载结果仅用于合法用途。',
      confirmText: '知道了',
      showCancel: false
    })
  }

  return (
    <View className='page profile-page fade-in'>
      <View className='profile-header fixed-header'>
        <Text className='profile-header__eyebrow'>账户中心</Text>
        <Text className='profile-header__title'>我的</Text>
      </View>

      <View className='profile-scroll'>
        <View className='identity-card'>
          {session?.user.avatarUrl ? (
            <Image className='identity-card__avatar-image' src={session.user.avatarUrl} mode='aspectFill' />
          ) : (
            <View className='identity-card__avatar'>我</View>
          )}
          <View className='identity-card__main'>
            <Text className='identity-card__name'>{session?.user.nickname || '未登录用户'}</Text>
            <Text className='identity-card__desc'>
              {session ? `已登录 · ${session.loginAt}` : '登录后缓存微信头像和昵称'}
            </Text>
          </View>
        </View>

        <View className='login-panel'>
          {session ? (
            <Button className='profile-button profile-button--ghost' onClick={handleLogout}>
              退出登录
            </Button>
          ) : (
            <Button className='profile-button profile-button--primary' loading={loggingIn} onClick={handleWechatLogin}>
              微信登录
            </Button>
          )}
        </View>

        <View className='menu'>
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

        <Text className='profile-footer'>证件照生成器 · 仅供合法用途</Text>
      </View>
      <BottomNav current='profile' />
    </View>
  )
}
