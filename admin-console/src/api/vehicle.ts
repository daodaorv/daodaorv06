/**
 * 车辆管理相关API接口
 */
import request from './request';
import type {
  Vehicle,
  VehicleListParams,
  VehicleCreateParams,
  VehicleStats,
  VehicleMaintenance,
  VehicleBooking,
  VehicleReview,
  VehicleListResponse,
  VehicleDetailResponse,
  VehicleStatsResponse,
  BookingStatus,
  MaintenanceStatus
} from '@/types/vehicle';

// 车辆管理API
export const getVehicles = (params?: VehicleListParams) => {
  return request.get<ApiResponse<Vehicle[]>>('/api/v1/vehicles', { params });
};

export const getVehicle = (id: string) => {
  return request.get<ApiResponse<Vehicle>>(`/api/v1/vehicles/${id}`);
};

export const createVehicle = (data: VehicleCreateParams) => {
  return request.post<ApiResponse<Vehicle>>('/api/v1/vehicles', data);
};

export const updateVehicle = (id: string, data: Partial<VehicleCreateParams>) => {
  return request.put<ApiResponse<Vehicle>>(`/api/v1/vehicles/${id}`, data);
};

export const deleteVehicle = (id: string) => {
  return request.delete<ApiResponse<null>>(`/api/v1/vehicles/${id}`);
};

export const updateVehicleStatus = (id: string, status: Vehicle['status']) => {
  return request.patch<ApiResponse<Vehicle>>(`/api/v1/vehicles/${id}/status`, { status });
};

// 车辆图片管理
export const uploadVehicleImage = (vehicleId: string, formData: FormData) => {
  return request.post<ApiResponse<any>>(`/api/v1/vehicles/${vehicleId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteVehicleImage = (vehicleId: string, imageId: string) => {
  return request.delete<ApiResponse<null>>(`/api/v1/vehicles/${vehicleId}/images/${imageId}`);
};

export const setMainImage = (vehicleId: string, imageId: string) => {
  return request.patch<ApiResponse<null>>(`/api/v1/vehicles/${vehicleId}/images/${imageId}/main`);
};

// 车辆维护管理
export const getVehicleMaintenance = (vehicleId: string, params?: { page?: number; pageSize?: number }) => {
  return request.get<ApiResponse<VehicleMaintenance[]>>(`/api/v1/vehicles/${vehicleId}/maintenance`, { params });
};

export const createMaintenanceRecord = (vehicleId: string, data: Omit<VehicleMaintenance, 'id' | 'createdAt' | 'updatedAt'>) => {
  return request.post<ApiResponse<VehicleMaintenance>>(`/api/v1/vehicles/${vehicleId}/maintenance`, data);
};

export const updateMaintenanceRecord = (vehicleId: string, maintenanceId: string, data: Partial<VehicleMaintenance>) => {
  return request.put<ApiResponse<VehicleMaintenance>>(`/api/v1/vehicles/${vehicleId}/maintenance/${maintenanceId}`, data);
};

export const deleteMaintenanceRecord = (vehicleId: string, maintenanceId: string) => {
  return request.delete<ApiResponse<null>>(`/api/v1/vehicles/${vehicleId}/maintenance/${maintenanceId}`);
};

export const updateMaintenanceStatus = (vehicleId: string, maintenanceId: string, status: MaintenanceStatus) => {
  return request.patch<ApiResponse<VehicleMaintenance>>(`/api/v1/vehicles/${vehicleId}/maintenance/${maintenanceId}/status`, { status });
};

// 车辆预约管理
export const getVehicleBookings = (vehicleId: string, params?: { page?: number; pageSize?: number; status?: BookingStatus }) => {
  return request.get<ApiResponse<VehicleBooking[]>>(`/api/v1/vehicles/${vehicleId}/bookings`, { params });
};

export const updateBookingStatus = (vehicleId: string, bookingId: string, status: BookingStatus) => {
  return request.patch<ApiResponse<VehicleBooking>>(`/api/v1/vehicles/${vehicleId}/bookings/${bookingId}/status`, { status });
};

// 车辆评价管理
export const getVehicleReviews = (vehicleId: string, params?: { page?: number; pageSize?: number }) => {
  return request.get<ApiResponse<VehicleReview[]>>(`/api/v1/vehicles/${vehicleId}/reviews`, { params });
};

export const replyToReview = (vehicleId: string, reviewId: string, reply: string) => {
  return request.post<ApiResponse<VehicleReview>>(`/api/v1/vehicles/${vehicleId}/reviews/${reviewId}/reply`, { reply });
};

// 车辆统计
export const getVehicleStats = (params?: { startDate?: string; endDate?: string }) => {
  return request.get<ApiResponse<VehicleStats>>('/api/v1/vehicles/stats', { params });
};

// 车辆可用性管理
export const updateVehicleAvailability = (vehicleId: string, availability: Vehicle['availability']) => {
  return request.put<ApiResponse<Vehicle>>(`/api/v1/vehicles/${vehicleId}/availability`, { availability });
};

export const blockDates = (vehicleId: string, dates: { startDate: string; endDate: string; reason: string; type: 'maintenance' | 'event' | 'block' }[]) => {
  return request.post<ApiResponse<Vehicle>>(`/api/v1/vehicles/${vehicleId}/block-dates`, { dates });
};

export const unblockDates = (vehicleId: string, blockedDateIds: string[]) => {
  return request.delete<ApiResponse<Vehicle>>(`/api/v1/vehicles/${vehicleId}/block-dates`, { data: { blockedDateIds } });
};

// 车辆导出
export const exportVehicles = (params?: VehicleListParams & { format?: 'excel' | 'csv' }) => {
  return request.get('/api/v1/vehicles/export', {
    params,
    responseType: 'blob'
  });
};

// 车辆批量操作
export const batchUpdateStatus = (vehicleIds: string[], status: Vehicle['status']) => {
  return request.patch<ApiResponse<null>>('/api/v1/vehicles/batch/status', { vehicleIds, status });
};

export const batchDelete = (vehicleIds: string[]) => {
  return request.delete<ApiResponse<null>>('/api/v1/vehicles/batch', { data: { vehicleIds } });
};

// 车辆品牌管理
export const getVehicleBrands = () => {
  return request.get<ApiResponse<{ brand: string; count: number }[]>>('/api/v1/vehicles/brands');
};

export const getVehicleModels = (brand: string) => {
  return request.get<ApiResponse<string[]>>(`/api/v1/vehicles/brands/${brand}/models`);
};

// 车辆位置管理
export const getVehicleLocations = () => {
  return request.get<ApiResponse<{ location: string; count: number }[]>>('/api/v1/vehicles/locations');
};

export const updateVehicleLocation = (vehicleId: string, location: string) => {
  return request.patch<ApiResponse<Vehicle>>(`/api/v1/vehicles/${vehicleId}/location`, { location });
};

// 统一导出API对象
export const vehicleApi = {
  // 基础管理
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,

  // 图片管理
  uploadVehicleImage,
  deleteVehicleImage,
  setMainImage,

  // 维护管理
  getVehicleMaintenance,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  updateMaintenanceStatus,

  // 预约管理
  getVehicleBookings,
  updateBookingStatus,

  // 评价管理
  getVehicleReviews,
  replyToReview,

  // 统计分析
  getVehicleStats,

  // 可用性管理
  updateVehicleAvailability,
  blockDates,
  unblockDates,

  // 导出和批量操作
  exportVehicles,
  batchUpdateStatus,
  batchDelete,

  // 品牌和位置
  getVehicleBrands,
  getVehicleModels,
  getVehicleLocations,
  updateVehicleLocation
};