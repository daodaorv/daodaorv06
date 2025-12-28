/**
 * 城市 Mock 数据
 */

import type { City, CityGroup } from '@/types/supplier'

// 热门城市列表
export const hotCities: City[] = [
  { code: '110000', name: '北京', province: '北京市', pinyin: 'beijing', initial: 'B' },
  { code: '310000', name: '上海', province: '上海市', pinyin: 'shanghai', initial: 'S' },
  { code: '440100', name: '广州', province: '广东省', pinyin: 'guangzhou', initial: 'G' },
  { code: '440300', name: '深圳', province: '广东省', pinyin: 'shenzhen', initial: 'S' },
  { code: '330100', name: '杭州', province: '浙江省', pinyin: 'hangzhou', initial: 'H' },
  { code: '320100', name: '南京', province: '江苏省', pinyin: 'nanjing', initial: 'N' },
  { code: '510100', name: '成都', province: '四川省', pinyin: 'chengdu', initial: 'C' },
  { code: '420100', name: '武汉', province: '湖北省', pinyin: 'wuhan', initial: 'W' },
  { code: '610100', name: '西安', province: '陕西省', pinyin: 'xian', initial: 'X' },
  { code: '500000', name: '重庆', province: '重庆市', pinyin: 'chongqing', initial: 'C' },
]

// 全国城市列表（按首字母分组）
export const allCities: City[] = [
  // A
  { code: '340100', name: '合肥', province: '安徽省', pinyin: 'hefei', initial: 'H' },
  { code: '340200', name: '芜湖', province: '安徽省', pinyin: 'wuhu', initial: 'W' },
  { code: '340300', name: '蚌埠', province: '安徽省', pinyin: 'bengbu', initial: 'B' },

  // B
  { code: '110000', name: '北京', province: '北京市', pinyin: 'beijing', initial: 'B' },
  { code: '130600', name: '保定', province: '河北省', pinyin: 'baoding', initial: 'B' },
  { code: '340300', name: '蚌埠', province: '安徽省', pinyin: 'bengbu', initial: 'B' },

  // C
  { code: '510100', name: '成都', province: '四川省', pinyin: 'chengdu', initial: 'C' },
  { code: '500000', name: '重庆', province: '重庆市', pinyin: 'chongqing', initial: 'C' },
  { code: '430100', name: '长沙', province: '湖南省', pinyin: 'changsha', initial: 'C' },
  { code: '220100', name: '长春', province: '吉林省', pinyin: 'changchun', initial: 'C' },
  { code: '320400', name: '常州', province: '江苏省', pinyin: 'changzhou', initial: 'C' },

  // D
  { code: '210200', name: '大连', province: '辽宁省', pinyin: 'dalian', initial: 'D' },
  { code: '370200', name: '东莞', province: '广东省', pinyin: 'dongguan', initial: 'D' },
  { code: '530100', name: '大理', province: '云南省', pinyin: 'dali', initial: 'D' },

  // F
  { code: '350100', name: '福州', province: '福建省', pinyin: 'fuzhou', initial: 'F' },
  { code: '440600', name: '佛山', province: '广东省', pinyin: 'foshan', initial: 'F' },

  // G
  { code: '440100', name: '广州', province: '广东省', pinyin: 'guangzhou', initial: 'G' },
  { code: '450100', name: '桂林', province: '广西壮族自治区', pinyin: 'guilin', initial: 'G' },
  { code: '520100', name: '贵阳', province: '贵州省', pinyin: 'guiyang', initial: 'G' },

  // H
  { code: '330100', name: '杭州', province: '浙江省', pinyin: 'hangzhou', initial: 'H' },
  { code: '340100', name: '合肥', province: '安徽省', pinyin: 'hefei', initial: 'H' },
  { code: '230100', name: '哈尔滨', province: '黑龙江省', pinyin: 'haerbin', initial: 'H' },
  { code: '460100', name: '海口', province: '海南省', pinyin: 'haikou', initial: 'H' },
  { code: '130400', name: '邯郸', province: '河北省', pinyin: 'handan', initial: 'H' },

  // J
  { code: '370100', name: '济南', province: '山东省', pinyin: 'jinan', initial: 'J' },
  { code: '350200', name: '厦门', province: '福建省', pinyin: 'xiamen', initial: 'X' },
  { code: '360100', name: '南昌', province: '江西省', pinyin: 'nanchang', initial: 'N' },

  // K
  { code: '530100', name: '昆明', province: '云南省', pinyin: 'kunming', initial: 'K' },

  // L
  { code: '620100', name: '兰州', province: '甘肃省', pinyin: 'lanzhou', initial: 'L' },
  { code: '410100', name: '洛阳', province: '河南省', pinyin: 'luoyang', initial: 'L' },
  { code: '530700', name: '丽江', province: '云南省', pinyin: 'lijiang', initial: 'L' },

  // N
  { code: '320100', name: '南京', province: '江苏省', pinyin: 'nanjing', initial: 'N' },
  { code: '450100', name: '南宁', province: '广西壮族自治区', pinyin: 'nanning', initial: 'N' },
  { code: '360100', name: '南昌', province: '江西省', pinyin: 'nanchang', initial: 'N' },
  { code: '330200', name: '宁波', province: '浙江省', pinyin: 'ningbo', initial: 'N' },

  // Q
  { code: '370200', name: '青岛', province: '山东省', pinyin: 'qingdao', initial: 'Q' },
  { code: '350300', name: '泉州', province: '福建省', pinyin: 'quanzhou', initial: 'Q' },

  // S
  { code: '310000', name: '上海', province: '上海市', pinyin: 'shanghai', initial: 'S' },
  { code: '440300', name: '深圳', province: '广东省', pinyin: 'shenzhen', initial: 'S' },
  { code: '320500', name: '苏州', province: '江苏省', pinyin: 'suzhou', initial: 'S' },
  { code: '210100', name: '沈阳', province: '辽宁省', pinyin: 'shenyang', initial: 'S' },
  { code: '140100', name: '石家庄', province: '河北省', pinyin: 'shijiazhuang', initial: 'S' },
  { code: '440500', name: '汕头', province: '广东省', pinyin: 'shantou', initial: 'S' },

  // T
  { code: '120000', name: '天津', province: '天津市', pinyin: 'tianjin', initial: 'T' },
  { code: '140100', name: '太原', province: '山西省', pinyin: 'taiyuan', initial: 'T' },
  { code: '370900', name: '泰安', province: '山东省', pinyin: 'taian', initial: 'T' },

  // W
  { code: '420100', name: '武汉', province: '湖北省', pinyin: 'wuhan', initial: 'W' },
  { code: '340200', name: '芜湖', province: '安徽省', pinyin: 'wuhu', initial: 'W' },
  { code: '320200', name: '无锡', province: '江苏省', pinyin: 'wuxi', initial: 'W' },
  { code: '330300', name: '温州', province: '浙江省', pinyin: 'wenzhou', initial: 'W' },
  { code: '370700', name: '潍坊', province: '山东省', pinyin: 'weifang', initial: 'W' },

  // X
  { code: '610100', name: '西安', province: '陕西省', pinyin: 'xian', initial: 'X' },
  { code: '350200', name: '厦门', province: '福建省', pinyin: 'xiamen', initial: 'X' },
  { code: '410700', name: '新乡', province: '河南省', pinyin: 'xinxiang', initial: 'X' },
  { code: '630100', name: '西宁', province: '青海省', pinyin: 'xining', initial: 'X' },

  // Y
  { code: '640100', name: '银川', province: '宁夏回族自治区', pinyin: 'yinchuan', initial: 'Y' },
  { code: '370600', name: '烟台', province: '山东省', pinyin: 'yantai', initial: 'Y' },
  { code: '320900', name: '盐城', province: '江苏省', pinyin: 'yancheng', initial: 'Y' },

  // Z
  { code: '410100', name: '郑州', province: '河南省', pinyin: 'zhengzhou', initial: 'Z' },
  { code: '440800', name: '珠海', province: '广东省', pinyin: 'zhuhai', initial: 'Z' },
  { code: '440200', name: '中山', province: '广东省', pinyin: 'zhongshan', initial: 'Z' },
  { code: '330800', name: '衢州', province: '浙江省', pinyin: 'quzhou', initial: 'Q' },
]

