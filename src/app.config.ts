export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/camera/index',
    'pages/result/index',
    'pages/orders/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '证件照生成器',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F5F6FA'
  },
  permission: {
    'scope.writePhotosAlbum': {
      desc: '用于保存无水印证件照到相册'
    }
  }
})
