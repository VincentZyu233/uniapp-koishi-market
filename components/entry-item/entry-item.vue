<template>
	<view class="EntryItem">
		
		<view class="EntryBox">
			
			<image class="EntryImage" :src="ImageSrc" mode="aspectFill"></image>
			<view class="EntryName">
				 <!-- Name: \n {{EntryObj.name}} -->
				 <!-- Score: \n {{EntryObj.score}} -->
				<view class="EntryKey">Name:</view>
				<view class="EntryValue">{{ EntryObj.name }}</view>
				<view class="EntryKey">Score:</view>
				<view class="EntryValue">{{ EntryObj.score }}</view>
			</view>
			<view class="EntryRank">
				{{RankNum}}
			</view>
			
		</view>
		
	</view>
</template>

<script setup>
	import { onLoad, onReady, onShow, onHide, onUnload, onPageScroll } from "@dcloudio/uni-app";
	
	const props = defineProps( {
		EntryObj:{
			type: Object,
			default: {
				name: "请输入姓名",
				score: "请输入分数"
			}
		},
		RankNum:{
			type: String,
			default: "请输入排名"
		},
		ImageSrc:{
			type: String,
			default: "../../static/mc_lucky_block.jpg"
		}
	} );
</script>

<style lang="scss">
	@keyframes zoomIn {
	    from {
	        height: 80%;
	    }
	    to {
	        height: 100%;
	    }
	}
	
	
	
	.EntryItem{
		// border: 2px solid red;
		// max-width: 750rpx;
		
		.EntryBox:hover, .EntryBox:active {
		    transform: scale(1.05);  /* 鼠标悬停时放大 */
		}
		
		.EntryBox{
			transition: transform 0.3s ease-out; /* 添加平滑过渡 */
			border: 1px solid rgba(0,0,0,0.2);
			// border: 2px solid blue;
			box-shadow: 0 4px 8px rgba(5, 5, 1, 0.4); /* 水平偏移量 垂直偏移量 模糊半径 阴影颜色 */
			border-radius: 10rpx;
			overflow: hidden;
			// height: 369rpx;
			height: 180px;
			// width: 360px;
			// width: 90%;
			position: relative;
			
			display: flex; flex-direction:  column; align-items: flex-start;
			
			.EntryImage{
				// border: 2px solid green;
				height: 100%; 
				width: 60%;
				bottom: 0;
				// scale: 1.2;
				// scale: 0.9;
				// width: 60%;
				position: absolute;
			}
			
			.EntryName{
				// border: 1px solid red;
				align-items: flex-start;
				width: 50%; height: 110%;
				padding: 0 0 0 0px;
				position: absolute;
				bottom: -5px; right: -5px;
				background: rgba(0,0,0,0.2);
				color: white;
				display: flex; flex-direction: column; // 纵向排列
				align-items: center; justify-content: center;
				backdrop-filter: blur(25rpx); //磨砂玻璃
				font-weight: 500; font-size: 30rpx;
				
				.EntryKey {
					font-size: 25px; // 加大字体
					font-weight: bold; // 加粗
					margin-top: 10px;
				}
	
				.EntryValue {
					font-size: 18px;
					margin-bottom: 10rpx;
				}
			}
			.EntryRank{
				// border: 1px solid red;
				position: absolute;
				left: 0;
				top: 0;
				background: rgba(250,129,90,0.7);
				backdrop-filter: blur(25rpx);
				color: #fff;
				font-size: 25rpx;
				padding: 5rpx 15rpx;
				border-radius: 0 0 6rpx 0;
				transform: scale(0.8);
				transform-origin: left top;
			}
		}
	}

</style>