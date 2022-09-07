const db = wx.cloud.database()
const app =getApp()
const util = require('../../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    previewList: [], //预习测验列表
    cid: 0,//课程id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      cid: Number(options.cid)
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getPreviewList()
  },

  /**
   * 获取预习测验列表
   */
  getPreviewList() {
    db.collection('preview_list').where({
      cid: this.data.cid
    }).get().then(res => {
      const previewList = res.data
      for (let i = 0; i < previewList.length; i++) {
        previewList[i].createTime = util.formatTime(previewList[i].createTime)
      }
      console.log('预习测验列表：', previewList)
      this.setData({
        previewList
      })
    }).catch(console.error)
  },

  /**
   * 点击预习测验跳转
   */
  onPreview: function(e) {
    console.log(e)
    const index = e.currentTarget.id
    const previewList = this.data.previewList
    const previewId = previewList[index].previewId
    app.globalData.course['previewId'] = Number(previewId) 
    app.globalData.course['_id'] = previewList[index]._id
    wx.navigateTo({
      url: '../../publish/setPreview/setPreview?previewId=' + previewId + '&cid=' + this.data.cid
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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