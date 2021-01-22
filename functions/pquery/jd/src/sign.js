const md5 = require('md5')

module.exports = (obj = {}, app_key = '', app_secret = '') => {
  const list = []
  if (typeof obj['app_key'] === 'undefined') {
    obj['app_key'] = app_key
  }
  Object.keys(obj)
    .sort()
    .forEach(key => {
      const value = obj[key]
      if (key !== 'access_token' || (typeof value === 'string' && value.length > 0)) {
        list.push(`${key}${typeof value === 'object' ? JSON.stringify(value) : value}`)
      }
    })
  const signStr = `${app_secret}${list.join('')}${app_secret}`
  return md5(signStr)
    .toUpperCase()
}
