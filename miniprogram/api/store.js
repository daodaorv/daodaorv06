/**
 * 门店API - Mock数据版本
 * @description 门店相关接口，当前使用Mock数据，后续接入后端API
 */

import request from '@/utils/request';

/**
 * 门店数据结构
 * @typedef {Object} Store
 * @property {string} id - 门店ID
 * @property {string} code - 门店编码
 * @property {string} name - 门店名称
 * @property {string} cityCode - 所属城市编码
 * @property {string} cityName - 所属城市名称
 * @property {string} address - 详细地址
 * @property {string} phone - 联系电话
 * @property {string} businessHours - 营业时间
 * @property {number} latitude - 纬度
 * @property {number} longitude - 经度
 * @property {number} [distance] - 距用户距离（米）
 * @property {boolean} supportDiffReturn - 是否支持异地还车
 */

// Mock门店数据
const MOCK_STORES = [
  // 北京门店
  {
    id: 'store_bj_001',
    code: 'BJ001',
    name: '北京朝阳大悦城店',
    cityCode: '110100',
    cityName: '北京',
    address: '北京市朝阳区朝阳北路101号大悦城1层',
    phone: '010-65001234',
    businessHours: '08:00-20:00',
    latitude: 39.9219,
    longitude: 116.4966,
    supportDiffReturn: true
  },
  {
    id: 'store_bj_002',
    code: 'BJ002',
    name: '北京首都机场T3店',
    cityCode: '110100',
    cityName: '北京',
    address: '北京市顺义区首都机场T3航站楼地下停车场B2层',
    phone: '010-64591234',
    businessHours: '06:00-23:00',
    latitude: 40.0799,
    longitude: 116.6031,
    supportDiffReturn: true
  },
  {
    id: 'store_bj_003',
    code: 'BJ003',
    name: '北京西站店',
    cityCode: '110100',
    cityName: '北京',
    address: '北京市丰台区莲花池东路118号北京西站南广场',
    phone: '010-63001234',
    businessHours: '07:00-22:00',
    latitude: 39.8947,
    longitude: 116.3221,
    supportDiffReturn: true
  },
  // 上海门店
  {
    id: 'store_sh_001',
    code: 'SH001',
    name: '上海虹桥火车站店',
    cityCode: '310100',
    cityName: '上海',
    address: '上海市闵行区申贵路1500号虹桥火车站P9停车场',
    phone: '021-54001234',
    businessHours: '06:00-23:00',
    latitude: 31.1956,
    longitude: 121.3200,
    supportDiffReturn: true
  },
  {
    id: 'store_sh_002',
    code: 'SH002',
    name: '上海浦东机场店',
    cityCode: '310100',
    cityName: '上海',
    address: '上海市浦东新区浦东机场T2航站楼P2停车场',
    phone: '021-68001234',
    businessHours: '06:00-23:00',
    latitude: 31.1441,
    longitude: 121.8052,
    supportDiffReturn: true
  },
  {
    id: 'store_sh_003',
    code: 'SH003',
    name: '上海南京路步行街店',
    cityCode: '310100',
    cityName: '上海',
    address: '上海市黄浦区南京东路800号',
    phone: '021-63001234',
    businessHours: '08:00-21:00',
    latitude: 31.2352,
    longitude: 121.4751,
    supportDiffReturn: false
  },
  // 广州门店
  {
    id: 'store_gz_001',
    code: 'GZ001',
    name: '广州白云机场店',
    cityCode: '440100',
    cityName: '广州',
    address: '广州市花都区白云国际机场T2航站楼地下停车场',
    phone: '020-86001234',
    businessHours: '06:00-23:00',
    latitude: 23.3959,
    longitude: 113.3080,
    supportDiffReturn: true
  },
  {
    id: 'store_gz_002',
    code: 'GZ002',
    name: '广州南站店',
    cityCode: '440100',
    cityName: '广州',
    address: '广州市番禺区石壁街道广州南站P3停车场',
    phone: '020-39001234',
    businessHours: '07:00-22:00',
    latitude: 22.9898,
    longitude: 113.2695,
    supportDiffReturn: true
  },
  // 深圳门店
  {
    id: 'store_sz_001',
    code: 'SZ001',
    name: '深圳宝安机场店',
    cityCode: '440300',
    cityName: '深圳',
    address: '深圳市宝安区宝安国际机场T3航站楼地下停车场',
    phone: '0755-23001234',
    businessHours: '06:00-23:00',
    latitude: 22.6393,
    longitude: 113.8108,
    supportDiffReturn: true
  },
  {
    id: 'store_sz_002',
    code: 'SZ002',
    name: '深圳北站店',
    cityCode: '440300',
    cityName: '深圳',
    address: '深圳市龙华区民治街道深圳北站西广场',
    phone: '0755-28001234',
    businessHours: '07:00-22:00',
    latitude: 22.6097,
    longitude: 114.0297,
    supportDiffReturn: true
  },
  // 杭州门店
  {
    id: 'store_hz_001',
    code: 'HZ001',
    name: '杭州萧山机场店',
    cityCode: '330100',
    cityName: '杭州',
    address: '杭州市萧山区萧山国际机场T3航站楼P1停车场',
    phone: '0571-86001234',
    businessHours: '06:00-23:00',
    latitude: 30.2295,
    longitude: 120.4344,
    supportDiffReturn: true
  },
  {
    id: 'store_hz_002',
    code: 'HZ002',
    name: '杭州东站店',
    cityCode: '330100',
    cityName: '杭州',
    address: '杭州市江干区全福桥路2号杭州东站东广场',
    phone: '0571-87001234',
    businessHours: '07:00-22:00',
    latitude: 30.2908,
    longitude: 120.2199,
    supportDiffReturn: true
  },
  // 成都门店
  {
    id: 'store_cd_001',
    code: 'CD001',
    name: '成都双流机场店',
    cityCode: '510100',
    cityName: '成都',
    address: '成都市双流区双流国际机场T2航站楼P3停车场',
    phone: '028-85001234',
    businessHours: '06:00-23:00',
    latitude: 30.5785,
    longitude: 103.9471,
    supportDiffReturn: true
  },
  {
    id: 'store_cd_002',
    code: 'CD002',
    name: '成都东站店',
    cityCode: '510100',
    cityName: '成都',
    address: '成都市成华区邛崃山路333号成都东站西广场',
    phone: '028-84001234',
    businessHours: '07:00-22:00',
    latitude: 30.6271,
    longitude: 104.1527,
    supportDiffReturn: true
  },
  // 三亚门店
  {
    id: 'store_sy_001',
    code: 'SY001',
    name: '三亚凤凰机场店',
    cityCode: '460200',
    cityName: '三亚',
    address: '三亚市天涯区凤凰国际机场到达厅出口',
    phone: '0898-88001234',
    businessHours: '07:00-22:00',
    latitude: 18.3029,
    longitude: 109.4122,
    supportDiffReturn: true
  },
  {
    id: 'store_sy_002',
    code: 'SY002',
    name: '三亚湾海月广场店',
    cityCode: '460200',
    cityName: '三亚',
    address: '三亚市天涯区三亚湾路海月广场旁',
    phone: '0898-88501234',
    businessHours: '08:00-20:00',
    latitude: 18.2513,
    longitude: 109.5054,
    supportDiffReturn: false
  }
];

