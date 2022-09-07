// pages/announce/announce.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cid: 0, //课程id
    annId: 0, //公告的id
    title: '', //用户输入的标题
    content: '', //用户输入的内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      cid: Number(app.globalData.course.cid),
    })
  },

  /**
   * 输入标题
   */
  titleChange: function(e) {
    const value = e.detail.value
    this.setData({
      title: value
    })
  },

  /**
   * 输入内容
   */
  contentChange: function(e) {
    const value = e.detail.value
    this.setData({
      content: value
    })
  },

  /**
   * 提交至云储存
   */
  submitForm: function() {
    const title = this.data.title
    const content = this.data.content
    if (title && content) {
      wx.showLoading({
        title: '正在创建...',
        mask: true
      })
      this.getAnnCount()
    } else {
      wx.showToast({
        title: '请输入标题或内容',
        icon: 'none'
      })
    }
  },

  /**
   * 查询已有公告的数量
   */
  getAnnCount: function () {
    db.collection('ann_list').where({
      cid: this.data.cid
    }).count({
      success: res => {
        // 定义该公告的id
        const annId = Number(res.total)
        this.setData({
          annId
        })
        console.log(annId)
        this.addAnnList()
      },
      fail: console.error
    })
  },

  /**
   * 添加公告,更新ann_list数据库
   */
  addAnnList: function () {
    db.collection('ann_list').add({
      data: {
        cid: this.data.cid,
        annId: this.data.annId,
        createTime: db.serverDate(),
        content: this.data.content,
        title: this.data.title,
        author: app.globalData.userInfo,
        viewCount: 0,
        viewPeople: []
      },
      success: res => {
        console.log("添加记录到ann_list成功：", res)
        wx.hideLoading();
        wx.showToast({
          title: '发布成功',
          success: res => {
            setTimeout(() => wx.navigateBack({}), 1000)
          }
        })
      },
      fail: console.error
    })
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