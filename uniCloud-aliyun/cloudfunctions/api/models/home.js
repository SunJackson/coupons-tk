const db = uniCloud.database();


var home = {
    tabs: () => {
		let tabs = db.collection('tabs').where({isuse: true}).orderBy("index", "desc").get();
		return tabs
	}
}

module.exports = home;
