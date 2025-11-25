import express from 'express';
import {
  DiyPageService,
  DiyComponentService,
  DiyTemplateService,
  DiyMediaService,
  PublishService
} from '../services/diy.service';
import {
  ApiResponse,
  PageConfiguration,
  PageListParams,
  CreatePageRequest,
  UpdatePageRequest,
  PublishRequest,
  ComponentListParams,
  TemplateListParams,
  CopyPageRequest,
  PreviewRequest,
  PageStatus,
  PageType
} from '../types/diy.types';
import { validatePageCreate, validatePageUpdate, validatePublish } from '../validators/diy.validator';
import { authenticateToken, requireAuth } from '../middleware/auth';

const router = express.Router();

// 页面管理路由

/**
 * 获取页面列表
 */
router.get('/pages', authenticateToken, async (req, res) => {
  try {
    const params: PageListParams = {
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 20,
      search: req.query.search as string,
      status: req.query.status as any,
      pageType: req.query.pageType as any,
      author: req.query.author as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined
    };

    const result = await DiyPageService.getPages(params);

    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        pagination: result.pagination
      }
    };

    res.json(response);
  } catch (error: any) {
    console.error('获取页面列表失败:', error);
    res.status(500).json({
      code: 500001,
      message: '获取页面列表失败',
      data: null
    });
  }
});

/**
 * 获取页面详��
 */
router.get('/pages/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DiyPageService.getPageById(id);

    if (!result) {
      return res.status(404).json({
        code: 404001,
        message: '页面不存在',
        data: null
      });
    }

    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: result
    };

    res.json(response);
  } catch (error: any) {
    console.error('获取页面详情失败:', error);
    res.status(500).json({
      code: 500002,
      message: '获取页面详情失败',
      data: null
    });
  }
});

/**
 * 创建页面
 */