// 按首字母分组
export const cityGroups: CityGroup[] = [
  {
    initial: 'A',
    cities: allCities.filter(city => city.initial === 'A'),
  },
  {
    initial: 'B',
    cities: allCities.filter(city => city.initial === 'B'),
  },
  {
    initial: 'C',
    cities: allCities.filter(city => city.initial === 'C'),
  },
  {
    initial: 'D',
    cities: allCities.filter(city => city.initial === 'D'),
  },
  {
    initial: 'F',
    cities: allCities.filter(city => city.initial === 'F'),
  },
  {
    initial: 'G',
    cities: allCities.filter(city => city.initial === 'G'),
  },
  {
    initial: 'H',
    cities: allCities.filter(city => city.initial === 'H'),
  },
  {
    initial: 'J',
    cities: allCities.filter(city => city.initial === 'J'),
  },
  {
    initial: 'K',
    cities: allCities.filter(city => city.initial === 'K'),
  },
  {
    initial: 'L',
    cities: allCities.filter(city => city.initial === 'L'),
  },
  {
    initial: 'N',
    cities: allCities.filter(city => city.initial === 'N'),
  },
  {
    initial: 'Q',
    cities: allCities.filter(city => city.initial === 'Q'),
  },
  {
    initial: 'S',
    cities: allCities.filter(city => city.initial === 'S'),
  },
  {
    initial: 'T',
    cities: allCities.filter(city => city.initial === 'T'),
  },
  {
    initial: 'W',
    cities: allCities.filter(city => city.initial === 'W'),
  },
  {
    initial: 'X',
    cities: allCities.filter(city => city.initial === 'X'),
  },
  {
    initial: 'Y',
    cities: allCities.filter(city => city.initial === 'Y'),
  },
  {
    initial: 'Z',
    cities: allCities.filter(city => city.initial === 'Z'),
  },
].filter(group => group.cities.length > 0) // 过滤掉空分组

// Mock API 实现
export function mockGetCityList(): Promise<City[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(allCities)
    }, 200)
  })
}

export function mockGetCityGroups(): Promise<CityGroup[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(cityGroups)
    }, 200)
  })
}

export function mockGetHotCities(): Promise<City[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(hotCities)
    }, 200)
  })
}
