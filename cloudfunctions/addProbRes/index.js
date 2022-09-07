// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: "release-1e7223",
  traceUser: true
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection('problem_list').doc(event._id).update({
    data: {
      resultPerAuthor: _.push(event.resultPerAuthor)
    }
  }).then(res => {
    console.log('添加问题的结果成功', res)
    return res
  })
    .catch(console.error)
}