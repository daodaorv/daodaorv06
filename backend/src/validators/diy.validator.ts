import {
  CreatePageRequest,
  UpdatePageRequest,
  PublishRequest,
  CopyPageRequest,
  PageConfiguration,
  KingKongConfig,
  BaseComponent,
  ComponentDefinition,
  ActionConfig
} from '../types/diy.types';
import { PageType, PageStatus } from '../types/diy.types';

/**
 * 验证页面创建请求
 */
export function validatePageCreate(data: CreatePageRequest): string[] {
  const errors: string[] = [];

  // 验证页面名称
  if (!data.name || data.name.trim().length === 0) {
    errors.push('页面名称不能为空');
  } else if (data.name.length > 255) {
    errors.push('页面名称不能超过255个字符');
  }

  // 验证页面类型
  if (!data.pageType || !Object.values(PageType).includes(data.pageType)) {
    errors.push('页面类型无效');
  }

  // 验证描述长度
  if (data.description && data.description.length > 1000) {
    errors.push('页面描述不能超过1000个字符');
  }

  // 验证模板ID
  if (data.templateId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.templateId)) {
    errors.push('模板ID格式无效');
  }

  // 验证配置数据
  if (data.config) {
    errors.push(...validatePageConfig(data.config));
  }

  return errors;
}

/**
 * 验证页面更新请求
 */
export function validatePageUpdate(data: UpdatePageRequest): string[] {
  const errors: string[] = [];

  // 验证页面名称
  if (data.name) {
    if (data.name.trim().length === 0) {
      errors.push('页面名称不能为空');
    } else if (data.name.length > 255) {
      errors.push('页面名称不能超过255个字符');
    }
  }

  // 验证描述长度
  if (data.description && data.description.length > 1000) {
    errors.push('页面描述不能超过1000个字符');
  }

  // 验证页面状态
  if (data.status && !Object.values(PageStatus).includes(data.status)) {
    errors.push('页面状态无效');
  }

  // 验证配置数据
  if (data.config) {
    errors.push(...validatePageConfig(data.config));
  }

  return errors;
}

/**
 * 验证发布请求
 */
export function validatePublish(data: PublishRequest): string[] {
  const errors: string[] = [];

  // 验证版本说明
  if (data.versionNotes && data.versionNotes.length > 500) {
    errors.push('版本说明不能超过500个字符');
  }

  // 验证定时发布时间
  if (data.publishAt) {
    const publishDate = new Date(data.publishAt);
    if (isNaN(publishDate.getTime())) {
      errors.push('发布时间格式无效');
    } else if (publishDate <= new Date()) {
      errors.push('发布时间必须是未来时间');
    }
  }

  return errors;
}

/**
 * 验证复制页面请求
 */
export function validateCopyPage(data: CopyPageRequest): string[] {
  const errors: string[] = [];

  // 验证新页面名称
  if (!data.name || data.name.trim().length === 0) {
    errors.push('新页面名称不能为空');
  } else if (data.name.length > 255) {
    errors.push('新页面名称不能超过255个字符');
  }

  // 验证描述长度
  if (data.description && data.description.length > 1000) {
    errors.push('页面描述不能超过1000个字符');
  }

  // 验证配置数据
  if (data.config) {
    errors.push(...validatePageConfig(data.config));
  }

  return errors;
}

/**
 * 验证页面配置数据
 */
export function validatePageConfig(config: Partial<PageConfiguration>): string[] {
  const errors: string[] = [];

  // 验证页面设置
  if (config.pageSettings) {
    errors.push(...validatePageSettings(config.pageSettings));
  }

  // 验证金刚区配置
  if (config.kingKongConfig) {
    errors.push(...validateKingKongConfig(config.kingKongConfig));
  }

  // 验证DIY区域配置
  if (config.diyAreas) {
    errors.push(...validateDiyAreas(config.diyAreas));
  }

  // 验证推广内容配置
  if (config.promotions) {
    errors.push(...validatePromotions(config.promotions));
  }

  return errors;
}

