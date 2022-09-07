//app.js
// 1. 引入vPush核心文件
// const vPush = require("./libs/vpush-pro-sdk/vpush.pro.js");
App({
  // 2. 初始化vPush，传递当前小程序的AppId参数
  // vPush: new vPush('wxc0e6b531e1fcee8f'),

  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.6.4 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: "release-1e7223",//这个就是环境id
        traceUser: true,
      })
    }

    // 获取用户手机系统信息
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

  },

  globalData: {
    userInfo: null,
    preview: [], //某次预习测验的内容
    courseware: [], //某个课件
    post: {}, //某个帖子的内容
    titles: [], //某个预习测验的所有题目
    file: [], //某个资料的内容
    course: { //存放课程的相关id,就不用每次跳转都传值(全为Number类型)
      _id: '',
      cid: 0,
      cName: '',
      coursewareId: 0,
      postId: 0,
      previewId: 0
    }
  }
})