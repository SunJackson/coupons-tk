const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({
    env: cloud.DYNAMIC_CURRENT_ENV
})


exports.main = async (event, context) => {
    let data = await db.collection('home').orderBy('sort', 'asc').get()
    console.log(data)
    let res = data.data
    return {
        menulist: res
    }
}