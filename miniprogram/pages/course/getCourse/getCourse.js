// pages/getCourse/getCourse.js
var WxSearch = require('../../../component/wxSearch/wxSearch.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lodingInfo: "正在搜索",
    // 搜索栏的相关数据
    wxSearchData: {
      value: "''",
      onSearch: false
    },
    courseSearched: [] //搜索结果
  },


  /**
   * 初始化的时候渲染wxSearchdata
   */
  initWxSearch: function() {
    var that = this
    // 热门搜索
    WxSearch.init(that, 43, ['课程设计','微积分', '大物', '心理健康', '线性代数', '马原', '毛概']);
    // 关键字
    WxSearch.initMindKeys([ '微信小程序开发', '微信开发', '微信小程序']);
  },

  /**
   * 用户点击搜索
   */
  wxSearchFn: function(e) {
    var that = this
    WxSearch.wxSearchAddHisKey(that);

    this.setData({
      searchLoadingHidden: false
    })
    const db = wx.cloud.database()
    db.collection("courses_list").where({
      courseName: db.RegExp({
        regexp: this.data.wxSearchData.value, //从搜索栏中获取的value作为规则进行匹配。
        options: 'i', //大小写不区分
      })
    }).get({
      fail: console.error,
      complete: res => {
        console.log("courseSearched搜索结果如下:", res.data)
        this.setData({
          searchLoadingHidden: true,
          courseSearched: res.data,
          ['wxSearchData.onSearch']: true
        })
      }
    })
  },

  /**
   * 用户输入搜索内容
   */
  wxSearchInput: function(e) {
    var that = this
    WxSearch.wxSearchInput(e, that);
  },

  /**
   * 搜索栏得到焦点
   */
  wxSerchFocus: function(e) {
    var that = this
    WxSearch.wxSearchFocus(e, that);
  },
  /**
   * 搜索栏失去焦点
   */
  wxSearchBlur: function(e) {
    var that = this
    WxSearch.wxSearchBlur(e, that);
  },
  /**
   * 点击搜索栏的关键词
   */
  wxSearchKeyTap: function(e) {
    var that = this
    WxSearch.wxSearchKeyTap(e, that);
  },
  /**
   * 删除关键词
   */
  wxSearchDeleteKey: function(e) {
    var that = this
    WxSearch.wxSearchDeleteKey(e, that);
  },
  /**
   * 删除所有关键词
   */
  wxSearchDeleteAll: function(e) {
    var that = this;
    WxSearch.wxSearchDeleteAll(that);
  },
  /**
   * 用户点击搜索栏
   */
  wxSearchTap: function(e) {
    var that = this
    WxSearch.wxSearchHiddenPancel(that);
  },

  /**
   * 添加课程
   */
  addCourse: function(e) {
    console.log(e)
    wx.showModal({
      title: '系统提示',
      content: '确认加入该课程吗？',
      success: res => {
        if (res.cancel) {

        } else {
          const courseSearched = this.data.courseSearched
          let index = e.currentTarget.id
          const cid = courseSearched[index].cid
          const _id = courseSearched[index]._id
          const cName = courseSearched[index].courseName
          const className = courseSearched[index].className
          const stuNum = courseSearched[index].student.length
          const userInfo = app.globalData.userInfo

          for (let i in courseSearched[index].student) {
            if (courseSearched[index].student[i].name == userInfo.nickName) {
              wx.showToast({
                title: '您已加入该课程',
                icon: 'none'
              })
              return
            }
          }
          wx.cloud.callFunction({
            name: 'getIntoCourse',
            data: {
              author: app.globalData.userInfo,
              _id,
              cid,
              cName,
              className,
              stuNum
            },
          }).then(res => {
            console.log('加入课程成功', res)
            wx.redirectTo({
              url: '/pages/myLisCourse/myLisCourse?cid=' + cid + '&cName=' + cName,
            })
          }).catch(console.error)
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.initWxSearch()
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