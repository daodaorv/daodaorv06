/**
 * DIY相关API接口
 */
import request from './request';
import type { ApiResponse, DiyProject, DiyTemplate, PaginationParams, PageConfiguration } from '@/types/diy';

// 项目管理API
export const getDiyProjects = (params?: PaginationParams) => {
  return request.get<ApiResponse<DiyProject[]>>('/api/v1/diy/projects', { params });
};

export const getDiyProject = (id: string) => {
  return request.get<ApiResponse<DiyProject>>(`/api/v1/diy/projects/${id}`);
};

export const createDiyProject = (data: Partial<DiyProject>) => {
  return request.post<ApiResponse<DiyProject>>('/api/v1/diy/projects', data);
};

export const updateDiyProject = (id: string, data: Partial<DiyProject>) => {
  return request.put<ApiResponse<DiyProject>>(`/api/v1/diy/projects/${id}`, data);
};

export const deleteDiyProject = (id: string) => {
  return request.delete<ApiResponse<null>>(`/api/v1/diy/projects/${id}`);
};

export const publishDiyProject = (id: string) => {
  return request.post<ApiResponse<null>>(`/api/v1/diy/projects/${id}/publish`);
};

export const savePageConfig = (id: string, config: PageConfiguration) => {
  return request.put<ApiResponse<PageConfiguration>>(`/api/v1/diy/projects/${id}/config`, { config });
};

export const getPageConfig = (id: string) => {
  return request.get<ApiResponse<PageConfiguration>>(`/api/v1/diy/projects/${id}/config`);
};

// 模板管理API
export const getTemplates = (params?: any) => {
  return request.get<ApiResponse<{
    items: any[];
    total: number;
    page: number;
    pageSize: number;
  }>>('/api/v1/diy/templates', { params });
};

export const getTemplate = (id: string) => {
  return request.get<ApiResponse<any>>(`/api/v1/diy/templates/${id}`);
};

export const createTemplate = (data: any) => {
  return request.post<ApiResponse<any>>('/api/v1/diy/templates', data);
};

export const updateTemplate = (id: string, data: any) => {
  return request.put<ApiResponse<any>>(`/api/v1/diy/templates/${id}`, data);
};

export const deleteTemplate = (id: string) => {
  return request.delete<ApiResponse<null>>(`/api/v1/diy/templates/${id}`);
};

export const copyTemplate = (id: string, data: any) => {
  return request.post<ApiResponse<any>>(`/api/v1/diy/templates/${id}/copy`, data);
};

export const exportTemplate = (id: string) => {
  return request.get<ApiResponse<any>>(`/api/v1/diy/templates/${id}/export`);
};

export const createFromTemplate = (templateId: string, data: any) => {
  return request.post<ApiResponse<DiyProject>>('/api/v1/diy/projects/from-template', { templateId, ...data });
};

// 兼容旧接口
export const getDiyTemplates = (params?: PaginationParams) => {
  return getTemplates(params);
};

export const getDiyTemplate = (id: string) => {
  return getTemplate(id);
};

export const createDiyTemplate = (data: Partial<DiyTemplate>) => {
  return createTemplate(data);
};

export const updateDiyTemplate = (id: string, data: Partial<DiyTemplate>) => {
  return updateTemplate(id, data);
};

export const deleteDiyTemplate = (id: string) => {
  return deleteTemplate(id);
};

export const useTemplate = (templateId: string, projectData: Partial<DiyProject>) => {
  return createFromTemplate(templateId, projectData);
};

// 组件库API
export const getComponentSchemas = () => {
  return request.get<ApiResponse<Record<string, any>>>('/api/v1/diy/library/schemas');
};

export const getComponentSchema = (type: string) => {
  return request.get<ApiResponse<any>>(`/api/v1/diy/library/schemas/${type}`);
};

export const getComponentLibrary = (params?: PaginationParams) => {
  return request.get<ApiResponse<any>>('/api/v1/diy/library', { params });
};

// 渲染API
export const renderComponent = (componentConfig: any, context?: any) => {
  return request.post<ApiResponse<{ html: string; css: string; js?: string }>>('/api/v1/diy/library/render', { componentConfig, context });
};

export const renderPage = (pageConfig: PageConfiguration, context?: any) => {
  return request.post<ApiResponse<{ html: string; css: string; js?: string }>>('/api/v1/diy/render/page', { pageConfig, context });
};

// 操作日志API
export const getOperationLogs = (projectId: string, params?: PaginationParams) => {
  return request.get<ApiResponse<any[]>>(`/api/v1/diy/logs/projects/${projectId}`, { params });
};

export const createOperationLog = (data: any) => {
  return request.post<ApiResponse<any>>('/api/v1/diy/logs', data);
};

// 统一导出API对象
export const diyApi = {
  // 项目管理
  getProjects: getDiyProjects,
  getProject: getDiyProject,
  createProject: createDiyProject,
  updateProject: updateDiyProject,
  deleteProject: deleteDiyProject,
  publishProject: publishDiyProject,
  savePageConfig,
  getPageConfig,

  // 模板管理
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  copyTemplate,
  exportTemplate,
  createFromTemplate,

  // 兼容旧方法
  getDiyTemplates,
  getDiyTemplate,
  createDiyTemplate,
  updateDiyTemplate,
  deleteDiyTemplate,
  useTemplate,

  // 组件库
  getComponentSchemas,
  getComponentSchema,
  getComponentLibrary,

  // 渲染
  renderComponent,
  renderPage,

  // 日志
  getOperationLogs,
  createOperationLog
};