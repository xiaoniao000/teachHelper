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
  const wxContext = cloud.getWXContext()
  let reply = event.reply
  reply['createTime'] = db.serverDate()
  return await db.collection('post_list').doc(event._id).update({
      data: {
        replies: _.push(reply),
        replyCount: event.replyCount
      },
    }).then(res => {
      console.log('添加回复成功', res)
    })
    .catch(console.error)

}