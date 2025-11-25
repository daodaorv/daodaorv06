/**
 * 组件库服务
 * 管理组件的CRUD操作、渲染和Schema提供
 */

import {
  Component,
  ApiResponse,
  PaginationResult,
  ComponentListParams,
  ComponentCategory
} from '../types/diy.types';
import { DiyComponent } from '../models/diy.models';
import {
  ComponentSchema,
  ComponentSchemas,
  ComponentSchemaType
} from '../types/component.schema';
import {
  ComponentRenderer,
  createRenderer,
  validateComponentConfig
} from './component.renderer';
import { Op } from 'sequelize';

/**
 * 组件库服务类
 */
export class ComponentLibraryService {
  /**
   * 获取所有组件Schema
   */
  static getComponentSchemas(): Record<string, ComponentSchema> {
    return ComponentSchemas;
  }

  /**
   * 获取单个组件Schema
   */
  static getComponentSchema(type: string): ComponentSchema | null {
    return ComponentSchemas[type as ComponentSchemaType] || null;
  }

  /**
   * 获取组件分类列表
   */
  static getComponentCategories(): Array<{ value: ComponentCategory; label: string; count: number }> {
    const categories = [
      { value: ComponentCategory.BASIC, label: '基础组件', count: 0 },
      { value: ComponentCategory.LAYOUT, label: '布局组件', count: 0 },
      { value: ComponentCategory.BUSINESS, label: '业务组件', count: 0 },
      { value: ComponentCategory.NAVIGATION, label: '导航组件', count: 0 },
      { value: ComponentCategory.MEDIA, label: '媒体组件', count: 0 },
      { value: ComponentCategory.FORM, label: '表单组件', count: 0 }
    ];

    // 返回所有分类（包括空分类）
    return categories;
  }

