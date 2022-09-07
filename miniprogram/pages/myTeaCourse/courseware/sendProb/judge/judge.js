// pages/myTeaCourse/publish/setPreview/judge/judge.js
const {
  $Toast
} = require('../../../../../dist/iview/base/index');
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    optionsTitle: '', //题目
    correctAnswer: false, //该判断题是否正确
    tid: null, //题目id
    coursewareId: null, //课件id
    _id: '', //修改某个记录要用的_id
    titles:[],//题目列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      _id: options._id,
      coursewareId: Number(options.coursewareId) 
    })
    this.whichType(Number(options.tid))
  },

  /**
   * 什么模式,编辑or添加
   */
  whichType: function(tid) {
    db.collection('problem_list').where({
      coursewareId: this.data.coursewareId
    }).get().then(res => {
      const titles = res.data[0].titles
      console.log('problem推送问题的内容', res.data[0])
      if (tid) { // 如果传过来tid，则为编辑题目的模式
        const title = res.data[0].titles[tid - 1]
        console.log(title)
        this.setData({
          titles,
          edit: true,
          tid: tid,
          optionsTitle: title.title,
          correctAnswer: title.correctAnswer,
        })
      } else { //否则 添加题目模式
        this.setData({
          tid: res.data[0].titles.length + 1
        })
      }
    })

  },

  /**
   * 输入标题
   */
  onInputTitle: function(e) {
    this.setData({
      optionsTitle: e.detail.value
    })
  },

  /**
   * 答案正确还是错误
   */
  handleChange: function(e) {
    const checked = e.detail.value
    this.setData({
      correctAnswer: checked ? true : false
    })
  },

  /**
   * 判断信息是否填写完整
   */
  isFull() {
    if (!this.data.optionsTitle) {
      $Toast({
        content: '请输入题目',
        type: 'warning'
      });
      return 1
    }
  },

  /**
   * 添加题目完成
   */
  finishOptions: function() {
    if (this.isFull()) return
    const title = {
      title: this.data.optionsTitle,
      correctAnswer: this.data.correctAnswer,
      onChange: false,
      tid: Number(this.data.tid),
      typeId: 2
    }
    var titles = this.data.titles
    // 如果为编辑模式
    if (this.data.edit) {
      titles[this.data.tid - 1] = title
      db.collection('problem_list').doc(this.data._id).update({
        data: {
          titles: titles
        }
      }).then(res => {
        $Toast({
          content: '修改成功',
          type: 'success'
        });
        setTimeout(() => {
          wx.navigateBack({})
        }, 1000)
      }).catch(e => {
        console.log(e)
      })
    } else {
      // 如果为添加题目的模式
      db.collection('problem_list').doc(this.data._id).update({
        data: {
          titles: _.push(title)
        }
      }).then(res => {
        $Toast({
          content: '创建成功',
          type: 'success'
        });
        setTimeout(() => {
          wx.navigateBack({})
        }, 1000)
      }).catch(e => {
        console.log(e)
      })
    }
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