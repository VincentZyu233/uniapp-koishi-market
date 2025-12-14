<template>
	<view class="market-page" :class="{ 'dark-mode': isDarkMode }">
		<!-- 顶部搜索栏和信息栏 -->
		<view class="top-section">
			<search-header 
				v-model="searchWords"
				@search="handleSearch"
				@clear="handleClearSearch"
			/>
			
		<!-- 市场信息 -->
		<view class="market-info" v-if="marketInfo && marketInfo.total">
			<view class="info-tag">
				<text class="info-icon">🌐</text>
				<text class="info-label">当前源:</text>
				<text class="info-value">{{ currentSourceUrl }}</text>
			</view>
			<view class="info-tag">
				<text class="info-icon">📦</text>
				<text class="info-label">插件总数:</text>
				<text class="info-value">{{ marketInfo.total }}</text>
			</view>
		</view>
		</view>
		
		<!-- 主体内容区域 -->
		<view class="content">
			<!-- 移动端遮罩层 -->
			<view 
				v-if="!sidebarCollapsed" 
				class="sidebar-mask" 
				@click="toggleSidebar"
			></view>
			
			<!-- 侧边分类栏 -->
			<market-sidebar
				:collapsed="sidebarCollapsed"
				:market-info="marketInfo"
				:sort-options="sortOptions"
				:active-sort="activeSort"
				:sort-order="sortOrder"
				:badges="badges"
				:active-badges="activeBadges"
				:categories="categories"
				:active-category="activeCategory"
				@toggle="toggleSidebar"
				@sort-change="toggleSort"
				@badge-change="toggleBadge"
				@category-change="toggleCategory"
			/>
			
		<!-- 插件列表 -->
		<view class="plugin-list" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
			<!-- 操作按钮 -->
			<view class="result-header">
				<view class="header-actions">
					<view class="settings-btn" @click="goToSettings">
						<text class="settings-icon">⚙️</text>
						<text class="settings-text">设置</text>
					</view>
					<view class="theme-toggle-btn" @click="toggleTheme">
						<text class="theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</text>
						<text class="theme-text">{{ isDarkMode ? '浅色' : '深色' }}</text>
					</view>
					<view class="refresh-btn" @click="refreshPlugins" :class="{ loading: isLoading }">
						<text class="refresh-icon">🔄</text>
						<text class="refresh-text">{{ isLoading ? '加载中...' : '刷新' }}</text>
					</view>
				</view>
			</view>				<!-- 加载状态 -->
				<view v-if="isLoading && plugins.length === 0" class="loading-state">
					<view class="loading-spinner"></view>
					<text class="loading-text">正在加载插件数据...</text>
				</view>
				
				<!-- 插件卡片列表 -->
				<scroll-view class="plugin-scroll" scroll-y v-else>
					<view class="plugin-grid">
						<plugin-card
							v-for="plugin in paginatedPlugins" 
							:key="plugin.id"
							:plugin="plugin"
							@click="openPlugin"
						/>
					</view>
					
					<!-- 空状态 -->
					<view v-if="filteredPlugins.length === 0" class="empty-state">
						<text class="empty-icon">📦</text>
						<text class="empty-text">没有找到相关插件</text>
					</view>
					
					<!-- 分页 -->
					<view v-if="totalPages > 1" class="pagination">
						<view 
							class="page-btn" 
							:class="{ disabled: currentPage === 1 }"
							@click="prevPage"
						>上一页</view>
						<view class="page-info">{{ currentPage }} / {{ totalPages }}</view>
						<view 
							class="page-btn"
							:class="{ disabled: currentPage === totalPages }"
							@click="nextPage"
						>下一页</view>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchMarketData, getCurrentEndpoint } from '@/utils/request.js'
import PluginCard from '@/components/plugin-card/plugin-card.vue'
import MarketSidebar from '@/components/market-sidebar/market-sidebar.vue'
import SearchHeader from '@/components/search-header/search-header.vue'

// 搜索相关
const searchWords = ref([])

// 侧边栏状态
const sidebarCollapsed = ref(false)

// 主题模式（默认黑暗模式）
const isDarkMode = ref(true)