/**
 * 验证页面设置
 */
function validatePageSettings(pageSettings: any): string[] {
  const errors: string[] = [];

  // 验证背景颜色
  if (pageSettings.backgroundColor && !/^#[0-9A-Fa-f]{6}$/.test(pageSettings.backgroundColor)) {
    errors.push('背景颜色格式无效，必须是十六进制颜色代码');
  }

  // 验证导航栏配置
  if (pageSettings.navigationBar) {
    if (!pageSettings.navigationBar.title || pageSettings.navigationBar.title.length > 50) {
      errors.push('导航栏标题长度必须在1-50个字符之间');
    }

    if (pageSettings.navigationBar.backgroundColor && !/^#[0-9A-Fa-f]{6}$/.test(pageSettings.navigationBar.backgroundColor)) {
      errors.push('导航栏背景颜色格式无效');
    }

    if (pageSettings.navigationBar.textColor && !/^#[0-9A-Fa-f]{6}$/.test(pageSettings.navigationBar.textColor)) {
      errors.push('导航栏文字颜色格式无效');
    }

    if (typeof pageSettings.navigationBar.showTitle !== 'boolean') {
      errors.push('导航栏显示标题必须为布尔值');
    }
  }

  return errors;
}

/**
 * 验证金刚区配置
 */
function validateKingKongConfig(config: KingKongConfig): string[] {
  const errors: string[] = [];

  // 验证列数
  if (config.columns && ![2, 3, 4, 5].includes(config.columns)) {
    errors.push('金刚区列数必须是2、3、4、5中的一个');
  }

  // 验证图标大小
  if (config.iconSize && (config.iconSize < 12 || config.iconSize > 64)) {
    errors.push('图标大小必须在12-64之间');
  }

  // 验证间距
  if (config.spacing && (config.spacing < 0 || config.spacing > 100)) {
    errors.push('间距必须在0-100之间');
  }

  // 验证边距
  if (config.padding) {
    if (config.padding.horizontal && (config.padding.horizontal < 0 || config.padding.horizontal > 200)) {
      errors.push('水平边距必须在0-200之间');
    }
    if (config.padding.vertical && (config.padding.vertical < 0 || config.padding.vertical > 200)) {
      errors.push('垂直边距必须在0-200之间');
    }
  }

  // 验证圆角
  if (config.borderRadius && (config.borderRadius < 0 || config.borderRadius > 50)) {
    errors.push('圆角半径必须在0-50之间');
  }

  // 验证背景颜色
  if (config.backgroundColor && !/^#[0-9A-Fa-f]{6}$/.test(config.backgroundColor)) {
    errors.push('金刚区背景颜色格式无效');
  }

  // 验证项目配置
  if (config.items) {
    if (!Array.isArray(config.items)) {
      errors.push('金刚区项目必须为数组');
    } else {
      config.items.forEach((item, index) => {
        const itemErrors = validateKingKongItem(item, index);
        errors.push(...itemErrors);
      });
    }
  }

  return errors;
}

/**
 * 验证金刚区项目
 */
function validateKingKongItem(item: any, index: number): string[] {
  const errors: string[] = [];

  if (!item.title || item.title.trim().length === 0) {
    errors.push(`金刚区项目${index + 1}标题不能为空`);
  }

  if (item.title && item.title.length > 20) {
    errors.push(`金刚区项目${index + 1}标题不能超过20个字符`);
  }

  if (!item.iconType || item.iconType.trim().length === 0) {
    errors.push(`金刚区项目${index + 1}图标类型不能为空`);
  }

  if (item.iconColor && !/^#[0-9A-Fa-f]{6}$/.test(item.iconColor)) {
    errors.push(`金刚区项目${index + 1}图标颜色格式无效`);
  }

  if (item.iconSize && (item.iconSize < 12 || item.iconSize > 64)) {
    errors.push(`金刚区项目${index + 1}图标大小必须在12-64之间`);
  }

  // 验证动作配置
  if (item.action) {
    errors.push(...validateActionConfig(item.action, `金刚区项目${index + 1}`));
  }

  return errors;
}