  /**
   * 获取组件列表
   */
  static async getComponents(params: ComponentListParams): Promise<PaginationResult<Component>> {
    try {
      const where: any = {};

      // 搜索条件
      if (params.search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${params.search}%` } },
          { description: { [Op.like]: `%${params.search}%` } }
        ];
      }

      // 分类筛选
      if (params.category) {
        where.category = params.category;
      }

      // 系统组件筛选
      if (params.isSystem !== undefined) {
        where.isSystem = params.isSystem;
      }

      // 启用状态筛选
      if (params.isActive !== undefined) {
        where.isActive = params.isActive;
      }

      const { rows, count } = await DiyComponent.findAndCountAll({
        where,
        limit: params.pageSize || 50,
        offset: ((params.page || 1) - 1) * (params.pageSize || 50),
        order: [
          ['sortOrder', 'ASC'],
          ['createdAt', 'DESC']
        ]
      });

      const components = rows.map(row => this.formatComponent(row));

      return {
        items: components,
        total: count,
        page: params.page || 1,
        pageSize: params.pageSize || 50,
        totalPages: Math.ceil(count / (params.pageSize || 50))
      };
    } catch (error) {
      console.error('获取组件列表失败:', error);
      throw new Error('获取组件列表失败');
    }
  }

  /**
   * 根据类型获取组件
   */
  static async getComponentByType(type: string): Promise<Component | null> {
    try {
      const component = await DiyComponent.findOne({
        where: { type, isActive: true }
      });

      return component ? this.formatComponent(component) : null;
    } catch (error) {
      console.error('获取组件详情失败:', error);
      throw new Error('获取组件详情失败');
    }
  }

  /**
   * 根据ID获取组件
   */
  static async getComponentById(id: string): Promise<Component | null> {
    try {
      const component = await DiyComponent.findByPk(id);

      return component ? this.formatComponent(component) : null;
    } catch (error) {
      console.error('根据ID获取组件失败:', error);
      throw new Error('获取组件详情失败');
    }
  }

  /**
   * 创建组件
   */
  static async createComponent(componentData: Partial<Component>): Promise<Component> {
    try {
      // 验证组件配置
      if (componentData.configSchema) {
        const validation = this.validateComponentSchema(componentData.configSchema);
        if (!validation.valid) {
          throw new Error(`组件Schema验证失败: ${validation.errors.join(', ')}`);
        }
      }

      const component = await DiyComponent.create({
        name: componentData.name,
        type: componentData.type,
        category: componentData.category,
        icon: componentData.icon,
        description: componentData.description,
        configSchema: componentData.configSchema,
        defaultProps: componentData.defaultProps || {},
        previewImage: componentData.previewImage,
        previewComponent: componentData.previewComponent,
        isSystem: componentData.isSystem || false,
        isActive: componentData.isActive !== false,
        sortOrder: componentData.sortOrder || 0,
        version: componentData.version || '1.0.0',
        createdBy: componentData.createdBy || 'system'
      });

      return this.formatComponent(component);
    } catch (error) {
      console.error('创建组件失败:', error);
      throw new Error('创建组件失败');
    }
  }

  /**
   * 更新组件
   */
  static async updateComponent(id: string, updateData: Partial<Component>): Promise<Component | null> {
    try {
      const component = await DiyComponent.findByPk(id);
      if (!component) {
        return null;
      }

      // 验证组件配置
      if (updateData.configSchema) {
        const validation = this.validateComponentSchema(updateData.configSchema);
        if (!validation.valid) {
          throw new Error(`组件Schema验证失败: ${validation.errors.join(', ')}`);
        }
      }

      await component.update({
        ...updateData,
        updatedBy: updateData.updatedBy
      });

      return this.formatComponent(component);
    } catch (error) {
      console.error('更新组件失败:', error);
      throw new Error('更新组件失败');
    }
  }

  /**
   * 删除组件
   */
  static async deleteComponent(id: string): Promise<boolean> {
    try {
      const result = await DiyComponent.destroy({
        where: { id }
      });
      return result > 0;
    } catch (error) {
      console.error('删除组件失败:', error);
      throw new Error('删除组件失败');
    }
  }

  /**
   * 初始化系统组件
   */
  static async initializeSystemComponents(): Promise<void> {
    try {
      // 检查是否已经初始化
      const existingCount = await DiyComponent.count({
        where: { isSystem: true }
      });

      if (existingCount > 0) {
        console.log('系统组件已初始化，跳过');
        return;
      }

      // 从Schema创建系统组件
      const systemComponents = Object.values(ComponentSchemas);

      for (const schema of systemComponents) {
        await this.createComponent({
          name: schema.name,
          type: schema.type,
          category: schema.category as ComponentCategory,
          icon: schema.icon,
          description: schema.description,
          configSchema: schema.properties,
          defaultProps: this.getDefaultPropsFromSchema(schema),
          isSystem: true,
          isActive: true,
          version: schema.version,
          createdBy: 'system'
        });
      }

      console.log(`成功初始化 ${systemComponents.length} 个系统组件`);
    } catch (error) {
      console.error('初始化系统组件失败:', error);
      throw new Error('初始化系统组件失败');
    }
  }

  /**
   * 渲染组件
   */
  static async renderComponent(
    componentConfig: any,
    context: {
      pageId: string;
      platform: 'miniprogram' | 'h5' | 'admin';
      isPreview?: boolean;
      theme?: any;
    }
  ): Promise<{ html: string; css: string; js?: string }> {
    try {
      // 验证组件配置
      const validation = validateComponentConfig(componentConfig);
      if (!validation.valid) {
        throw new Error(`组件配置验证失败: ${validation.errors.join(', ')}`);
      }

      const renderer = createRenderer({
        pageId: context.pageId,
        isPreview: context.isPreview || false,
        platform: context.platform,
        theme: context.theme
      });

      const result = renderer.renderComponent(componentConfig);
      return {
        html: result.html,
        css: result.css,
        js: result.js
      };
    } catch (error) {
      console.error('渲染组件失败:', error);
      throw new Error('渲染组件失败');
    }
  }

  /**
   * 批量渲染组件
   */
  static async renderComponents(
    componentConfigs: any[],
    context: {
      pageId: string;
      platform: 'miniprogram' | 'h5' | 'admin';
      isPreview?: boolean;
      theme?: any;
    }
  ): Promise<{ html: string; css: string; js: string }> {
    try {
      const renderer = createRenderer({
        pageId: context.pageId,
        isPreview: context.isPreview || false,
        platform: context.platform,
        theme: context.theme
      });

      const htmlParts: string[] = [];
      const cssParts: string[] = [];
      const jsParts: string[] = [];

      for (const componentConfig of componentConfigs) {
        const validation = validateComponentConfig(componentConfig);
        if (!validation.valid) {
          console.warn(`跳过无效组件配置: ${validation.errors.join(', ')}`);
          continue;
        }

        const result = renderer.renderComponent(componentConfig);
        htmlParts.push(result.html);
        cssParts.push(result.css);
        if (result.js) {
          jsParts.push(result.js);
        }
      }

      return {
        html: htmlParts.join('\n'),
        css: cssParts.join('\n'),
        js: jsParts.join('\n')
      };
    } catch (error) {
      console.error('批量渲染组件失败:', error);
      throw new Error('批量渲染组件失败');
    }
  }

  /**
   * 格式化组件数据
   */
  private static formatComponent(component: any): Component {
    return {
      id: component.id,
      name: component.name,
      type: component.type,
      category: component.category,
      icon: component.icon,
      description: component.description,
      configSchema: component.configSchema,
      defaultProps: component.defaultProps,
      previewImage: component.previewImage,
      previewComponent: component.previewComponent,
      isSystem: component.isSystem,
      isActive: component.isActive,
      sortOrder: component.sortOrder,
      version: component.version,
      createdBy: component.createdBy,
      createdAt: component.createdAt.toISOString(),
      updatedAt: component.updatedAt.toISOString()
    };
  }

  /**
   * 验证组件Schema
   */
  private static validateComponentSchema(configSchema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!configSchema || typeof configSchema !== 'object') {
      errors.push('组件Schema必须是对象类型');
      return { valid: false, errors };
    }

    if (!configSchema.props || !Array.isArray(configSchema.props)) {
      errors.push('组件Schema必须包含props数组');
      return { valid: false, errors };
    }

    // 验证每个属性
    for (const prop of configSchema.props) {
      if (!prop.type || !prop.title) {
        errors.push('组件属性必须包含type和title');
      }

      // 验证类型
      const validTypes = ['text', 'number', 'boolean', 'color', 'image', 'url', 'select', 'array', 'object'];
      if (!validTypes.includes(prop.type)) {
        errors.push(`无效的属性类型: ${prop.type}`);
      }

      // 验证select类型的options
      if (prop.type === 'select' && (!prop.options || !Array.isArray(prop.options))) {
        errors.push('select类型的属性必须包含options数组');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * 从Schema获取默认属性
   */
  private static getDefaultPropsFromSchema(schema: ComponentSchema): Record<string, any> {
    const defaultProps: Record<string, any> = {};

    for (const [key, property] of Object.entries(schema.properties)) {
      if (property.default !== undefined) {
        defaultProps[key] = property.default;
      } else {
        // 根据类型设置默认值
        switch (property.type) {
          case 'text':
          case 'url':
            defaultProps[key] = '';
            break;
          case 'number':
            defaultProps[key] = 0;
            break;
          case 'boolean':
            defaultProps[key] = false;
            break;
          case 'array':
            defaultProps[key] = [];
            break;
          case 'object':
            defaultProps[key] = {};
            break;
          case 'select':
            defaultProps[key] = property.options?.[0]?.value || '';
            break;
        }
      }
    }

    return defaultProps;
  }
}