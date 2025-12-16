<template>
	<view class="plugin-detail-page" :class="{ 'dark-mode': isDarkMode }" :style="{ paddingTop: statusBarOffset + 'px' }">
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
						<!-- 如果有头像则显示头像，否则显示图标 -->
						<image 
							v-if="authorEmail" 
							class="author-avatar"
							:src="getAvatarUrl(authorEmail)" 
							mode="aspectFill"
							@error="handleAvatarError"
						/>
						<view v-else class="icon-fallback">
							<text class="icon-text">{{ getCategoryIcon(plugin.category) }}</text>
						</view>
					</view>
					<view class="plugin-basic-info">
						<view class="plugin-name">{{ plugin.shortname || plugin.name }}</view>
						<view class="plugin-package">@{{ plugin._raw?.package?.name || plugin.name }}</view>
						<view class="plugin-author" v-if="plugin.author">
							<text class="author-icon">👤</text>
							<text>{{ plugin.author }}</text>
						</view>
					</view>
				</view>
				
				<!-- 插件描述 -->
				<view class="section">
					<view class="section-title">📝 描述</view>
					<view class="section-content">
						<rich-text-parser 
							class="description-text" 
							:text="getDescription(plugin.description || plugin._raw?.manifest?.description)"
							:parse-images="true"
							:parse-links="true"
						/>
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
						<view class="info-item">
							<text class="info-label">下载量</text>
							<text class="info-value">{{ formatNumber(plugin.downloads || plugin._raw?.downloads?.lastMonth) }}/月</text>
						</view>
						<view class="info-item">
							<text class="info-label">评分</text>
							<view class="rating-value">
								<text class="stars">{{ renderStars(plugin.rating) }}</text>
								<text class="rating-number">{{ plugin.rating?.toFixed(1) || '0.0' }}</text>
							</view>
						</view>
						<view class="info-item">
							<text class="info-label">安装大小</text>
							<text class="info-value">{{ formatSize(plugin.installSize || plugin._raw?.installSize) }}</text>
						</view>
						<view class="info-item">
							<text class="info-label">发布大小</text>
							<text class="info-value">{{ formatSize(plugin.publishSize || plugin._raw?.publishSize) }}</text>
						</view>
						<view class="info-item">
							<text class="info-label">依赖数</text>
							<text class="info-value">{{ plugin.dependents || plugin._raw?.dependents || 0 }}</text>
						</view>
						<view class="info-item" v-if="plugin._raw?.score">
							<text class="info-label">质量评分</text>
							<text class="info-value">{{ plugin._raw.score.quality?.toFixed(1) || 'N/A' }}</text>
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
				
				<!-- 发布者信息 -->
				<view class="section" v-if="plugin._raw?.package?.publisher">
					<view class="section-title">👤 发布者</view>
					<view class="publisher-card">
						<image 
							class="publisher-avatar"
							:src="getAvatarUrl(plugin._raw.package.publisher.email)" 
							mode="aspectFill"
						/>
						<view class="publisher-info">
							<text class="publisher-name">{{ plugin._raw.package.publisher.username }}</text>
							<text class="publisher-email">{{ plugin._raw.package.publisher.email }}</text>
						</view>
					</view>
				</view>
				
				<!-- 维护者信息 -->
				<view class="section" v-if="plugin._raw?.package?.maintainers?.length">
					<view class="section-title">🛠️ 维护者 ({{ plugin._raw.package.maintainers.length }})</view>
					<view class="maintainers-list">
						<view class="maintainer-card" v-for="(maintainer, index) in plugin._raw.package.maintainers" :key="index">
							<image 
								class="maintainer-avatar"
								:src="getAvatarUrl(maintainer.email)" 
								mode="aspectFill"
							/>
							<view class="maintainer-info">
								<text class="maintainer-name">{{ maintainer.username }}</text>
								<text class="maintainer-email">{{ maintainer.email }}</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 服务实现 -->
				<view class="section" v-if="plugin._raw?.manifest?.service">
					<view class="section-title">⚙️ 服务</view>
					<view class="service-info">
						<view class="service-item" v-if="plugin._raw.manifest.service.implements?.length">
							<text class="service-label">实现：</text>
							<view class="service-tags">
								<text class="service-tag" v-for="(impl, index) in plugin._raw.manifest.service.implements" :key="index">
									{{ impl }}
								</text>
							</view>
						</view>
						<view class="service-item" v-if="plugin._raw.manifest.service.required?.length">
							<text class="service-label">依赖：</text>
							<view class="service-tags">
								<text class="service-tag required" v-for="(req, index) in plugin._raw.manifest.service.required" :key="index">
									{{ req }}
								</text>
							</view>
						</view>
						<view class="service-item" v-if="plugin._raw.manifest.service.optional?.length">
							<text class="service-label">可选：</text>
							<view class="service-tags">
								<text class="service-tag optional" v-for="(opt, index) in plugin._raw.manifest.service.optional" :key="index">
									{{ opt }}
								</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 关键词 -->
				<view class="section" v-if="plugin._raw?.package?.keywords?.length">
					<view class="section-title">🔖 关键词</view>
					<view class="keywords-container">
						<view class="keyword-tag" v-for="(keyword, index) in plugin._raw.package.keywords" :key="index">
							{{ keyword }}
						</view>
					</view>
				</view>
				
				<!-- 链接信息 -->
				<view class="section" v-if="plugin._raw?.package?.links">
					<view class="section-title">🔗 相关链接</view>
					<view class="links-container">
						<view class="link-item" v-if="plugin._raw.package.links.npm" @click="copyLink(plugin._raw.package.links.npm)">
							<text class="link-icon">📦</text>
							<text class="link-text">NPM</text>
							<text class="link-url">{{ plugin._raw.package.links.npm }}</text>
						</view>
						<view class="link-item" v-if="plugin._raw.package.links.homepage" @click="copyLink(plugin._raw.package.links.homepage)">
							<text class="link-icon">🏠</text>
							<text class="link-text">主页</text>
							<text class="link-url">{{ plugin._raw.package.links.homepage }}</text>
						</view>
						<view class="link-item" v-if="plugin._raw.package.links.repository" @click="copyLink(plugin._raw.package.links.repository)">
							<text class="link-icon">💻</text>
							<text class="link-text">仓库</text>
							<text class="link-url">{{ plugin._raw.package.links.repository }}</text>
						</view>
						<view class="link-item" v-if="plugin._raw.package.links.bugs" @click="copyLink(plugin._raw.package.links.bugs)">
							<text class="link-icon">🐛</text>
							<text class="link-text">问题反馈</text>
							<text class="link-url">{{ plugin._raw.package.links.bugs }}</text>
						</view>
					</view>
				</view>
				
				<!-- 时间信息 -->
				<view class="section">
					<view class="section-title">⏰ 时间信息</view>
					<view class="info-grid">
						<view class="info-item" v-if="plugin.createdAt">
							<text class="info-label">创建时间</text>
							<text class="info-value">{{ formatDate(plugin.createdAt) }}</text>
						</view>
						<view class="info-item" v-if="plugin.updatedAt">
							<text class="info-label">更新时间</text>
							<text class="info-value">{{ formatDate(plugin.updatedAt) }}</text>
						</view>
						<view class="info-item" v-if="plugin.license">
							<text class="info-label">开源协议</text>
							<text class="info-value">{{ plugin.license }}</text>
						</view>
						<view class="info-item" v-if="plugin.category">
							<text class="info-label">分类</text>
							<text class="info-value">{{ getCategoryName(plugin.category) }}</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import RichTextParser from '@/components/rich-text-parser/rich-text-parser.vue';
