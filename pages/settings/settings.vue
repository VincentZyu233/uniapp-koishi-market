<template>
	<view class="settings-page" :class="{ 'dark-mode': isDarkMode }" :style="{ paddingTop: statusBarOffset + 'px' }">
		<view class="settings-header">
			<text class="header-title">⚙️ 设置</text>
			<view class="theme-toggle" @click="toggleTheme">
				<text>{{ isDarkMode ? '🌙' : '☀️' }}</text>
			</view>
		</view>
		
		<view class="settings-content">
			<!-- 插件市场源设置 -->
			<view class="setting-section">
				<view class="section-title">
					<text class="title-icon">🌐</text>
					<text class="title-text">插件市场数据源</text>
				</view>
				
			<!-- 预设源选择 -->
			<view class="setting-item">
				<text class="item-label">选择预设源</text>
				<picker 
					mode="selector" 
					:value="selectedPresetIndex" 
					:range="presetSources" 
					range-key="name"
					@change="onPresetChange"
					class="preset-picker"
				>
					<view class="picker-view-enhanced">
						<view class="picker-main">
							<text class="picker-name">{{ presetSources[selectedPresetIndex].name }}</text>
							<text class="picker-description">{{ presetSources[selectedPresetIndex].description }}</text>
							<text class="picker-url">{{ presetSources[selectedPresetIndex].url || '请在下方输入' }}</text>
						</view>
						<text class="picker-arrow">▼</text>
					</view>
				</picker>
			</view>				<!-- 自定义URL -->
			<view class="setting-item">
				<text class="item-label">自定义源地址</text>
				<textarea 
					class="custom-input" 
					v-model="customEndpoint" 
					placeholder="输入自定义 API 端点"
					@blur="onCustomEndpointChange"
					:disabled="selectedPresetIndex !== presetSources.length - 1"
					auto-height
				/>
				<text v-if="selectedPresetIndex !== presetSources.length - 1" class="input-hint">请先选择"自定义"选项</text>
			</view>
			
				<!-- 当前使用的URL -->
				<view class="setting-item info-item">
					<text class="item-label">当前源地址</text>
					<text class="current-url">{{ currentEndpoint }}</text>
				</view>
				
				<!-- 源信息说明 -->
				<view class="source-info">
					<view class="info-row">
						<text class="info-label">地区：</text>
						<text class="info-value">{{ presetSources[selectedPresetIndex].region }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">说明：</text>
						<text class="info-value">{{ presetSources[selectedPresetIndex].description }}</text>
					</view>
				</view>
			</view>
			
			<!-- 测试连接按钮 -->
			<view class="action-section">
				<button class="test-btn" @click="testConnection" :disabled="isTesting">
					<text>{{ isTesting ? '测试中...' : '🔍 测试连接' }}</text>
				</button>
				<button class="reset-btn" @click="resetToDefault">
					<text>🔄 恢复默认</text>
				</button>
			</view>
			
			<!-- 测试结果 -->
			<view v-if="testResult" class="test-result" :class="testResult.success ? 'success' : 'error'">
				<text class="result-icon">{{ testResult.success ? '✅' : '❌' }}</text>
				<text class="result-text">{{ testResult.message }}</text>
			</view>
			
			<!-- 返回按钮 -->
			<view class="back-section">
				<button class="back-btn" @click="goBack">
					<text>← 返回插件市场</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { DEFAULT_MARKET_SEARCH_ENDPOINT, fetchMarketData } from '../../utils/request.js'
// #ifdef MP-WEIXIN || MP-QQ
import { getStatusBarHeight } from '@/utils/system.js'
// #endif

// 主题模式
const isDarkMode = ref(true)
const statusBarOffset = ref(0)

// 预设源列表
const presetSources = ref([
	{
		name: 'VincentZyu FastAPI代理（推荐）',
		url: 'https://sh-aliyun2.vincentzyu233.cn/koishi-market-proxy/market',
		region: '全球',
		description: '自建 FastAPI 代理源，解决跨域问题'
	},
	{
		name: 'NyanZone',
		url: 'https://registry.nyan.zone/k/market/index.json',
		region: '全球',
		description: '官方推荐源，速度快且稳定'
	},
	{
		name: '上学聚合源(大陆推荐)',
		url: 'https://cdn.jsdmirror.com/gh/shangxueink/koishi-registry-aggregator@gh-pages/market.json',
		region: '全球',
		description: '聚合多个源的数据，插件最全'
	},
	{
		name: 't4wefan（大陆）',
		url: 'https://registry.koishi.t4wefan.pub/index.json',
		region: '中国大陆',
		description: '大陆镜像源，国内访问速度快'
	},
	{
		name: 'Lipraty（大陆）',
		url: 'https://koi.nyan.zone/registry/index.json',
		region: '中国大陆',
		description: '大陆镜像源，备选方案'
	},
	{
		name: 'itzdrli（全球）',
		url: 'https://kp.itzdrli.cc',
		region: '全球',
		description: '全球CDN源'
	},
	{
		name: 'Q78KG（全球）',
		url: 'https://koishi-registry.yumetsuki.moe/index.json',
		region: '全球',
		description: '社区维护源'
	},
	{
		name: 'Koishi官方（全球）',
		url: 'https://registry.koishi.chat/index.json',
		region: '全球',
		description: 'Koishi 官方源'
	},
	{
		name: '神秘社区源-miao',
		url: 'http://miao-qinghuitou.vincentzyu233.cn:5140/storeluna/index.json',
		region: '社区',
		description: '神秘社区维护的特殊源'
	},
	{
		name: '自定义',
		url: '',
		region: '自定义',
		description: '使用下方自定义地址'
	}
])

// 当前选择的预设索引
const selectedPresetIndex = ref(0)
// 自定义端点
const customEndpoint = ref('')
// 测试状态
const isTesting = ref(false)
// 测试结果
const testResult = ref(null)

// 当前端点（计算属性）
const currentEndpoint = computed(() => {
	if (selectedPresetIndex.value === presetSources.value.length - 1) {
		// 选择了"自定义"
		return customEndpoint.value || DEFAULT_MARKET_SEARCH_ENDPOINT
	}
	return presetSources.value[selectedPresetIndex.value].url
})

// 加载保存的设置
onMounted(() => {
	// 小程序状态栏适配
	// #ifdef MP-WEIXIN || MP-QQ
	const statusBarHeight = getStatusBarHeight()
	statusBarOffset.value = statusBarHeight + 10
	console.log('状态栏高度:', statusBarHeight, 'px，偏移量:', statusBarOffset.value, 'px')
	// #endif
	
	// 加载主题
	const savedTheme = uni.getStorageSync('theme')
	if (savedTheme) {
		isDarkMode.value = savedTheme === 'dark'
	}
	
	// 加载端点设置
	const savedEndpoint = uni.getStorageSync('market_endpoint')
	const savedPresetIndex = uni.getStorageSync('market_preset_index')
	
	if (savedPresetIndex !== null && savedPresetIndex !== undefined) {
		selectedPresetIndex.value = savedPresetIndex
	}
	
	if (savedEndpoint) {
		customEndpoint.value = savedEndpoint
	}
})

// 切换主题
const toggleTheme = () => {
	isDarkMode.value = !isDarkMode.value
	uni.setStorageSync('theme', isDarkMode.value ? 'dark' : 'light')
}

// 预设源变化
const onPresetChange = (e) => {
	selectedPresetIndex.value = e.detail.value
	uni.setStorageSync('market_preset_index', selectedPresetIndex.value)
	
	// 如果不是自定义，保存预设URL
	if (selectedPresetIndex.value !== presetSources.value.length - 1) {
		const selectedUrl = presetSources.value[selectedPresetIndex.value].url
		uni.setStorageSync('market_endpoint', selectedUrl)
	}
	
	testResult.value = null
	
	uni.showToast({
		title: '已切换数据源',
		icon: 'success'
	})
}

// 自定义端点变化
const onCustomEndpointChange = () => {
	if (customEndpoint.value.trim()) {
		selectedPresetIndex.value = presetSources.value.length - 1 // 切换到"自定义"
		uni.setStorageSync('market_preset_index', selectedPresetIndex.value)
		uni.setStorageSync('market_endpoint', customEndpoint.value)
		testResult.value = null
		
		uni.showToast({
			title: '已保存自定义源',
			icon: 'success'
		})
	}
}

// 测试连接
const testConnection = async () => {
	if (!currentEndpoint.value) {
		uni.showToast({
			title: '请先设置数据源',
			icon: 'none'
		})
		return
	}
	
	isTesting.value = true
	testResult.value = null
	
	try {
		const startTime = Date.now()
		const data = await fetchMarketData({
			endpoint: currentEndpoint.value,
			isConsoleOutput: false,
			isShowToast: false
		})
		const endTime = Date.now()
		const duration = endTime - startTime
		
		testResult.value = {
			success: true,
			message: `连接成功！获取到 ${data.total} 个插件，耗时 ${duration}ms`
		}
	} catch (error) {
		testResult.value = {
			success: false,
			message: `连接失败：${error.message || '网络错误'}`
		}
	} finally {
		isTesting.value = false
	}
}

// 恢复默认设置
const resetToDefault = () => {
	uni.showModal({
		title: '确认恢复',
		content: '确定要恢复到默认数据源吗？',
		success: (res) => {
			if (res.confirm) {
				selectedPresetIndex.value = 0
				customEndpoint.value = ''
				uni.setStorageSync('market_preset_index', 0)
				uni.setStorageSync('market_endpoint', presetSources.value[0].url)
				testResult.value = null
				
				uni.showToast({
					title: '已恢复默认设置',
					icon: 'success'
				})
			}
		}
	})
}

// 返回
const goBack = () => {
	uni.navigateBack()
}
</script>

<style scoped>
.settings-page {
	width: 100vw;
	min-height: 100vh;
	background-color: var(--bg-primary, #ffffff);
	color: var(--text-primary, #1f2328);
	padding: 40rpx 60rpx;
	box-sizing: border-box;
	
	/* 浅色主题变量 */
	--bg-primary: #ffffff;
	--bg-secondary: #f8f8f9;
	--text-primary: #1f2328;
	--text-secondary: #656d76;
	--text-tertiary: #8c959f;
	--border-color: #d0d7de;
	--primary-color: #5546a3;
	--success-color: #1a7f37;
	--danger-color: #d1242f;
}

.settings-page.dark-mode {
	--bg-primary: #0d1117;
	--bg-secondary: #161b22;
	--text-primary: #e6edf3;
	--text-secondary: #8b949e;
	--text-tertiary: #6e7681;
	--border-color: #30363d;
	--primary-color: #7c6bce;
	--success-color: #2ea043;
	--danger-color: #f85149;
}

.settings-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 60rpx;
}

.header-title {
	font-size: 48rpx;
	font-weight: 600;
	color: var(--text-primary);
}

.theme-toggle {
	padding: 16rpx;
	font-size: 48rpx;
	cursor: pointer;
	transition: transform 0.3s;
}

.theme-toggle:active {
	transform: scale(0.9);
}

.settings-content {
	max-width: 1200rpx;
	margin: 0 auto;
}

.setting-section {
	background-color: var(--bg-secondary);
	border-radius: 16rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
	border: 2rpx solid var(--border-color);
}

.section-title {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 40rpx;
	padding-bottom: 24rpx;
	border-bottom: 2rpx solid var(--border-color);
}

.title-icon {
	font-size: 40rpx;
}

.title-text {
	font-size: 36rpx;
	font-weight: 600;
	color: var(--text-primary);
}

.setting-item {
	margin-bottom: 32rpx;
}

.item-label {
	display: block;
	font-size: 28rpx;
	color: var(--text-secondary);
	margin-bottom: 16rpx;
	font-weight: 500;
}

.preset-picker {
	width: 100%;
}

.picker-view-enhanced {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 32rpx;
	background-color: var(--bg-primary);
	border: 2rpx solid var(--border-color);
	border-radius: 12rpx;
	transition: all 0.3s;
	gap: 16rpx;
}

.picker-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	min-width: 0;
}

.picker-name {
	font-size: 32rpx;
	color: var(--text-primary);
	font-weight: 600;
}

.picker-description {
	font-size: 24rpx;
	color: var(--text-secondary);
	line-height: 1.5;
}

.picker-url {
	font-size: 22rpx;
	color: var(--text-tertiary);
	font-family: monospace;
	word-break: break-all;
	line-height: 1.4;
}

.picker-arrow {
	font-size: 24rpx;
	color: var(--text-tertiary);
	flex-shrink: 0;
}

.custom-input {
	width: 100%;
	min-height: 120rpx;
	padding: 24rpx 32rpx;
	background-color: var(--bg-primary);
	border: 2rpx solid var(--border-color);
	border-radius: 12rpx;
	font-size: 28rpx;
	color: var(--text-primary);
	box-sizing: border-box;
	line-height: 1.6;
	transition: all 0.3s;
}

.custom-input[disabled] {
	opacity: 0.5;
	background-color: var(--bg-secondary);
	cursor: not-allowed;
}

.input-hint {
	display: block;
	margin-top: 12rpx;
	font-size: 24rpx;
	color: var(--text-tertiary);
}

.info-item {
	background-color: var(--bg-primary);
	padding: 24rpx 32rpx;
	border-radius: 12rpx;
	border: 2rpx solid var(--border-color);
}

.current-url {
	display: block;
	font-size: 26rpx;
	color: var(--primary-color);
	word-break: break-all;
	margin-top: 8rpx;
	font-family: monospace;
}

.source-info {
	margin-top: 24rpx;
	padding: 24rpx;
	background-color: var(--bg-primary);
	border-radius: 12rpx;
	border: 2rpx solid var(--border-color);
}

.info-row {
	display: flex;
	margin-bottom: 12rpx;
	font-size: 26rpx;
}

.info-row:last-child {
	margin-bottom: 0;
}

.info-label {
	color: var(--text-tertiary);
	min-width: 100rpx;
}

.info-value {
	color: var(--text-secondary);
	flex: 1;
}

.action-section {
	display: flex;
	gap: 24rpx;
	margin-bottom: 32rpx;
}

.test-btn,
.reset-btn {
	flex: 1;
	padding: 28rpx 48rpx;
	border-radius: 12rpx;
	font-size: 32rpx;
	border: none;
	transition: all 0.3s;
}

.test-btn {
	background-color: var(--primary-color);
	color: white;
}

.test-btn:disabled {
	opacity: 0.6;
}

.reset-btn {
	background-color: var(--bg-secondary);
	color: var(--text-primary);
	border: 2rpx solid var(--border-color);
}

.test-result {
	padding: 24rpx 32rpx;
	border-radius: 12rpx;
	margin-bottom: 32rpx;
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.test-result.success {
	background-color: rgba(26, 127, 55, 0.1);
	border: 2rpx solid var(--success-color);
}

.test-result.error {
	background-color: rgba(209, 36, 47, 0.1);
	border: 2rpx solid var(--danger-color);
}

.result-icon {
	font-size: 36rpx;
}

.result-text {
	font-size: 28rpx;
	color: var(--text-primary);
	flex: 1;
}

.back-section {
	margin-top: 60rpx;
}

.back-btn {
	width: 100%;
	padding: 28rpx;
	background-color: var(--bg-secondary);
	color: var(--text-primary);
	border: 2rpx solid var(--border-color);
	border-radius: 12rpx;
	font-size: 32rpx;
}
</style>
