<template>
	<view class="search-header">
		<view class="search-bar">
			<view class="search-icon">
				<text class="iconfont">🔍</text>
			</view>
			<input 
				class="search-input" 
				type="text" 
				v-model="inputValue"
				:placeholder="placeholder"
				confirm-type="search"
				@confirm="handleSearch"
			/>
			<view v-if="inputValue" class="clear-icon" @click="handleClear">
				<text class="iconfont">✕</text>
			</view>
		</view>
		
		<!-- 搜索标签 -->
		<scroll-view class="search-tags" scroll-x v-if="searchWords.length > 0">
			<view class="tag-list">
				<view 
					v-for="(word, index) in searchWords" 
					:key="index" 
					class="search-tag"
					@click="handleRemoveTag(index)"
				>
					{{ word }}
					<text class="tag-close">✕</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
	modelValue: {
		type: Array,
		default: () => []
	},
	placeholder: {
		type: String,
		default: '搜索插件...'
	}
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const inputValue = ref('')
const searchWords = ref([...props.modelValue])

watch(() => props.modelValue, (newVal) => {
	searchWords.value = [...newVal]
}, { deep: true })

const handleSearch = () => {
	if (inputValue.value.trim()) {
		const newWords = [...searchWords.value, inputValue.value.trim()]
		searchWords.value = newWords
		emit('update:modelValue', newWords)
		emit('search', inputValue.value.trim())
		inputValue.value = ''
	}
}

const handleClear = () => {
	inputValue.value = ''
	searchWords.value = []
	emit('update:modelValue', [])
	emit('clear')
}

const handleRemoveTag = (index) => {
	searchWords.value.splice(index, 1)
	emit('update:modelValue', [...searchWords.value])
}
</script>

<style scoped>
.search-header {
	background-color: transparent;
	padding: 0;
	z-index: 100;
	width: 100%;
}

.search-bar {
	display: flex;
	align-items: center;
	background-color: var(--bg-secondary, #f8f8f9);
	border-radius: 48rpx;
	padding: 24rpx 40rpx;
	margin: 0 auto;
	max-width: 1200rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;
}

.search-icon {
	font-size: 32rpx;
	color: var(--text-tertiary, #8c959f);
	margin-right: 16rpx;
	opacity: 0.5;
}

.search-input {
	flex: 1;
	font-size: 28rpx;
	border: none;
	background: transparent;
	color: var(--text-primary, #333);
}

.clear-icon {
	font-size: 32rpx;
	color: var(--text-tertiary, #999);
	padding: 0 10rpx;
	cursor: pointer;
}

.search-tags {
	margin-top: 20rpx;
	white-space: nowrap;
	max-width: 1200rpx;
	margin-left: auto;
	margin-right: auto;
	padding: 0 40rpx;
}

.tag-list {
	display: flex;
	gap: 16rpx;
	flex-wrap: wrap;
	align-items: center;
}

.search-tag {
	display: inline-flex;
	align-items: center;
	padding: 12rpx 24rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	border-radius: 24rpx;
	font-size: 26rpx;
	font-weight: 500;
	white-space: nowrap;
	cursor: pointer;
	user-select: none;
	transition: all 0.3s ease;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	animation: slideIn 0.3s ease;
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateY(-10rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.search-tag:hover {
	transform: translateY(-2rpx);
	box-shadow: 0 6rpx 16rpx rgba(102, 126, 234, 0.4);
}

.search-tag:active {
	transform: translateY(0);
}

.tag-close {
	margin-left: 12rpx;
	font-weight: bold;
	font-size: 28rpx;
	opacity: 0.8;
}
</style>
