const req = require('request-promise')
const format = require('dateformat')
const sign = require('./sign')

module.exports = async (url = 'https://router.jd.com/api', method, param_json, version = '1.0', access_token = '', app_key = '', app_secret = '') => {
  const qs = {
    method,
    param_json: typeof param_json === 'object' ? JSON.stringify(param_json) : param_json,
    v: version,
    access_token,
    app_key,
    timestamp: format(new Date(), 'yyyy-mm-dd HH:MM:ss'),
    sign_method: 'md5',
    format: 'json'
  }
  qs.sign = sign(qs,
    app_key,
    app_secret)
  return await req({
    uri: url,
    qs,
    json: true
  })
}
