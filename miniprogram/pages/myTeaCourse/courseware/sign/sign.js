// pages/myTeaCourse/courseware/sign/sign.js
const app = getApp();
const db = wx.cloud.database()
let wechat = require("../../../../libs/wechat.js");
let util = require("../../../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cid: 0, //课程id
    _id: '', //课程的_id
    openSign: false, //签到功能是否开启
    address: '', //获取的地址
    location: {}, //获取的经纬度
    signList: [], //学生签到列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      cid: options.cid
    })
    this.getSignList()
  },

  /**
   * 开启签到
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
    } else {
      this.closeSign()
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
        console.log("当前地址", d.data.result.address);
        this.setData({
          address: d.data.result.address,
        })
        this.openSign()
      })
      .catch(e => {
        console.log(e);
      })
  },

  /**
   * 打开数据库的签到开关
   */
  openSign() {
    db.collection("courses_list").doc(this.data_id).update({
        data: {
          openSign: true,
          address: this.data.address
        }
      }).then(() => {
        console.log("签到开启成功")
        this.setData({
          openSign: true
        })
        this.getSignList()
      })
      .catch(error => console.error)
  },

  /**
   * 关闭数据库的签到开关
   */
  closeSign() {
    db.collection("courses_list").doc(this.data_id).update({
        data: {
          openSign: false,
        }
      }).then(() => {
        console.log("签到关闭成功")
        this.setData({
          openSign: false
        })
      })
      .catch(error => console.error)
  },

  /**
   * 获取签到学生列表和签到开关状态
   */
  getSignList() {
    db.collection('courses_list').where({
        cid: Number(this.data.cid)
      }).get()
      .then(res => {
        console.log("课程信息：", res)
        const _id = res.data[0]._id
        const signList = res.data[0].signList
        for (let i = 0; i < signList.length; i++) {
          signList[i].signTime = util.getDateDiff(signList[i].signTime)
        }
        this.setData({
          _id: _id,
          signList: signList,
          openSign: res.data[0].openSign,
          address: res.data[0].address
        })
      })
      .catch(e => console.log(e))
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