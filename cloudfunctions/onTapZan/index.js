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
  console.log(event)
  return await db.collection('post_list').doc(event._id).update({
    data: {
      zanCount: event.zanCount,
      ups: _.push(event.ups_openid)
    }
  }).then(res => {
    console.log(res)
  }).catch(console.error)
}