const app = getApp();
const db = wx.cloud.database()
const _ = db.command
let wechat = require("../../../../libs/wechat.js");
let util = require("../../../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cid: 0, //课程id
    _id: '', //课程的_id，用于查数据库
    openSign: false, //签到功能是否开启
    tAddress: '', //教师的地址
    sAddress: '', //学生的地址
    location: {}, //获取的经纬度
    course: {}, //该门课程信息
    signList: [] //学生签到列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      cid: options.cid
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.getSignList()
  },

  /**
   * 获取签到学生列表以及其他信息(签到的学生不用再次签到)
   */
  getSignList() {
    db.collection('courses_list').where({
        cid: Number(this.data.cid)
      }).get()
      .then(res => {
        console.log('course:', res)
        const signList = res.data[0].signList
        this.setData({
          signList: signList,
          tAddress: res.data[0].address,
          _id: res.data[0]._id
        })
        for (let i = 0; i < signList.length; i++) {
          signList[i].signTime = util.getDateDiff(signList[i].signTime)
          if (signList[i].author.openid == app.globalData.userInfo.openid) {
            this.setData({
              openSign: true,
              sAddress: signList[i].sAddress
            })
          }
        }
        this.setData({
          signList:signList
        })
        console.log(this.data.signList)
      })
      .catch(error => console.error)
  },

  /**
   * 点击签到
   */
  onSign: function(e) {
    if (this.data.openSign == false) {
      wx.showLoading({
        title: '正在获取当前位置',
        mask: true
      })
      let mapCtx = wx.createMapContext('myMap');
      setTimeout(() => {
        mapCtx.moveToLocation();
      }, 1000);
      setTimeout(() => {
        wx.hideLoading()
        this.getAddress(mapCtx);
      }, 2000);
    }else{
      wx.showToast({
        title: '已经签到了哦',
      })
    }
  },

  /**
   * 获取地理位置
   */
  getAddress(mapCtx) {
    wechat.getCenterLocation(mapCtx)
      .then(d => {
        let {
          latitude,
          longitude
        } = d;
        this.setData({})
        console.log("当前位置纬度", latitude, "当前位置经度", longitude);
        let url = `https://apis.map.qq.com/ws/geocoder/v1/`;
        let key = 'C2HBZ-7GZKQ-ROL5D-GB5OD-4X54Q-QYBN3';
        let params = {
          location: latitude + "," + longitude,
          key
        }
        return wechat.request(url, params);
      })
      .then(d => {
        console.log(d);
        const sAddress = d.data.result.address
        console.log("当前地址", sAddress);
        this.setData({
          sAddress: sAddress
        })
        if (sAddress == this.data.tAddress) {
          // 添加记录到数据库
          this.updateSignList()
        } else {
          wx.showModal({
            title: '签到失败',
            content: '是不是未赶到教室上课呀',
          })
        }

      })
      .catch(e => {
        console.log(e);
      })
  },

  /**
   * 添加学生记录到数据库
   */
  updateSignList() {
    const signStatus = {
      author: app.globalData.userInfo,
      signTime: new Date(),
      sAddress: this.data.sAddress
    }
    db.collection("courses_list").doc(this.data._id).update({
        data: {
          signList: _.push(signStatus),
        }
      }).then(() => {
        console.log("签到成功")
        this.getSignList()
        wx.showToast({
          title: '签到成功',
        })
        this.setData({
          openSign:true
        })
      })
      .catch(error => console.error)
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