router.post('/pages', authenticateToken, requireAuth, async (req, res) => {
  try {
    const pageData: CreatePageRequest = req.body;

    // 数据验证
    const validationError = validatePageCreate(pageData);
    if (validationError) {
      return res.status(400).json({
        code: 400001,
        message: '请求参数错误',
        data: null,
        errors: validationError
      });
    }

    const result = await DiyPageService.createPage(pageData, req.user.id);

    // 记录操作日志
    await DiyPageService.logOperation({
      pageId: result.id,
      actionType: 'create',
      details: { templateId: pageData.templateId },
      afterConfig: result.config,
      userId: req.user.id,
      userName: req.user.name,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const response: ApiResponse = {
      code: 0,
      message: '页面创建成功',
      data: result
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('创建页面失败:', error);
    res.status(500).json({
      code: 500003,
      message: '创建页面失败',
      data: null
    });
  }
});

/**
 * 更新页面
 */
router.put('/pages/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdatePageRequest = req.body;

    // 数据验证
    const validationError = validatePageUpdate(updateData);
    if (validationError) {
      return res.status(400).json({
        code: 400002,
        message: '请求参数错误',
        data: null,
        errors: validationError
      });
    }

    // 获取原始配置用于日志记录
    const originalPage = await DiyPageService.getPageById(id);

    const result = await DiyPageService.updatePage(id, updateData);

    if (!result) {
      return res.status(404).json({
        code: 404002,
        message: '页面不存在',
        data: null
      });
    }

    // 记录操作日志
    await DiyPageService.logOperation({
      pageId: id,
      actionType: 'update',
      details: updateData,
      beforeConfig: originalPage?.config,
      afterConfig: result.config,
      userId: req.user.id,
      userName: req.user.name,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const response: ApiResponse = {
      code: 0,
      message: '页面更新成功',
      data: result
    };

    res.json(response);
  } catch (error: any) {
    console.error('更新页面失败:', error);
    res.status(500).json({
      code: 500004,
      message: '更新页面失败',
      data: null
    });
  }
});

/**
 * 删除页面
 */
router.delete('/pages/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // 获取原始配置用于日志记录
    const originalPage = await DiyPageService.getPageById(id);

    const result = await DiyPageService.deletePage(id);

    if (!result) {
      return res.status(404).json({
        code: 404003,
        message: '页面不存在',
        data: null
      });
    }

    // 记录操作日志
    await DiyPageService.logOperation({
      pageId: id,
      actionType: 'delete',
      details: {},
      beforeConfig: originalPage?.config,
      userId: req.user.id,
      userName: req.user.name,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const response: ApiResponse = {
      code: 0,
      message: '页面删除成功',
      data: null
    };

    res.json(response);
  } catch (error: any) {
    console.error('删除页面失败:', error);
    res.status(500).json({
      code: 500005,
      message: '删除页面失败',
      data: null
    });
  }
});

/**
 * 复制页面
 */
router.post('/pages/:id/copy', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const copyData: CopyPageRequest = req.body;

    const result = await DiyPageService.copyPage(id, copyData, req.user.id);

    if (!result) {
      return res.status(404).json({
        code: 404004,
        message: '原页面不存在',
        data: null
      });
    }

    // 记录操作日志
    await DiyPageService.logOperation({
      pageId: result.id,
      actionType: 'copy',
      details: { originalPageId: id, newPageName: copyData.name },
      afterConfig: result.config,
      userId: req.user.id,
      userName: req.user.name,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const response: ApiResponse = {
      code: 0,
      message: '页面复制成功',
      data: result
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('复制页面失败:', error);
    res.status(500).json({
      code: 500006,
      message: '复制页面失败',
      data: null
    });
  }
});

/**
 * 发布页面
 */
router.post('/pages/:id/publish', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const publishData: PublishRequest = req.body;

    // 数据验证
    const validationError = validatePublish(publishData);
    if (validationError) {
      return res.status(400).json({
        code: 400003,
        message: '请求参数错误',
        data: null,
        errors: validationError
      });
    }

    const result = await PublishService.publishPage(id, publishData, req.user.id);

    if (!result) {
      return res.status(404).json({
        code: 404005,
        message: '页面不存在或状态不支持发布',
        data: null
      });
    }

    // 更新页面状态和发布时间
    await DiyPageService.updatePageStatus(id, PageStatus.PUBLISHED);

    // 记录操作日志
    await DiyPageService.logOperation({
      pageId: id,
      actionType: 'publish',
      details: publishData,
      afterConfig: result.config,
      userId: req.user.id,
      userName: req.user.name,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const response: ApiResponse = {
      code: 0,
      message: '页面发布成功',
      data: {
        publicationId: result.id,
        version: result.version,
        publishedAt: result.publishedAt
      }
    };

    res.json(response);
  } catch (error: any) {
    console.error('发布页面失败:', error);
    res.status(500).json({
      code: 500007,
      message: '发布页面失败',
      data: null
    });
  }
});

/**
 * 预览页面
 */
router.post('/pages/preview', authenticateToken, async (req, res) => {
  try {
    const previewData: PreviewRequest = req.body;

    const result = await PublishService.previewPage(previewData);

    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: result
    };

    res.json(response);
  } catch (error: any) {
    console.error('预览页面失败:', error);
    res.status(500).json({
      code: 500008,
      message: '预览页面失败',
      data: null
    });
  }
});

/**
 * 获取页面发布历史
 */
router.get('/pages/:id/publications', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await PublishService.getPagePublications(id);

    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: result
    };

    res.json(response);
  } catch (error: any) {
    console.error('获取发布历史失败:', error);
    res.status(500).json({
      code: 500009,
      message: '获取发布历史失败',
      data: null
    });
  }
});

/**
 * 获取页面操作日志
 */
router.get('/pages/:id/logs', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await DiyPageService.getPageOperationLogs(id);

    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: result
    };

    res.json(response);
  } catch (error: any) {
    console.error('获取操作日志失败:', error);
    res.status(500).json({
      code: 500010,
      message: '获取操作日志失败',
      data: null
    });
  }
});

export default router;