// 城市间异地还车费用配置表
const DIFF_RETURN_FEE_TABLE = {
  // 北京-上海: 800元
  '110100-310100': 800,
  '310100-110100': 800,
  // 北京-广州: 1200元
  '110100-440100': 1200,
  '440100-110100': 1200,
  // 北京-深圳: 1200元
  '110100-440300': 1200,
  '440300-110100': 1200,
  // 北京-杭州: 600元
  '110100-330100': 600,
  '330100-110100': 600,
  // 北京-成都: 1000元
  '110100-510100': 1000,
  '510100-110100': 1000,
  // 上海-广州: 1000元
  '310100-440100': 1000,
  '440100-310100': 1000,
  // 上海-深圳: 1000元
  '310100-440300': 1000,
  '440300-310100': 1000,
  // 上海-杭州: 300元
  '310100-330100': 300,
  '330100-310100': 300,
  // 广州-深圳: 200元
  '440100-440300': 200,
  '440300-440100': 200,
  // 广州-三亚: 800元
  '440100-460200': 800,
  '460200-440100': 800,
  // 深圳-三亚: 800元
  '440300-460200': 800,
  '460200-440300': 800,
  // 默认费用
  'default': 500
};

/**
 * 计算两点间距离（单位：米）
 * @param {number} lat1 - 纬度1
 * @param {number} lng1 - 经度1
 * @param {number} lat2 - 纬度2
 * @param {number} lng2 - 经度2
 * @returns {number} 距离（米）
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * 格式化距离显示
 * @param {number} distance - 距离（米）
 * @returns {string} 格式化后的距离
 */
