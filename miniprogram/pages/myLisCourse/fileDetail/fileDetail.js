// pages/myLisCourse/fileDetail/fileDetail.js
const app = getApp()
// 获取随机颜色
function getRandomColor() {
  const rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    file: {}, //存放资料的内容
    danmuList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      file: app.globalData.file
    })

    console.log(this.data.file)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.videoContext = wx.createVideoContext('myVideo')
  },

  bindInputBlur: function(e) {
    this.inputValue = e.detail.value
  },
  bindSendDanmu: function() {
    this.videoContext.sendDanmu({
      text: this.inputValue,
      color: getRandomColor()
    })
  },
  // 下载视频
  bindDownload: function() {
    wx.showLoading({
      title: '正在下载',
    })
    var downloadTask = wx.cloud.downloadFile({
      fileID: this.data.file.fileUrl,
      success: res => {
        console.log(res)
        if (res.tempFilePath) {
          wx.saveVideoToPhotosAlbum({
            filePath: res.tempFilePath,
            success: resp => {
              console.log("保存相册成功", res)
            },
            fail: err => {
              console.log("保存相册失败", res)
            }
          })
        } else {
          console.log("下载失败", res)
        }
      },
      fail: res => {
        console.log("下载失败(cancel)", res)
      },
      complete: () => wx.hideLoading()
    })
  },
  videoErrorCallback: function(e) {
    console.log('视频错误信息:')
    console.log(e.detail.errMsg)
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