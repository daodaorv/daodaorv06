/**
 * 车辆 Mock 数据生成器
 * 根据门店动态生成车辆列表
 */

import { mockStores } from './home';

export interface VehicleData {
	id: string;
	name: string;
	image: string;
	type: string;
	seats: number;
	beds: number;
	transmission: string;
	price: number;
	tags: string[];
	features?: string[];
	brand: string;
	storeId: string;
	storeName: string;
}

// 基础车辆模板（与后端数据库ID对应）
const VEHICLE_TEMPLATES: Omit<VehicleData, 'storeId' | 'storeName'>[] = [
	{
		id: '1',
		name: '上汽大通RG10 生活家V90',
		image: '/static/场景推荐2.jpg',
		type: 'C型',
		seats: 6,
		beds: 4,
		transmission: '自动挡',
		price: 680,
		tags: ['热门', '新车', '独立卫浴'],
		features: ['独立卫浴', 'KTV'],
		brand: '上汽大通'
	},
	{
		id: '2',
		name: '宇通B530 舒适版',
		image: '/static/优惠政策.jpg',
		type: 'B型',
		seats: 4,
		beds: 2,
		transmission: '自动挡',
		price: 520,
		tags: ['经济实惠', '好停车'],
		brand: '宇通'
	},
	{
		id: '3',
		name: '览众C7 经典版',
		image: '/static/场景推荐2.jpg',
		type: 'C型',
		seats: 6,
		beds: 4,
		transmission: '手动挡',
		price: 580,
		tags: ['皮卡底盘', '动力强'],
		brand: '览众'
	},
	{
		id: '4',
		name: '上汽大通V90 商务版',
		image: '/static/优惠政策.jpg',
		type: 'B型',
		seats: 4,
		beds: 2,
		transmission: '自动挡',
		price: 480,
		tags: [],
		brand: '上汽大通'
	}
];

/**
 * 根据门店生成车辆列表
 */
export function generateVehiclesByStore(storeName: string, storeId: string): VehicleData[] {
	return VEHICLE_TEMPLATES.map(template => ({
		...template,
		storeId,
		storeName
	}));
}

/**
 * 根据城市和门店名称生成车辆列表
 */
export function generateMockVehicles(cityName?: string, storeName?: string): VehicleData[] {
	// 如果指定了门店，查找对应的门店ID
	if (storeName) {
		for (const stores of Object.values(mockStores)) {
			const store = stores.find(s => s.name === storeName);
			if (store) {
				return generateVehiclesByStore(store.name, store.id);
			}
		}
	}

	// 默认返回深圳宝安店的车辆
	return generateVehiclesByStore('深圳宝安店', '401');
}
