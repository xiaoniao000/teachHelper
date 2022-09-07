// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: "release-1e7223",
  traceUser: true
})
const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  return await db.collection("courses_list").add({
    data: {
      cid: event.cid,
      courseName: event.cName,
      className: event.className,
      teacherName: event.userInfo.nickName,
      _openid: wxContext.OPENID,
      student: [],
      signList: [],
      openSign: false,
      address: null,
      createTime: db.serverDate()
    }
  })
}