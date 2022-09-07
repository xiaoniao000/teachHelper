const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coursewareId: 0, //课件id
    _id: '', //第几次问题的_id  用它才能添加题目！！
    problem: {}, //问题测验的内容
    titles: [], //题目列表
    onchangetitle: false, //是否点击了某个题目  点击了出现编辑等框框
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      coursewareId: Number(options.coursewareId),
    })
  },

  /**
   * 添加选择题
   */
  onChoice() {
    wx.navigateTo({
      url: './choice/choice?coursewareId=' + this.data.coursewareId + '&_id=' + this.data._id,
    })
  },

  /**
   * 添加判断题
   */
  onJudge() {
    wx.navigateTo({
      url: './judge/judge?_id=' + this.data._id + '&coursewareId=' + this.data.coursewareId,
    })
  },

  /**
   * 添加简答题
   */
  onShortAnswer() {
    wx.navigateTo({
      url: './shortAnswer/shortAnswer?_id=' + this.data._id + '&coursewareId=' + this.data.coursewareId,
    })
  },

  /**
   * 获取Problem_id和题目列表
   */
  getProblem() {
    db.collection('problem_list').where({
      coursewareId: Number(this.data.coursewareId)
    }).get()
      .then(res => {
        this.setData({
          problem: res.data[0],
          _id: res.data[0]._id,
          titles: res.data[0].titles,
        })
        console.log('该Problem的信息：', this.data.problem)
        // app.globalData.titles = res.data[0].titles
      }).catch(console.error)
  },

  /**
   * 点击出现改变题目的四个选项
   */
  onChangetitle: function (e) {
    console.log(e)
    // 这里的tid指的是每一道题目里的tid
    const tid = e.currentTarget.dataset.tid
    const titles = this.data.titles

    for (var index of titles) {
      // 如果用户点击的是已经出现四个框的题目。打开或关闭它
      if (index.onChange) {
        if (index.tid == tid) {
          titles[tid - 1].onChange = !titles[tid - 1].onChange
          this.setData({
            titles: titles
          })
          return
        } else {
          // 如果不是
          index.onChange = false
          titles[tid - 1].onChange = !titles[tid - 1].onChange
          this.setData({
            titles: titles
          })
          return
        }
      }
    }
    titles[tid - 1].onChange = !titles[tid - 1].onChange
    this.setData({
      titles: titles
    })
    console.log('titles:', titles)
  },

  /**
   * 点击题目的编辑选项跳转至编辑页面
   */
  changetitle: function (e) {
    const tid = e.currentTarget.dataset.tid
    const typeId = e.currentTarget.dataset.typeId
    console.log('typeId题目类型',typeId)
    if (typeId == 0 || typeId == 1) {
      wx.navigateTo({
        url: './choice/choice?coursewareId=' + this.data.coursewareId  + '&_id=' + this.data._id + '&tid=' + tid,
      })
    } else if (typeId == 2) {
      wx.navigateTo({
        url: './judge/judge?tid=' + tid + '&_id=' + this.data._id + '&coursewareId=' + this.data.coursewareId,
      })
    } else if (typeId == 3) {
      wx.navigateTo({
        url: './shortAnswer/shortAnswer?tid=' + tid + '&_id=' + this.data._id + '&coursewareId=' + this.data.coursewareId,
      })
    }
  },

  /**
   * 点击题目的上移选项
   */
  uptitle: function (e) {
    const tid = e.currentTarget.dataset.tid
    if (tid == 1) {
      wx.showToast({
        title: '第一题不能再上移了',
        icon: 'none'
      })
      return
    }
    const titles = this.data.titles
    titles[tid - 1].tid = tid - 1
    titles[tid - 2].tid = tid
    const t = titles[tid - 1]
    titles[tid - 1] = titles[tid - 2]
    titles[tid - 2] = t
    db.collection('problem_list').doc(this.data._id).update({
      data: {
        titles: titles
      }
    }).then(res => {
      this.setData({
        titles: titles
      })
      console.log('上移成功')
    }).catch(e => console.log(e))
  },

  /**
   * 点击题目的下移选项
   */
  downtitle: function (e) {
    const tid = e.currentTarget.dataset.tid
    const titles = this.data.titles
    if (tid == titles.length) {
      wx.showToast({
        title: '最后一题不能下移了',
        icon: 'none'
      })
      return
    }
    titles[tid - 1].tid = tid + 1
    titles[tid].tid = tid
    const t = titles[tid - 1]
    titles[tid - 1] = titles[tid]
    titles[tid] = t

    db.collection('problem_list').doc(this.data._id).update({
      data: {
        titles: titles
      },
      success: res => {
        this.setData({
          titles: titles
        })
        console.log("下移成功")
      },
      fail: console.error
    })
  },

  /**
   * 点击题目的删除选项
   */
  deletetitle: function (e) {
    wx.showModal({
      title: '系统提示',
      content: '是否确认删除此题',
      success: res => {
        if (res.cancel) { } else {
          const titles = this.data.titles
          const tid = e.currentTarget.dataset.tid
          titles.splice(tid - 1, 1)
          for (let j = tid; j <= titles.length; j++) {
            titles[j - 1].tid = j
          }
          db.collection('problem_list').doc(this.data._id).update({
            data: {
              titles: titles
            }
          }).then(res => {
            this.setData({
              titles: titles
            })
            console.log('删除成功:', res)
          }).catch(console.error)
        }
      }
    })
  },

  /**
   * 推送问题
   */
  onPublish: function (e) {
    const isPublished = this.data.problem.isPublished
    if (isPublished == false) {
      wx.showModal({
        title: '系统提示',
        content: '是否确认推送该问题',
        success: res => {
          if (res.cancel) { } else {
            db.collection('problem_list').doc(this.data._id).update({
              data: {
                isPublished: true
              }
            }).then(res => {
              wx.showToast({
                title: '推送成功',
              })
              this.setData({
                ['problem.isPublished']: true
              })
            }).catch(console.error)
          }
        }
      })
    } else {
      wx.showModal({
        title: '系统提示',
        content: '是否确认暂定该问题',
        success: res => {
          if (res.cancel) { } else {
            db.collection('problem_list').doc(this.data._id).update({
              data: {
                isPublished: false
              }
            }).then(res => {
              wx.showToast({
                title: '暂定成功',
              })
              this.setData({
                ['problem.isPublished']: false
              })
            }).catch(console.error)
          }
        }
      })
    }
  },

  /**
   * 保存问题测验
   */
  saveProblem: function () {
    app.globalData.titles = this.data.titles
    db.collection('problem_list').doc(this.data._id).update({
      data: {}
    }).then(res => {
      wx.showToast({
        title: '保存成功',
      })
    }).catch(console.error)

  },

  /**
   * 预览问题测验
   */
  viewProblem: function () {
    wx.showModal({
      title: '系统提示',
      content: '预览前请先保存，如果已保存，请点确定',
      success: res => {
        if (res.cancel) { } else {
          wx.navigateTo({
            url: '',//!!!
          })
        }
      }
    })
  },

  /**
   * 删除问题测验
   */
  deleteProblem: function () {
    wx.showModal({
      title: '系统提示',
      content: '确认删除该问题测验吗',
      success: res => {
        if (res.cancel) { } else {
          db.collection('problem_list').doc(this.data._id)
            .remove().then(res => {
              console.log('删除成功')
              wx.showToast({
                title: '删除成功',
              })
              setTimeout(() => {
                wx.navigateBack({})
              }, 1000)
            }).catch(console.error)
        }
      }
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
    this.getProblem()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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