/**
 * DIY可视化编辑器类型定义
 */

// 组件基础类型
export interface BaseComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  styles: ComponentStyles;
  parentId?: string;
  sortIndex: number;
  children?: BaseComponent[];
}

// 组件样式
export interface ComponentStyles {
  display?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed';
  width?: number | string;
  height?: number | string;
  left?: number | string;
  top?: number | number | string;
  right?: number | string;
  bottom?: number | string;
  zIndex?: number;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  border?: string;
  borderRadius?: number | string;
  boxShadow?: string;
  padding?: number | string;
  margin?: number | string;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: number | string;
  fontSize?: number | string;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
}

// 页面配置
export interface PageConfiguration {
  id: string;
  name: string;
  description?: string;
  type: 'home' | 'community' | 'crowdfunding' | 'profile';
  components: BaseComponent[];
  settings: PageSettings;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

// 页面设置
export interface PageSettings {
  backgroundColor?: string;
  backgroundImage?: string;
  maxWidth?: number;
  padding?: number;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  layout?: {
    type?: 'fixed' | 'responsive';
    containerWidth?: number;
  };
}

// 组件库项
export interface ComponentLibraryItem {
  type: string;
  name: string;
  icon: string;
  category: ComponentCategory;
  description: string;
  defaultProps: Record<string, any>;
  previewImage?: string;
  schema?: ComponentSchema;
}

// 组件分类
export type ComponentCategory =
  | 'basic'      // 基础组件
  | 'layout'     // 布局组件
  | 'business'   // 业务组件
  | 'navigation' // 导航组件
  | 'media'      // 媒体组件
  | 'form'       // 表单组件;

// 组件Schema
export interface ComponentSchema {
  type: string;
  name: string;
  category: ComponentCategory;
  icon: string;
  description: string;
  version: string;
  properties: Record<string, ComponentProperty>;
  events?: ComponentEvent[];
  styleConfig?: StyleConfig;
}

// 组件属性
export interface ComponentProperty {
  type: 'text' | 'number' | 'boolean' | 'color' | 'select' | 'array' | 'object' | 'image' | 'action';
  title: string;
  description?: string;
  default?: any;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any; description?: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// 组件事件
export interface ComponentEvent {
  name: string;
  title: string;
  description?: string;
}

// 样式配置
export interface StyleConfig {
  layout?: boolean;
  spacing?: boolean;
  typography?: boolean;
  border?: boolean;
  background?: boolean;
}

// 项目信息
export interface DiyProject {
  id: string;
  name: string;
  description?: string;
  type: PageConfiguration['type'];
  status: 'draft' | 'published' | 'archived';
  pageConfig: PageConfiguration;
  templateId?: string;
  publishedVersion?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// 模板信息
export interface DiyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  previewData?: any;
  config: PageConfiguration;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// 拖拽相关
export interface DragItem {
  componentType: string;
  componentData: Partial<BaseComponent>;
}

export interface DropTarget {
  componentId: string;
  position: 'before' | 'after' | 'inside';
  index?: number;
}

// 编辑器状态
export interface EditorState {
  currentPage: PageConfiguration | null;
  selectedComponentId: string | null;
  clipboardComponent: BaseComponent | null;
  history: {
    past: PageConfiguration[];
    present: number;
    future: PageConfiguration[];
  };
  isPreview: boolean;
  zoom: number;
  canvasSize: {
    width: number;
    height: number;
  };
}

// 动作配置
export interface ActionConfig {
  type: 'navigate' | 'webview' | 'phone' | 'miniprogram' | 'action';
  target: string;
  params?: Record<string, any>;
}

// KingKong导航配置
export interface KingKongConfig {
  title: string;
  columns: number;
  items: KingKongItem[];
  styles?: ComponentStyles;
}

export interface KingKongItem {
  id: string;
  title: string;
  iconType: string;
  iconColor?: string;
  iconImage?: string;
  action?: ActionConfig;
}

// 响应式断点
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 响应式配置
export interface ResponsiveConfig {
  [key in Breakpoint]: {
    display?: boolean;
    width?: number | string;
    height?: number | string;
    fontSize?: number | string;
    margin?: number | string;
    padding?: number | string;
  };
}

// API响应类型
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

// 分页参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 操作日志
export interface OperationLog {
  id: string;
  projectId?: string;
  pageId?: string;
  operation: 'create' | 'update' | 'delete' | 'publish' | 'preview';
  description: string;
  beforeData?: any;
  afterData?: any;
  userId: string;
  ip: string;
  userAgent: string;
  createdAt: string;
}