import { simpleMd5 } from '@/utils/md5.js';
// #ifdef MP-WEIXIN || MP-QQ
import { getStatusBarHeight } from '@/utils/system.js'
// #endif

const isDarkMode = ref(false);
const isLoading = ref(true);
const plugin = ref({});
const avatarError = ref(false);
const statusBarOffset = ref(0);

// 从上一页接收插件数据
onLoad((options) => {
	try {
		// 小程序状态栏适配
		// #ifdef MP-WEIXIN || MP-QQ
		const statusBarHeight = getStatusBarHeight()
		statusBarOffset.value = statusBarHeight + 10
		console.log('状态栏高度:', statusBarHeight, 'px，偏移量:', statusBarOffset.value, 'px')
		// #endif
		
		// 从localStorage读取主题设置
		const savedTheme = uni.getStorageSync('theme');
		if (savedTheme) {
			isDarkMode.value = savedTheme === 'dark';
		}
		
		// 接收插件数据
		if (options.plugin) {
			plugin.value = JSON.parse(decodeURIComponent(options.plugin));
			
			// 调试：打印当前插件的完整数据结构
			console.log('=== 插件详情页 - 当前插件数据结构 ===')
			console.log('插件名称:', plugin.value.shortname || plugin.value.name)
			console.log('完整数据:', JSON.stringify(plugin.value, null, 2))
			console.log('=======================================')
			
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

// 获取作者邮箱（用于 Gravatar）
const authorEmail = computed(() => {
	if (avatarError.value) return null
	
	const p = plugin.value
	
	// 优先从 _raw.package.publisher 获取
	if (p._raw?.package?.publisher?.email) {
		return p._raw.package.publisher.email
	}
	
	// 从 _raw.package.maintainers 获取
	if (p._raw?.package?.maintainers?.length > 0) {
		const email = p._raw.package.maintainers[0].email
		if (email) return email
	}
	
	return null
});

// 获取 Gravatar 头像 URL
const getAvatarUrl = (email) => {
	if (!email) return ''
	const hash = simpleMd5(email.toLowerCase().trim())
	return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=96`
};

// 头像加载失败处理
const handleAvatarError = () => {
	avatarError.value = true
};

// 获取分类图标
const getCategoryIcon = (category) => {
	const icons = {
		adapter: '🔌',
		extension: '🧩',
		tool: '🔧',
		game: '🎮',
		image: '🖼️',
		manage: '⚙️',
		general: '📦',
		webui: '🌐',
		other: '📋'
	};
	return icons[category] || '📦';
};

// 获取分类名称
const getCategoryName = (category) => {
	const names = {
		adapter: '适配器',
		extension: '扩展功能',
		tool: '实用工具',
		game: '娱乐玩法',
		image: '图片服务',
		manage: '管理工具',
		general: '通用功能',
		webui: 'Web界面',
		other: '其他'
	};
	return names[category] || category;
};

// 获取贡献者列表
const getContributors = () => {
	const contributors = plugin.value.contributors || [];
	const maintainers = plugin.value.maintainers || [];
	return [...contributors, ...maintainers];
};

// 渲染星级
const renderStars = (rating) => {
	if (!rating || rating < 0) rating = 0;
	if (rating > 5) rating = 5;
	
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 >= 0.5;
	const emptyStars = 5 - Math.ceil(rating);
	
	let stars = '★'.repeat(fullStars);
	if (hasHalfStar) stars += '☆';
	if (emptyStars > 0) stars += '☆'.repeat(emptyStars);
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
	background: linear-gradient(135deg, var(--primary-color), #7c66d4);
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	overflow: hidden;
}

.author-avatar {
	width: 100%;
	height: 100%;
	border-radius: 24rpx;
}

.icon-fallback {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
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
	margin-bottom: 8rpx;
}

.plugin-author {
	font-size: 26rpx;
	color: var(--text-tertiary);
	display: flex;
	align-items: center;
	gap: 6rpx;
}

.author-icon {
	font-size: 24rpx;
}

/* 区块样式 */
.section {
	background-color: var(--bg-secondary);
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.section:hover {
	transform: translateY(-2rpx);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
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
	grid-template-columns: repeat(auto-fit, minmax(220rpx, 1fr));
	gap: 24rpx;
}

@media (min-width: 768px) {
	.info-grid {
		grid-template-columns: repeat(4, 1fr);
	}
}

.info-item {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	padding: 20rpx;
	background-color: var(--bg-tertiary);
	border-radius: 12rpx;
	transition: all 0.25s ease;
}

.info-item:hover {
	background-color: var(--bg-primary);
	transform: scale(1.03);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
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
	transition: all 0.25s ease;
}

.badge:hover {
	transform: scale(1.05);
	filter: brightness(1.1);
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

/* 发布者卡片 */
.publisher-card {
	display: flex;
	align-items: center;
	gap: 24rpx;
	padding: 24rpx;
	background-color: var(--bg-tertiary);
	border-radius: 12rpx;
	transition: all 0.3s ease;
}

.publisher-card:hover {
	background-color: var(--bg-primary);
	transform: scale(1.02);
	box-shadow: 0 4rpx 12rpx rgba(85, 70, 163, 0.1);
}

.publisher-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	flex-shrink: 0;
	transition: all 0.3s ease;
}

.publisher-avatar:hover {
	transform: scale(1.1) rotate(5deg);
	box-shadow: 0 4rpx 12rpx rgba(85, 70, 163, 0.3);
}

.publisher-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.publisher-name {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-primary);
}

.publisher-email {
	font-size: 24rpx;
	color: var(--text-tertiary);
	word-break: break-all;
}

/* 维护者列表 */
.maintainers-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.maintainer-card {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 20rpx;
	background-color: var(--bg-tertiary);
	border-radius: 12rpx;
	transition: all 0.25s ease;
}

.maintainer-card:hover {
	background-color: var(--bg-primary);
	transform: translateX(8rpx);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.maintainer-avatar {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	flex-shrink: 0;
	transition: all 0.3s ease;
}

.maintainer-avatar:hover {
	transform: scale(1.15) rotate(-5deg);
	box-shadow: 0 2rpx 8rpx rgba(85, 70, 163, 0.3);
}

.maintainer-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.maintainer-name {
	font-size: 26rpx;
	font-weight: 600;
	color: var(--text-primary);
}

.maintainer-email {
	font-size: 22rpx;
	color: var(--text-tertiary);
	word-break: break-all;
}

/* 服务信息 */
.service-info {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.service-item {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.service-label {
	font-size: 26rpx;
	color: var(--text-secondary);
	font-weight: 600;
}

.service-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.service-tag {
	padding: 8rpx 16rpx;
	background-color: var(--bg-primary);
	border: 2rpx solid var(--border-color);
	border-radius: 12rpx;
	font-size: 24rpx;
	color: var(--text-primary);
	transition: all 0.2s ease;
}

.service-tag:hover {
	transform: scale(1.08);
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.service-tag.required {
	background-color: rgba(85, 70, 163, 0.1);
	border-color: var(--primary-color);
	color: var(--primary-color);
}

.service-tag.optional {
	background-color: rgba(191, 135, 0, 0.1);
	border-color: var(--warning-color);
	color: var(--warning-color);
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
	transition: all 0.2s ease;
}

.keyword-tag:hover {
	background: linear-gradient(135deg, var(--primary-color), #7c66d4);
	color: #fff;
	border-color: transparent;
	transform: scale(1.05) rotate(-1deg);
	box-shadow: 0 2rpx 8rpx rgba(85, 70, 163, 0.3);
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
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.link-item:hover {
	background-color: var(--bg-primary);
	transform: translateX(4rpx) scale(1.02);
	box-shadow: -4rpx 0 0 0 var(--primary-color), 0 4rpx 12rpx rgba(85, 70, 163, 0.15);
}

.link-item:active {
	transform: translateX(2rpx) scale(0.99);
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
