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
  await db.collection('courses_list').doc(event._id).update({
    data: {
      'student': _.push(event.author)
    }
  }).then(res => {
    console.log('courses_list数据库修改成功')
  }).catch(console.error)

  return await db.collection('my_lis_course').add({
    data: {
      cid: Number(event.cid),
      author: event.author,
      createTime: db.serverDate(),
      courseName: event.cName,
      className: event.className,
      stuNum: event.stuNum + 1,
      _openid: event.author.openId
    }
  }).then(res => {
    console.log('加入课程成功', res)
  }).catch(console.error)
}