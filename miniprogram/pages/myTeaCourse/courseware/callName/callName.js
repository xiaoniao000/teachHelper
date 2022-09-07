// pages/myTeaCourse/courseware/callName/callName.js
const db = wx.cloud.database()
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    parse: true,//是否暂停
    students: [],//头像列表
    tower: [{
      id: 0,
      url: 'https://image.weilanwl.com/img/4x3-1.jpg'
    }, 
    {
      id: 1,
      url: 'https://image.weilanwl.com/img/4x3-2.jpg'
    }, 
    {
      id: 2,
      url: 'https://image.weilanwl.com/img/4x3-3.jpg'
    }, 
    {
      id: 3,
      url: 'https://image.weilanwl.com/img/4x3-4.jpg'
    }, {
      id: 4,
      url: 'https://image.weilanwl.com/img/4x3-2.jpg'
    }, 
    {
      id: 5,
      url: 'https://image.weilanwl.com/img/4x3-4.jpg'
    }, 
    {
      id: 6,
      url: 'https://image.weilanwl.com/img/4x3-2.jpg'
    },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getStudentList()
    // this.towerSwiper()
  },

  /**
   * 获取学生列表
   */
  getStudentList() {
    db.collection('courses_list').where({
      //cid: app.globalData.course.cid
       cid: Number(4)
    }).get()
      .then(res => {
        const students = res.data[0].student
        this.setData({
          students
        })
        this.towerSwiper()
      })
  },

  // 初始化towerSwiper
  towerSwiper() {
    //let list = this.data.students;
     let list = this.data.tower;
    for (let i = 0; i < list.length; i++) {
      list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
      list[i].mLeft = i - parseInt(list.length / 2)
    }
    this.setData({
      //students: list
       tower: list
    })
    // console.log(this.data.tower)
    console.log('students学生列表',this.data.students)
  },

  /**
   * 点击随机点名
   */
  callNameTap: function () {
    this.setData({
      parse: false
    })
    this.callNameStart()
  },

  /**
   * 开始随机点名
   */
  callNameStart: function () {
    if (this.data.parse == true) return
    //递归实现异步调用
    setTimeout(() => {
       let list = this.data.tower
      //let list = this.data.students
      let mLeft = list[0].mLeft;
      let zIndex = list[0].zIndex;
      for (let i = 1; i < list.length; i++) {
        list[i - 1].mLeft = list[i].mLeft
        list[i - 1].zIndex = list[i].zIndex
      }
      list[list.length - 1].mLeft = mLeft;
      list[list.length - 1].zIndex = zIndex;
      this.setData({
         tower: list
        //students: list
      })
      this.callNameStart()
    }, 80);
  },

  /**
   * 暂停随机点名
   */
  callNameStop: function () {
    this.setData({
      parse: true
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