// 加载状态
const isLoading = ref(false)
const loadError = ref(null)

// 当前使用的源 URL
const currentSourceUrl = computed(() => getCurrentEndpoint())

// 排序相关
const activeSort = ref('default')
const sortOrder = ref('desc')

const sortOptions = [
	{ key: 'default', label: '默认排序', icon: '⭐' },
	{ key: 'download', label: '下载量', icon: '📥' },
	{ key: 'rating', label: '评分', icon: '❤️' },
	{ key: 'updated', label: '更新时间', icon: '🕐' },
	{ key: 'created', label: '发布时间', icon: '📅' }
]

// 筛选徽章
const activeBadges = ref([])
const badges = ref([
	{ key: 'verified', label: '官方认证', icon: '✓', count: 0 },
	{ key: 'preview', label: '预览版本', icon: '👁', count: 0 },
	{ key: 'insecure', label: '不安全', icon: '⚠', count: 0 },
	{ key: 'portable', label: '便携版本', icon: '📦', count: 0 },
	{ key: 'newborn', label: '新发布', icon: '🎉', count: 0 }
])

// 分类
const activeCategory = ref('')
const categories = ref([
	{ key: 'adapter', label: '适配器', icon: '🔌', count: 0 },
	{ key: 'extension', label: '扩展功能', icon: '🧩', count: 0 },
	{ key: 'tool', label: '实用工具', icon: '🔧', count: 0 },
	{ key: 'game', label: '娱乐玩法', icon: '🎮', count: 0 },
	{ key: 'image', label: '图片服务', icon: '🖼', count: 0 },
	{ key: 'manage', label: '管理工具', icon: '⚙️', count: 0 },
	{ key: 'general', label: '通用功能', icon: '📦', count: 0 },
	{ key: 'other', label: '其他', icon: '📋', count: 0 }
])

// 插件数据
const plugins = ref([])
const marketInfo = ref({})
const currentPage = ref(1)
const pageSize = ref(24)

// 计算属性
const filteredPlugins = computed(() => {
	let result = plugins.value
	
	// 按搜索词筛选
	if (searchWords.value.length > 0) {
		result = result.filter(plugin => {
			return searchWords.value.every(word => {
				const lowerWord = word.toLowerCase()
				return plugin.name.toLowerCase().includes(lowerWord) ||
					   plugin.description.toLowerCase().includes(lowerWord) ||
					   plugin.author.toLowerCase().includes(lowerWord)
			})
		})
	}
	
	// 按分类筛选
	if (activeCategory.value) {
		result = result.filter(plugin => plugin.category === activeCategory.value)
	}
	
	// 按徽章筛选
	if (activeBadges.value.length > 0) {
		result = result.filter(plugin => {
			return activeBadges.value.every(badge => plugin[badge])
		})
	}
	
	// 排序
	result = [...result].sort((a, b) => {
		let aVal, bVal
		switch (activeSort.value) {
			case 'download':
				aVal = a.downloads || 0
				bVal = b.downloads || 0
				break
			case 'rating':
				aVal = a.rating || 0
				bVal = b.rating || 0
				break
			case 'updated':
				aVal = new Date(a.updatedAt || 0).getTime()
				bVal = new Date(b.updatedAt || 0).getTime()
				break
			case 'created':
				aVal = new Date(a.createdAt || 0).getTime()
				bVal = new Date(b.createdAt || 0).getTime()
				break
			default:
				return 0
		}
		return sortOrder.value === 'desc' ? bVal - aVal : aVal - bVal
	})
	
	return result
})

const totalPages = computed(() => {
	return Math.ceil(filteredPlugins.value.length / pageSize.value)
})

const paginatedPlugins = computed(() => {
	const start = (currentPage.value - 1) * pageSize.value
	const end = start + pageSize.value
	return filteredPlugins.value.slice(start, end)
})

