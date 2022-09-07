const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    homeworkId: null, //第几次作业
    cid: null, //第几次作业对应的课程的id
    _id: '', //第几次作业的_id  用它才能添加题目！！
    name:'',//作业的标题
    titles: [], //题目列表
    onchangetitle: false, //是否点击了某个题目  点击了出现编辑等框框
    homework: [], //作业的内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      homeworkId: Number(options.homeworkId),
      cid: Number(options.cid)
    })
  },

  /**
   * 输入作业标题
   */
  nameChange(e) {
    this.setData({
      name: e.detail.value
    })
  },

  /**
   * 添加选择题
   */
  onChoice() {
    wx.navigateTo({
      url: './choice/choice?homeworkId=' + this.data.homeworkId + '&cid=' + this.data.cid + '&_id=' + this.data._id,
    })
  },

  /**
   * 添加判断题
   */
  onJudge() {
    wx.navigateTo({
      url: './judge/judge?_id=' + this.data._id,
    })
  },

  /**
   * 添加简答题
   */
  onShortAnswer() {
    wx.navigateTo({
      url: './shortAnswer/shortAnswer?_id=' + this.data._id,
    })
  },

  /**
   * 获取homework_id和题目列表
   */
  getHomework() {
    db.collection('homework_list').where({
        homeworkId: Number(this.data.homeworkId),
        cid: Number(this.data.cid),
      }).get()
      .then(res => {
        this.setData({
          _id: res.data[0]._id,
          name:res.data[0].name,
          titles: res.data[0].titles,
          homework: res.data[0]
        })
        console.log('该homework的信息：', this.data.homework)
        app.globalData.titles = res.data[0].titles
      }).catch(e => {
        console.log(e)
      })
  },

  /**
   * 点击出现改变题目的四个选项
   */
  onChangetitle: function(e) {
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
  changetitle: function(e) {
    const tid = e.currentTarget.dataset.tid
    const typeId = e.currentTarget.dataset.typeId
    console.log(typeId)
    if (typeId == 0 || typeId == 1) {
      wx.navigateTo({
        url: './choice/choice?homeworkId=' + this.data.homeworkId + '&cid=' + this.data.cid + '&_id=' + this.data._id + '&tid=' + tid,
      })
    } else if (typeId == 2) {
      wx.navigateTo({
        url: './judge/judge?tid=' + tid + '&_id=' + this.data._id,
      })
    } else if (typeId == 3) {
      wx.navigateTo({
        url: './shortAnswer/shortAnswer?tid=' + tid + '&_id=' + this.data._id,
      })
    }
  },

  /**
   * 点击题目的上移选项
   */
  uptitle: function(e) {
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
    db.collection('homework_list').doc(this.data._id).update({
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
  downtitle: function(e) {
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

    db.collection('homework_list').doc(this.data._id).update({
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
  deletetitle: function(e) {
    wx.showModal({
      title: '系统提示',
      content: '是否确认删除此题',
      success: res => {
        if (res.cancel) {} else {
          const titles = this.data.titles
          const tid = e.currentTarget.dataset.tid
          titles.splice(tid - 1, 1)
          for (let j = tid; j <= titles.length; j++) {
            titles[j - 1].tid = j
          }
          db.collection('homework_list').doc(this.data._id).update({
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
   * 发布作业
   */
  onPublish: function(e) {
    const isPublished = this.data.homework.isPublished
    if (isPublished == false) {
      wx.showModal({
        title: '系统提示',
        content: '是否确认发布该课后作业',
        success: res => {
          if (res.cancel) {} else {
            db.collection('homework_list').doc(this.data._id).update({
              data: {
                isPublished: true
              }
            }).then(res => {
              wx.showToast({
                title: '发布成功',
              })
              this.setData({
                ['homework.isPublished']: true
              })
            }).catch(console.error)
          }
        }
      })
    } else {
      wx.showModal({
        title: '系统提示',
        content: '是否确认暂定该课后作业',
        success: res => {
          if (res.cancel) {} else {
            db.collection('homework_list').doc(this.data._id).update({
              data: {
                isPublished: false
              }
            }).then(res => {
              wx.showToast({
                title: '暂定成功',
              })
              this.setData({
                ['homework.isPublished']: false
              })
            }).catch(console.error)
          }
        }
      })
    }
  },

  /**
   * 保存作业测验
   */
  saveHomework: function() {
    app.globalData.titles = this.data.titles
    db.collection('homework_list').doc(this.data._id).update({
      data:{
        name: this.data.name
      }
    }).then(res=>{
      wx.showToast({
        title: '保存成功',
      })
    }).catch(console.error)
  },

  /**
   * 预览作业测验
   */
  viewHomework: function() {
    wx.showModal({
      title: '系统提示',
      content: '预览前请先保存，如果已保存，请点确定',
      success: res => {
        if (res.cancel) {} else {
          wx.navigateTo({
            url: '/pages/myLisCourse/preview/preview',
          })
        }
      }
    })
  },

  /**
   * 删除作业测验
   */
  deleteHomework: function() {
    wx.showModal({
      title: '系统提示',
      content: '确认删除该作业吗',
      success: res => {
        if (res.cancel) {} else {
          db.collection('homework_list').doc(this.data._id)
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
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getHomework()
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