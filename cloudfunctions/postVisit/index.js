// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: "release-1e7223",
  traceUser: true
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async(event, context) => {
  return await db.collection("post_list").doc(event._id).update({
    data: {
      visitCount: event.visitCount + 1,
      visitors: _.push(event.visitId)
    }
  }).then(res => {
    console.log('浏览量+1', res)
  }).catch(console.error)
}