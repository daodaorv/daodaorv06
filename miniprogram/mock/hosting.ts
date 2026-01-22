/**
 * 托管相关Mock数据
 */

// 托管收益数据
export const mockHostingIncome = {
  totalIncome: 12580.50,
  todayPending: 350.00,
  monthEstimate: 8500.00
};

// 托管车辆列表
export const mockHostingVehicles = [
  {
    id: 1,
    plateNumber: '京A·12345',
    thumbnail: 'https://placehold.co/200x150/FF9F29/FFFFFF?text=Vehicle1',
    status: 'renting',
    statusText: '出租中',
    todayIncome: 350.00,
    monthIncome: 5200.00
  },
  {
    id: 2,
    plateNumber: '京B·67890',
    thumbnail: 'https://placehold.co/200x150/2196F3/FFFFFF?text=Vehicle2',
    status: 'idle',
    statusText: '空闲',
    todayIncome: 0,
    monthIncome: 3300.00
  }
];

// 托管公告
export const mockHostingNotices = [
  { id: 1, content: '托管车辆享受平台统保，车主零保险成本' },
  { id: 2, content: '淡季补贴最高1000元/月，让您收益更稳定' },
  { id: 3, content: '新用户托管立享首月额外10%收益加成' }
];

// 热门托管车型
export const mockPopularModels = [
  {
    id: 1,
    name: '大通V90',
    brand: '上汽大通',
    thumbnail: 'https://placehold.co/300x200/FF9F29/FFFFFF?text=V90',
    price: 358000,
    monthlyIncome: 4500,
    features: ['6座', '自动挡', '柴油'],
    tag: '热门'
  },
  {
    id: 2,
    name: '依维柯欧胜',
    brand: '南京依维柯',
    thumbnail: 'https://placehold.co/300x200/2196F3/FFFFFF?text=IVECO',
    price: 428000,
    monthlyIncome: 5200,
    features: ['6座', '自动挡', '柴油'],
    tag: '高收益'
  },
  {
    id: 3,
    name: '福特全顺',
    brand: '江铃福特',
    thumbnail: 'https://placehold.co/300x200/4CAF50/FFFFFF?text=Transit',
    price: 298000,
    monthlyIncome: 3800,
    features: ['6座', '手动挡', '柴油'],
    tag: '性价比'
  }
];
