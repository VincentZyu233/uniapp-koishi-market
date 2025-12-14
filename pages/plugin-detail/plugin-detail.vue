<template>
	<view class="plugin-detail-page" :class="{ 'dark-mode': isDarkMode }">
		<!-- 顶部导航栏 -->
		<view class="detail-header">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">←</text>
				<text class="back-text">返回</text>
			</view>
			<view class="header-title">插件详情</view>
			<view class="theme-toggle" @click="toggleTheme">
				<text class="theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</text>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="isLoading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>
		
		<!-- 插件详情内容 -->
		<scroll-view v-else class="detail-content" scroll-y>
			<view class="content-wrapper">
				<!-- 插件头部信息 -->
				<view class="plugin-header">
					<view class="plugin-icon">
						<text class="icon-text">📦</text>
					</view>
					<view class="plugin-basic-info">
						<view class="plugin-name">{{ plugin.shortname || plugin.name }}</view>
						<view class="plugin-package">{{ plugin.package?.name || plugin.name }}</view>
					</view>
				</view>
				
				<!-- 插件描述 -->
				<view class="section" v-if="plugin.package?.description">
					<view class="section-title">📝 插件描述</view>
					<view class="section-content">
						<text class="description-text">{{ getDescription(plugin.package.description) }}</text>
					</view>
				</view>
				
				<!-- 版本信息 -->
				<view class="section">
					<view class="section-title">🏷️ 版本信息</view>
					<view class="info-grid">
						<view class="info-item">
							<text class="info-label">当前版本</text>
							<text class="info-value">{{ plugin.version || 'N/A' }}</text>
						</view>
						<view class="info-item" v-if="plugin.package?.peerDependencies?.koishi">
							<text class="info-label">Koishi 版本</text>
							<text class="info-value">{{ plugin.package.peerDependencies.koishi }}</text>
						</view>
					</view>
				</view>
				
				<!-- 统计信息 -->
				<view class="section">
					<view class="section-title">📊 统计信息</view>
					<view class="info-grid">
						<view class="info-item" v-if="plugin.downloads">
							<text class="info-label">下载量</text>
							<text class="info-value">{{ formatNumber(plugin.downloads.lastMonth) }}/月</text>
						</view>
						<view class="info-item" v-if="plugin.rating">
							<text class="info-label">评分</text>
							<view class="rating-value">
								<text class="stars">{{ renderStars(plugin.rating) }}</text>
								<text class="rating-number">{{ plugin.rating.toFixed(1) }}</text>
							</view>
						</view>
						<view class="info-item" v-if="plugin.installSize">
							<text class="info-label">安装大小</text>
							<text class="info-value">{{ formatSize(plugin.installSize) }}</text>
						</view>
						<view class="info-item" v-if="plugin.downloads">
							<text class="info-label">总下载</text>
							<text class="info-value">{{ formatNumber(plugin.downloads.lastYear) }}</text>
						</view>
					</view>
				</view>
				
				<!-- 徽章信息 -->
				<view class="section" v-if="plugin.insecure || plugin.verified || plugin.portable">
					<view class="section-title">🎖️ 徽章</view>
					<view class="badges-container">
						<view class="badge verified" v-if="plugin.verified">
							<text class="badge-icon">✓</text>
							<text class="badge-text">官方认证</text>
						</view>
						<view class="badge portable" v-if="plugin.portable">
							<text class="badge-icon">📱</text>
							<text class="badge-text">可移植</text>
						</view>
						<view class="badge insecure" v-if="plugin.insecure">
							<text class="badge-icon">⚠️</text>
							<text class="badge-text">不安全</text>
						</view>
					</view>
				</view>
				
				<!-- 作者信息 -->
				<view class="section" v-if="plugin.contributors || plugin.maintainers">
					<view class="section-title">👤 作者信息</view>
					<view class="contributors-list">
						<view class="contributor" v-for="(contributor, index) in getContributors()" :key="index">
							<text class="contributor-name">{{ contributor.name || contributor }}</text>
							<text class="contributor-email" v-if="contributor.email">{{ contributor.email }}</text>
						</view>
					</view>
				</view>
				
				<!-- 关键词 -->
				<view class="section" v-if="plugin.package?.keywords && plugin.package.keywords.length > 0">
					<view class="section-title">🔖 关键词</view>
					<view class="keywords-container">
						<view class="keyword-tag" v-for="(keyword, index) in plugin.package.keywords" :key="index">
							{{ keyword }}
						</view>
					</view>
				</view>
				
				<!-- 链接信息 -->
				<view class="section">
					<view class="section-title">🔗 相关链接</view>
					<view class="links-container">
						<view class="link-item" v-if="plugin.links?.npm" @click="copyLink(plugin.links.npm)">
							<text class="link-icon">📦</text>
							<text class="link-text">NPM</text>
							<text class="link-url">{{ plugin.links.npm }}</text>
						</view>
						<view class="link-item" v-if="plugin.links?.homepage" @click="copyLink(plugin.links.homepage)">
							<text class="link-icon">🏠</text>
							<text class="link-text">主页</text>
							<text class="link-url">{{ plugin.links.homepage }}</text>
						</view>
						<view class="link-item" v-if="plugin.links?.repository" @click="copyLink(plugin.links.repository)">
							<text class="link-icon">💻</text>
							<text class="link-text">仓库</text>
							<text class="link-url">{{ plugin.links.repository }}</text>
						</view>
					</view>
				</view>
				
				<!-- 更新时间 -->
				<view class="section" v-if="plugin.updatedAt">
					<view class="section-title">⏰ 更新时间</view>
					<view class="section-content">
						<text class="update-time">{{ formatDate(plugin.updatedAt) }}</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const isDarkMode = ref(false);
