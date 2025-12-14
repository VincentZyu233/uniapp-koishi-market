<template>
	<view class="outout">
		
<!-- 		<view class="debug">
			[debug]ref vars: <br>
			x={{props.x}}, y={{props.y}} <br>
			idxIndicatorStyle={{idxIndicatorStyle}}
		</view> -->
		
		<view :class="[ 'idxIndicator', idxIndicatorStyle ]">
			<!-- {{idxIndicatorStyle}} -->
		</view>
		
		<view class="left">
			<!-- Left Content -->
			<view class="leftBar">
				<view class="circle" @click="toUrl('/pages/banner/banner')">
					<image src="../../static/logo.png" mode="aspectFill"></image>
				</view>
				<view class="icon icon1" @click="toUrl('/pages/index/index')">
				    <text class="line1">跑酷</text>
				    <text class="line2">Scoreboard</text>
				</view>
				<view class="icon icon2" @click="toUrl('/pages/authme/authme')">
				<!-- <navigator class="icon icon2" url="/pages/works/works" open-type="reLaunch"> -->
				    <text class="line1">玩家</text>
				    <text class="line2">Authme.db</text>
				</view>
				<view class="icon icon3" @click="toUrl('/pages/mark-guide/mark-guide')">
				    <text class="line1">指南</text>
				    <text class="line2">Markdown</text>
				</view>
				<view class="icon icon4" @click="toUrl('/pages/server-status/server-status')">
				    <text class="line1">服务器</text>
				    <text class="line2">Status</text>
				</view>
			</view>
		</view>
		<view class="right">
			<!-- Right Content -->
			<view class="rightButton" @click="toUrl('/pages/under-construction/under-construction')">
			    <uni-icons type="person" size="24"></uni-icons>
			    <text>??</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { defineProps, ref, onMounted } from "vue";
	import { onLoad, onReady, onShow, onHide, onUnload, onPageScroll } from "@dcloudio/uni-app";
	import { getCurrentIdx } from "@/utils/page.js"
		
	const props = defineProps( {
		x:{
			type: Number,
			default: 0
		},
		y:{
			type: Number,
			default: 0
		}
	} );
	
	const idxIndicatorStyle = ref('');

	onLoad((event) => {
		const paramLastIdx = event.LastIdx ? event.LastIdx : 0;
		console.log("getLastIdx(): get param LastIdx from url: ", paramLastIdx );
		// idxIndicatorStyle.value = `idxIndicator${Number( paramLastIdx )}`
		
		idxIndicatorStyle.value = `idxIndicator${Number( props.x )}`
		setTimeout(() => {
		  idxIndicatorStyle.value = `idxIndicator${props.y}`
		}, 111);
	});

	const toUrl=(url)=>{
		const CurrentIdx = getCurrentIdx();
		uni.reLaunch({
			url:`${url}?LastIdx=${CurrentIdx}`
		})
		console.log("to url:", url);
	}
	
</script>

