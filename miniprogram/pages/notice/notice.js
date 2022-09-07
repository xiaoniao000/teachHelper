// pages/notice/notice.js
/**
 * 通知列表数据
 */
var Notices = [
  {
    picUrl:"../../images/announce.png",
    courseName:"概率论",
    content:"同学们注意，本节课由于天气原因暂停授课",
    time:"2018.9.10"
  },
  {
    picUrl:"../../images/announce.png",
    courseName:"线性代数",
    content:"请大家在下次上课的时候带好纸笔，准备考试,加油。",
    time:"2018.9.22"
  },
  {
    picUrl:"../../images/announce.png",
    courseName:"合同法",
    content:"同学们注意，本节课将在XXXXX上课",
    time:"2018.8.1"
  },
]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalName:''//要左滑的modal的名字
  },

  /**
   * 跳转到私信页面
   */
  privateNews:function (){
    wx.navigateTo({
      url: './privateNews/privateNews',
    })
  },

  /**
   * 跳转到通知页面
   */
  tapToNoticeDetial:function (e){
    console.log(e)
    var noticeId = e.currentTarget.id
    // 跳转到通知页面 并 传递自定义的数据 noticeId 的值
    wx.navigateTo({
      url: './noticeDetail/noticeDetail?noticeId=' + noticeId,
    })
  },

  menuBorder: function (e) {
    this.setData({
      menuBorder: e.detail.value
    });
  },
  menuArrow: function (e) {
    this.setData({
      menuArrow: e.detail.value
    });
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