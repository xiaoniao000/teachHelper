const app = getApp()
const util = require('../../utils/util.js')
const db = wx.cloud.database()
let sortByDescP = true;
let sortByDescH = true;
const MAX = 5
import {
  $wuxDialog
} from '../../dist/index'
const floatButtons = [{
  label: '新建预习',
  icon: '/images/addPreview.png',
},
{
  label: '发布课件',
  icon: '/images/addCourseware.png',
}, {
  label: '发布帖子',
  icon: '/images/addPost.png',
},
{
  label: '布置作业',
  icon: '/images/addHomework.png',
},
{
  label: '发布公告',
  icon: '/images/addAnn.png',
}
]
const iconList = [{
  icon: 'cardboardfill',
  color: 'red',
  badge: 0,
  name: '进入课件'
},
{
  icon: 'recordfill',
  color: 'orange',
  badge: 0,
  name: '发布课件'
},
{
  icon: 'deletefill',
  color: 'yellow',
  badge: 0,
  name: '删除课件'
}, {
  icon: 'noticefill',
  color: 'olive',
  badge: 1,
  name: '课件学习状况'
}, {
  icon: 'upstagefill',
  color: 'cyan',
  badge: 0,
  name: '排行榜'
}, {
  icon: 'locationfill',
  color: 'blue',
  badge: 0,
  name: '签到'
}
]

let options = [{
  text: '最近一次预习反馈',
  type: 'radio',
  options: []
}, {
  text: '最高分',
  type: 'sort',
}]

