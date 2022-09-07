module.exports = {
  // host: 'app.dimanche.net.cn',
 
  host: 'testshop.taoke93.com',
  request(options) {
    let url = options.url;
    if (url && url.indexOf('http') != 0) {
      url = 'https://' + this.host + url;
    }
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data : options.data,
        method : options.method,
        header: Object.assign({ 'content-type': 'application/json' }, options.header || {}),
        success:function(res){
          //取出stat，翻译
          resolve(res.data);
        },  
        fail:function(err){
          resolve({stat:'networkError', message:JSON.stringify(err)});
        }
      })
    });
  },

  post(options) {
    options.method = 'POST';
    return this.request(options);
  },

  get(options) {
    options.method = 'GET';
    return this.request(options);
  }
}