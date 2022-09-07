const app = getApp()
const util = require('../../utils/util.js')
const db = wx.cloud.database()
import {
  $wuxDialog
} from '../../dist/index'
const MAX = 5
const floatButtons = [{
    label: '分享资料',
    icon: '/images/addCourseware.png',
  },
  {
    label: '发布帖子',
    icon: '/images/addPost.png',
  }
]
const iconList = [{
  icon: 'cardboardfill',
  color: 'red',
  badge: 0,
  name: '进入课件'
}, {
  icon: 'upstagefill',
  color: 'cyan',
  badge: 0,
  name: '排行榜'
}, {
  icon: 'clothesfill',
  color: 'blue',
  badge: 0,
  name: '签到'
}]
let actions4 = [{
    name: '视频'
  },
  {
    name: 'PPT文档'
  },
  {
    name: '退出'
  },
]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gridCol: 3,
    iconList: iconList,

    previewList: [], //预习测验列表
    showPrevLoading: false, //是否显示正在加载预习
    postList: [], //帖子列表
    hideLoading: true, //是否隐藏正在加载
    floatButtons, //按钮样式列表
    coursewareList: [], //课件列表
    userInfo: null, //用户信息
    index: 0, //课件在数组中的index
    cid: 0, //课程id
    cName: "", //课程名称
    drawerShow: false, //是否显示抽屉层
    actions4, //分享资料出现的弹窗的内容
    fileList: [], //资料列表
    fileId: 0, //要发布的资料文件的id
    showInputName: false, //是否显示输入文件名字的dialog
    fileName: '', //输入的视频名字
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      userInfo: app.globalData.userInfo,
      cid: Number(options.cid),
      cName: options.cName
    })
    app.globalData.course['cid'] = this.data.cid
    app.globalData.course['cName'] = this.data.cName
    console.log("userInfo", this.data.userInfo) //输入用户信息
    wx.setNavigationBarTitle({ //设置导航栏标题
      title: options.cName
    })
  },

  /**
   * 获取预习测验列表
   */
  getPreviewList() {
    this.setData({
      showPrevLoading: true
    })
    db.collection('preview_list').where({
      cid: this.data.cid,
      isPublished: true
    }).get().then(res => {
      const previewList = res.data
      for (let i = 0; i < previewList.length; i++) {
        previewList[i].createTime = util.formatTime(previewList[i].createTime)
      }
      console.log('previewList预习测验列表：', previewList)
      this.setData({
        previewList,
        showPrevLoading: false
      })
    }).catch(console.error)
  },

  /**
   * 点击进入预习测验
   */
  onPreviewTest(e) {
    const index = e.currentTarget.id
    app.globalData.titles = this.data.previewList[index].titles
    app.globalData.course['previewId'] = Number(this.data.previewList[index].previewId)
    app.globalData.course._id = this.data.previewList[index]._id
    wx.navigateTo({
      url: './preview/preview?previewId=' + this.data.previewList[index].previewId + '&cid=' + this.data.cid,
    })
  },

  /**
   * 获取课件列表
   */
  getCoursewareList: function() {
    this.setData({
      showCwLoading: true
    })
    db.collection("courseware_list").where({
      cid: this.data.cid,
      isPublished: true
    }).orderBy('coursewareId', 'desc').limit(MAX).get({
      success: res => {
        var coursewareList = res.data
        // 修改时间戳为标准时间格式
        for (var i = 0; i < coursewareList.length; i++) {
          coursewareList[i].minSecond = util.getTime(coursewareList[i].createTime)
          coursewareList[i].monthDay = util.getDay(coursewareList[i].createTime)
        }
        this.setData({
          coursewareList: coursewareList, //课件列表
          showCwLoading: false
        })
        console.log('coursewareList:', this.data.coursewareList)
      },
      fail: console.error
    })
  },

  /**
   * 用户点击的课件
   */
  onCourseware: function(e) {
    console.log(e)
    const index = e.currentTarget.id
    console.log("此课件的index为：", index)
    this.setData({
      drawerShow: true,
      index: index,
    })
  },

  /**
   * 用户点击的课件抽屉层的某个格子
   */
  onTapDrawerGrid: function(e) {
    console.log(e)
    const index = this.data.index //课件在数组中的index
    const gridIndex = e.currentTarget.id //点击的格子id
    const coursewareId = this.data.coursewareList[index].coursewareId //课件id
    console.log(this.data.coursewareList[index])
    console.log("格子的index为：", gridIndex)
    if (gridIndex == 0) {
      if (this.data.coursewareList[index].type == 0) { //视频
        app.globalData.file = this.data.coursewareList[gridIndex]
        wx.navigateTo({
          url: '/pages/myLisCourse/fileDetail/fileDetail',
        })
      } else {
        app.globalData.courseware = this.data.coursewareList[index]
        wx.navigateTo({
          url: '/pages/myLisCourse/courseware/courseware?cid=' + this.data.cid + '&cName=' + this.data.cName,
        })
      }
    } else if (gridIndex == 1) {
      // 排行榜
    } else if (gridIndex == 2) {
      wx.navigateTo({
        url: './courseware/sign/sign?cid=' + this.data.cid,
      })
    }
  },

  /**
   * 获取帖子列表
   */
  getPostList() {
    this.setData({
      showPostLoading: true
    })
    db.collection("post_list").where({
        courseId: this.data.cid
      }).orderBy('postId', 'desc').limit(MAX).get({})
      .then(res => {
        console.log("postList:", res.data)
        var postList = res.data

        if (postList.length == 0) return
        for (let i = 0; i < postList.length; i++) {
          // 是否已经点赞 浏览 评论 (通过js来修改样式)
          for (let up of postList[i].ups)
            if (up == this.data.userInfo.openid) {
              postList[i]['zanColor'] = 'red'
              break
            }
          if (typeof(postList[i].visitors) != 'undefined')
            for (let visitId of postList[i].visitors)
              if (visitId == this.data.userInfo.openid) {
                postList[i]['visitColor'] = 'blue'
                break
              }
          for (let j in postList[i].replies)
            if (postList[i].replies[j].author.openid == this.data.userInfo.openid) {
              postList[i]['replyColor'] = 'yellow'
              break
            }
          // 换取图片临时路径
          wx.cloud.getTempFileURL({
            fileList: postList[i].images
          }).then(res => {
            for (let j = 0; j < res.fileList.length; j++)
              postList[i].images[j] = res.fileList[j].tempFileURL
            postList[i].createAt = util.formatTime(postList[i].createTime)
            if (postList[i].replies) {
              for (let j = 0; j < postList[i].replies.length; j++) {
                postList[i].replies[j].lastReplyAt = util.getDateDiff(new Date(postList[i].replies[j].createTime))
              }
            }
            this.setData({
              postList,
              showPostLoading: false
            })
          }).catch(console.error)
        }
      })
  },

  /**
   * 预览图片
   */
  onImagePreview: function(e) {
    const id = e.currentTarget.id
    const images = this.data.postList[id].images
    wx.previewImage({
      current: images[id], //当前预览的图片
      urls: images, //所有要预览的图片
    })
  },

  /**
   * 点击进入帖子详情
   */
  onTapPost: function(e) {
    console.log(e)
    var postId = this.data.postList[e.currentTarget.id].postId
    app.globalData.post = this.data.postList[e.currentTarget.id]
    wx.navigateTo({
      url: './discussion/discussion?postId=' + postId + '&cName=' + this.data.cName + '&cid=' + this.data.cid,
    })
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
    if (e.detail.index == 0) {
      this.handleOpen4()
    } else if (e.detail.index == 1) {
      wx.navigateTo({
        url: './discussion/addPost/addPost?cid=' + this.data.cid
      })
    }
  },

  /**
   * 点击公告卡片跳转
   */
  onTapAnn: function(e) {
    console.log(e)
    var tap = e.currentTarget.dataset.tap
    var time = this.data.annList[tap].time
    var content = this.data.annList[tap].content
    wx.navigateTo({
      url: '/pages/myTeaCourse/announce/announce?time=' + time + "&content=" + content,
    })
  },

  //打开选择分享资料的对话框
  handleOpen4() {
    this.setData({
      visible4: true
    });
  },

  //处理用户的选择
  handleClick4(e) {
    console.log(e)
    let index = e.detail.index
    this.setData({
      visible4: false
    });
    //index 0 视频 1 文件
    this.prompt(index)
  },

  //提示输入文件名称
  prompt(type) {
    const alert = (content) => {
      $wuxDialog('#wux-dialog--alert').alert({
        resetOnClose: true,
        title: '提示',
        content: content,
      })
    }
    $wuxDialog().prompt({
      resetOnClose: true,
      title: '提示',
      defaultText: '',
      maxlength: -1,
      placeholder: '请输入文件名称',
      onConfirm: (e, response) => {
        console.log(`${response}`)
        this.setData({
          fileName: `${response}`
        })
        this.uploadFile(type)
      },
    })

  },

  /**
   * 发布资料文件
   */
  uploadFile(type) {
    if (type == 0) {
      //选择视频
      wx.chooseVideo({
        success: res => {
          console.log(res)
          wx.showLoading({
            title: '正在上传',
          })
          this.uploadToDb(type, res)
        },
        fail: console.error,
      })
    } else if (type == 1) {
      // 选择文件
      wx.chooseImage({
        count: 1,
        success: res => {
          console.log("选择了如下文件：", res)
          wx.showLoading({
            title: '正在上传',
          })
          this.uploadToDb(type, res)
        },
      })
    }
  },

  // 上传至服务器
  uploadToDb(type, chooseRes) {
    let cover //封面临时路径
    if (type == 0) cover = chooseRes.thumbTempFilePath;
    else if (type == 1) cover = chooseRes.tempFilePaths[0]

    wx.cloud.uploadFile({
      cloudPath: this.data.cid + '/' + 'file_list' + '/' + this.data.fileName + '/' + 'cover',
      filePath: cover,
      success: res => {
        cover = res.fileID; //封面云储存路径
        console.log("上传封面成功：", cover)
        let fileId //课件id
        db.collection('file_list').count({
          success: res => {
            fileId = Number(res.total)
            let i = 0; //上传的个数
            let fileIDs = [] //上传到云储存成功后返回的引用文件的路径（fileIDs）
            this.wxCloudUpload(type, chooseRes, i, fileId, fileIDs, cover); //上传文档或视频到服务器
          },
          fail: console.error
        })
      },
      fail: console.error
    })
  },

  //调用微信提供的函数上传
  wxCloudUpload(type, chooseRes, i, fileId, fileIDs, cover) {
    // 云储存的路径
    let cloudPath = this.data.cid + '/' + 'file_list' + '/' + this.data.fileName + '/' + i
    // 上传文件至云储存
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: type ? chooseRes.tempFilePaths[i] : chooseRes.tempFilePath,
      success: res => {
        fileIDs.push(res.fileID)
        console.log((i + 1) + "个文件上传成功：", res)
      },
      fail: e => {
        console.log(e)
        wx.showModal({
          title: '系统提示',
          content: '上传失败',
          showCancel: false
        })
      },
      complete: () => {
        i++;
        console.log(type)
        if (type == 0 || i == chooseRes.tempFilePaths.length) {
          // 添加上传记录到数据库
          db.collection('file_list').add({
            data: {
              cid: this.data.cid,
              fileId,
              name: this.data.fileName,
              createTime: db.serverDate(),
              visitCount: 0,
              downloadCount: 0,
              type,
              cover,
              fileUrl: fileIDs,
            },
            success: res => {
              wx.hideLoading()
              wx.showToast({
                title: '上传成功',
                icon: 'success'
              })
              console.log("添加记录到数据库file_list成功：", res)
              this.getFileList()// 重新获取文件资料列表
            },
            fail: console.error
          })
        } else { //递归调用uploadDIY函数
          this.wxCloudUpload(type, chooseRes, i, fileId, fileIDs, cover);
        }
      }
    })
  },

  /**
   * 获取文件资料列表
   */
  getFileList: function() {
    this.setData({
      showFileLoading: true
    })
    db.collection("file_list").where({
      cid: this.data.cid
    }).orderBy('fileId', 'desc').limit(MAX).get({
      success: res => {
        var fileList = res.data
        let fileUrlList = []
        // 修改时间戳为标准时间格式
        for (var i = 0; i < fileList.length; i++) {
          fileList[i].createAt = util.getDateDiff(fileList[i].createTime)
          fileUrlList[i] = fileList[i].fileUrl
        }
        wx.cloud.getTempFileURL({
          fileList: fileUrlList,
          success: res => {
            console.log(res.fileList)
            this.setData({
              fileUrlList: res.fileList
            })
          },
          fail: console.error
        })
        this.setData({
          fileList: fileList, //课件列表
          showFileLoading: false
        })
        app.globalData.fileList = fileList
        console.log('fileList:', this.data.fileList)
      },
      fail: console.error
    })
  },

  /**
   * 点击进入资料详情页面
   */
  onFileDetail: function(e) {
    let index = e.currentTarget.id
    app.globalData.file = this.data.fileList[index]
    wx.navigateTo({
      url: './fileDetail/fileDetail',
    })
  },

  /**
   * 用户点击蒙版,关闭抽屉层
   */
  onClose() {
    this.setData({
      drawerShow: false
    });
  },

  /**
   * 获取公告列表
   */
  getAnnList() {
    db.collection('ann_list').where({
      cid: this.data.cid
    }).orderBy('annId', 'desc').get().then(res => {
      console.log('annList公告列表', res.data)
      let annList = res.data
      for (let item of annList) {
        item.createTime = util.getDateDiff(item.createTime)
      }
      this.setData({
        annList
      })
    }).catch(console.error)
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
    this.getPostList() //获取帖子列表
    this.getCoursewareList() //获取课件列表
    this.getPreviewList() //获取预习测验
    this.getFileList() //获取分享资料列表
    this.getAnnList() //获取公告列表
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.setData({
      drawerShow: false
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