// pages/course/course.js
var util = require('../../utils/util.js')
const MAX = 5;
const app = getApp()
const db = wx.cloud.database()
const swiperImg = [
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1554734711773&di=485530e7defd21f1b6ea76cae03e2abf&imgtype=0&src=http%3A%2F%2F5b0988e595225.cdn.sohucs.com%2Fimages%2F20171219%2Fc28aa0ca9e604a4f9eafc73bfec4566e.jpeg',
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1554735909709&di=78bea043b51e1cc543a5bd638c45957e&imgtype=0&src=http%3A%2F%2F5b0988e595225.cdn.sohucs.com%2Fq_70%2Cc_zoom%2Cw_640%2Fimages%2F20180717%2F4065c7895bf045e39eb10964f3b0f88d.jpeg',
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1554734852947&di=f996845439be2312d7b06cd6934606f5&imgtype=0&src=http%3A%2F%2Fs7.sinaimg.cn%2Fmw690%2F001WTdsqgy6LblunSAe66%26690',
  'https://timgsa.baidu.com/timg?image&quality=80&size=b10000_10000&sec=1554724815&di=2d4eae6290df0273babfbf93dd8583f9&src=http://5b0988e595225.cdn.sohucs.com/images/20171028/3ad276f0fdd24dba92c8b9f8058f0516.jpeg'
]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    skipTea: 1, //第几次获取我教的课（一次获取5份）
    skipLis: 1, //第几次获取我听的课（一次获取5份）
    activeIndex: 0, //激活的tab 0我教的课，1我听的课
    courses_list: [], //我教的课的课程列表
    myLisCourse: [], //我教的课的课程列表
    cardCur: 0, //用于轮播图
    swiperImg, //轮播图图片
    hideGetCourseLoading: true, //是否隐藏课程加载的loding
    hasMoreT: true, //还有没有更多我教的课
    hasMoreL: true, //还有没有更多我听的课
    moreLoadingHidden: true, //是否显示加载更多
  },

  onResize: function(res) {
    res.size.windowWidth // 新的显示区域宽度
    res.size.windowHeight // 新的显示区域高度
  },

  DotStyle(e) {
    this.setData({
      DotStyle: e.detail.value
    })
  },

  // 轮播图
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },

  /**
   * 切换标签页
   */
  onTabChange: function(e) {
    this.setData({
      activeIndex: e.detail.index
    })
  },

  /**
   * 点击跳转到课程详细页面
   */
  onCourseDetail: function(e) {
    console.log(e)
    var acIndex = this.data.activeIndex
    const index = e.currentTarget.id
    if (acIndex == 0) {
      const courses_list = this.data.courses_list
      const cid = courses_list[index].cid
      const cName = courses_list[index].courseName
      const stuNum = courses_list[index].student.length
      wx.navigateTo({
        url: '/pages/myTeaCourse/myTeaCourse?cid=' + cid + '&cName=' + cName + '&stuNum=' + stuNum,
      })
    } else {
      const cid = this.data.myLisCourse[index].cid
      const cName = this.data.myLisCourse[index].courseName
      wx.navigateTo({
        url: '/pages/myLisCourse/myLisCourse?cid=' + cid + '&cName=' + cName,
      })
    }
  },

  /**
   * 获取教授的课程列表
   */
  getTeaCourse: function() {
    this.setData({
      hideGetCourseLoading: false
    })
    db.collection('courses_list').orderBy('cid', 'desc').where({
      _openid: app.globalData.userInfo.openid
    }).limit(MAX).get({
      success: res => {
        this.setData({
          courses_list: res.data,
          hideGetCourseLoading: true,
          moreLoadingHidden: false
        })
        // app.globalData.quesList = app.globalData.quesList.concat(res.data)
        console.log("我创建的课程列表：", this.data.courses_list)
      },
      fail: console.error
    })
  },

  /**
   * 获取加入课程列表
   */
  getLisCourse: function() {
    db.collection('my_lis_course').orderBy('cid', 'desc').where({
      _openid: app.globalData.userInfo.openid
    }).limit(MAX).get({
      success: res => {
        this.setData({
          myLisCourse: res.data,
        })
        console.log("我加入的课程列表：", this.data.myLisCourse)
      },
      fail: console.error
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // wx.setTabBarBadge({
    //   index: 0,
    //   text: '1'
    // })
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
    this.getTeaCourse()
    this.getLisCourse()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.setData({
      skipTea: 1,
      skipLis: 1,
      hasMoreT: true,
      hasMoreL: true,
    })
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
    this.getTeaCourse()
    this.getLisCourse()
  },

  /**
   * 点击加载更过我教的课
   */
  getMoreT() {
    this.setData({
      moreLoadingHidden: true
    })
    const skip = this.data.skipTea
    db.collection('courses_list').orderBy('cid', 'desc').where({
      _openid: app.globalData.userInfo.openid
    }).limit(MAX).skip(MAX * skip).get({
      success: res => {
        console.log("第" + (1 + skip * MAX) + '门到第' + (skip + 1) * MAX + '门课程为:', res.data)
        this.setData({
          skipTea: skip + 1,
          courses_list: this.data.courses_list.concat(res.data),
          moreLoadingHidden: false
        })
        if (res.data.length < MAX) {
          this.setData({
            hasMoreT: false
          })
        }
      },
      fail: console.error
    })
  },

  /**
   * 点击加载更多我听的课
   */
  getMoreL() {
    this.setData({
      moreLoadingHidden: true
    })
    const skip = this.data.skipLis
    db.collection('my_lis_course').orderBy('cid', 'desc').where({
      _openid: app.globalData.userInfo.openid
    }).skip(MAX * skip).limit(MAX).get({
      success: res => {
        console.log("第" + (1 + skip * MAX) + '门到第' + (skip + 1) * MAX + '门课程为:', res.data)
        this.setData({
          skipLis: skip + 1,
          myLisCourse: this.data.myLisCourse.concat(res.data),
          moreLoadingHidden: false
        })
        if (res.data.length < MAX) {
          this.setData({
            hasMoreL: false
          })
        }
      },
      fail: console.error
    })
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