// 方法
const toggleSidebar = () => {
	sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleTheme = () => {
	isDarkMode.value = !isDarkMode.value
	// 保存到本地存储
	uni.setStorageSync('theme', isDarkMode.value ? 'dark' : 'light')
}

const handleSearch = (word) => {
	currentPage.value = 1
}

const handleClearSearch = () => {
	currentPage.value = 1
}

const toggleSort = (key) => {
	if (activeSort.value === key) {
		sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
	} else {
		activeSort.value = key
		sortOrder.value = 'desc'
	}
	currentPage.value = 1
}

const toggleBadge = (key) => {
	const index = activeBadges.value.indexOf(key)
	if (index > -1) {
		activeBadges.value.splice(index, 1)
	} else {
		activeBadges.value.push(key)
	}
	currentPage.value = 1
}

const toggleCategory = (key) => {
	if (activeCategory.value === key) {
		activeCategory.value = ''
	} else {
		activeCategory.value = key
	}
	currentPage.value = 1
}

const openPlugin = (plugin) => {
	// 将插件数据编码后传递到详情页
	const pluginData = encodeURIComponent(JSON.stringify(plugin));
	uni.navigateTo({
		url: `/pages/plugin-detail/plugin-detail?plugin=${pluginData}`
	})
}

const goToSettings = () => {
	uni.navigateTo({
		url: '/pages/settings/settings'
	})
}

const prevPage = () => {
	if (currentPage.value > 1) {
		currentPage.value--
	}
}

const nextPage = () => {
	if (currentPage.value < totalPages.value) {
		currentPage.value++
	}
}

// 加载插件数据
const loadPlugins = async () => {
	try {
		isLoading.value = true
		loadError.value = null
		
		console.log('开始加载 Koishi 插件市场数据...')
		
		// 调用请求函数获取数据
		const data = await fetchMarketData({
			isConsoleOutput: true,
			isShowToast: true
		})
		
		console.log('数据加载成功:', data)
		
		// 设置插件列表
		plugins.value = data.plugins || []
		
		// 保存市场信息
		marketInfo.value = {
			forceTime: data.forceTime,
			mirror: data.mirror,
			total: data.total
		}
		
		// 更新统计数据
		updateCounts(data)
		
		console.log(`成功加载 ${plugins.value.length} 个插件`)
		
	} catch (error) {
		console.error('加载插件数据失败:', error)
		loadError.value = error.message || '加载失败'
		
		uni.showModal({
			title: '加载失败',
			content: '无法加载插件数据，请稍后重试',
			confirmText: '重试',
			success: (res) => {
				if (res.confirm) {
					loadPlugins()
				}
			}
		})
	} finally {
		isLoading.value = false
	}
}

const updateCounts = (data) => {
	// 更新徽章计数（从返回的数据中获取）
	if (data.badges) {
		badges.value.forEach(badge => {
			badge.count = data.badges[badge.key] || 0
		})
	}
	
	// 更新分类计数（从返回的数据中获取）
	if (data.categories) {
		categories.value.forEach(category => {
			category.count = data.categories[category.key] || 0
		})
	}
	
	// 如果没有返回统计数据，则手动计算
	if (!data.badges || !data.categories) {
		badges.value.forEach(badge => {
			badge.count = plugins.value.filter(p => p[badge.key]).length
		})
		
		categories.value.forEach(category => {
			category.count = plugins.value.filter(p => p.category === category.key).length
		})
	}
}

// 刷新数据
const refreshPlugins = () => {
	loadPlugins()
}

onMounted(() => {
	// 从本地存储加载主题设置
	const savedTheme = uni.getStorageSync('theme')
	if (savedTheme) {
		isDarkMode.value = savedTheme === 'dark'
	}
	
	loadPlugins()
})
</script>

<style scoped>
/* CSS变量 - 浅色模式 */
.market-page {
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	
	/* 浅色主题变量 - Koishi 原版配色 */
	--bg-primary: #ffffff;
	--bg-secondary: #f8f8f9;
	--text-primary: #1f2328;
	--text-secondary: #656d76;
	--text-tertiary: #8c959f;
	--border-color: #d0d7de;
	--primary-color: #5546a3;
	--success-color: #1a7f37;
	--warning-color: #bf8700;
	--danger-color: #d1242f;
	--k-text-normal: #656d76;
	--k-text-dark: #1f2328;
	--k-text-active: #5546a3;
	--k-fill-normal: #8c959f;
	--card-shadow: 0 0 0 4rpx inset transparent;
	
	background-color: var(--bg-primary);
	color: var(--text-primary);
	transition: background-color 0.3s, color 0.3s;
}

/* 顶部区域 */
.top-section {
	background-color: var(--bg-primary);
}

/* 市场信息 */
.market-info {
	display: flex;
	gap: 24rpx;
	padding: 16rpx 60rpx;
	flex-wrap: wrap;
	align-items: center;
}

.info-tag {
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 24rpx;
	background-color: var(--bg-secondary);
	border: 2rpx solid var(--border-color);
	border-radius: 20rpx;
	font-size: 24rpx;
	white-space: nowrap;
}

.info-icon {
	font-size: 28rpx;
}

.info-label {
	color: var(--text-tertiary);
	font-weight: 500;
}

.info-value {
	color: var(--primary-color);
	font-weight: 600;
}

/* 黑暗模式变量 - Koishi 原版配色 */
.market-page.dark-mode {
	--bg-primary: #0d1117;
	--bg-secondary: #161b22;
	--text-primary: #e6edf3;
	--text-secondary: #8b949e;
	--text-tertiary: #6e7681;
	--border-color: #30363d;
	--primary-color: #7c6bce;
	--success-color: #2ea043;
	--warning-color: #e3b341;
	--danger-color: #f85149;
	--k-text-normal: #8b949e;
	--k-text-dark: #e6edf3;
	--k-text-active: #7c6bce;
	--k-fill-normal: #6e7681;
	--card-shadow: 0 0 0 4rpx inset transparent;
}

/* 搜索区域包装 */
::v-deep .search-header {
	padding: 64rpx 60rpx 0;
	background-color: var(--bg-primary);
}

/* 主体内容 */
.content {
	flex: 1;
	display: flex;
	overflow: hidden;
	position: relative;
}

/* 移动端侧边栏遮罩 */
.sidebar-mask {
	display: none;
}

@media (max-width: 768rpx) {
	.sidebar-mask {
		display: block;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
	}
}

/* 插件列表 */
.plugin-list {
	flex: 1;
	display: flex;
	flex-direction: column;
	background-color: var(--bg-primary);
	transition: all 0.3s;
	overflow: hidden;
	min-width: 0;
}

.result-header {
	padding: 24rpx 60rpx;
	background-color: var(--bg-primary);
	border-bottom: 0;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	flex-shrink: 0;
}

.header-actions {
	display: flex;
	gap: 20rpx;
}

.settings-btn {
	display: flex;
	align-items: center;
	padding: 12rpx 28rpx;
	background-color: var(--bg-secondary);
	color: var(--text-primary);
	border: 2rpx solid var(--border-color);
	border-radius: 24rpx;
	font-size: 26rpx;
	transition: all 0.3s ease;
	cursor: pointer;
	font-weight: 500;
}

.settings-btn:hover {
	background-color: var(--primary-color);
	color: #fff;
	border-color: var(--primary-color);
}

.settings-icon {
	margin-right: 8rpx;
	font-size: 28rpx;
}

.settings-text {
	white-space: nowrap;
}

.theme-toggle-btn {
	display: flex;
	align-items: center;
	padding: 12rpx 28rpx;
	background-color: var(--bg-secondary);
	color: var(--text-primary);
	border: 2rpx solid var(--border-color);
	border-radius: 24rpx;
	font-size: 26rpx;
	transition: all 0.3s ease;
	cursor: pointer;
	font-weight: 500;
}

.theme-toggle-btn:hover {
	background-color: var(--primary-color);
	color: #fff;
	border-color: var(--primary-color);
}

.theme-icon {
	margin-right: 8rpx;
	font-size: 28rpx;
}

.theme-text {
	white-space: nowrap;
}

.refresh-btn {
	display: flex;
	align-items: center;
	padding: 10rpx 24rpx;
	background-color: #409eff;
	color: #fff;
	border-radius: 20rpx;
	font-size: 24rpx;
	transition: all 0.3s;
	cursor: pointer;
}

.refresh-btn.loading {
	opacity: 0.6;
}

.refresh-icon {
	margin-right: 8rpx;
	display: inline-block;
}

.refresh-btn.loading .refresh-icon {
	animation: rotate 1s linear infinite;
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.refresh-text {
	white-space: nowrap;
}

/* 加载状态 */
.loading-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 20rpx;
	flex: 1;
}

.loading-spinner {
	width: 60rpx;
	height: 60rpx;
	border: 4rpx solid #e8e8e8;
	border-top-color: #409eff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 20rpx;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.loading-text {
	font-size: 28rpx;
	color: var(--text-tertiary);
}

.plugin-scroll {
	flex: 1;
	padding: 30rpx;
	overflow-x: hidden;
	width: 100%;
	box-sizing: border-box;
}

.plugin-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(336px, 1fr));
	gap: 24rpx;
	width: 100%;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 20rpx;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 20rpx;
}

