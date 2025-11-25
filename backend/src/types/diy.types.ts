/**
 * DIY页面配置相关数据类型定义
 */

// 页面类型枚举
export enum PageType {
  HOME = 'home',
  COMMUNITY = 'community',
  CROWDFUNDING = 'crowdfunding',
  PROFILE = 'profile'
}

// 页面状态枚举
export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// 组件分类枚举
export enum ComponentCategory {
  BASIC = 'basic',       // 基础组件
  LAYOUT = 'layout',     // 布局组件
  BUSINESS = 'business', // 业务组件
  NAVIGATION = 'navigation', // 导航组件
  MEDIA = 'media',       // 媒体组件
  FORM = 'form'         // 表单组件
}

// 操作类型枚举
export enum ActionType {
  NAVIGATE = 'navigate',     // 页面导航
  WEBVIEW = 'webview',       // 网页跳转
  MINIPROGRAM = 'miniProgram', // 小程序跳转
  PHONE = 'phone',           // 拨打电话
  ACTION = 'action',         // 自定义动作
  NONE = 'none'             // 无动作
}

import {
  ComponentSchema,
  ComponentSchemas,
  ComponentSchemaType
} from './component.schema';
export interface ActionConfig {
  type: ActionType;
  target: string;
  params?: Record<string, any>;
}

// 组件样式接口
export interface ComponentStyles {
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  padding?: number | string;
  margin?: number | string;
  width?: number | string;
  height?: number | string;
  backgroundColor?: string;
  backgroundImage?: string;
  borderRadius?: number | string;
  borderWidth?: number;
  borderColor?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: string | number;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  opacity?: number;
  zIndex?: number;
  position?: 'relative' | 'absolute' | 'fixed' | 'static';
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  shadow?: {
    offsetX?: number;
    offsetY?: number;
    blur?: number;
    color?: string;
  };
}

// 数据源配置
export interface DataSourceConfig {
  type: 'static' | 'api' | 'user';
  apiUrl?: string;
  apiMethod?: 'GET' | 'POST';
  apiParams?: Record<string, any>;
  staticData?: any;
  refreshInterval?: number;
  cacheTime?: number;
}

// 显示条件
export interface DisplayCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  logic?: 'and' | 'or';
}

// 基础组件实例
export interface BaseComponent {
  id: string;
  type: string; // 组件类型标识
  props: Record<string, any>;
  styles: ComponentStyles;
  dataSource?: DataSourceConfig;
  children?: BaseComponent[];
  conditions?: DisplayCondition[];
  animations?: AnimationConfig[];
  events?: EventConfig[];
  parentId?: string;
  sortIndex: number;
}

// 动画配置
export interface AnimationConfig {
  name: string;
  duration: number;
  delay: number;
  iteration: number | 'infinite';
  direction: 'normal' | 'reverse' | 'alternate';
  timing: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

// 事件配置
export interface EventConfig {
  trigger: 'click' | 'hover' | 'load';
  action: ActionConfig;
  params?: Record<string, any>;
}

// 金刚区项目配置
export interface KingKongItem {
  id: string;
  title: string;
  iconType: string;
  iconColor: string;
  iconSize?: number;
  action?: ActionConfig;
  styles?: ComponentStyles;
}

// 金刚区配置
export interface KingKongConfig {
  title?: string;
  subtitle?: string;
  showHeader: boolean;
  columns: 2 | 3 | 4 | 5;
  iconSize: number;
  spacing: number;
  backgroundColor: string;
  padding: {
    horizontal: number;
    vertical: number;
  };
  borderRadius: number;
  items: KingKongItem[];
}

// 轮播图项目
export interface BannerItem {
  url: string;
  title?: string;
  description?: string;
  action?: ActionConfig;
}

// 轮播图配置
export interface BannerConfig {
  images: BannerItem[];
  autoplay: boolean;
  interval: number;
  indicatorDots: boolean;
  circular: boolean;
  height: number;
  borderRadius: number;
}

// 商品卡片配置
export interface ProductCardConfig {
  image: string;
  name: string;
  price: number;
  unit?: string;
  rating?: number;
  tags?: string[];
  showPrice: boolean;
  showRating: boolean;
  showTags: boolean;
  action?: ActionConfig;
}

// 页面配置
export interface PageConfiguration {
  id: string;
  name: string;
  description?: string;
  pageType: PageType;
  status: PageStatus;
  version: number;

  // 页面设置
  pageSettings: {
    backgroundColor: string;
    backgroundImage?: string;
    navigationBar: {
      title: string;
      backgroundColor: string;
      textColor: string;
      showTitle: boolean;
    };
    enablePullRefresh: boolean;
    enableReachBottom: boolean;
  };