let optionsHomework = [{
  text: '最近一次作业反馈',
  type: 'radio',
  options: []
}, {
  text: '最高分',
  type: 'sort',
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
    collected: false,
    gridCol: 3,
    iconList: iconList,

    previewId: 0, //教师选择要查看的预习测验反馈的id(主要用于查看图表时的跳转)
    homeworkId: 0, //教师选择要查看的课后作业反馈的id(主要用于查看图表时的跳转)
    previewList: [], //预习测验的列表（获取它主要是用于拿到正确答案）
    homeworlList: [], //课后作业的列表（获取它主要是用于拿到正确答案）
    resultPerAuthorP: [], //预习测验的结果列表(含个人信息，分数，对错列表)
    resultPerAuthorH: [], //课后作业的结果列表(含个人信息，分数，对错列表)
    options, //课前预习的
    optionsHomework, //课后作业的
    actions4, //分享资料出现的弹窗的内容
    postList: [], //帖子列表
    coursewareList: [], //课件列表
    hideLoading: true, //是否隐藏正在加载
    floatButtons, //按钮样式列表
    userInfo: '', //用户信息
    index: 0, //课件在数组中的index
    cid: 0, //课程id
    cName: "", //课程名称
    stuNum: 0, //课程学生人数
    coursewareId: 0, //要发布的课件的id
    drawerShow: false, //是否显示抽屉层
    annList: [], //公告列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo,
      cid: Number(options.cid),
      cName: options.cName,
    })
    if (typeof (options.stuNum) != 'undefined')
      this.setData({
        stuNum: options.stuNum
      })

    app.globalData.course['cid'] = this.data.cid
    app.globalData.course['cName'] = this.data.cName
    console.log("userInfo", this.data.userInfo) //输出用户信息
    wx.setNavigationBarTitle({ //设置导航栏标题
      title: options.cName
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getPreviewList() //获取预习测验列表
    this.getCoursewareList() //获取课件列表
    this.getPostList() //获取帖子列表
    this.getAnnList() //获取公告列表
    this.getHomeworkList() //获取课后作业列表
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 获取所有预习试卷的列表
   */
  getPreviewList() {
    db.collection('preview_list').where({
      cid: this.data.cid
    }).orderBy('previewId', 'desc')
      .get().then(res => {
        if (res.data.length == 0) return
        // 把预习试卷的名字传入到options中供显示和选择
        let arr = []
        for (let item of res.data) {
          let obj = {
            text: item.name //名字暂时为previewId
          }
          arr.push(obj)
        }
        this.setData({
          previewList: res.data,
          ['options[0].options']: arr,
          previewId: res.data[0].previewId, //预先设置为最新测验的previewId，供查看图表
        })
        console.log('previewList预习试卷信息和题目列表', res.data)
        // 打开课程首先显示最新一次的预习反馈
        this.getPrevResult(0)
      }).catch(console.error)
  },

  /**
   * 获取所有课后作业的列表
   */
  getHomeworkList() {
    db.collection('homework_list').where({
      cid: this.data.cid
    }).orderBy('homeworkId', 'desc')
      .get().then(res => {
        if (res.data.length == 0) return
        // 把预习试卷的名字传入到options中供显示和选择
        let arr = []
        for (let item of res.data) {
          let obj = {
            text: item.name
          }
          arr.push(obj)
        }
        this.setData({
          homeworkList: res.data,
          ['optionsHomework[0].options']: arr,
          homeworkId: res.data[0].homeworkId, //预先设置为最新测验的homeworkId，供查看图表
        })
        console.log('homeworkList预习试卷信息和题目列表', res.data)
        // 打开课程首先显示最新一次的课后反馈
        this.getHomeResult(0)
      }).catch(console.error)
  },

  /**
   * 选择查看第几次测验的成绩，并排序
   */
  sortScoreP(e) {
    console.log(e)
    // 如果点击了排序
    if (e.detail.options.length == 0) {
      let resultPerAuthorP = this.data.resultPerAuthorP
      if (sortByDescP == false) {
        resultPerAuthorP.reverse()
        sortByDescP = true
      } else {
        for (var i = 0; i < resultPerAuthorP.length - 1; i++) {
          for (var j = 0; j < resultPerAuthorP.length - 1 - i; j++) {
            if (resultPerAuthorP[j].score >= resultPerAuthorP[j + 1].score) {
              var temp = resultPerAuthorP[j];
              resultPerAuthorP[j] = resultPerAuthorP[j + 1];
              resultPerAuthorP[j + 1] = temp;
            }
          }
        }
        sortByDescP = false
      }
      this.setData({
        resultPerAuthorP
      })
      // 点击选择测验时
    } else {
      let index = e.detail.key
      let previewId = this.data.previewList[index].previewId
      this.setData({
        previewId
      })
      console.log(index)
      this.getPrevResult(index)
    }
  },

  /**
   * 选择查看第几次课后作业的成绩，并排序
   */
  sortScoreH(e) {
    console.log(e)
    // 如果点击了排序
    if (e.detail.options.length == 0) {
      let resultPerAuthorH = this.data.resultPerAuthorH
      if (sortByDescH == false) {
        resultPerAuthorH.reverse()
        sortByDescH = true
      } else {
        for (var i = 0; i < resultPerAuthorH.length - 1; i++) {
          for (var j = 0; j < resultPerAuthorH.length - 1 - i; j++) {
            if (resultPerAuthorH[j].score >= resultPerAuthorH[j + 1].score) {
              var temp = resultPerAuthorH[j];
              resultPerAuthorH[j] = resultPerAuthorH[j + 1];
              resultPerAuthorH[j + 1] = temp;
            }
          }
        }
        sortByDescH = false
      }
      this.setData({
        resultPerAuthorH
      })
      // 点击选择测验时
    } else {
      let index = e.detail.key
      let previewId = this.data.previewList[index].previewId
      this.setData({
        previewId
      })
      console.log(index)
      this.getPrevResult(index)
    }
  },

  /**
   * 获取选中的预习测验的测验结果列表
   */
  getPrevResult: function (index) {
    let resultPerAuthorP = this.data.previewList[index].resultPerAuthor
    if (typeof (resultPerAuthorP) == 'undefined' || resultPerAuthorP.length == 0) {
      this.setData({
        animation: 'shake',
        resultPerAuthorP: []
      })
      setTimeout(() => {
        this.setData({
          animation: ''
        })
      }, 1000)
    } else {
      this.setData({
        resultPerAuthorP
      })
    }
  },

  /**
   * 获取选中的课后作业的测验结果列表
   */
  getHomeResult: function (index) {
    let resultPerAuthorH = this.data.homeworkList[index].resultPerAuthor
    if (typeof (resultPerAuthorH) == 'undefined' || resultPerAuthorH.length == 0) {
      this.setData({
        animation: 'shake',
        resultPerAuthorH: []
      })
      setTimeout(() => {
        this.setData({
          animation: ''
        })
      }, 1000)
    } else {
      this.setData({
        resultPerAuthorH
      })
    }
  },

  /**
   * 添加预习
   */
  addPreview() {
    db.collection('preview_list').where({
      cid: this.data.cid
    }).orderBy('previewId', 'desc')
      .limit(1).get().then(res => {
        console.log(res)
        let previewId
        if (res.data.length == 0) previewId = 0
        else previewId = res.data[0].previewId + 1
        db.collection('preview_list').add({
          data: {
            cid: Number(this.data.cid),
            previewId: previewId,
            name: '',
            titles: [],
            createTime: db.serverDate(),
            isPublished: false
          }
        }).then(res => {
          console.log('新建预习成功,PreviewId:', previewId)
          wx.navigateTo({
            url: './publish/setPreview/setPreview?previewId=' + previewId + '&cid=' + this.data.cid
          })
        }).catch(console.error)
      })
  },

  /**
   * 添加课后作业
   */
  addHomework() {
    db.collection('homework_list').where({
      cid: this.data.cid
    }).orderBy('homeworkId', 'desc')
      .limit(1).get().then(res => {
        console.log(res)
        let homeworkId
        if (res.data.length == 0) homeworkId = 0
        else homeworkId = res.data[0].homeworkId + 1
        db.collection('homework_list').add({
          data: {
            cid: Number(this.data.cid),
            homeworkId: homeworkId,
            name: '',
            title: '',
            titles: [],
            createTime: db.serverDate(),
            isPublished: false
          }
        }).then(res => {
          console.log('新建课后作业成功homeworkId:', homeworkId)
          wx.navigateTo({
            url: './publish/setHomework/setHomework?homeworkId=' + homeworkId + '&cid=' + this.data.cid
          })
        }).catch(e => {
          console.log(e)
        })
      })
  },

  /**
   * 点击查看已发布的预习测验
   */
  previewTitles: function () {
    wx.navigateTo({
      url: './preview/previewTitles/previewTitles?cid=' + this.data.cid,
    })
  },

  /**
   * 点击查看已发布的课后作业
   */
  homeworkTitles: function () {
    wx.navigateTo({
      url: './homework/homeworkTitles/homeworkTitles?cid=' + this.data.cid,
    })
  },

  /**
   * 查看各题正确率和成绩分布图
   */
  watchChartP: function () {
    wx.navigateTo({
      url: '/pages/myTeaCourse/preview/resultChart/resultChart?previewId=' + this.data.previewId,
    })
  },

  /**
   * 查看各题正确率和成绩分布图
   */
  watchChartH: function () {
    wx.navigateTo({
      url: '/pages/myTeaCourse/preview/resultChart/resultChart?homeworkId=' + this.data.homeworkId,
    })
  },

  /**
   * 获取课件列表
   */
  getCoursewareList: function () {
    this.setData({
      showCwLoading: true
    })
    db.collection("courseware_list").where({
      cid: this.data.cid
    }).orderBy('coursewareId', 'desc').limit(MAX).get({
      success: res => {
        var coursewareList = res.data
        if (coursewareList.length == 0) return
        // 修改时间戳为标准时间格式
        for (var i = 0; i < coursewareList.length; i++) {
          coursewareList[i].minSecond = util.getTime(coursewareList[i].createTime)
          coursewareList[i].monthDay = util.getDay(coursewareList[i].createTime)
        }
        this.setData({
          coursewareList: coursewareList, //课件列表
          showCwLoading: false
        })
        // app.globalData.coursewareList = coursewareList//!!!
        console.log('coursewareList课件列表:', this.data.coursewareList)
      },
      fail: console.error
    })
  },

  /**
   * 用户点击的课件
   */
  onCourseware: function (e) {
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
  onTapDrawerGrid: function (e) {
    console.log(e)
    const index = this.data.index //课件在数组中的index
    const gridIndex = e.currentTarget.id //点击的格子id
    console.log(this.data.coursewareList[index])
    const coursewareId = this.data.coursewareList[index].coursewareId //课件id
    console.log(this.data.coursewareList[index])
    console.log("格子的index为：", gridIndex)
    if (gridIndex == 0) {
      if (this.data.coursewareList[index].type == 0) { //视频
        app.globalData.file = this.data.coursewareList[index]
        wx.navigateTo({
          url: '/pages/myLisCourse/fileDetail/fileDetail',
        })
      } else {
        app.globalData.courseware = this.data.coursewareList[index]
        wx.navigateTo({
          url: '/pages/myTeaCourse/courseware/courseware?cid=' + this.data.cid + '&cName=' + this.data.cName,
        })
      }
    } else if (gridIndex == 1) {
      this.publishCourseware()
    } else if (gridIndex == 2) {

    } else if (gridIndex == 3) {

    } else if (gridIndex == 5) {
      wx.navigateTo({
        url: './courseware/sign/sign?cid=' + this.data.cid,
      })
    }
  },

  /**
   * 发布课件
   */
  publishCourseware() {
    const coursewareList = this.data.coursewareList
    const index = this.data.index
    if (coursewareList[index].isPublished) {
      wx.showToast({
        title: '该课件已经发布',
      })
      return
    }
    db.collection('courseware_list').doc(coursewareList[index]._id).update({
      data: {
        isPublished: true
      }
    }).then(res => {
      console.log("课件发布成功")
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      })
      // key为动态变量的写法
      var isPublished = 'coursewareList[' + index + '].isPublished';
      this.setData({
        [isPublished]: true,
        drawerShow: false
      })
    }).catch(() => console.error)
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
          if (typeof (postList[i].visitors) != 'undefined')
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
  onImagePreview: function (e) {
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
  onTapPost: function (e) {
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
    if (e.detail.index == 1) {
      this.handleOpen4()
      // this.uploadCourseware()
    } else if (e.detail.index == 0) {
      this.addPreview()
    } else if (e.detail.index == 3) {
      this.addHomework()
    } else if (e.detail.index == 2) { //发布帖子
      wx.navigateTo({
        url: './discussion/addPost/addPost?cid=' + this.data.cid
      })
    } else if (e.detail.index == 4) {
      wx.navigateTo({
        url: './publish/setAnnounce/setAnnounce'
      })
    }
  },

  //打开上传课件的对话框
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
    if (index == 2) return;
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
      placeholder: '请输入课件名称',
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
   * 发布课件
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
        count: 15,
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

  // 上传临时的封面至服务器
  uploadToDb(type, chooseRes) {
    let cover //封面临时路径
    if (type == 0) cover = chooseRes.thumbTempFilePath;//视频
    else if (type == 1) cover = chooseRes.tempFilePaths[0]//文档
    wx.cloud.uploadFile({
      cloudPath: this.data.cid + '/' + 'courseware_list' + '/' + this.data.fileName + '/' + 'cover',
      filePath: cover,
      success: res => {
        cover = res.fileID;//封面云储存路径
        console.log("上传封面成功：", cover)
        let coursewareId//课件id
        db.collection('courseware_list').count({
          success: res => {
            coursewareId = Number(res.total)
            let i = 0;//上传的个数
            let fileIDs = []//上传到云储存成功后返回的引用文件的路径（fileIDs）
            this.wxCloudUpload(type, chooseRes, i, coursewareId, fileIDs, cover);//上传文档或视频到服务器
          },
          fail: console.error
        })
      },
      fail: console.error
    })
  },

  //调用微信提供的函数上传
  wxCloudUpload(type, chooseRes, i, coursewareId, fileIDs, cover) {
    // 云储存的路径
    let cloudPath = this.data.cid + '/' + 'courseware_list' + '/' + this.data.fileName + '/' + i
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
          db.collection('courseware_list').add({
            data: {
              cid: this.data.cid,
              coursewareId,
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
              console.log("添加记录到数据库courseware_list成功：", res)
              this.getCoursewareList()// 重新获取文件资料列表
            },
            fail: console.error
          })
        } else { //递归调用uploadDIY函数
          this.wxCloudUpload(type, chooseRes, i, coursewareId, fileIDs, cover);
        }
      }
    })
  },


  /**
   * 点击公告卡片跳转
   */
  onTapAnn: function (e) {
    console.log(e)
    var tap = e.currentTarget.dataset.tap
    var time = this.data.annList[tap].time
    var content = this.data.annList[tap].content
    wx.navigateTo({
      url: '/pages/myTeaCourse/announce/announce?time=' + time + "&content=" + content,
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      drawerShow: false
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