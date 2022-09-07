const {
  $Toast
} = require('../../../../../dist/iview/base/index');
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    _id: '', //problem的_id
    coursewareId: 0, //这道题属于第几次的预习作业
    problem: '', //problem的内容
    optionsTitle: '', //题目
    options: [], //选项的列表
    cid: 10, //课程的id
    tid: 0, //题目的id
    typeId: 0, //题目类型  0 单选 1多选 2判断 3简答
    correctAnswer: null, //单选题正确答案
    correctAnswers: [false, false], //多选题正确答案
    edit: false, //是否为编辑模式
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      coursewareId: Number(options.coursewareId),
      _id: options._id
    })
    this.whichType(Number(options.tid)) //!!!还没有获取到problem
  },

  /**
   * 获取该预习作业的题目数量等信息
   */
  getTitleInfo(tid) {
    db.collection('problem_list').where({
        coursewareId: this.data.coursewareId,
      }).get()
      .then(res => {
        console.log(res)
        if (res.data.length == 0) {
          console.log('该预习下没有题目')
          this.setData({
            tid: 1,
          })
        } else {
          this.setData({
            tid: res.data[0].titles.length + 1,
            problem: res.data[0],
          })
        }
      }).catch(console.error)
  },

  /**
   * 什么模式,编辑or添加
   */
  whichType: function(tid) {
    // 如果传过来tid，则为编辑题目的模式
    if (tid) {
      db.collection('problem_list').where({
        coursewareId: this.data.coursewareId
      }).get().then(res => {
        this.setData({
          problem: res.data[0]
        })
        const title = this.data.problem.titles[tid - 1]
        console.log(title)
        this.setData({
          edit: true,
          tid: tid,
          optionsTitle: title.title,
          options: title.options,
          typeId: title.typeId,
        })
        if (title.typeId == 0) {
          this.setData({
            correctAnswer: title.correctAnswer
          })
        } else {
          this.setData({
            correctAnswers: title.correctAnswer
          })
        }
      })
    } else { //否则 添加题目模式
      this.initOptions()
      this.getTitleInfo()
    }
  },

  /**
   * 输入标题
   */
  onInputTitle: function(e) {
    const optionsTitle = e.detail.value
    this.setData({
      optionsTitle: optionsTitle
    })
  },

  /**
   * 输入选项内容
   */
  onInputContent: function(e) {
    const id = e.currentTarget.id
    const options = this.data.options
    // 选项每个的内容
    options[id] = e.detail.value
    this.setData({
      options: options
    })

  },

  /**
   * 添加选项
   */
  addOptions: function() {
    const options = this.data.options
    const correctAnswers = this.data.correctAnswers
    correctAnswers.push(false)
    options.push('')
    this.setData({
      options: options,
      correctAnswers
    })
  },

  /**
   * 删除选项
   */
  removeOptions: function(e) {
    const index = e.currentTarget.id
    const options = this.data.options
    const correctAnswers = this.data.correctAnswers
    options.splice(index, 1)
    correctAnswers.splice(index, 1)
    this.setData({
      options: options,
      correctAnswers
    })
    console.log('选项如下：', options)
  },

  /**
   * 选择正确答案
   */
  chooseAnswer: function(e) {
    const index = e.currentTarget.id
    // 如果为单选题,
    if (this.data.typeId == 0) {
      this.setData({
        correctAnswer: index
      })
      // 如果为多选题，用数组来存答案，1对0错
    } else {
      const correctAnswers = this.data.correctAnswers
      this.setData({
        ['correctAnswers[' + index + ']']: !correctAnswers[index]
      })
      console.log(correctAnswers)
    }
  },

  /**
   * 切换单选,多选
   */
  handleChange: function(e) {
    const checked = e.detail.value
    this.setData({
      typeId: checked ? 1 : 0
    })
  },

  /**
   * 判断信息是否填写完整
   */
  isFull() {
    const options = this.data.options
    if (!this.data.optionsTitle) {
      $Toast({
        content: '请输入题目',
        type: 'warning'
      });
      return 1
    }
    for (let i = 0; i < options.length; i++) {
      if (options[i] == null) {
        $Toast({
          content: '请填写选项',
          type: 'warning'
        });
        return 1
      }
    }
    if (this.data.typeId == 0) {
      if (this.data.correctAnswer == null) {
        $Toast({
          content: '请选择正确答案',
          type: 'warning'
        });
        return 1
      }
    } else {
      const correctAnswers = this.data.correctAnswers
      for (let i = 0; i < correctAnswers.length; i++)
        if (correctAnswers[i] == true) return 0
      $Toast({
        content: '请选择正确答案',
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
    var title
    if (this.data.typeId == 0) {
      title = {
        tid: this.data.tid,
        title: this.data.optionsTitle,
        typeId: this.data.typeId,
        options: this.data.options,
        correctAnswer: Number(this.data.correctAnswer),
        onChange: false
      }
    } else {
      title = {
        tid: this.data.tid,
        title: this.data.optionsTitle,
        typeId: this.data.typeId,
        options: this.data.options,
        correctAnswer: this.data.correctAnswers,
        onChange: false
      }
    }
    console.log(title)
    // 如果为编辑模式
    if (this.data.edit) {
      var titles = this.data.problem.titles
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
   * 初始化选项
   */
  initOptions() {
    const options = this.data.options;
    options[0] = null
    options[1] = null
    this.setData({
      options: options,
    })
  },
})