/**
 * 验证DIY区域配置
 */
function validateDiyAreas(diyAreas: any): string[] {
  const errors: string[] = [];

  if (typeof diyAreas !== 'object' || diyAreas === null) {
    errors.push('DIY区域必须为对象');
    return errors;
  }

  for (const [areaId, area] of Object.entries(diyAreas)) {
    if (!area || typeof area !== 'object') {
      errors.push(`DIY区域${areaId}配置必须为对象`);
      continue;
    }

    const areaConfig = area as any;

    // 验证布局类型
    if (areaConfig.layout && !['grid', 'list', 'free'].includes(areaConfig.layout)) {
      errors.push(`DIY区域${areaId}布局类型无效`);
    }

    // 验证组件数组
    if (areaConfig.components) {
      if (!Array.isArray(areaConfig.components)) {
        errors.push(`DIY区域${areaId}组件必须为数组`);
      } else {
        areaConfig.components.forEach((component: BaseComponent, index: number) => {
          const componentErrors = validateBaseComponent(component, `DIY区域${areaId}组件${index + 1}`);
          errors.push(...componentErrors);
        });
      }
    }
  }

  return errors;
}

/**
 * 验证基础组件
 */
function validateBaseComponent(component: BaseComponent, path: string): string[] {
  const errors: string[] = [];

  // 验证组件ID
  if (!component.id || component.id.trim().length === 0) {
    errors.push(`${path}的ID不能为空`);
  }

  // 验证组件类型
  if (!component.type || component.type.trim().length === 0) {
    errors.push(`${path}的类型不能为空`);
  }

  // 验证属性对象
  if (component.props && typeof component.props !== 'object') {
    errors.push(`${path}的属性必须为对象`);
  }

  // 验证样式对象
  if (component.styles && typeof component.styles !== 'object') {
    errors.push(`${path}的样式必须为对象`);
  }

  // 验证排序索引
  if (typeof component.sortIndex !== 'number' || component.sortIndex < 0) {
    errors.push(`${path}的排序索引必须为非负数`);
  }

  // 验证数据源配置
  if (component.dataSource) {
    errors.push(...validateDataSourceConfig(component.dataSource, `${path}的数据源`));
  }

  // 验证子组件
  if (component.children) {
    if (!Array.isArray(component.children)) {
      errors.push(`${path}的子组件必须为数组`);
    } else {
      component.children.forEach((child, index) => {
        const childErrors = validateBaseComponent(child, `${path}子组件${index + 1}`);
        errors.push(...childErrors);
      });
    }
  }

  // 验证事件配置
  if (component.events) {
    if (!Array.isArray(component.events)) {
      errors.push(`${path}的事件配置必须为数组`);
    } else {
      component.events.forEach((event, index) => {
        errors.push(...validateEventConfig(event, `${path}事件${index + 1}`));
      });
    }
  }

  return errors;
}

/**
 * 验证数据源配置
 */
function validateDataSourceConfig(dataSource: any, path: string): string[] {
  const errors: string[] = [];

  if (typeof dataSource !== 'object') {
    errors.push(`${path}必须为对象`);
    return errors;
  }

  // 验证数据源类型
  if (!dataSource.type || !['static', 'api', 'user'].includes(dataSource.type)) {
    errors.push(`${path}类型必须为static、api或user中的一个`);
  }

  // 验证API相关配置
  if (dataSource.type === 'api') {
    if (!dataSource.apiUrl || dataSource.apiUrl.trim().length === 0) {
      errors.push(`${path}的API地址不能为空`);
    }

    if (dataSource.apiMethod && !['GET', 'POST'].includes(dataSource.apiMethod)) {
      errors.push(`${path}的API方法必须为GET或POST`);
    }

    // 验证刷新间隔
    if (dataSource.refreshInterval && (dataSource.refreshInterval < 10 || dataSource.refreshInterval > 3600)) {
      errors.push(`${path}的刷新间隔必须在10-3600秒之间`);
    }

    // 验证缓存时间
    if (dataSource.cacheTime && (dataSource.cacheTime < 0 || dataSource.cacheTime > 7200)) {
      errors.push(`${path}的缓存时间必须在0-7200秒之间`);
    }
  }

  return errors;
}