const isLoading = ref(true);
const plugin = ref({});

// 从上一页接收插件数据
onLoad((options) => {
	try {
		// 从localStorage读取主题设置
		const savedTheme = uni.getStorageSync('theme');
		if (savedTheme) {
			isDarkMode.value = savedTheme === 'dark';
		}
		
		// 接收插件数据
		if (options.plugin) {
			plugin.value = JSON.parse(decodeURIComponent(options.plugin));
			isLoading.value = false;
		} else {
			// 如果没有数据，显示错误并返回
			uni.showToast({
				title: '插件数据错误',
				icon: 'error',
				duration: 2000
			});
			setTimeout(() => {
				uni.navigateBack();
			}, 2000);
		}
	} catch (error) {
		console.error('加载插件详情失败:', error);
		uni.showToast({
			title: '加载失败',
			icon: 'error',
			duration: 2000
		});
		setTimeout(() => {
			uni.navigateBack();
		}, 2000);
	}
});

// 返回上一页
const goBack = () => {
	uni.navigateBack();
};

// 切换主题
const toggleTheme = () => {
	isDarkMode.value = !isDarkMode.value;
	uni.setStorageSync('theme', isDarkMode.value ? 'dark' : 'light');
};

// 获取描述文本（中文优先）
const getDescription = (description) => {
	if (typeof description === 'object') {
		return description['zh-CN'] || description['zh'] || description['en'] || JSON.stringify(description);
	}
	return description || '暂无描述';
};

// 获取贡献者列表
const getContributors = () => {
	const contributors = plugin.value.contributors || [];
	const maintainers = plugin.value.maintainers || [];
	return [...contributors, ...maintainers];
};

// 渲染星级
const renderStars = (rating) => {
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 >= 0.5;
	let stars = '★'.repeat(fullStars);
	if (hasHalfStar) stars += '☆';
	stars += '☆'.repeat(5 - Math.ceil(rating));
	return stars;
};

// 格式化数字
const formatNumber = (num) => {
	if (!num) return '0';
	if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
	if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
	return num.toString();
};

// 格式化大小
const formatSize = (bytes) => {
	if (!bytes) return '0 B';
	if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
	if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
	return bytes + ' B';
};

// 格式化日期
const formatDate = (dateString) => {
	const date = new Date(dateString);
	return date.toLocaleString('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
};

// 复制链接
const copyLink = (url) => {
	uni.setClipboardData({
		data: url,
		success: () => {
			uni.showToast({
				title: '链接已复制',
				icon: 'success',
				duration: 1500
			});
		}
	});
};
</script>

<style lang="scss" scoped>
.plugin-detail-page {
	width: 100%;
	height: 100vh;
	background-color: var(--bg-primary, #ffffff);
	display: flex;
	flex-direction: column;
}

.dark-mode {
	--bg-primary: #0d1117;
	--bg-secondary: #161b22;
	--bg-tertiary: #21262d;
	--text-primary: #e6edf3;
	--text-secondary: #8b949e;
	--text-tertiary: #6e7681;
	--border-color: #30363d;
	--primary-color: #7c6bce;
	--success-color: #3fb950;
	--warning-color: #d29922;
	--danger-color: #f85149;
}

.plugin-detail-page:not(.dark-mode) {
	--bg-primary: #ffffff;
	--bg-secondary: #f8f8f9;
	--bg-tertiary: #f0f0f0;
	--text-primary: #1f2328;
	--text-secondary: #656d76;
	--text-tertiary: #8c959f;
	--border-color: #d8dee4;
	--primary-color: #5546a3;
	--success-color: #1a7f37;
	--warning-color: #bf8700;
	--danger-color: #d1242f;
}

/* 顶部导航栏 */
.detail-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background-color: var(--bg-secondary);
	border-bottom: 2rpx solid var(--border-color);
	flex-shrink: 0;
}

.back-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 20rpx;
	background-color: var(--bg-primary);
	border: 2rpx solid var(--border-color);
	border-radius: 20rpx;
	cursor: pointer;
	transition: all 0.3s;
}

