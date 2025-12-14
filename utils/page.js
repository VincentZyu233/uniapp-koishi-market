import exp from "constants";

const mapping_Pagename_X = {
	"banner": 0,
	"index": 1,
	"authme": 2,
	"mark-guide": 3,
	"server-status": 4,
	"under-construction": 5
}

export const getCurrentIdx = ()=>{
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	const url = currentPage.route;
	console.log('Current URL:', url);
	
	const urlParts = url.split('/');
	const fileName = urlParts[urlParts.length - 1];
	console.log('Current file name:', fileName);
	
	return mapping_Pagename_X[fileName];
}

export const toUrl=(url)=>{
	const CurrentIdx = getCurrentIdx();
	uni.reLaunch({
		url:`${url}?LastIdx=${CurrentIdx}`
	})
	console.log("to url:", url);
}