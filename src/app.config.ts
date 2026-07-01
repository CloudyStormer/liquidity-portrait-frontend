export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/result/index',
    'pages/orders/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F4F7FC',
    navigationBarTitleText: '证件照助手',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F4F7FC'
  },
  permission: {
    'scope.writePhotosAlbum': {
      desc: '用于保存处理后的图片到相册'
    }
  }
})
