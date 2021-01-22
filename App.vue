<style lang="scss">
    /*每个页面公共css */
    /* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
    @import "uview-ui/index.scss";
    
</style>
<script>
export default {
	onLaunch: function() {
		console.log('App Launch');
		console.log('App Load');
		const userInfo = uni.getStorageSync('userInfo');
		if(userInfo){
			this.globalData.userInfo = userInfo
		};
	},
	onShow: function() {
		console.log('App Show');
	},
	onHide: function() {
		console.log('App Hide');
	},
	globalData: {
		openid: '',
		userInfo: '',
		shareMessages: []
	},
};
</script>

<style>

</style>
