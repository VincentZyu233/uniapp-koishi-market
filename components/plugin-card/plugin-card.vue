<template>
	<view class="plugin-card" @click="handleClick">
		<!-- 头部：图标 + 名称 + 评分 -->
		<view class="card-header">
			<view class="icon-container">
				<view class="category-icon">
					<text>{{ getCategoryIcon(plugin.category) }}</text>
				</view>
			</view>
			
			<view class="header-main">
				<view class="title-row">
					<text class="plugin-name">{{ plugin.shortname || plugin.name }}</text>
					<view v-if="badge" class="badge-icon" :class="badge.type">
						<text>{{ getBadgeIcon(badge.type) }}</text>
					</view>
				</view>
				
				<view class="rating-row">
					<view class="stars">
						<text 
							v-for="i in 5" 
							:key="i" 
							class="star"
							:class="{ filled: i <= Math.round(plugin.rating || 0) }"
						>★</text>
					</view>
					<text class="rating-value">{{ (plugin.rating || 0).toFixed(1) }}</text>
				</view>
			</view>
		</view>
		
		<!-- 描述 -->
		<view class="card-description" @click.stop="handleDescriptionClick">
			<rich-text-parser 
				:text="plugin.description || ''"
				:parse-images="true"
				:parse-links="true"
				:show-full-url="false"
			/>
		</view>
		
		<!-- 底部：版本、大小、下载量、作者 -->
		<view class="card-footer">
			<view class="footer-item">
				<text class="footer-icon">🏷️</text>
				<text class="footer-text">{{ plugin.version }}</text>
			</view>
			
			<view v-if="plugin.installSize" class="footer-item">
				<text class="footer-icon">📦</text>
				<text class="footer-text">{{ formatSize(plugin.installSize) }}</text>
			</view>
			
			<view v-if="plugin.downloads" class="footer-item">
				<text class="footer-icon">📥</text>
				<text class="footer-text">{{ plugin.downloads }}</text>
			</view>
			
		<view class="spacer"></view>
		
		<view class="author-avatar" v-if="authorEmail">
			<image 
				class="avatar-img" 
				:src="getAvatarUrl(authorEmail)"
				mode="aspectFill"
				@error="handleAvatarError"
			/>
		</view>
		<view class="author-avatar" v-else>
			<text class="avatar-text">{{ getAvatarText(plugin.author) }}</text>
		</view>
	</view>
</view>
</template><script setup>
import { computed, ref } from 'vue'
import RichTextParser from '@/components/rich-text-parser/rich-text-parser.vue'
import { simpleMd5 } from '@/utils/md5.js'

const props = defineProps({
	plugin: {
		type: Object,
		required: true
	}
})

const emit = defineEmits(['click'])

const avatarError = ref(false)

// 获取作者邮箱
const authorEmail = computed(() => {
	if (avatarError.value) return null
	
	const plugin = props.plugin
	
	// 优先从 _raw.package.publisher 获取
	if (plugin._raw?.package?.publisher?.email) {
		return plugin._raw.package.publisher.email
	}
	
	// 从 _raw.package.maintainers 获取
	if (plugin._raw?.package?.maintainers?.length > 0) {
		const email = plugin._raw.package.maintainers[0].email
		if (email) return email
	}
	
	// 兼容旧格式：从 package.publisher 获取
	if (plugin.package?.publisher?.email) {
		return plugin.package.publisher.email
	}
	
	return null
})

