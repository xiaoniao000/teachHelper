// pages/myTeaCourse/discussion/addPost/addPost.js
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
const util = require('../../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cid: 0, //课程id
    postId: 0, //帖子的id
    imageId: 0, //图片的id
    type: true, //类型： 发帖poster 回复reply
    title: '', //用户输入的标题
    content: '', //用户输入的内容
    images: [], //用户选择的图片的临时地址
    fileIDs:[],//上传到云储存后返回的图片地址
    userInfo: {}, //用户信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      cid: Number(options.cid),
      userInfo: app.globalData.userInfo
    })
    if (options.type) {
      this.setData({
        type: false,
        post_id: app.globalData.post._id,
      })
      wx.setNavigationBarTitle({
        title: '回复',
      })
    }

    console.log(options)
    this.getPostCount()
    this.getImageCount()
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
   * 添加图片
   */
  addPhoto: function(e) {
    wx.chooseImage({
      count: 3,
      success: res => {
        const images = this.data.images.concat(res.tempFilePaths)
        // 限制最多只能留下3张照片
        this.setData({
          images: images.length <= 3 ? images : images.slice(0, 3)
        })
        console.log(res)
      }
    })
  },

  /**
   * 预览图片
   */
  onImagePreview: function(e) {
    const id = e.target.id
    const images = this.data.images
    wx.previewImage({
      current: images[id], //当前预览的图片
      urls: images, //所有要预览的图片
    })
  },

  /**
   * 删除图片
   */
  removeImage(e) {
    console.log(e)
    const id = e.currentTarget.id
    // 删除数组中的图片  妙  (splice 返回值是删除的项)
    const images = this.data.images
    images.splice(id, 1)
    this.setData({
      images: images
    })
    console.log(images)
  },

  /**
   * 提交至云储存
   */
  submitForm: function() {
    const title = this.data.title
    const content = this.data.content

    if (this.data.type == true) {
      if (title && content) {
        wx.showLoading({
          title: '正在创建...',
          mask: true
        })
        var iamges = this.data.images
        // 如果没添加图片
        if (iamges.length == 0) {
          this.addPostList()
        } else {
          var successUp = 0; //成功个数
          var failUp = 0; //失败个数
          var length = iamges.length; //总共个数
          var i = 0; //第几个
          this.uploadDIY(iamges, successUp, failUp, i, length);
        }
      } else {
        wx.showToast({
          title: '请输入标题或内容',
          icon: 'none'
        })
      }
    }else{
      if (content) {
        wx.showLoading({
          title: '正在创建...',
          mask: true
        })
        var iamges = this.data.images
        // 如果没添加图片
        if (iamges.length == 0) {
          this.updatePostList()
        } else {
          var successUp = 0; //成功个数
          var failUp = 0; //失败个数
          var length = iamges.length; //总共个数
          var i = 0; //第几个
          this.uploadDIY(iamges, successUp, failUp, i, length);
        }
      } else {
        wx.showToast({
          title: '发布失败,请输入内容',
          icon: 'none'
        })
      }
    }

  },

  /**
   * 更新images数据库
   */
  updateImages() {
    db.collection('images').add({
      data: {
        courseId: this.data.cid,
        postId: this.data.postId,
        createTime: db.serverDate(),
        imageId: imageId
      },
      success: res => {
        console.log("添加记录到images成功：", res)
      },
      fail: console.error
    })
  },

  /* 函数描述：作为上传文件时递归上传的函数体；
   * 参数描述： 
   * filePaths是文件路径数组
   * successUp是成功上传的个数
   * failUp是上传失败的个数
   * i是文件路径数组的指标
   * length是文件路径数组的长度
   */
  uploadDIY(filePaths, successUp, failUp, i, length) {
    const cid = this.data.cid
    const postId = this.data.postId
    var imageId = this.data.imageId + successUp
    var that = this;
    wx.showLoading({
      title: "图片上传中...",
    })
    wx.cloud.uploadFile({
      // 帖子图片路径：cloud://xxx/courseId/postId/floorId/commemtId/imageId
      cloudPath: cid + '/' + postId + '/' + imageId,
      filePath: filePaths[i],
      success: res => {
        // 不知道为什么不能执行这里？？？
        successUp++;
        var srcArr = that.data.src;
        srcArr.push(filePaths[i]),
          that.setData({
            src: srcArr
          });

        var data = JSON.parse(res.data);
        var newpicKeys = that.data.picKeys;
        newpicKeys.push(data.data['pic_key']);
        that.setData({
          picKeys: newpicKeys
        });
      },
      fail: (res) => {
        that.setData({
          isuploaderror: 1
        });
        failUp++;
        console.log('上传图片失败：',res)
      },
      complete: res => {
        // 更新images数据库
        // this.updateImages()
        console.log('complete',res)
        this.data.fileIDs.push(res.fileID)
        i++;
        if (i == length) {
          wx.hideLoading();
          // 全部上传完之后,更新postlist数据库
          this.addPostList()
        } else { //递归调用uploadDIY函数
          if (that.data.isuploaderror) {
            wx.showToast({
              title: "图片上传失败，请重新上传",
              duration: 2000, //显示时长
            })
          } else {
            this.uploadDIY(filePaths, successUp, failUp, i, length);
          }
        }
      }
    });
  },

  /**
   * 添加帖子,更新post_list数据库
   */
  addPostList: function () {
    db.collection('post_list').add({
      data: {
        courseId: this.data.cid,
        postId: this.data.postId,
        createTime: db.serverDate(),
        images: this.data.fileIDs,
        content: this.data.content,
        title: this.data.title,
        author: this.data.userInfo,
        zanCount: 0,
        visitCount: 0,
        replyCount: 0,
        ups: [],
        replies: [],
      },
      success: res => {
        console.log("添加记录到post_list成功：", res)
        wx.hideLoading();
        wx.showToast({
          title: '发布成功',
          success: res => {
            setTimeout(() => wx.navigateBack({}), 2000)
          }
        })
      },
      fail: console.error
    })
  },

  /**
   * 更新帖子(添加回复),更新post_list数据库
   */
  updatePostList: function () {
    const reply = {
      author: this.data.userInfo,
      content: this.data.content,
      zanCount: 0,
      replyCount: 0,
      images: this.data.images,
      ups: []
    }
    wx.cloud.callFunction({
      name: 'updatePost',
      data: {
        _id: this.data.post_id,
        reply,
        replyCount: app.globalData.post.replyCount + 1
      }
    }).then(res => {
      console.log('回复成功', res)
      wx.hideLoading();
      const replyCount = app.globalData.post.replyCount
      app.globalData.post['replies'].push(reply)
      app.globalData.post.replies[replyCount]['lastReplyAt'] = util.getDateDiff(new Date())
      app.globalData.post['replyColor'] = 'yellow'
      app.globalData.post.replyCount = replyCount + 1
      console.log(app.globalData.post)

      wx.showToast({
        title: '发布成功',
        success: res => {
          setTimeout(() => wx.navigateBack({
            delta: 1
          }), 1000)
        }
      })
    }).catch(console.error)
  },

  /**
   * 查询已有帖子的数量
   */
  getPostCount: function() {
    db.collection('post_list').count({
      success: res => {
        // 定义该帖子的id
        const postId = Number(res.total)
        this.setData({
          postId
        })
        console.log(postId)
      },
      fail: console.error
    })
  },
  /**
   * 查询已有图片的数量
   */
  getImageCount: function() {
    db.collection('images').count({
      success: res => {
        // 定义该帖子的id
        const imageId = Number(res.total)
        this.setData({
          imageId
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