/**
 * 验证事件配置
 */
function validateEventConfig(event: any, path: string): string[] {
  const errors: string[] = [];

  if (typeof event !== 'object') {
    errors.push(`${path}必须为对象`);
    return errors;
  }

  // 验证触发事件
  if (!event.trigger || !['click', 'hover', 'load'].includes(event.trigger)) {
    errors.push(`${path}的触发事件必须为click、hover或load中的一个`);
  }

  // 验证动作配置
  if (event.action) {
    errors.push(...validateActionConfig(event.action, `${path}的动作`));
  }

  return errors;
}

/**
 * 验证动作配置
 */
function validateActionConfig(action: ActionConfig, path: string): string[] {
  const errors: string[] = [];

  if (typeof action !== 'object') {
    errors.push(`${path}必须为对象`);
    return errors;
  }

  // 验证动作类型
  if (!action.type || !['navigate', 'webview', 'miniProgram', 'phone', 'action', 'none'].includes(action.type)) {
    errors.push(`${path}的类型必须为navigate、webview、miniProgram、phone、action或none中的一个`);
  }

  // 验证目标地址
  if (action.type !== 'none' && (!action.target || action.target.trim().length === 0)) {
    errors.push(`${path}的目标地址不能为空`);
  }

  // 验证电话号码
  if (action.type === 'phone' && action.target) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(action.target.replace(/\D/g, ''))) {
      errors.push(`${path}的电话号码格式无效`);
    }
  }

  return errors;
}

/**
 * 验证推广内容配置
 */
function validatePromotions(promotions: any): string[] {
  const errors: string[] = [];

  if (typeof promotions !== 'object' || promotions === null) {
    errors.push('推广内容配置必须为对象');
    return errors;
  }

  for (const [position, promotion] of Object.entries(promotions)) {
    if (!promotion || typeof promotion !== 'object') {
      errors.push(`推广位置${position}配置必须为对象`);
      continue;
    }

    const promoConfig = promotion as any;

    // 验证类型
    if (!promoConfig.type || promoConfig.type.trim().length === 0) {
      errors.push(`推广位置${position}的类型不能为空`);
    }

    // 验证配置对象
    if (!promoConfig.config || typeof promoConfig.config !== 'object') {
      errors.push(`推广位置${position}的配置必须为对象`);
    }

    // 验证启用状态
    if (typeof promoConfig.enabled !== 'boolean') {
      errors.push(`推广位置${position}的启用状态必须为布尔值`);
    }

    // 验证时间范围
    if (promoConfig.startTime && isNaN(new Date(promoConfig.startTime).getTime())) {
      errors.push(`推广位置${position}的开始时间格式无效`);
    }

    if (promoConfig.endTime && isNaN(new Date(promoConfig.endTime).getTime())) {
      errors.push(`推广位置${position}的结束时间格式无效`);
    }

    if (promoConfig.startTime && promoConfig.endTime && new Date(promoConfig.startTime) >= new Date(promoConfig.endTime)) {
      errors.push(`推广位置${position}的开始时间必须早于结束时间`);
    }
  }

  return errors;
}

/**
 * 验证组件定义
 */
