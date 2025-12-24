/**
 * 距离计算工具
 * 使用 Haversine 公式计算地球表面两点间的距离
 */

// 地球半径(公里)
const EARTH_RADIUS_KM = 6371

// 坐标接口
export interface Coordinate {
  latitude: number
  longitude: number
}

// 距离计算结果
export interface DistanceResult {
  distance: number // 距离(公里)
  distanceFormatted: string // 格式化的距离字符串
}

// 距离缓存
const distanceCache = new Map<string, DistanceResult>()

/**
 * 将角度转换为弧度
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * 生成缓存键
 */
function getCacheKey(coord1: Coordinate, coord2: Coordinate): string {
  // 使用排序后的坐标生成键,确保 A->B 和 B->A 使用同一个缓存
  const coords = [
    `${coord1.latitude.toFixed(6)},${coord1.longitude.toFixed(6)}`,
    `${coord2.latitude.toFixed(6)},${coord2.longitude.toFixed(6)}`
  ].sort()
  return coords.join('|')
}

/**
 * 格式化距离
 */
function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}米`
  }
  return `${distance.toFixed(2)}公里`
}

/**
 * 使用 Haversine 公式计算两点间距离
 * @param coord1 第一个坐标点
 * @param coord2 第二个坐标点
 * @returns 距离结果(公里)
 */
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): DistanceResult {
  // 验证坐标有效性
  if (!isValidCoordinate(coord1) || !isValidCoordinate(coord2)) {
    throw new Error('无效的坐标数据')
  }

  // 如果是同一个点,距离为0
  if (coord1.latitude === coord2.latitude && coord1.longitude === coord2.longitude) {
    return {
      distance: 0,
      distanceFormatted: '0公里'
    }
  }

  // 转换为弧度
  const lat1 = toRadians(coord1.latitude)
  const lat2 = toRadians(coord2.latitude)
  const deltaLat = toRadians(coord2.latitude - coord1.latitude)
  const deltaLon = toRadians(coord2.longitude - coord1.longitude)

  // Haversine 公式
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  // 计算距离(保留2位小数)
  const distance = Math.round(EARTH_RADIUS_KM * c * 100) / 100

  return {
    distance,
    distanceFormatted: formatDistance(distance)
  }
}

/**
 * 使用缓存的距离计算
 * @param coord1 第一个坐标点
 * @param coord2 第二个坐标点
 * @returns 距离结果(公里)
 */
export function calculateDistanceWithCache(
  coord1: Coordinate,
  coord2: Coordinate
): DistanceResult {
  const cacheKey = getCacheKey(coord1, coord2)

  // 检查缓存
  if (distanceCache.has(cacheKey)) {
    return distanceCache.get(cacheKey)!
  }

  // 计算距离
  const result = calculateDistance(coord1, coord2)

  // 存入缓存
  distanceCache.set(cacheKey, result)

  return result
}

/**
 * 验证坐标是否有效
 */
export function isValidCoordinate(coord: Coordinate): boolean {
  if (!coord || typeof coord.latitude !== 'number' || typeof coord.longitude !== 'number') {
    return false
  }

  // 纬度范围: -90 到 90
  if (coord.latitude < -90 || coord.latitude > 90) {
    return false
  }

  // 经度范围: -180 到 180
  if (coord.longitude < -180 || coord.longitude > 180) {
    return false
  }

  return true
}

/**
 * 计算门店间距离(便捷方法)
 * @param pickupStoreId 取车门店ID
 * @param returnStoreId 还车门店ID
 * @param stores 门店列表
 * @returns 距离结果
 */
export function calculateStoreDistance(
  pickupStoreId: number,
  returnStoreId: number,
  stores: Array<{ id: number; latitude: number; longitude: number }>
): DistanceResult {
  // 如果是同一门店,距离为0
  if (pickupStoreId === returnStoreId) {
    return {
      distance: 0,
      distanceFormatted: '0公里'
    }
  }

  // 查找门店
  const pickupStore = stores.find((s) => s.id === pickupStoreId)
  const returnStore = stores.find((s) => s.id === returnStoreId)

  if (!pickupStore) {
    throw new Error(`取车门店不存在: ID=${pickupStoreId}`)
  }

  if (!returnStore) {
    throw new Error(`还车门店不存在: ID=${returnStoreId}`)
  }

  // 计算距离(使用缓存)
  return calculateDistanceWithCache(
    { latitude: pickupStore.latitude, longitude: pickupStore.longitude },
    { latitude: returnStore.latitude, longitude: returnStore.longitude }
  )
}

/**
 * 清空距离缓存
 */
export function clearDistanceCache(): void {
  distanceCache.clear()
}

/**
 * 获取缓存大小
 */
export function getDistanceCacheSize(): number {
  return distanceCache.size
}

/**
 * 批量计算多个门店间的距离
 * @param storeIds 门店ID列表
 * @param stores 门店列表
 * @returns 距离矩阵 { [fromId-toId]: DistanceResult }
 */
export function calculateStoreDistanceMatrix(
  storeIds: number[],
  stores: Array<{ id: number; latitude: number; longitude: number }>
): Record<string, DistanceResult> {
  const matrix: Record<string, DistanceResult> = {}

  for (let i = 0; i < storeIds.length; i++) {
    for (let j = i + 1; j < storeIds.length; j++) {
      const fromId = storeIds[i]
      const toId = storeIds[j]
      const key = `${fromId}-${toId}`

      try {
        const result = calculateStoreDistance(fromId, toId, stores)
        matrix[key] = result
        // 反向也存储
        matrix[`${toId}-${fromId}`] = result
      } catch (error) {
        console.error(`计算门店距离失败: ${fromId} -> ${toId}`, error)
      }
    }
  }

  return matrix
}
