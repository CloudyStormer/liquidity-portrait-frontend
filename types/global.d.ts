declare namespace NodeJS {
  interface ProcessEnv {
    TARO_APP_API_BASE?: string
    TARO_ENV:
      | 'weapp'
      | 'swan'
      | 'alipay'
      | 'h5'
      | 'rn'
      | 'tt'
      | 'quickapp'
      | 'qq'
      | 'jd'
  }
}
