/**
 * 城市 API
 */
import { mockGetCityList, mockGetCityGroups, mockGetHotCities } from '@/mock/cities'
import type { City, CityGroup } from '@/types/supplier'

// 导出类型
export type { City, CityGroup }

/**
 * 获取城市列表
 */
export const getCityList = (): Promise<City[]> => {
  // return request.get('/cities')
  return mockGetCityList()
}

/**
 * 获取城市列表（按首字母分组）
 */
export const getCityGroups = (): Promise<CityGroup[]> => {
  // return request.get('/cities/groups')
  return mockGetCityGroups()
}

/**
 * 获取热门城市
 */
export const getHotCities = (): Promise<City[]> => {
  // return request.get('/cities/hot')
  return mockGetHotCities()
}
