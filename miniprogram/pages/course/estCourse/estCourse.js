// pages/estCourse/estCourse.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled: false,
    loading: false,
    cName: '', //课程名称
    className: '', //班级
    cid: 0, //课程id  默认先为0
  },

  /**
   * 输入课程名称
   */
  cNameInput: function(e) {
    this.setData({
      cName: e.detail.value
    })
  },

  /**
   * 输入班级名称
   */
  classNameInput: function(e) {
    this.setData({
      className: e.detail.value
    })
  },

  /**
   * 创建课程完成
   */
  finish: function() {
    var cName = this.data.cName
    var className = this.data.className
    const userInfo = app.globalData.userInfo //用户信息

    if (cName == '' || className == '') {
      wx.showToast({
        title: '请输入完整信息',
        icon: 'none'
      })
    } else {
      db.collection("courses_list").orderBy('cid','desc').limit(1).get({
        success: res => {
          console.log(res)
          const cid = res.data.length ? (res.data[0].cid + 1): 1
          this.setData({
            cid: cid
          })
          wx.cloud.callFunction({
            name: 'estCourse',
            data: {
              cid,
              cName,
              className,
              userInfo
            },
            success: res => {
              console.log(res)
              console.log('创建成功')
              wx.redirectTo({
                url: '/pages/myTeaCourse/myTeaCourse?cid=' + this.data.cid + '&cName=' + this.data.cName,
              })
            },
            fail: console.error
          })
        },
        fail:console.error
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})