/**
 * 测试请求函数
 * 在浏览器控制台或 Node.js 环境中运行此文件来测试请求
 */

// 如果在 Node.js 环境中测试，可以使用 fetch
if (typeof fetch === 'undefined') {
	global.fetch = require('node-fetch');
}

const DEFAULT_MARKET_SEARCH_ENDPOINT = 'https://registry.nyan.zone/k/market/index.json';

async function testFetchMarketData() {
	console.log('开始测试 Koishi 市场数据获取...\n');
	
	try {
		console.log('请求 URL:', DEFAULT_MARKET_SEARCH_ENDPOINT);
		
		const response = await fetch(DEFAULT_MARKET_SEARCH_ENDPOINT);
		
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		
		const data = await response.json();
		
		console.log('\n✅ 请求成功！');
		console.log('─────────────────────────────────');
		console.log('镜像源:', data.mirror);
		console.log('强制更新时间:', new Date(data.forceTime).toLocaleString());
		console.log('插件总数:', data.objects?.length || 0);
		
		if (data.objects && data.objects.length > 0) {
			console.log('\n前 5 个插件示例:');
			console.log('─────────────────────────────────');
			
			data.objects.slice(0, 5).forEach((plugin, index) => {
				console.log(`\n[${index + 1}] ${plugin.shortname || plugin.package?.name}`);
				console.log(`   版本: ${plugin.package?.version}`);
				console.log(`   分类: ${plugin.category}`);
				console.log(`   下载: ${plugin.downloads?.lastMonth || 0} 次/月`);
				console.log(`   评分: ${plugin.rating?.toFixed(2) || 'N/A'}`);
				console.log(`   标签: ${[
					plugin.verified && '✓认证',
					plugin.preview && '👁预览',
					plugin.portable && '📦便携',
					plugin.insecure && '⚠不安全'
				].filter(Boolean).join(' ') || '无'}`);
			});
			
			// 统计分类
			const categories = {};
			data.objects.forEach(p => {
				categories[p.category] = (categories[p.category] || 0) + 1;
			});
			
			console.log('\n\n分类统计:');
			console.log('─────────────────────────────────');
			Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
				console.log(`${cat.padEnd(20)} ${count} 个插件`);
			});
			
			// 统计徽章
			const badges = {
				verified: 0,
				preview: 0,
				insecure: 0,
				portable: 0
			};
			
			data.objects.forEach(p => {
				if (p.verified) badges.verified++;
				if (p.manifest?.preview) badges.preview++;
				if (p.insecure) badges.insecure++;
				if (p.portable) badges.portable++;
			});
			
			console.log('\n徽章统计:');
			console.log('─────────────────────────────────');
			console.log(`✓ 官方认证: ${badges.verified} 个`);
			console.log(`👁 预览版本: ${badges.preview} 个`);
			console.log(`⚠ 不安全: ${badges.insecure} 个`);
			console.log(`📦 便携版本: ${badges.portable} 个`);
		}
		
		console.log('\n─────────────────────────────────');
		console.log('✅ 测试完成！数据结构正常\n');
		
		return data;
		
	} catch (error) {
		console.error('\n❌ 测试失败:', error.message);
		console.error('错误详情:', error);
		throw error;
	}
}

// 如果直接运行此文件
if (typeof module !== 'undefined' && require.main === module) {
	testFetchMarketData()
		.then(() => process.exit(0))
		.catch(() => process.exit(1));
}

// 导出供其他模块使用
if (typeof module !== 'undefined') {
	module.exports = { testFetchMarketData };
}
