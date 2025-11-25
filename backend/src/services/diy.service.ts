import { Op, ValidationError, WhereOptions } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import {
  DiyPage,
  DiyComponent,
  DiyTemplate,
  DiyPagePublication,
  DiyOperationLog,
  DiyMediaResource,
  setupDiyAssociations
} from '../models/diy.models';
import {
  PageConfiguration,
  PageListParams,
  CreatePageRequest,
  UpdatePageRequest,
  PublishRequest,
  PreviewRequest,
  CopyPageRequest,
  ComponentListParams,
  TemplateListParams,
  ApiResponse,
  PageStatus,
  PageType,
  ComponentCategory,
  PublicationRecord,
  OperationLog,
  KingKongConfig,
  BaseComponent
} from '../types/diy.types';
import { sequelize } from '../config/database';
import { generatePreviewHtml } from '../utils/preview-generator';

/**
 * DIY页面服务类
 */
export class DiyPageService {
  /**
   * 获取页面列表
   */
  static async getPages(params: PageListParams): Promise<{
    rows: PageConfiguration[];
    count: number;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    const where: WhereOptions<any> = {};

    // 构建查询条件
    if (params.status) {
      where.status = params.status;
    }

    if (params.pageType) {
      where.pageType = params.pageType;
    }

    if (params.author) {
      where.createdBy = params.author;
    }

    if (params.search) {
      where.name = {
        [Op.like]: `%${params.search}%`
      };
    }

    if (params.dateFrom && params.dateTo) {
      where.createdAt = {
        [Op.between]: [params.dateFrom, params.dateTo]
      };
    }

    // 分页参数
    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || 20, 100); // 限制最大页面大小
    const offset = (page - 1) * pageSize;