.back-btn:active {
	transform: scale(0.95);
	background-color: var(--bg-tertiary);
}

.back-icon {
	font-size: 32rpx;
	color: var(--text-primary);
}

.back-text {
	font-size: 28rpx;
	color: var(--text-primary);
}

.header-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-primary);
}

.theme-toggle {
	padding: 12rpx;
	cursor: pointer;
}

.theme-icon {
	font-size: 36rpx;
}

/* 加载状态 */
.loading-container {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20rpx;
}

.loading-spinner {
	width: 60rpx;
	height: 60rpx;
	border: 4rpx solid var(--border-color);
	border-top-color: var(--primary-color);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.loading-text {
	font-size: 28rpx;
	color: var(--text-secondary);
}

/* 内容区域 */
.detail-content {
	flex: 1;
	overflow-y: auto;
}

.content-wrapper {
	padding: 30rpx;
	max-width: 1200rpx;
	margin: 0 auto;
}

/* 插件头部 */
.plugin-header {
	display: flex;
	align-items: center;
	gap: 30rpx;
	padding: 40rpx;
	background-color: var(--bg-secondary);
	border-radius: 16rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.plugin-icon {
	width: 120rpx;
	height: 120rpx;
	background-color: var(--bg-tertiary);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.icon-text {
	font-size: 80rpx;
}

.plugin-basic-info {
	flex: 1;
	min-width: 0;
}

.plugin-name {
	font-size: 40rpx;
	font-weight: 600;
	color: var(--text-primary);
	margin-bottom: 12rpx;
	word-break: break-word;
}

.plugin-package {
	font-size: 28rpx;
	color: var(--text-secondary);
	word-break: break-word;
}

/* 区块样式 */
.section {
	background-color: var(--bg-secondary);
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-primary);
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.section-content {
	color: var(--text-primary);
	line-height: 1.8;
}

.description-text {
	font-size: 28rpx;
	color: var(--text-secondary);
	line-height: 1.8;
}

/* 信息网格 */
.info-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200rpx, 1fr));
	gap: 24rpx;
}

.info-item {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	padding: 20rpx;
	background-color: var(--bg-tertiary);
	border-radius: 12rpx;
}

.info-label {
	font-size: 24rpx;
	color: var(--text-tertiary);
}

.info-value {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-primary);
}

.rating-value {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.stars {
	font-size: 28rpx;
	color: #ffd700;
}

.rating-number {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-primary);
}

/* 徽章 */
.badges-container {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.badge {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 24rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.badge.verified {
	background-color: rgba(26, 127, 55, 0.15);
	color: var(--success-color);
}

.badge.portable {
	background-color: rgba(191, 135, 0, 0.15);
	color: var(--warning-color);
}

.badge.insecure {
	background-color: rgba(209, 36, 47, 0.15);
	color: var(--danger-color);
}

.badge-icon {
	font-size: 28rpx;
}

.badge-text {
	font-weight: 500;
}

/* 贡献者列表 */
.contributors-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.contributor {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	padding: 20rpx;
	background-color: var(--bg-tertiary);
	border-radius: 12rpx;
}

.contributor-name {
	font-size: 28rpx;
	font-weight: 500;
	color: var(--text-primary);
}

.contributor-email {
	font-size: 24rpx;
	color: var(--text-secondary);
}

/* 关键词 */
.keywords-container {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.keyword-tag {
	padding: 12rpx 24rpx;
	background-color: var(--bg-tertiary);
	border: 2rpx solid var(--border-color);
	border-radius: 20rpx;
	font-size: 24rpx;
	color: var(--text-secondary);
}

/* 链接 */
.links-container {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.link-item {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 20rpx;
	background-color: var(--bg-tertiary);
	border-radius: 12rpx;
	cursor: pointer;
	transition: all 0.3s;
}

.link-item:active {
	transform: scale(0.98);
	background-color: var(--bg-primary);
}

.link-icon {
	font-size: 32rpx;
}

.link-text {
	font-size: 28rpx;
	font-weight: 500;
	color: var(--text-primary);
	min-width: 80rpx;
}

.link-url {
	flex: 1;
	font-size: 24rpx;
	color: var(--text-secondary);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* 更新时间 */
.update-time {
	font-size: 28rpx;
	color: var(--text-secondary);
}

/* 移动端优化 */
@media (max-width: 768rpx) {
	.content-wrapper {
		padding: 20rpx;
	}
	
	.plugin-header {
		flex-direction: column;
		align-items: flex-start;
		padding: 30rpx;
	}
	
	.plugin-icon {
		width: 100rpx;
		height: 100rpx;
	}
	
	.icon-text {
		font-size: 64rpx;
	}
	
	.plugin-name {
		font-size: 36rpx;
	}
	
	.info-grid {
		grid-template-columns: 1fr;
	}
	
	.back-text {
		display: none;
	}
}
</style>
