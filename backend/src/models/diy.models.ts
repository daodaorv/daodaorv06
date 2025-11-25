import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import {
  PageConfiguration,
  PageStatus,
  PageType,
  ComponentDefinition,
  ComponentCategory,
  TemplateConfiguration,
  PublicationRecord,
  OperationLog,
  MediaResource
} from '../types/diy.types';

/**
 * DIY页面配置模型
 */
export class DiyPage extends Model {

  static initModel(sequelize: any) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '页面名称'
      },
      description: {
        type: DataTypes.TEXT,
        comment: '页面描述'
      },
      pageType: {
        type: DataTypes.ENUM(...Object.values(PageType)),
        allowNull: false,
        comment: '页面类型'
      },
      config: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '页面配置数据'
      },
      status: {
        type: DataTypes.ENUM(...Object.values(PageStatus)),
        defaultValue: PageStatus.DRAFT,
        comment: '页面状态'
      },
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: '当前版本号'
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '创建者ID'
      },
      updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: '最后更新者ID'
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '发布时间'
      }
    }, {
      sequelize,
      modelName: 'DiyPage',
      tableName: 'diy_pages',
      timestamps: true,
      paranoid: false,
      indexes: [
        {
          fields: ['pageType', 'status'],
          name: 'idx_page_type_status'
        },
        {
          fields: ['createdBy'],
          name: 'idx_created_by'
        },
        {
          fields: ['status'],
          name: 'idx_status'
        }
      ]
    });
  }
}

/**
 * DIY组件库模型
 */
export class DiyComponent extends Model {

  static initModel(sequelize: any) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '组件名称'
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: '组件类型标识'
      },
      category: {
        type: DataTypes.ENUM(...Object.values(ComponentCategory)),
        allowNull: false,
        comment: '组件分类'
      },
      icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '组件图标'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '组件描述'
      },
      configSchema: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: { props: [] },
        comment: '组件配置模式'
      },
      defaultProps: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '组件默认属性'
      },
      previewImage: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '组件预览图'
      },
      previewComponent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '组件预览代码'
      },
      isSystem: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: '是否系统组件'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: '是否启用'
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '排序'
      },
      version: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: '1.0.0',
        comment: '组件版本'
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '创建者ID'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '创建时间'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '更新时间'
      }
    }, {
      sequelize,
      modelName: 'DiyComponent',
      tableName: 'diy_components',
      timestamps: true,
      paranoid: false,
      indexes: [
        {
          fields: ['category', 'isActive'],
          name: 'idx_category_active'
        },
        {
          fields: ['isSystem'],
          name: 'idx_is_system'
        }
      ]
    });
  }
}

/**
 * DIY页面模板模型
 */
export class DiyTemplate extends Model {

  static initModel(sequelize: any) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '模板名称'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '模板描述'
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '模板分类'
      },
      thumbnail: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '模板缩略图'
      },
      previewData: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '模板预览数据'
      },
      config: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '模板配置数据'
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: '模板标签'
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: '是否公开'
      },
      usageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '使用次数'
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
        comment: '评分'
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '创建者ID'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '创建时间'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '更新时间'
      }
    }, {
      sequelize,
      modelName: 'DiyTemplate',
      tableName: 'diy_templates',
      timestamps: true,
      paranoid: false,
      indexes: [
        {
          fields: ['category', 'isPublic'],
          name: 'idx_category_public'
        },
        {
          fields: ['rating'],
          name: 'idx_rating'
        },
        {
          fields: ['usageCount'],
          name: 'idx_usage_count'
        }
      ]
    });
  }
}

/**
 * DIY页面发布历史模型
 */
export class DiyPagePublication extends Model {

  static initModel(sequelize: any) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
      },
      pageId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '页面ID'
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '版本号'
      },
      config: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '版本配置数据'
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'replaced'),
        defaultValue: 'active',
        comment: '版本状态'
      },
      publishedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '发布者ID'
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '发布时间'
      },
      replacedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '替换时间'
      }
    }, {
      sequelize,
      modelName: 'DiyPagePublication',
      tableName: 'diy_page_publications',
      timestamps: false,
      paranoid: false,
      indexes: [
        {
          fields: ['pageId', 'status'],
          name: 'idx_page_id_status'
        },
        {
          fields: ['publishedAt'],
          name: 'idx_published_at'
        }
      ]
    });
  }
}

/**
 * DIY用户操作日志模型
 */
export class DiyOperationLog extends Model {

  static initModel(sequelize: any) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
      },
      pageId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: '页面ID'
      },
      actionType: {
        type: DataTypes.ENUM('create', 'update', 'delete', 'publish', 'restore', 'copy'),
        allowNull: false,
        comment: '操作类型'
      },
      details: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '操作详情'
      },
      beforeConfig: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '操作前配置'
      },
      afterConfig: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '操作后配置'
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '操作者ID'
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: '操作IP地址'
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '用户代理'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '创建时间'
      }
    }, {
      sequelize,
      modelName: 'DiyOperationLog',
      tableName: 'diy_operation_logs',
      timestamps: false,
      paranoid: false,
      indexes: [
        {
          fields: ['pageId', 'actionType'],
          name: 'idx_page_id_action'
        },
        {
          fields: ['userId', 'actionType'],
          name: 'idx_user_id_action'
        },
        {
          fields: ['createdAt'],
          name: 'idx_created_at'
        }
      ]
    });
  }
}

/**
 * DIY媒体资源模型
 */
export class DiyMediaResource extends Model {

  static initModel(sequelize: any) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '资源名称'
      },
      type: {
        type: DataTypes.ENUM('image', 'video', 'icon', 'audio', 'document'),
        allowNull: false,
        comment: '资源类型'
      },
      filePath: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '文件路径'
      },
      fileUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '访问URL'
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '文件大小(字节)'
      },
      mimeType: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'MIME类型'
      },
      dimensions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '尺寸信息(宽高)'
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        comment: '其他元数据'
      },
      uploadedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '上传者ID'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '创建时间'
      }
    }, {
      sequelize,
      modelName: 'DiyMediaResource',
      tableName: 'diy_media_resources',
      timestamps: false,
      paranoid: false,
      indexes: [
        {
          fields: ['type'],
          name: 'idx_type'
        },
        {
          fields: ['uploadedBy'],
          name: 'idx_uploaded_by'
        },
        {
          fields: ['createdAt'],
          name: 'idx_created_at'
        }
      ]
    });
  }
}

// 模型关联关系设置
export function setupDiyAssociations(sequelize: any) {
  // 页面与发布历史的关联
  DiyPage.hasMany(DiyPagePublication, {
    foreignKey: 'pageId',
    sourceKey: 'id',
    as: 'publications'
  });

  DiyPagePublication.belongsTo(DiyPage, {
    foreignKey: 'pageId',
    targetKey: 'id',
    as: 'page'
  });

  // 页面与操作日志的关联
  DiyPage.hasMany(DiyOperationLog, {
    foreignKey: 'pageId',
    sourceKey: 'id',
    as: 'operationLogs'
  });

  DiyOperationLog.belongsTo(DiyPage, {
    foreignKey: 'pageId',
    targetKey: 'id',
    as: 'page'
  });

  // 组件与操作日志的关联
  DiyComponent.hasMany(DiyOperationLog, {
    foreignKey: 'details',
    sourceKey: 'type',
    as: 'operationLogs'
  });
}