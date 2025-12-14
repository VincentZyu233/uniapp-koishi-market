<script>
	export default {
		onLaunch: function() {
			// QQ小程序的分享设置
			// 在每个页面的onLoad函数添加代码：
			// #ifdef MP-QQ
			// qq.showShareMenu({
			// 	showShareItems: ['qq', 'qzone', 'wechatFriends', 'wechatMoment']
			// });
			// console.log("set qq.showShareMenu in App.vue");
			// #endif
			console.log('App Launch，20250524')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */

</style>
