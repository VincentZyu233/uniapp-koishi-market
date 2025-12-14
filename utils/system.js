export const SYSTEM_INFO = uni.getSystemInfoSync();

export const getStatusBarHeight = ()=>{
	const res = (SYSTEM_INFO.statusBarHeight) || 0;
	// console.log("getStatusBarHeight = ", res);
	return res;
}

export const getTitleBarHeight = ()=>{
	let res;
	if ( uni.getMenuButtonBoundingClientRect ){
		// console.log( "uni.getMenuButtonBoundingClientRect = " );
		// console.log( uni.getMenuButtonBoundingClientRect() ); 
		let {top,height} = uni.getMenuButtonBoundingClientRect();
		// console.log("top, height: ", top, height);
		res = height + 2*(top - getStatusBarHeight());
	} else {
		res = 60;
	}
	
	// console.log( "res in title bar height: ", res );
	return res;
}

export const getNavBarHeight = ()=>{
	return getStatusBarHeight() + getTitleBarHeight();
}

//抖音小程序适配
// export const getLeftIcon = ()=>{
// 	if (tt.getCustomButtonBoundingClientRect){
// 		console.log( tt.getCustomButtonBoundingClientRect() );
// 		let { leftIcon:{left,width} } = tt.getCustomButtonBoundingClientRect();
// 		return left + parseInt(width) + 5;
// 	} else {
// 		return 0;
// 	}
// }
export const getLeftIcon = ()=>{
	// #ifdef MP-TOUTIAO
		let { leftIcon:{left,width} } = tt.getCustomButtonBoundingClientRect();
		return left + parseInt(width) + 5;
	// #endif
	
	// #ifndef MP-TOUTIAO
		return 0;
	// #endif
}

export const RpxToPx = (RpxValue)=>{
	return RpxValue * uni.getWindowInfo().windowWidth / 750;
}