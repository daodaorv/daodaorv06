/**
 * 车辆状态管理
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getVehicles, getVehicleDetail, favoriteVehicle } from '@/api/vehicle';

export const useVehicleStore = defineStore('vehicle', () => {
    // 状态
    const vehicleList = ref<any[]>([]);
    const currentVehicle = ref<any>(null);
    const searchParams = ref<any>({});
    const favoriteIds = ref<string[]>([]);

    // 获取车辆列表
    const fetchVehicles = async (params: any) => {
        try {
            searchParams.value = params;
            const res = await getVehicles(params);
            if (res.code === 0) {
                vehicleList.value = res.data.list;
                return res.data;
            }
            return null;
        } catch (error) {
            console.error('获取车辆列表失败:', error);
            return null;
        }
    };

    // 获取车辆详情
    const fetchVehicleDetail = async (id: string) => {
        try {
            const res = await getVehicleDetail(id);
            if (res.code === 0) {
                currentVehicle.value = res.data;
                return res.data;
            }
            return null;
        } catch (error) {
            console.error('获取车辆详情失败:', error);
            return null;
        }
    };

    // 切换收藏
    const toggleFavorite = async (vehicleId: string) => {
        try {
            const res = await favoriteVehicle(vehicleId);
            if (res.code === 0) {
                const index = favoriteIds.value.indexOf(vehicleId);
                if (index > -1) {
                    favoriteIds.value.splice(index, 1);
                } else {
                    favoriteIds.value.push(vehicleId);
                }
                // 保存到本地存储
                uni.setStorageSync('favoriteIds', JSON.stringify(favoriteIds.value));
                return res.data.favorited;
            }
            return false;
        } catch (error) {
            console.error('收藏操作失败:', error);
            return false;
        }
    };

    // 检查是否已收藏
    const isFavorite = (vehicleId: string) => {
        return favoriteIds.value.includes(vehicleId);
    };

    // 初始化收藏列表
    const initFavorites = () => {
        const saved = uni.getStorageSync('favoriteIds');
        if (saved) {
            favoriteIds.value = JSON.parse(saved);
        }
    };

    // 清空列表
    const clearList = () => {
        vehicleList.value = [];
    };

    return {
        // 状态
        vehicleList,
        currentVehicle,
        searchParams,
        favoriteIds,
        // 方法
        fetchVehicles,
        fetchVehicleDetail,
        toggleFavorite,
        isFavorite,
        initFavorites,
        clearList
    };
});
