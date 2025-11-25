import express from 'express';
import { DiyComponentService, DiyTemplateService, DiyMediaService } from '../services/diy.service';
import { ApiResponse, ComponentListParams, TemplateListParams } from '../types/diy.types';

const router = express.Router();

/**
 * 获取组件列表
 */
router.get('/components', async (req, res) => {
  try {
    const params: ComponentListParams = {
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 50,
      search: req.query.search as string,
      category: req.query.category as any,
      isSystem: req.query.isSystem ? req.query.isSystem === 'true' : undefined,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
    };

    const result = await DiyComponentService.getComponents(params);

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
    console.error('获取组件列表失败:', error);
    res.status(500).json({
      code: 500011,
      message: '获取组件列表失败',
      data: null
    });
  }
});

/**
 * 获取组件详情
 */
router.get('/components/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const result = await DiyComponentService.getComponentByType(type);

    if (!result) {
      return res.status(404).json({
        code: 404006,
        message: '组件不存在',
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
    console.error('获取组件详情失败:', error);
    res.status(500).json({
      code: 500012,
      message: '获取组件详情失败',
      data: null
    });
  }
});

/**
 * 获取组件分类列表
 */
router.get('/components/categories', async (req, res) => {
  try {
    const result = await DiyComponentService.getComponentCategories();

    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: result
    };

    res.json(response);
  } catch (error: any) {
    console.error('获取组件分类失败:', error);
    res.status(500).json({
      code: 500013,
      message: '获取组件分类失败',
      data: null
    });
  }
});

/**
 * 获取模板列表
 */
router.get('/templates', async (req, res) => {
  try {
    const params: TemplateListParams = {
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 20,
      search: req.query.search as string,
      category: req.query.category as string,
      isPublic: req.query.isPublic ? req.query.isPublic === 'true' : undefined,
      author: req.query.author as string,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      minUsageCount: req.query.minUsageCount ? parseInt(req.query.minUsageCount as string) : undefined
    };

    const result = await DiyTemplateService.getTemplates(params);

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
    console.error('获取模板列表失败:', error);
    res.status(500).json({
      code: 500014,
      message: '获取模板列表失败',
      data: null
    });
  }
});

/**
 * 获取模板详情
 */
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DiyTemplateService.getTemplateById(id);

    if (!result) {
      return res.status(404).json({
        code: 404007,
        message: '模板不存在',
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
    console.error('获取模板详情失败:', error);
    res.status(500).json({
      code: 500015,
      message: '获取模板详情失败',
      data: null
    });
  }
});

/**
 * 上传媒体文件
 */
router.post('/media/upload', async (req, res) => {
  try {
    // 注意：这里需要配合文件上传中间件（如multer）
    // 暂时返回模拟数据，实际实现时需要处理文件上传
    const mockFileData = {
      name: req.body.name || '未命名文件',
      type: req.body.type || 'image',
      filePath: req.body.filePath || '/uploads/mock.jpg',
      fileUrl: req.body.fileUrl || '/static/mock.jpg',
      fileSize: parseInt(req.body.fileSize) || 0,
      mimeType: req.body.mimeType || 'image/jpeg',
      dimensions: req.body.dimensions ? JSON.parse(req.body.dimensions) : undefined,
      uploadedBy: 'mock-user-id' // 实际应该从认��中间件获取
    };

    const result = await DiyMediaService.uploadMedia(mockFileData);

    const response: ApiResponse = {
      code: 0,
      message: '文件上传成功',
      data: result
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('文件上传失败:', error);
    res.status(500).json({
      code: 500016,
      message: '文件上传失败',
      data: null
    });
  }
});

/**
 * 获取媒体资源列表
 */
router.get('/media', async (req, res) => {
  try {
    const params = {
      type: req.query.type as string,
      uploadedBy: req.query.uploadedBy as string,
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 20
    };

    const result = await DiyMediaService.getMediaList(params);

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
    console.error('获取媒体资源列表失败:', error);
    res.status(500).json({
      code: 500017,
      message: '获取媒体资源列表失败',
      data: null
    });
  }
});

export default router;