// pages/myTeaCourse/discussion/discussion.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command

const floatButtons = [{
    label: '快速回复',
    icon: '/images/reply.png',
  },
  {
    label: '收藏帖子',
    icon: '/images/collect.png',
  }
]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cid: 0, //课程ID
    cName: "", //课程名称
    postId: 0, //帖子ID
    post: {}, //帖子内容
    floatButtons, //按钮样式列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      post: app.globalData.post,
      postId: options.postId,
      cid: options.cid
    })

    console.log('post该帖子内容',this.data.post)
    wx.setNavigationBarTitle({
      title: options.cName
    })
  },

  /**
   * 预览图片
   */
  onImagePreview: function(e) {
    const id = e.currentTarget.id
    const images = this.data.post.images
    console.log(e)
    wx.previewImage({
      current: images[id], //当前预览的图片
      urls: images, //所有要预览的图片
    })
  },

  /**
   * 给楼主点赞
   */
  onTapZan(e) {
    const post = this.data.post
    const openid = app.globalData.userInfo.openid
    //如果没有点过赞
    if (post.ups.indexOf(openid) == -1) {
      post.ups.push(openid)
      this.setData({
        ['post.zanCount']: post.zanCount + 1,
        ['post.ups']: post.ups,
        ['post.zanColor']: 'red'
      })
      wx.cloud.callFunction({
        name: 'onTapZan',
        data: {
          _id: post._id,
          zanCount: post.zanCount,
          ups_openid: openid
        }
      }).then(res => {
        console.log('点赞成功', res)
      }).catch(console.error)
    }
  },

  /**
   * 监听浮动按钮的状态
   */
  onFloBtnChange(e) {
    console.log('onFloBtnChange', e)
  },

  /**
   * 点击了浮动按钮的哪个按钮
   */
  onFloBtnClick(e) {
    console.log('onClick', e.detail)
    if (e.detail.index == 0) { //快速回复
      wx.navigateTo({
        url: './addPost/addPost?postId=' + this.data.postId + '&type=reply' + '&cid=' + this.data.cid,
      })
    } else if (e.detail.index == 1) { //收藏帖子
      wx.navigateTo({
        url: './publish/setPreview/setPreview'
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.cloud.callFunction({
      name: 'postVisit',
      data: {
        _id: this.data.post._id,
        visitCount: this.data.post.visitCount,
        visitId: app.globalData.userInfo.openid
      }
    }).then(res => {
      console.log('浏览量+1')
    }).catch(console.error)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      post: app.globalData.post,
    })
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