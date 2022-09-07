// pages/privateNews/privateNews.js

var PriNewsList = [
  {
    picUrl:"https://pic4.zhimg.com/v2-60245ae62a8f6a549ecd30bb546b056e_im.jpg",
    name:"张三",
    content:"今天的老师讲课真的好有趣。",
    time:"1天前"
  },
  {
    picUrl:"https://pic1.zhimg.com/v2-df9931b8cb1fb98437fb8604c87e8525_im.jpg",
    name:"李四",
    content: "老师讲的很棒",
    time: "2天前"
  },
  {
    picUrl:"https://pic1.zhimg.com/v2-328e21c99e9c954f2dfa00d26e7540c9_im.jpg",
    name:"小二",
    content: "听着课很舒服",
    time: "4天前"
  },
  {
    picUrl:"https://pic3.zhimg.com/v2-a86db8b9dfc36c5cb36f84c72390a650_xl.jpg",
    name:"王五",
    content: "感触挺大，老师加油",
    time: "7天前"
  },
]


Page({

  /**
   * 页面的初始数据
   */
  data: {
    priNewsList: PriNewsList,
    modalName: ''//要左滑的modal的名字
  },

  /**
   * 跳转到通知页面
   */
  tapToNoticeDetial: function (e) {
    console.log(e)
    var noticeId = e.currentTarget.id
    // 跳转到通知页面 并 传递自定义的数据 noticeId 的值
    wx.navigateTo({
      url: '../noticeDetail/noticeDetail?noticeId=' + noticeId,
    })
  },

  /**
   * ListTouch触摸开始
   */
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  /**
   * ListTouch计算方向
   */
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  /**
   * ListTouch计算滚动
   */
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})