  // DIY区域配置
  diyAreas: {
    [areaId: string]: {
      layout: 'grid' | 'list' | 'free';
      components: BaseComponent[];
      styles: ComponentStyles;
    };
  };

  // 金刚区配置（首页特有）
  kingKongConfig?: KingKongConfig;

  // 推广内容配置
  promotions: {
    [position: string]: {
      type: string;
      config: Record<string, any>;
      enabled: boolean;
      startTime?: string;
      endTime?: string;
    };
  };

  // 元数据
  metadata: {
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    author: string;
    templateId?: string;
    tags: string[];
    preview?: string;
    versionNotes?: string;
  };
}

// 页面配置创建请求
export interface CreatePageRequest {
  name: string;
  description?: string;
  pageType: PageType;
  templateId?: string;
  config?: Partial<PageConfiguration>;
}

// 页面配置更新请求
export interface UpdatePageRequest {
  name?: string;
  description?: string;
  status?: PageStatus;
  config?: Partial<PageConfiguration>;
}

// 组件库配置
export interface ComponentDefinition {
  id: string;
  name: string;
  type: string;
  category: ComponentCategory;
  icon: string;
  description: string;
  configSchema: ConfigSchema;
  defaultProps: Record<string, any>;
  previewImage?: string;
  previewComponent?: string;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
  version: string;
}

// 组件实体接口（用于数据库操作）
export interface Component {
  id: string;
  name: string;
  type: string;
  category: ComponentCategory;
  icon: string;
  description: string;
  configSchema: Record<string, any>; // 使用any类型以兼容数据库JSON字段
  defaultProps: Record<string, any>;
  previewImage?: string;
  previewComponent?: string;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
  version: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// 配置模式
export interface ConfigSchema {
  props: ConfigPropDefinition[];
  styles?: ConfigPropDefinition[];
  events?: ConfigPropDefinition[];
  layout?: ConfigPropDefinition[];
}

// 配置属性定义
export interface ConfigPropDefinition {
  key: string;
  type: 'text' | 'number' | 'boolean' | 'color' | 'select' | 'image' | 'icon' | 'action' | 'array' | 'object';
  label: string;
  description?: string;
  required?: boolean;
  default?: any;
  min?: number;
  max?: number;
  options?: string[] | { label: string; value: any }[];
  placeholder?: string;
  validation?: {
    pattern?: string;
    message?: string;
  };
  itemSchema?: ConfigSchema; // 数组项的模式
}

// 模板配置
export interface TemplateConfiguration {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  previewData: any;
  config: PageConfiguration;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  rating: number;
  author: string;
  createdAt: string;
  updatedAt: string;
  version: string;
}

// 发布历史记录
export interface PublicationRecord {
  id: string;
  pageId: string;
  version: number;
  config: PageConfiguration;
  status: 'active' | 'inactive' | 'replaced';
  publishedBy: string;
  publishedAt: string;
  replacedAt?: string;
  notes?: string;
}

// 操作日志记录
export interface OperationLog {
  id: string;
  pageId?: string;
  actionType: 'create' | 'update' | 'delete' | 'publish' | 'restore' | 'copy';
  details: Record<string, any>;
  beforeConfig?: PageConfiguration;
  afterConfig?: PageConfiguration;
  userId: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

// 媒体资源
export interface MediaResource {
  id: string;
  name: string;
  type: 'image' | 'video' | 'icon' | 'audio' | 'document';
  filePath: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  metadata: Record<string, any>;
  uploadedBy: string;
  uploadedAt: string;
}

// API响应通用格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

// 分页请求参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: PageStatus;
  category?: ComponentCategory;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页响应结果
export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 页面列表查询参数
export interface PageListParams extends PaginationParams {
  pageType?: PageType;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

// 组件列表查询参数
export interface ComponentListParams extends PaginationParams {
  category?: ComponentCategory;
  isSystem?: boolean;
  isActive?: boolean;
}

// 模板列表查询参数
export interface TemplateListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  isPublic?: boolean;
  author?: string;
  minRating?: number;
  minUsageCount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 发布请求
export interface PublishRequest {
  versionNotes?: string;
  publishAt?: string; // 定时发布时间
}

// 预览请求
export interface PreviewRequest {
  config: PageConfiguration;
  device?: 'mobile' | 'tablet' | 'desktop';
}

// 复制页面请求
export interface CopyPageRequest {
  name: string;
  description?: string;
  config?: Partial<PageConfiguration>;
}

// 版本对比结果
export interface VersionCompareResult {
  pageId: string;
  version1: number;
  version2: number;
  differences: {
    type: 'added' | 'modified' | 'deleted';
    componentId?: string;
    path?: string;
    oldValue?: any;
    newValue?: any;
    description: string;
  }[];
}