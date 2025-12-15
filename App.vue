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
	
	/* 引入霞鹜文楷等宽字体 - 使用在线字体 */
	@font-face {
		font-family: 'LXGWWenKaiMono';
		src: url('https://gitee.com/vincent-zyu/uniapp-koishi-market/releases/download/fonts/LXGWWenKaiMono-Light.ttf') format('truetype');
		font-weight: 300;
		font-style: normal;
	}
	
	@font-face {
		font-family: 'LXGWWenKaiMono';
		src: url('https://gitee.com/vincent-zyu/uniapp-koishi-market/releases/download/fonts/LXGWWenKaiMono-Regular.ttf') format('truetype');
		font-weight: 400;
		font-style: normal;
	}
	
	@font-face {
		font-family: 'LXGWWenKaiMono';
		src: url('https://gitee.com/vincent-zyu/uniapp-koishi-market/releases/download/fonts/LXGWWenKaiMono-Medium.ttf') format('truetype');
		font-weight: 500;
		font-style: normal;
	}
	
	/* 全局应用字体 */
	page {
		font-family: 'LXGWWenKaiMono', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
	}
	
	/* 确保所有元素继承字体 */
	* {
		font-family: inherit;
	}

</style>
