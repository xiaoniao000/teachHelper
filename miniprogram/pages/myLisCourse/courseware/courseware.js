// pages/myTeaCourse/courseware/courseware.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cid:0,//课件id
    userInfo:'',//用户信息
    courseware: [], //课件
    coursewareId: '', //课件id
    images: [], //课件的图片列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      cid: options.cid,
      cName: options.cName,
      courseware: app.globalData.courseware,
      coursewareId: app.globalData.courseware.coursewareId,
      userInfo: app.globalData.userInfo,
    })
    wx.setNavigationBarTitle({
      title: options.cName,
    })
    this.getTempFileURL()
  },
  
  /**
   * 获取图片临时路径（我不知道为什么要这样）
   */
  getTempFileURL:function(e){
    const cwList = this.data.courseware
    console.log('courseware课件内容', cwList)
    var fileUrl = cwList.fileUrl
    wx.cloud.getTempFileURL({
      fileList: fileUrl,
      success: res => {
        // get temp file URL
        var images = []
        for (let i = 0; i < res.fileList.length; i++) {
          images.push(res.fileList[i].tempFileURL)
        }
        console.log('课件的图片列表', images)
        this.setData({
          images: images
        })
      },
      fail: console.error
    })
  },
  
  /**
   * 预览图片
   */
  onImagePreview: function (e) {
    const index = e.target.id
    const images = this.data.images
    wx.previewImage({
      current: images[index], //当前预览的图片
      urls: images, //所有要预览的图片
    })
  },

  /**
   * 开启同步
   */
  synchronous:function(){
    
  },

  /**
   * 抽屉层相关
   */
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
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
    this.setData({
      modalName: null
    })
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