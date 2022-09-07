const app = getApp()
const db = wx.cloud.database()
const _ = db.command
let categories = new Array() //存放类别（第几题）的数组
let correctAnswers = new Array() //存放该测验正确答案的数组
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scroll: 0, //滚动的位置
    titles: [], //题目列表
    cid: 0,
    _id: '',
    previewId: 0,
    result: [ //用户填写的答案列表
      []
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      cid: Number(options.cid),
      previewId: Number(options.previewId),
      _id: app.globalData.course._id,
    })
    this.getTitles()
  },

  // 获取题目列表
  getTitles(){
    db.collection('preview_list').where({
      previewId:this.data.previewId,
      cid: this.data.cid
    }).get().then(res=>{
      const titles = res.data[0].titles
      console.log('titles题目列表',titles)
      this.setData({
        titles
      })
      this.initResult()
    }).catch(console.error)
  },

  // 初始化result列表
  // 单选题 Number  多选题 数组  判断题 bool  简答题 字符串
  initResult() {
    var arr = this.data.result
    const titles = this.data.titles
    for (let i = 0; i < titles.length; i++) {
      if (titles[i].typeId == 1) {
        arr[i] = []
        for (let j = 0; j < titles[i].options.length; j++) {
          arr[i][j] = false
        }
      } else if (titles[i].typeId == 0) {
        arr[i] = -1
      } else if (titles[i].typeId == 2) {
        arr[i] = false
      } else if (titles[i].typeId == 3) {
        arr[i] = ''
      }
    }
    this.setData({
      result: arr
    })
  },

  /**
   * 上一题
   */
  scrollPrev() {
    const scroll = this.data.scroll
    if (scroll == 0) {
      wx.showToast({
        title: '前面没题目了哦！',
        icon: 'none'
      })
    } else {
      this.setData({
        scroll: scroll - 1
      })
    }
  },

  /**
   * 下一题或者交卷
   */
  scrollSteps() {
    const scroll = this.data.scroll
    if (scroll == this.data.titles.length - 1) {
      wx.showModal({
        title: '系统提示',
        content: '已经是最后一题了,确认交卷吗？',
        success: res => {
          if (res.cancel) {} else {
            this.getCorrectAnswer()
          }
        }
      })
    } else {
      this.setData({
        scroll: this.data.scroll + 1
      })
    }
  },

  /**
   * 获取正确答案进行比较
   */
  getCorrectAnswer() {
    const titles = this.data.titles
    let i = 0
    // 找到本地存储中的那个测验试卷
    for (let title of titles) {
      if (title.typeId == 3) {
        categories[i] = ('第' + (i + 1) + '题为简答题')
        correctAnswers[i] = null
      } else {
        categories[i] = ('第' + (i + 1) + '题')
        correctAnswers[i] = (title.correctAnswer)
      }
      i++
    }
    console.log('categories题目类型：', categories)
    console.log('correctAnswers正确答案：', correctAnswers)
    this.toResultPerAuthor() //比较正确答案和学生填写结果,存储到数组中
  },

  /**
   * 判断对错并记录数据
   */
  toResultPerAuthor() {
    const length = correctAnswers.length //测验题目的长度
    let resultPerAuthor = { //存放个人分数和个人信息和答案对错的对象
      author: app.globalData.userInfo,
      result: [],
      score: 0
    }
    for (let i = 0; i < length; i++) {
      // 如果为简答题，或答案对了，+1,并记录对错
      if (correctAnswers[i] == null || this.data.result[i].toString() == correctAnswers[i].toString()) {
        resultPerAuthor['score']++;
        resultPerAuthor.result[i] = true
      } else resultPerAuthor.result[i] = false
    }
    console.log(resultPerAuthor)
    wx.cloud.callFunction({
      name: 'addPrevRes',
      data:{
        resultPerAuthor,
        _id: this.data._id
      }
    }).then(res => {
      console.log('答案记录成功',res)
      // 上传结果到预习结果数据库
      db.collection('preview_result').add({
        data: {
          author: app.globalData.userInfo,
          createTime: db.serverDate(),
          result: this.data.result,
          cid: app.globalData.course.cid,
          previewId: app.globalData.course.previewId,
        }
      }).then(res => {
        console.log('提交成功')
        wx.showToast({
          title: '提交成功',
        })
        setTimeout(() => {
          wx.navigateBack({})
        }, 1000)
      })
    }).catch(console.error)
  },

  /**
   * 简答题输入
   */
  onInputTextarea: function(e) {
    console.log(e)
    const scroll = this.data.scroll
    var arr = this.data.result
    arr[scroll] = e.detail.value
    this.setData({
      result: arr
    })
    console.log(this.data.result)
  },

  /**
   * 判断题选择了哪个
   */
  handleChange: function(e) {
    const scroll = this.data.scroll
    const checked = e.detail.value
    var arr = this.data.result
    arr[scroll] = checked ? true : false
    this.setData({
      result: arr
    })
    console.log(this.data.result)
  },

  /**
   * 选择正确答案
   */
  chooseAnswer: function(e) {
    const index = e.currentTarget.id
    const titles = this.data.titles
    const arr = this.data.result
    const scroll = this.data.scroll
    // 如果为单选题,存放一个index，index是几，几是对的
    if (titles[scroll].typeId == 0) {
      arr[scroll] = Number(index)
      this.setData({
        result: arr
      })
      console.log(arr)
      // 如果为多选题，用数组来存答案，true对false错
    } else {
      arr[scroll][index] = !arr[scroll][index]
      this.setData({
        result: arr
      })
      console.log(arr)
    }
  },

  /**
   * 单选题选择了哪个
   */
  onRadioChange(e) {
    const scroll = this.data.scroll
    var arr = this.data.result
    arr[scroll] = e.detail.result
    this.setData({
      result: arr
    })
    console.log(this.data.result)
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