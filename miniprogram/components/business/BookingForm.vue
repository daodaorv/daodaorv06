<template>
	<view class="booking-form">
		<!-- 第一行：取车城市 | 取车门店 -->
		<view class="form-row">
			<view class="form-item" @tap="openCityPicker('pickup')">
				<view class="label">取车城市</view>
				<view class="input-box">
					<u-icon name="map" size="18" color="#999"></u-icon>
					<text class="input-text">{{ pickupCity || '选择城市' }}</text>
					<u-icon name="arrow-down" size="12" color="#999"></u-icon>
				</view>
			</view>

			<view class="form-item" @tap="openStorePicker('pickup')">
				<view class="label">取车门店</view>
				<view class="input-box">
					<u-icon name="home" size="18" color="#999"></u-icon>
					<text class="input-text">{{ pickupStore || '选择门店' }}</text>
					<u-icon name="arrow-down" size="12" color="#999"></u-icon>
				</view>
			</view>
		</view>

		<!-- 第二行：取还车时间综合选择 -->
		<view class="form-row">
			<view class="date-time-container" @tap="openDatePicker">
				<view class="dt-section">
					<text class="dt-label">取车时间</text>
					<view class="dt-value-group">
						<text class="dt-date">{{ formatDate(pickupDate) || '选择日期' }}</text>
						<text class="dt-time">{{ pickupTime }}</text>
					</view>
				</view>
				
				<view class="duration-divider">
					<view class="duration-tag">
						<text class="duration-text">共{{ duration }}天</text>
					</view>
				</view>
				
				<view class="dt-section right">
					<text class="dt-label">还车时间</text>
					<view class="dt-value-group">
						<text class="dt-date">{{ formatDate(returnDate) || '选择日期' }}</text>
						<text class="dt-time">{{ returnTime }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 第三行：异地还车 (紧凑布局) -->
		<view class="checkbox-row compact">
			<view class="checkbox-container" @tap="toggleDifferentLocation">
				<view class="checkmark-circle" :class="{ checked: isDifferentLocation }">
					<u-icon v-if="isDifferentLocation" name="checkbox-mark" size="12" color="#FFFFFF"></u-icon>
				</view>
				<text class="checkbox-text">异地还车</text>
			</view>
		</view>

		<!-- 第四行：还车城市 | 还车门店 (动态显示) -->
		<view v-if="isDifferentLocation" class="form-row different-location">
			<view class="form-item" @tap="openCityPicker('return')">
				<view class="label">还车城市</view>
				<view class="input-box">
					<u-icon name="map" size="18" color="#999"></u-icon>
					<text class="input-text">{{ returnCity || '选择城市' }}</text>
					<u-icon name="arrow-down" size="12" color="#999"></u-icon>
				</view>
			</view>

			<view class="form-item" @tap="openStorePicker('return')">
				<view class="label">还车门店</view>
				<view class="input-box">
					<u-icon name="home" size="18" color="#999"></u-icon>
					<text class="input-text">{{ returnStore || '选择门店' }}</text>
					<u-icon name="arrow-down" size="12" color="#999"></u-icon>
				</view>
			</view>
		</view>

		<!-- 查询按钮 -->
		<button 
			class="search-button" 
			hover-class="search-button-hover"
			@tap="handleSearch"
		>
			查询可用房车
		</button>

		<!-- 弹窗组件 -->
		<CityStorePicker 
			ref="cityStorePicker" 
			:type="pickerType" 
			:title="pickerTitle" 
			:data="pickerData"
			:selected-id="currentSelectedId"
			@confirm="onPickerConfirm"
		/>
		

	</view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import dayjs from 'dayjs';
import CityStorePicker from './CityStorePicker.vue';

const emit = defineEmits(['search', 'open-date-picker']);

// --- Mock Data ---
// --- Mock Data ---
const cities = [
	{ id: '1', name: '北京' },
	{ id: '2', name: '上海' },
	{ id: '3', name: '成都' },
	{ id: '4', name: '深圳' },
	{ id: '5', name: '广州' },
	{ id: '6', name: '杭州' },
	{ id: '7', name: '重庆' },
	{ id: '8', name: '西安' },
	{ id: '9', name: '武汉' },
	{ id: '10', name: '长沙' },
	{ id: '11', name: '南京' },
	{ id: '12', name: '苏州' },
	{ id: '13', name: '天津' },
	{ id: '14', name: '青岛' },
	{ id: '15', name: '厦门' },
	{ id: '16', name: '昆明' },
	{ id: '17', name: '三亚' },
	{ id: '18', name: '海口' }
];

const stores = {
	'1': [{ id: '101', name: '北京朝阳店' }, { id: '102', name: '北京海淀店' }, { id: '103', name: '北京大兴店' }],
	'2': [{ id: '201', name: '上海虹桥店' }, { id: '202', name: '上海浦东店' }, { id: '203', name: '上海嘉定店' }],
	'3': [{ id: '301', name: '成都双流店' }, { id: '302', name: '成都高新店' }, { id: '303', name: '成都天府店' }],
	'4': [{ id: '401', name: '深圳宝安店' }, { id: '402', name: '深圳南山店' }, { id: '403', name: '深圳龙岗店' }],
	'5': [{ id: '501', name: '广州白云店' }, { id: '502', name: '广州天河店' }, { id: '503', name: '广州番禺店' }],
	'6': [{ id: '601', name: '杭州萧山店' }, { id: '602', name: '杭州西湖店' }],
	'7': [{ id: '701', name: '重庆江北店' }, { id: '702', name: '重庆渝北店' }],
	'8': [{ id: '801', name: '西安未央店' }, { id: '802', name: '西安雁塔店' }],
	'9': [{ id: '901', name: '武汉洪山店' }, { id: '902', name: '武汉江汉店' }],
	'10': [{ id: '1001', name: '长沙岳麓店' }, { id: '1002', name: '长沙雨花店' }],
	'11': [{ id: '1101', name: '南京江宁店' }, { id: '1102', name: '南京鼓楼店' }],
	'12': [{ id: '1201', name: '苏州吴中店' }, { id: '1202', name: '苏州工业园店' }],
	'13': [{ id: '1301', name: '天津滨海店' }, { id: '1302', name: '天津南开店' }],
	'14': [{ id: '1401', name: '青岛市南店' }, { id: '1402', name: '青岛崂山店' }],
	'15': [{ id: '1501', name: '厦门思明店' }, { id: '1502', name: '厦门湖里店' }],
	'16': [{ id: '1601', name: '昆明官渡店' }, { id: '1602', name: '昆明盘龙店' }],
	'17': [{ id: '1701', name: '三亚凤凰店' }, { id: '1702', name: '三亚海棠湾店' }],
	'18': [{ id: '1801', name: '海口美兰店' }, { id: '1802', name: '海口龙华店' }]
};

// --- State ---
const pickupCity = ref('');
const pickupCityId = ref('');
const pickupStore = ref('');
const pickupStoreId = ref('');

const returnCity = ref('');
const returnCityId = ref('');
const returnStore = ref('');
const returnStoreId = ref('');

const pickupDate = ref('');
const pickupTime = ref('10:00');
const returnDate = ref('');
const returnTime = ref('10:00'); // 始终同步pickupTime

const isDifferentLocation = ref(false);

// --- Picker State ---
const cityStorePicker = ref();
const pickerType = ref<'city' | 'store'>('city');
const pickerTitle = ref('');
const pickerData = ref<any[]>([]);
const currentPickerTarget = ref<'pickup' | 'return'>('pickup');
const currentSelectedId = ref('');



// --- Computed ---
const duration = computed(() => {
	if (!pickupDate.value || !returnDate.value) return 0;
	const start = dayjs(`${pickupDate.value} ${pickupTime.value}`);
	const end = dayjs(`${returnDate.value} ${returnTime.value}`);
	const diffHours = end.diff(start, 'hour');
	return Math.max(1, Math.ceil(diffHours / 24));
});

// --- Lifecycle ---
onMounted(() => {
	loadFromStorage();
	if (!pickupCity.value) {
		// 默认值
		pickupCity.value = '深圳';
		pickupCityId.value = '4';
		pickupStore.value = '深圳宝安店';
		pickupStoreId.value = '401';
		
		const now = dayjs();
		pickupDate.value = now.add(2, 'hour').format('YYYY-MM-DD');
		returnDate.value = now.add(2, 'day').add(2, 'hour').format('YYYY-MM-DD');
	}
});

// --- Methods ---

const formatDate = (date: string) => {
	if (!date) return '';
	return dayjs(date).format('MM月DD日');
};

// Picker Handlers
const openCityPicker = (target: 'pickup' | 'return') => {
	console.log('🔍 openCityPicker 被调用', target);
	console.log('🔍 cityStorePicker.value:', cityStorePicker.value);

	currentPickerTarget.value = target;
	pickerType.value = 'city';
	pickerTitle.value = target === 'pickup' ? '选择取车城市' : '选择还车城市';
	pickerData.value = cities;
	currentSelectedId.value = target === 'pickup' ? pickupCityId.value : returnCityId.value;
	cityStorePicker.value?.open();

	console.log('🔍 cityStorePicker.open() 已调用');
};

const openStorePicker = (target: 'pickup' | 'return') => {
	console.log('🔍 openStorePicker 被调用', target);

	const cityId = target === 'pickup' ? pickupCityId.value : returnCityId.value;
	if (!cityId) {
		uni.showToast({ title: '请先选择城市', icon: 'none' });
		return;
	}

	currentPickerTarget.value = target;
	pickerType.value = 'store';
	pickerTitle.value = target === 'pickup' ? '选择取车门店' : '选择还车门店';
	pickerData.value = (stores as any)[cityId] || [];
	currentSelectedId.value = target === 'pickup' ? pickupStoreId.value : returnStoreId.value;
	cityStorePicker.value?.open();

	console.log('🔍 openStorePicker 完成');
};

const onPickerConfirm = (item: any) => {
	if (pickerType.value === 'city') {
		if (currentPickerTarget.value === 'pickup') {
			pickupCity.value = item.name;
			pickupCityId.value = item.id;
			// 重置门店
			pickupStore.value = '';
			pickupStoreId.value = '';
		} else {
			returnCity.value = item.name;
			returnCityId.value = item.id;
			returnStore.value = '';
			returnStoreId.value = '';
		}
	} else {
		if (currentPickerTarget.value === 'pickup') {
			pickupStore.value = item.name;
			pickupStoreId.value = item.id;
		} else {
			returnStore.value = item.name;
			returnStoreId.value = item.id;
		}
	}
	saveToStorage();
};

// Date Picker Handlers
const openDatePicker = () => {
	console.log('🔍 openDatePicker 被调用 (emitting event)');
	emit('open-date-picker', {
		pickupDate: pickupDate.value,
		returnDate: returnDate.value,
		time: pickupTime.value
	});
};

const onDateConfirm = (data: any) => {
	console.log('Date Picker Confirmed:', data);
	pickupDate.value = data.pickupDate;
	returnDate.value = data.returnDate;
	pickupTime.value = data.time;
	returnTime.value = data.time; // 同步还车时间
	saveToStorage();
};

const toggleDifferentLocation = () => {
	isDifferentLocation.value = !isDifferentLocation.value;
	if (!isDifferentLocation.value) {
		// 清空还车信息
		returnCity.value = '';
		returnCityId.value = '';
		returnStore.value = '';
		returnStoreId.value = '';
	}
	saveToStorage();
};

const handleSearch = () => {
	// 验证
	if (!pickupCityId.value || !pickupStoreId.value) {
		uni.showToast({ title: '请选择取车城市和门店', icon: 'none' });
		return;
	}
	if (!pickupDate.value || !returnDate.value) {
		uni.showToast({ title: '请选择取还车时间', icon: 'none' });
		return;
	}
	if (isDifferentLocation.value && (!returnCityId.value || !returnStoreId.value)) {
		uni.showToast({ title: '请选择还车城市和门店', icon: 'none' });
		return;
	}
	
	const params = {
		pickupCity: pickupCity.value,
		pickupStore: pickupStore.value,
		pickupDate: pickupDate.value,
		pickupTime: pickupTime.value,
		returnDate: returnDate.value,
		returnTime: returnTime.value,
		isDifferentLocation: isDifferentLocation.value,
		returnCity: isDifferentLocation.value ? returnCity.value : pickupCity.value,
		returnStore: isDifferentLocation.value ? returnStore.value : pickupStore.value,
		duration: duration.value
	};
	
	console.log('Search Params:', params);
	emit('search', params);
};

// Storage
const saveToStorage = () => {
	const data = {
		pickupCity: pickupCity.value,
		pickupCityId: pickupCityId.value,
		pickupStore: pickupStore.value,
		pickupStoreId: pickupStoreId.value,
		pickupDate: pickupDate.value,
		pickupTime: pickupTime.value,
		returnDate: returnDate.value,
		returnTime: returnTime.value,
		isDifferentLocation: isDifferentLocation.value,
		returnCity: returnCity.value,
		returnCityId: returnCityId.value,
		returnStore: returnStore.value,
		returnStoreId: returnStoreId.value
	};
	uni.setStorageSync('booking_form_data', data);
};

const loadFromStorage = () => {
	const data = uni.getStorageSync('booking_form_data');
	if (data) {
		// 检查缓存是否过期 (7天) - 这里简化处理，假设未过期
		pickupCity.value = data.pickupCity;
		pickupCityId.value = data.pickupCityId;
		pickupStore.value = data.pickupStore;
		pickupStoreId.value = data.pickupStoreId;
		pickupDate.value = data.pickupDate;
		pickupTime.value = data.pickupTime;
		returnDate.value = data.returnDate;
		returnTime.value = data.returnTime;
		isDifferentLocation.value = data.isDifferentLocation;
		returnCity.value = data.returnCity;
		returnCityId.value = data.returnCityId;
		returnStore.value = data.returnStore;
		returnStoreId.value = data.returnStoreId;
	}
};
defineExpose({ onDateConfirm });
</script>

<style scoped lang="scss">
.booking-form {
	background-color: #FFFFFF;
	border-radius: $uni-border-radius-lg;
	padding: 40rpx 32rpx;
	box-shadow: $uni-shadow-lg;
	position: relative;
	z-index: 10;
}

.form-row {
	display: flex;
	gap: 24rpx;
	margin-bottom: 32rpx;
	
	&.different-location {
		animation: slideDown 0.3s ease-out;
	}
}

@keyframes slideDown {
	from { opacity: 0; transform: translateY(-10rpx); }
	to { opacity: 1; transform: translateY(0); }
}

.form-item {
	flex: 1;
	overflow: hidden;
}

.label {
	font-size: 24rpx;
	color: $uni-text-color-secondary;
	margin-bottom: 16rpx;
	font-weight: 500;
}

.input-box {
	display: flex;
	align-items: center;
	gap: 12rpx;
	height: 88rpx;
	padding: 0 24rpx;
	background-color: $uni-bg-color;
	border-radius: 16rpx;
	transition: background-color 0.2s;
	
	&:active {
		background-color: darken($uni-bg-color, 2%);
	}
}

.input-text {
	flex: 1;
	font-size: 30rpx;
	color: $uni-text-color;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-weight: 600;
}

/* 综合时间选择框 */
.date-time-container {
	flex: 1;
	display: flex;
	align-items: center;
	height: 140rpx;
	background-color: $uni-bg-color;
	border-radius: 16rpx;
	padding: 0 32rpx;
	position: relative;
}

.dt-section {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	z-index: 1;
	
	&.right {
		align-items: flex-end;
	}
}

.dt-label {
	font-size: 22rpx;
	color: $uni-text-color-secondary;
	margin-bottom: 8rpx;
}

.dt-value-group {
	display: flex;
	align-items: baseline;
	gap: 8rpx;
}

.dt-date {
	font-size: 36rpx;
	font-weight: bold;
	color: $uni-text-color;
	font-family: 'DIN Alternate', sans-serif;
}

.dt-time {
	font-size: 26rpx;
	color: $uni-text-color-secondary;
}

.duration-divider {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 0;
}

.duration-tag {
	height: 44rpx;
	padding: 0 24rpx;
	background-color: #FFFFFF;
	border-radius: 22rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: $uni-shadow-sm;
	border: 1rpx solid $uni-border-color-light;
}

.duration-text {
	font-size: 24rpx;
	color: $uni-color-primary;
	font-weight: bold;
}

/* 异地还车 (紧凑) */
.checkbox-row {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 32rpx;
	
	&.compact {
		margin-top: -16rpx;
	}
}

.checkbox-container {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 8rpx 0;
}

.checkbox {
	width: 36rpx;
	height: 36rpx;
	border: 2rpx solid #DDD;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
	
	&.checked {
		background-color: $uni-color-primary;
		border-color: $uni-color-primary;
	}
}

.checkbox-text {
	font-size: 26rpx;
	color: $uni-text-color;
}

/* 查询按钮 */
.search-button {
	width: 100%;
	height: 100rpx;
	background: linear-gradient(135deg, $uni-color-primary 0%, #FFB84D 100%);
	color: #FFFFFF;
	font-size: 36rpx;
	font-weight: bold;
	border-radius: 50rpx;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 12rpx 32rpx rgba(255, 159, 41, 0.3);
	transition: all 0.2s;
	
	&::after {
		border: none;
	}
}

.search-button-hover {
	transform: scale(0.98);
	opacity: 0.95;
	box-shadow: 0 6rpx 16rpx rgba(255, 159, 41, 0.3);
}
</style>