function formatDistance(distance) {
  if (distance < 1000) {
    return `${distance}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
}

/**
 * 获取城市门店列表
 * @param {Object} params - 查询参数
 * @param {string} params.cityCode - 城市编码
 * @param {string} [params.cityName] - 城市名称（备选）
 * @param {number} [params.latitude] - 用户纬度
 * @param {number} [params.longitude] - 用户经度
 * @param {string} [params.keyword] - 搜索关键词
 * @returns {Promise<{code: number, data: Store[], message: string}>}
 */
export function getStoresByCity(params) {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      let stores = [...MOCK_STORES];

      // 按城市筛选
      if (params.cityCode) {
        stores = stores.filter(s => s.cityCode === params.cityCode);
      } else if (params.cityName) {
        stores = stores.filter(s => s.cityName === params.cityName);
      }

      // 按关键词搜索
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        stores = stores.filter(s =>
          s.name.toLowerCase().includes(keyword) ||
          s.address.toLowerCase().includes(keyword)
        );
      }

      // 计算距离并排序
      if (params.latitude && params.longitude) {
        stores = stores.map(store => ({
          ...store,
          distance: calculateDistance(
            params.latitude,
            params.longitude,
            store.latitude,
            store.longitude
          )
        }));
        stores.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      // 格式化距离显示
      stores = stores.map(store => ({
        ...store,
        distanceText: store.distance ? formatDistance(store.distance) : ''
      }));

      resolve({
        code: 0,
        data: stores,
        message: 'success'
      });
    }, 300);
  });
}

/**
 * 获取门店详情
 * @param {string} storeId - 门店ID
 * @returns {Promise<{code: number, data: Store|null, message: string}>}
 */
export function getStoreDetail(storeId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const store = MOCK_STORES.find(s => s.id === storeId);
      resolve({
        code: store ? 0 : 404,
        data: store || null,
        message: store ? 'success' : '门店不存在'
      });
    }, 200);
  });
}

/**
 * 获取异地还车费用
 * @param {string} pickupCityCode - 取车城市编码
 * @param {string} returnCityCode - 还车城市编码
 * @returns {Promise<{code: number, data: {fee: number, supported: boolean}, message: string}>}
 */
export function getDiffReturnFee(pickupCityCode, returnCityCode) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 同城取还免费
      if (pickupCityCode === returnCityCode) {
        resolve({
          code: 0,
          data: { fee: 0, supported: true },
          message: 'success'
        });
        return;
      }

      // 查询费用表
      const key = `${pickupCityCode}-${returnCityCode}`;
      const fee = DIFF_RETURN_FEE_TABLE[key] || DIFF_RETURN_FEE_TABLE['default'];

      resolve({
        code: 0,
        data: { fee, supported: true },
        message: 'success'
      });
    }, 200);
  });
}

/**
 * 检查门店是否支持异地还车
 * @param {string} storeId - 门店ID
 * @returns {Promise<{code: number, data: boolean, message: string}>}
 */
export function checkDiffReturnSupport(storeId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const store = MOCK_STORES.find(s => s.id === storeId);
      resolve({
        code: 0,
        data: store ? store.supportDiffReturn : false,
        message: 'success'
      });
    }, 100);
  });
}

export default {
  getStoresByCity,
  getStoreDetail,
  getDiffReturnFee,
  checkDiffReturnSupport
};
