// pages/myTeaCourse/preview/resultChart/resultChart.js
var wxCharts = require('../../../../utils/wxcharts.js');
const app = getApp()
const db = wx.cloud.database()
var radarChart = null;
var pieChart = null;
let categories = new Array() //存放类别（第几题）的数组
let accuracy
Page({

  /**
   * 页面的初始数据
   */
  data: {
    previewId: 0, //接收的previewId
    preview: [], //预习测验的内容
    showLoading: true,//展示正在加载
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      previewId: options.previewId
    })
    this.getPreview()
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
   * 获取该预习测验的内容，并判断是否为简答题
   */
  getPreview(previewId) {

    db.collection('preview_list').where({
      cid: app.globalData.course.cid,
      previewId: Number(this.data.previewId)
    }).get().then(res => {
      console.log('preview该预习测验内容', res.data[0])
      this.setData({
        preview: res.data[0]
      })
      let i = 0
      // 设置categories题目类型
      for (let title of this.data.preview.titles) {
        if (title.typeId == 3) {
          categories[i] = ('第' + (i + 1) + '题为简答题')
        } else {
          categories[i] = ('第' + (i + 1) + '题')
        }
        i++
      }
      console.log('categories题目类型：', categories)
      this.toAccuracyAndScore() //比较正确答案和学生填写结果,存储到数组中
    }).catch(console.error)
  },
  /**
   * 通过计算，将结果转换成正确率和分数的形式
   */
  toAccuracyAndScore() {
    const titlesLength = this.data.preview.titles.length //测验题目的长度
    const resultPerAuthor = this.data.preview.resultPerAuthor //存放每个人测验结果的列表
    accuracy = new Array(titlesLength) //存放每一题正确率的数组,并设置其长度
    for (let i = 0; i < titlesLength; i++) //设置初始正确人数为0
      accuracy[i] = 0

    for (let i = 0; i < resultPerAuthor.length; i++) {
      let j = 0
      for (let value of resultPerAuthor[i].result) {
        if (value == true) accuracy[j]++;
        j++
      }
    }
    for (let i in accuracy)
      accuracy[i] = (accuracy[i] / resultPerAuthor.length).toFixed(2)
    console.log('accuracy[]各题的正确率：', accuracy)

    //用于制成成绩分布表的数组，每个分数有多少人
    let scoreSeries = new Array(titlesLength)
    for (let i = 0; i <= titlesLength; i++) {
      let info = {
        name: i + '分',
        data: 0
      }
      scoreSeries[i] = info
    }
    for (let item of resultPerAuthor) {
      for (let index = 0; index <= titlesLength; index++) {
        if (item.score == index) {
          scoreSeries[index].data++;
          break
        }
      }
    }
    console.log('scoreSeries[]成绩分布情况', scoreSeries)
    setTimeout(() => {
      this.setData({
        showLoading: false
      })
      this.tabulateToRadar(accuracy) //转换成正确率表格
      this.tabulateToPie(scoreSeries) //转换成成绩分布表
    }, 1000)
  },

  /**
   * 将正确率形式的测验结果制作成表格
   */
  tabulateToRadar(accuracy) {
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    radarChart = new wxCharts({
      canvasId: 'radarCanvas',
      type: 'radar',
      categories: categories,
      series: [{
        name: '正确率',
        data: accuracy
      }],
      width: windowWidth,
      height: 300,
      extra: {
        radar: {
          max: 1
        }
      }
    });
  },
  /**
   * 将成绩分布形式的测验结果制作成表格
   */
  tabulateToPie(scoreSeries) {
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    pieChart = new wxCharts({
      animation: true,
      canvasId: 'pieCanvas',
      type: 'pie',
      series: scoreSeries,
      width: windowWidth,
      height: 300,
      dataLabel: true,
    });
  },
  /**
   * 点击图表输出什么东西
   */
  toastAccuracy: function(e) {
    const index = radarChart.getCurrentDataIndex(e)
    if (index < 0) return
    let percent = accuracy[index] * 100
    wx.showToast({
      title: '第' + (index + 1) + '题正确率为' + String(percent) + '%',
      icon: 'none'
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