    const { count, rows } = await DiyPage.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [
        ['updatedAt', 'DESC']
      ],
      attributes: { exclude: ['config'] } // 列表中不返回配置数据以提高性能
    });

    return {
      rows: rows.map(page => page.toJSON() as PageConfiguration),
      count,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }

  /**
   * 根据ID获取页面详情
   */
  static async getPageById(id: string): Promise<PageConfiguration | null> {
    const page = await DiyPage.findByPk(id, {
      include: [
        {
          model: DiyOperationLog,
          as: 'operationLogs',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    return page ? page.toJSON() as PageConfiguration : null;
  }

  /**
   * 创建页面
   */
  static async createPage(pageData: CreatePageRequest, userId: string): Promise<PageConfiguration> {
    const transaction = await sequelize.transaction();

    try {
      // 如果基于模板创建，复制模板配置
      let config: Partial<PageConfiguration>;
      if (pageData.templateId) {
        const template = await DiyTemplate.findByPk(pageData.templateId);
        if (!template) {
          throw new Error('模板不存在');
        }
        config = template.config as PageConfiguration;
      } else {
        config = pageData.config || {};
      }

      // 创建页面配置
      const newPage = await DiyPage.create({
        id: uuidv4(),
        name: pageData.name,
        description: pageData.description,
        pageType: pageData.pageType,
        config: this.createDefaultPageConfig(pageData.pageType, config),
        status: PageStatus.DRAFT,
        version: 1,
        createdBy: userId
      }, { transaction });

      await transaction.commit();

      return newPage.toJSON() as PageConfiguration;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 更新页面
   */
  static async updatePage(id: string, updateData: UpdatePageRequest): Promise<PageConfiguration | null> {
    const page = await DiyPage.findByPk(id);
    if (!page) {
      return null;
    }

    // 合并配置数据
    const updatedConfig = {
      ...page.config,
      ...updateData.config
    };

    // 更新字段
    const updates: any = {
      updatedAt: new Date()
    };

    if (updateData.name) {
      updates.name = updateData.name;
    }

    if (updateData.description) {
      updates.description = updateData.description;
    }

    if (updateData.status) {
      updates.status = updateData.status;
    }

    if (Object.keys(updatedConfig).length > 0) {
      updates.config = updatedConfig;
      updates.version = (page.version || 1) + 1;
    }

    await page.update(updates);

    return page.toJSON() as PageConfiguration;
  }

  /**
   * 删除页面
   */
  static async deletePage(id: string): Promise<boolean> {
    const page = await DiyPage.findByPk(id);
    if (!page) {
      return false;
    }

    await page.destroy();
    return true;
  }

  /**
   * 复制页面
   */
  static async copyPage(id: string, copyData: CopyPageRequest, userId: string): Promise<PageConfiguration | null> {
    const originalPage = await DiyPage.findByPk(id);
    if (!originalPage) {
      return null;
    }

    const newPage = await DiyPage.create({
      id: uuidv4(),
      name: copyData.name,
      description: copyData.description || originalPage.description,
      pageType: originalPage.pageType,
      config: {
        ...originalPage.config,
        ...copyData.config
      },
      status: PageStatus.DRAFT,
      version: 1,
      createdBy: userId
    });

    return newPage.toJSON() as PageConfiguration;
  }

  /**
   * 更新页面状态
   */
  static async updatePageStatus(id: string, status: PageStatus): Promise<boolean> {
    const page = await DiyPage.findByPk(id);
    if (!page) {
      return false;
    }

    await page.update({
      status,
      publishedAt: status === PageStatus.PUBLISHED ? new Date() : null,
      updatedAt: new Date()
    });

    return true;
  }

  /**
   * 获取页面操作日志
   */
  static async getPageOperationLogs(id: string): Promise<OperationLog[]> {
    const logs = await DiyOperationLog.findAll({
      where: { pageId: id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    return logs.map(log => log.toJSON() as OperationLog);
  }

  /**
   * 记录操作日志
   */
  static async logOperation(logData: {
    pageId?: string;
    actionType: 'create' | 'update' | 'delete' | 'publish' | 'restore' | 'copy';
    details: Record<string, any>;
    beforeConfig?: object;
    afterConfig?: object;
    userId: string;
    userName?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await DiyOperationLog.create({
      id: uuidv4(),
      pageId: logData.pageId,
      actionType: logData.actionType,
      details: logData.details,
      beforeConfig: logData.beforeConfig,
      afterConfig: logData.afterConfig,
      userId: logData.userId,
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
      createdAt: new Date()
    });
  }

  /**
   * 创建默认页面配置
   */
  private static createDefaultPageConfig(pageType: PageType, existingConfig?: Partial<PageConfiguration>): PageConfiguration {
    const defaultConfig: PageConfiguration = {
      id: '',
      name: '',
      pageType,
      status: PageStatus.DRAFT,
      version: 1,
      pageSettings: {
        backgroundColor: '#ffffff',
        navigationBar: {
          title: '叨叨房车',
          backgroundColor: '#FF9F29',
          textColor: '#ffffff',
          showTitle: true
        },
        enablePullRefresh: true,
        enableReachBottom: false
      },
      diyAreas: {},
      promotions: {},
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: '',
        tags: []
      }
    };

    // 根据页面类型设置特定默认值
    if (pageType === PageType.HOME) {
      defaultConfig.kingKongConfig = {
        title: '快捷服务',
        columns: 4,
        iconSize: 24,
        spacing: 16,
        backgroundColor: '#ffffff',
        padding: { horizontal: 16, vertical: 16 },
        borderRadius: 8,
        items: []
      };
    }

    return {
      ...defaultConfig,
      ...existingConfig,
      pageType, // 确保页面类型不被覆盖
      metadata: {
        ...defaultConfig.metadata,
        ...existingConfig?.metadata,
        updatedAt: new Date().toISOString()
      }
    };
  }
}

/**
 * DIY组件服务类
 */
export class DiyComponentService {
  /**
   * 获取组件列表
   */
  static async getComponents(params: ComponentListParams): Promise<{
    rows: any[];
    count: number;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    const where: WhereOptions<any> = {};

    if (params.category) {
      where.category = params.category;
    }

    if (params.isSystem !== undefined) {
      where.isSystem = params.isSystem;
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${params.search}%` } },
        { type: { [Op.like]: `%${params.search}%` } }
      ];
    }

    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || 50, 200);
    const offset = (page - 1) * pageSize;

    const { count, rows } = await DiyComponent.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [
        ['isSystem', 'DESC'],
        ['sortOrder', 'ASC'],
        ['createdAt', 'DESC']
      ]
    });

    return {
      rows,
      count,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }

  /**
   * 根据类型获取组件
   */
  static async getComponentByType(type: string): Promise<any | null> {
    const component = await DiyComponent.findOne({
      where: { type, isActive: true }
    });

    return component ? component.toJSON() : null;
  }

  /**
   * 获取组件分类列表
   */
  static async getComponentCategories(): Promise<string[]> {
    const categories = await DiyComponent.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      where: { isActive: true }
    });

    return categories.map(cat => cat.category);
  }
}

/**
 * DIY模板服务类
 */
export class DiyTemplateService {
  /**
   * 获取模板列表
   */
  static async getTemplates(params: TemplateListParams): Promise<{
    rows: any[];
    count: number;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    const where: WhereOptions<any> = {};

    if (params.category) {
      where.category = params.category;
    }

    if (params.isPublic !== undefined) {
      where.isPublic = params.isPublic;
    }

    if (params.author) {
      where.createdBy = params.author;
    }

    if (params.minRating) {
      where.rating = {
        [Op.gte]: params.minRating
      };
    }

    if (params.minUsageCount) {
      where.usageCount = {
        [Op.gte]: params.minUsageCount
      };
    }

    if (params.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${params.search}%` } },
        { description: { [Op.like]: `%${params.search}%` } }
      ];
    }

    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || 20, 100);
    const offset = (page - 1) * pageSize;

    const { count, rows } = await DiyTemplate.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [
        ['rating', 'DESC'],
        ['usageCount', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    return {
      rows,
      count,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }

  /**
   * 根据ID获取模板详情
   */
  static async getTemplateById(id: string): Promise<any | null> {
    const template = await DiyTemplate.findByPk(id);
    return template ? template.toJSON() : null;
  }
}

/**
 * DIY媒体资源服务类
 */
export class DiyMediaService {
  /**
   * 上传媒体文件
   */
  static async uploadMedia(file: {
    name: string;
    type: 'image' | 'video' | 'icon' | 'audio' | 'document';
    filePath: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    dimensions?: { width: number; height: number };
    uploadedBy: string;
  }): Promise<any> {
    const media = await DiyMediaResource.create({
      id: uuidv4(),
      name: file.name,
      type: file.type,
      filePath: file.filePath,
      fileUrl: file.fileUrl,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      dimensions: file.dimensions,
      metadata: {},
      uploadedBy: file.uploadedBy,
      createdAt: new Date()
    });

    return media.toJSON();
  }

  /**
   * 获取媒体资源列表
   */
  static async getMediaList(params: {
    type?: string;
    uploadedBy?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    rows: any[];
    count: number;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    const where: WhereOptions<any> = {};

    if (params.type) {
      where.type = params.type;
    }

    if (params.uploadedBy) {
      where.uploadedBy = params.uploadedBy;
    }

    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || 20, 100);
    const offset = (page - 1) * pageSize;

    const { count, rows } = await DiyMediaResource.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      rows,
      count,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }
}

/**
 * 发布服务类
 */
export class PublishService {
  /**
   * 发布页面
   */
  static async publishPage(pageId: string, publishData: PublishRequest, userId: string): Promise<PublicationRecord | null> {
    const transaction = await sequelize.transaction();

    try {
      const page = await DiyPage.findByPk(pageId, { transaction });
      if (!page) {
        throw new Error('页面不存在');
      }

      if (page.status !== PageStatus.DRAFT) {
        throw new Error('只有草稿状态的页面才能发布');
      }

      // 创建发布记录
      const publication = await DiyPagePublication.create({
        id: uuidv4(),
        pageId,
        version: page.version + 1,
        config: page.config,
        status: 'active',
        publishedBy: userId,
        publishedAt: new Date()
      }, { transaction });

      // 更新页面状态
      await page.update({
        status: PageStatus.PUBLISHED,
        version: page.version + 1,
        publishedAt: new Date(),
        updatedAt: new Date()
      }, { transaction });

      await transaction.commit();

      return publication.toJSON() as PublicationRecord;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 预览页面
   */
  static async previewPage(previewData: PreviewRequest): Promise<{
    html: string;
    config: PageConfiguration;
  }> {
    // 生成预览HTML
    const html = generatePreviewHtml(previewData.config);

    return {
      html,
      config: previewData.config
    };
  }

  /**
   * 获取页面发布历史
   */
  static async getPagePublications(pageId: string): Promise<PublicationRecord[]> {
    const publications = await DiyPagePublication.findAll({
      where: { pageId },
      order: [['version', 'DESC']],
      limit: 20
    });

    return publications.map(pub => pub.toJSON() as PublicationRecord);
  }
}

// 导出所有服务类
export {
  DiyPageService,
  DiyComponentService,
  DiyTemplateService,
  DiyMediaService,
  PublishService
};