.empty-text {
	font-size: 28rpx;
	color: var(--text-tertiary);
}

/* 分页 */
.pagination {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 48rpx 30rpx;
	gap: 16rpx;
	background-color: var(--bg-primary);
}

.page-btn {
	min-width: 80rpx;
	height: 64rpx;
	padding: 0 24rpx;
	background-color: var(--bg-secondary);
	color: var(--text-primary);
	border: 2rpx solid var(--border-color);
	border-radius: 8rpx;
	font-size: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s ease;
}

.page-btn:hover:not(.disabled) {
	background-color: var(--primary-color);
	color: white;
	border-color: var(--primary-color);
}

.page-btn.disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.page-info {
	font-size: 28rpx;
	color: var(--text-secondary);
	font-weight: 500;
}

/* 响应式布局 */
@media (max-width: 768rpx) {
	.top-section {
		position: sticky;
		top: 0;
		z-index: 100;
		background-color: var(--bg-primary);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.market-info {
		padding: 16rpx 20rpx;
		gap: 12rpx;
		justify-content: center;
		flex-wrap: wrap;
	}
	
	.info-tag {
		padding: 10rpx 20rpx;
		font-size: 24rpx;
		gap: 6rpx;
		flex: 0 1 auto;
	}
	
	.info-icon {
		font-size: 26rpx;
	}
	
	.info-label {
		display: none;
	}
	
	::v-deep .search-header {
		padding: 30rpx 20rpx 16rpx;
	}
	
	.content {
		position: relative;
	}
	
	.plugin-list {
		width: 100%;
	}
	
	.result-header {
		padding: 20rpx;
		justify-content: center;
	}
	
	.header-actions {
		flex-wrap: wrap;
		gap: 12rpx;
		justify-content: center;
	}
	
	.settings-btn,
	.theme-toggle-btn,
	.refresh-btn {
		flex: 1 1 calc(50% - 6rpx);
		min-width: 0;
		justify-content: center;
		padding: 16rpx 20rpx;
		font-size: 24rpx;
	}
	
	.settings-icon,
	.theme-icon,
	.refresh-icon {
		font-size: 28rpx;
	}
	
	.plugin-grid {
		grid-template-columns: 1fr;
		gap: 20rpx;
		padding: 0;
	}
	
	.plugin-scroll {
		padding: 20rpx;
	}
	
	.pagination {
		padding: 30rpx 20rpx;
		gap: 12rpx;
		flex-wrap: wrap;
	}
	
	.page-btn {
		height: 70rpx;
		min-width: 70rpx;
		font-size: 26rpx;
	}
	
	.page-info {
		width: 100%;
		text-align: center;
		font-size: 26rpx;
	}
}

/* 超小屏幕优化 */
@media (max-width: 375rpx) {
	.info-tag {
		padding: 8rpx 16rpx;
		font-size: 22rpx;
	}
	
	.settings-btn,
	.theme-toggle-btn,
	.refresh-btn {
		padding: 14rpx 16rpx;
		font-size: 22rpx;
	}
	
	.settings-text,
	.theme-text,
	.refresh-text {
		display: none;
	}
}
</style>