<style lang="scss">
.outout {
	// border: 1px solid red;
	background-color: rgba(0,0,0,0);
	display: flex;
	width: 100vw;
	
	.debug{
		z-index: 1919810;
		position: absolute;
		transform: translateY(-100px);
		top: 0; left: 0;
	}

	.idxIndicator{
		z-index: 114514;
		position: absolute;
		bottom: 5px;
		height: 6rpx;
		width: 60rpx;
		background-color: rgba(43, 108, 248, 0.808);
		box-shadow: 0px -5px 15px 5px rgba(63, 60, 241, 0.4);
		
		transition: all 0.222s ease-out;
	}
	
	.idxIndicator.idxIndicator0{
		left: 52rpx;
		// transform: translateX(5px); /* 向下平移10px */
		
		transition: all 0.222s ease-out;
	}
	
	.idxIndicator.idxIndicator1{
		left: 150rpx;
		// transform: translateX(10px); /* 向下平移10px */
		
		transition: all 0.222s ease-out;
	}
	
	.idxIndicator.idxIndicator2{
		left: 258rpx; 
		// transform: translateX(15px); /* 向下平移10px */
		
		transition: all 0.222s ease-out;
	}
	
	.idxIndicator.idxIndicator3{
		left: 361rpx; 
		// transform: translateX(20px); /* 向下平移10px */
		
		transition: all 0.222s ease-out;
	}
	
	.idxIndicator.idxIndicator4{
		left: 463rpx; 
		// transform: translateX(25px); /* 向下平移10px */
		
		transition: all 0.222s ease-out;
	}
	
	.idxIndicator.idxIndicator5{
		left: 610rpx;
		// transform: translateX(25px); /* 向下平移10px */
		
		transition: all 0.222s ease-out;
	}
	
	
	

	.left {
		// border: 1px solid red;
		height: 100rpx;
		width: 600rpx;
		padding: 0 0 10rpx 25rpx;
		.leftBar{
			box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.4); /* 水平偏移量 垂直偏移量 模糊半径 阴影颜色 */
			height: 100rpx;
			// border: 1px solid red;
			min-width: 20px;
			background-color: rgba(250,250,250,0.5);
			backdrop-filter: blur(5px);
			
			border-radius: 40rpx;
			
			display: flex;
			align-items: center;
			padding: 0 20rpx; /* 给左右留一些内边距 */
			
			.circle {
			    width: 77rpx;
			    height: 77rpx;
				margin-right: 10rpx; /* 给圆和图标间留一些空间 */
			    background-color: white;
				box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2); /* 水平偏移量 垂直偏移量 模糊半径 阴影颜色 */				
			    border-radius: 33%;
				overflow: hidden;
				
			    display: flex;
			    align-items: center;
			    justify-content: center;
				image{
					height: 100%;
					width: 100%;
				}
			}
			
			.icon {
				// border: 1px solid orange;
			    flex: 1; /* 使每个图标平分剩余的宽度 */
			    display: flex;
				flex-direction: column;
			    align-items: center;
			    justify-content: center;
			    text-align: center; /* 确保文本居中 */
			    height: 100%; /* 根据需要调整高度 */
			    // width: 60px; /* 根据需要调整宽度 */
			    // border: 1px solid red;
			    background-color: rgba(0, 0, 0, 0);
			    padding: -1px; /* 给内部元素留出一些空间 */
				margin: -5px;
			    // margin-right: 10px; /* 如果需要与其他元素之间留空间 */
				
				.line1 {
					position: absolute;
					bottom: 45rpx;
				    font-size: 30rpx; /* 调整文字大小 */
				    color: black; /* 黑色文字 */
					white-space: nowrap; /* 文本不换行 */
				}
				
				.line2 {
					position: absolute;
					bottom: 23rpx;
				    font-size: 15rpx; /* 调整文字大小 */
				    color: darkblue; /* 灰色文字 */
					opacity: 0.77;
					white-space: nowrap; /* 文本不换行 */
				}
			}

		}
		
	}
	
	.right {
		// border: 1px solid red;
		height: 100rpx;
		width: 150rpx;
		padding: 0 25rpx 10rpx 25rpx;
		
		.rightButton {
			// border: 1px solid red;
			box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.4); /* 水平偏移量 垂直偏移量 模糊半径 阴影颜色 */
		    display: flex;
		    flex-direction: column;
		    align-items: center;
		    justify-content: center;
		    height: 100rpx; /* 适当增加高度以适应上下布局 */
		    width: 100rpx;  /* 设置宽度 */
			background-color: rgba(250,250,250,0.5);
			backdrop-filter: blur(5px);
		    border-radius: 40rpx;
		    // padding: 5px; /* 给内部元素留一些空间 */
			uni-icons {
			    font-size: 10px; /* 设置图标大小 */
			    margin-bottom: 2px; /* 给图标和文字之间留一些空间 */
			}
			text {
			    font-size: 20px; /* 设置文字大小 */
			}
		}

	}
}


</style>
