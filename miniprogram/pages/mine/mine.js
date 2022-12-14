//获取应用实例
var app = getApp()
Component({
  data: {
    starCount: 0,
    forksCount: 0,
    visitTotal: 0,
    warn: '小程序需要您的微信授权才能正常使用哦~',
    userInfo: {},
    hasUserInfo: false
  },
  methods: {
    onLoad(options) {
      let that = this;
      wx.showLoading({
        title: '数据加载中',
        mask: true,
      })
      let i = 0;
      numDH();
      function numDH() {
        if (i < 20) {
          setTimeout(function () {
            that.setData({
              visitTotal: i,
              forksCount: i,
              visitTotal: i
            })
            i++
            numDH();
          }, 20)
        } else {
          that.setData({
            starCount: that.coutNum(999),
            forksCount: that.coutNum(8888),
            visitTotal: that.coutNum(77777)
          })
        }
      }
      wx.hideLoading()

      // 以前的
      if (app.globalData.userInfo) {
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
        console.log(this.data.userInfo)
      } else if (this.data.canIUse) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = res => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      } else {
        // 在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          success: res => {
            app.globalData.userInfo = res.userInfo
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          }
        })
      }

    },
    onShow(){
      this.setData({
        userInfo:app.globalData.userInfo
      })
    },
    coutNum(e) {
      if (e > 1000 && e < 10000) {
        e = (e / 1000).toFixed(1) + 'k'
      }
      if (e > 10000) {
        e = (e / 10000).toFixed(1) + 'W'
      }
      return e
    },
    CopyLink(e) {
      // wx.setClipboardData({
      //   data: e.currentTarget.dataset.link,
      //   success: res => {
      //     wx.showToast({
      //       title: '已复制',
      //       duration: 1000,
      //     })
      //   }
      // })
    },
    showModal(e) {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    },
    hideModal(e) {
      this.setData({
        modalName: null
      })
    },
    // showQrcode() {
    //   wx.previewImage({
    //     urls: ['https://image.weilanwl.com/color2.0/zanCode.jpg'],
    //     current: 'https://image.weilanwl.com/color2.0/zanCode.jpg' // 当前显示图片的http链接      
    //   })
    // },
  },
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 3
        })
      }
    }
  }
})