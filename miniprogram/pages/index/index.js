//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showLoading: false,
  },

  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onLoad: function() {
    // 如果用户已经授权，直接进入小程序
    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log('已授权信息', res)
        if (res.authSetting['scope.userInfo']) {
          this.setData({
            showLoading: true
          })
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              app.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (app.userInfoReadyCallback) {
                app.userInfoReadyCallback(res)
              }
              // 调用云函数登录获取openid,不需要复杂的鉴权机制
              wx.cloud.callFunction({
                name: 'login',
                success: res => {
                  app.globalData.userInfo['openid'] = res.result.openid
                  console.log('userInfo用户的信息：', app.globalData.userInfo)
                  this.setData({
                    userInfo: app.globalData.userInfo,
                    hasUserInfo: true,
                    // showLoading: false
                  })
                  wx.switchTab({
                    url: '../course/course',
                  })
                },
                fail: console.error
              })
            }
          })
        }
      }
    })
  },

  /**
   * 授权函数，用户主动点击才能授权
   */
  getUserInfo: function(e) {
    //用户按了允许授权按钮
    if (e.detail.userInfo) {
      console.log(" open-type='getUserInfo' 使用成功", e)
      // 保存到全局userInfo中
      app.globalData.userInfo = e.detail.userInfo
      // 获取openid
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          app.globalData.userInfo['openid'] = res.result.openid
          console.log('userInfo用户的信息：', app.globalData.userInfo)
          //授权成功后,通过改变 hasUserInfo 的值，让实现页面显示出来，把授权页面隐藏起来
          this.setData({
            hasUserInfo: true,
            userInfo: e.detail.userInfo,
          });
          wx.switchTab({
            url: '../course/course',
          })
        }
      })
    } else {
      //用户按了拒绝按钮，此时不会返回任何东西
      wx.showModal({
        title: '系统提示',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },

  onShareAppMessage() {

  }

})