// 获取 Gravatar 头像 URL
const getAvatarUrl = (email) => {
	if (!email) return ''
	// 使用 Gravatar 服务
	// d=identicon 会生成几何图案作为默认头像
	// s=48 指定大小为 48x48 像素
	const hash = simpleMd5(email.toLowerCase().trim())
	return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=96`
}

// 处理头像加载错误
const handleAvatarError = () => {
	avatarError.value = true
}

// 获取插件徽章
const badge = computed(() => {
	if (props.plugin.verified) return { type: 'verified', query: 'is:verified' }
	if (props.plugin.insecure) return { type: 'insecure', query: 'is:insecure' }
	if (props.plugin.preview) return { type: 'preview', query: 'is:preview' }
	if (props.plugin.newborn) return { type: 'newborn', query: 'is:newborn' }
	if (props.plugin.portable) return { type: 'portable', query: 'is:portable' }
	return null
})

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
		preset: '📋',
		ai: '🤖',
		gametool: '🎯',
		life: '🌟',
		media: '🎬',
		meme: '😄',
		webui: '🌐',
		core: '💎',
		other: '📄'
	}
	return icons[category] || '📦'
}

// 获取徽章图标
const getBadgeIcon = (type) => {
	const icons = {
		verified: '✓',
		preview: '👁',
		insecure: '⚠',
		portable: '📦',
		newborn: '🎉'
	}
	return icons[type] || ''
}

// 格式化大小
const formatSize = (bytes) => {
	if (!bytes) return ''
	if (bytes >= 1024 * 1024 * 1000) {
		return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
	} else if (bytes >= 1024 * 1000) {
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
	} else {
		return (bytes / 1024).toFixed(1) + ' KB'
	}
}

// 获取作者头像文字
const getAvatarText = (author) => {
	if (!author) return '?'
	return author.charAt(0).toUpperCase()
}

const handleClick = () => {
	emit('click', props.plugin)
}

// 处理描述区域点击，如果点击的是链接，不触发卡片点击
const handleDescriptionClick = (e) => {
	// 检查点击目标是否是链接元素
	const target = e.target;
	if (target && target.className) {
		const className = typeof target.className === 'string' ? target.className : '';
		if (className.includes('link-')) {
			// 点击的是链接，不触发卡片点击
			console.log('点击了链接，阻止冒泡');
			e.stopPropagation();
			return;
		}
	}
}
</script>

<style scoped>
.plugin-card {
	width: 100%;
	height: 468rpx;
	background-color: var(--bg-secondary, #fff);
	border-radius: 12rpx;
	padding: 32rpx 40rpx;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 0 0 2rpx transparent inset;
	cursor: pointer;
}

.plugin-card:hover {
	box-shadow: 0 0 0 2rpx var(--primary-color, #5546a3) inset, 0 8rpx 24rpx rgba(85, 70, 163, 0.15);
	transform: translateY(-4rpx) scale(1.01);
}

/* 头部 */
.card-header {
	display: flex;
	gap: 32rpx;
	flex-shrink: 0;
}

.icon-container {
	flex-shrink: 0;
}

.category-icon {
	width: 112rpx;
	height: 112rpx;
	border-radius: 16rpx;
	border: 1rpx solid var(--border-color, #e8e8e8);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 56rpx;
}

.header-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	min-width: 0;
}

.title-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.plugin-name {
	font-size: 36rpx;
	font-weight: 600;
	color: var(--text-primary, #1f2328);
	line-height: 1.5;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex: 1;
	min-width: 0;
}

.badge-icon {
	flex-shrink: 0;
	width: 36rpx;
	height: 36rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36rpx;
	position: relative;
	z-index: 1;
}

.badge-icon.verified {
	color: var(--success-color, #1a7f37);
}

.badge-icon.verified::before {
	content: '';
	position: absolute;
	width: 50%;
	height: 50%;
	background-color: white;
	border-radius: 50%;
	z-index: -1;
}

.badge-icon.preview {
	color: var(--warning-color, #bf8700);
}

.badge-icon.insecure {
	color: var(--danger-color, #d1242f);
}

.badge-icon.insecure::before {
	content: '';
	position: absolute;
	width: 50%;
	height: 50%;
	background-color: white;
	border-radius: 50%;
	z-index: -1;
}

.badge-icon.portable {
	color: var(--primary-color, #5546a3);
}

.badge-icon.newborn {
	color: var(--success-color, #1a7f37);
}

.rating-row {
	display: flex;
	align-items: center;
	gap: 8rpx;
	height: 48rpx;
}

.stars {
	display: flex;
	gap: 8rpx;
}

.star {
	font-size: 28rpx;
	color: #d0d7de;
	line-height: 1;
	transition: color 0.3s ease;
}

.star.filled {
	color: var(--warning-color, #bf8700);
}

.rating-value {
	font-size: 24rpx;
	color: var(--text-tertiary, #999);
	margin-left: 4rpx;
}

/* 描述 */
.card-description {
	flex: 1;
	font-size: 30rpx;
	line-height: 1.5;
	color: var(--text-secondary, #656d76);
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 4;
	-webkit-box-orient: vertical;
	word-break: break-word;
	margin: 0;
	min-height: 0;
}

/* 底部 */
.card-footer {
	display: flex;
	align-items: center;
	gap: 16rpx;
	height: 48rpx;
	flex-shrink: 0;
	font-size: 28rpx;
	color: var(--text-secondary, #656d76);
	overflow: hidden;
	margin-bottom: -8rpx;
	transition: color 0.3s ease;
}

.footer-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
	flex-shrink: 0;
	overflow: hidden;
}

.footer-icon {
	font-size: 24rpx;
	flex-shrink: 0;
	width: 32rpx;
	margin-right: 4rpx;
	vertical-align: -2rpx;
}

.footer-text {
	font-size: 28rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.spacer {
	flex: 1 1 auto;
}

.author-avatar {
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	cursor: pointer;
	vertical-align: middle;
	overflow: hidden;
}

.avatar-img {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.avatar-text {
	color: white;
	font-size: 24rpx;
	font-weight: bold;
}
</style>