export function validateComponentDefinition(component: ComponentDefinition): string[] {
  const errors: string[] = [];

  // 验证组件名称
  if (!component.name || component.name.trim().length === 0) {
    errors.push('组件名称不能为空');
  } else if (component.name.length > 100) {
    errors.push('组件名称不能超过100个字符');
  }

  // 验证组件类型
  if (!component.type || component.type.trim().length === 0) {
    errors.push('组件类型不能为空');
  } else if (!/^[a-z][a-z0-9-_]*$/i.test(component.type)) {
    errors.push('组件类型只能包含字母、数字、连字符和下划线，且必须以字母开头');
  }

  // 验证组件描述
  if (!component.description || component.description.trim().length === 0) {
    errors.push('组件描述不能为空');
  } else if (component.description.length > 500) {
    errors.push('组件描述不能超过500个字符');
  }

  // 验证配置模式
  if (!component.configSchema) {
    errors.push('组件配置模式不能为空');
  } else {
    errors.push(...validateConfigSchema(component.configSchema));
  }

  // 验证默认属性
  if (!component.defaultProps || typeof component.defaultProps !== 'object') {
    errors.push('组件默认属性必须为对象');
  }

  // 验证排序索引
  if (typeof component.sortOrder !== 'number' || component.sortOrder < 0) {
    errors.push('组件排序索引必须为非负数');
  }

  // 验证版本号
  if (!component.version || !/^\d+\.\d+\.\d+$/.test(component.version)) {
    errors.push('组件版本号格式无效，必须是x.y.z格式');
  }

  return errors;
}

/**
 * 验证配置模式
 */
function validateConfigSchema(schema: any): string[] {
  const errors: string[] = [];

  if (typeof schema !== 'object') {
    errors.push('配置模式必须为对象');
    return errors;
  }

  // 验证属性定义
  if (!schema.props || !Array.isArray(schema.props)) {
    errors.push('配置模式必须包含属性数组');
  } else {
    schema.props.forEach((prop: any, index: number) => {
      errors.push(...validateConfigPropDefinition(prop, `属性${index + 1}`));
    });
  }

  // 验证样式定义（可选）
  if (schema.styles && Array.isArray(schema.styles)) {
    schema.styles.forEach((style: any, index: number) => {
      errors.push(...validateConfigPropDefinition(style, `样式${index + 1}`));
    });
  }

  return errors;
}

/**
 * 验证配置属性定义
 */
function validateConfigPropDefinition(prop: any, path: string): string[] {
  const errors: string[] = [];

  if (typeof prop !== 'object') {
    errors.push(`${path}必须为对象`);
    return errors;
  }

  // 验证键名
  if (!prop.key || prop.key.trim().length === 0) {
    errors.push(`${path}的键名不能为空`);
  } else if (!/^[a-z][a-z0-9A-Z]*$/.test(prop.key)) {
    errors.push(`${path}的键名必须符合驼峰命名规范`);
  }

  // 验证类型
  const validTypes = ['text', 'number', 'boolean', 'color', 'select', 'image', 'icon', 'action', 'array', 'object'];
  if (!prop.type || !validTypes.includes(prop.type)) {
    errors.push(`${path}的类型必须为${validTypes.join('、')}中的一个`);
  }

  // 验证标签
  if (!prop.label || prop.label.trim().length === 0) {
    errors.push(`${path}的标签不能为空`);
  }

  // 验证描述
  if (prop.description && prop.description.length > 200) {
    errors.push(`${path}的描述不能超过200个字符`);
  }

  // 验证默认值
  if (prop.default !== undefined && prop.type === 'number' && typeof prop.default !== 'number') {
    errors.push(`${path}的默认值必须为数字`);
  }

  if (prop.default !== undefined && prop.type === 'boolean' && typeof prop.default !== 'boolean') {
    errors.push(`${path}的默认值必须为布尔值`);
  }

  // 验证数值范围
  if (prop.type === 'number') {
    if (prop.min !== undefined && (typeof prop.min !== 'number' || prop.min < 0)) {
      errors.push(`${path}的最小值必须为非负数`);
    }
    if (prop.max !== undefined && (typeof prop.max !== 'number' || prop.max < 0)) {
      errors.push(`${path}的最大值必须为非负数`);
    }
    if (prop.min !== undefined && prop.max !== undefined && prop.min >= prop.max) {
      errors.push(`${path}的最小值必须小于最大值`);
    }
  }

  return errors;
}