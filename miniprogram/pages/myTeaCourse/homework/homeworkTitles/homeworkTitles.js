const db = wx.cloud.database()
const app =getApp()
const util = require('../../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    homeworkList: [], //课后作业列表
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
    this.getHomeworkList()
  },

  /**
   * 获取课后作业列表
   */
  getHomeworkList() {
    db.collection('homework_list').where({
      cid: this.data.cid
    }).get().then(res => {
      const homeworkList = res.data
      for (let i = 0; i < homeworkList.length; i++) {
        homeworkList[i].createTime = util.formatTime(homeworkList[i].createTime)
      }
      console.log('课后作业列表：', homeworkList)
      this.setData({
        homeworkList
      })
    }).catch(console.error)
  },

  /**
   * 点击课后作业跳转
   */
  onHomework: function(e) {
    console.log(e)
    const index = e.currentTarget.id
    const homeworkList = this.data.homeworkList
    const homeworkId = homeworkList[index].homeworkId
    app.globalData.course['homeworkId'] = Number(homeworkId) 
    app.globalData.course['_id'] = homeworkList[index]._id
    wx.navigateTo({
      url: '../../publish/setHomework/setHomework?homeworkId=' + homeworkId + '&cid=' + this.data.cid
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