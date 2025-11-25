import express from 'express';
import { ComponentLibraryService } from '../services/component.library';
import { ApiResponse } from '../types/diy.types';

const router = express.Router();

/**
 * 获取所有组件Schema
 */
router.get('/schemas', async (req, res): Promise<void> => {
  try {
    const schemas = ComponentLibraryService.getComponentSchemas();

    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: schemas
    };

    res.json(response);
  } catch (error: any) {
    console.error('获取组件Schema失败:', error);
    res.status(500).json({
      code: 500018,
      message: '获取组件Schema失败',
      data: null
    });
  }
});

/**
 * 获取单个组件Schema
 */
router.get('/schemas/:type', async (req, res): Promise<void> => {
  try {
    const { type } = req.params;
    const schema = ComponentLibraryService.getComponentSchema(type);

    if (!schema) {
      res.status(404).json({
        code: 404008,
        message: '组件Schema不存在',
        data: null
      });
      return;
    }

    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: schema
    };

    res.json(response);
  } catch (error: any) {
    console.error('获取组件Schema失败:', error);
    res.status(500).json({
      code: 500019,
      message: '获取组件Schema失败',
      data: null
    });
  }
});

/**
 * 获取组件分类列表
 */
router.get('/categories', async (req, res): Promise<void> => {
  try {
    const categories = ComponentLibraryService.getComponentCategories();

    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: categories
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
 * 获取组件列表
 */
router.get('/', async (req, res): Promise<void> => {
  try {
    const params = {
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 50,
      search: req.query.search as string,
      category: req.query.category as any,
      isSystem: req.query.isSystem ? req.query.isSystem === 'true' : undefined,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
    };

    const result = await ComponentLibraryService.getComponents(params);

    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages
        }
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
 * 根据类型获取组件
 */
router.get('/type/:type', async (req, res): Promise<void> => {
  try {
    const { type } = req.params;
    const component = await ComponentLibraryService.getComponentByType(type);

    if (!component) {
      res.status(404).json({
        code: 404006,
        message: '组件不存在',
        data: null
      });
      return;
    }

    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: component
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
 * 根据ID获取组件
 */
router.get('/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const component = await ComponentLibraryService.getComponentById(id);

    if (!component) {
      res.status(404).json({
        code: 404006,
        message: '组件不存在',
        data: null
      });
      return;
    }

    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: component
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
 * 创建组件
 */
router.post('/', async (req, res): Promise<void> => {
  try {
    const componentData = req.body;
    const result = await ComponentLibraryService.createComponent(componentData);

    const response: ApiResponse = {
      code: 0,
      message: '组件创建成功',
      data: result
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('创建组件失败:', error);
    res.status(500).json({
      code: 500020,
      message: '创建组件失败',
      data: null
    });
  }
});

/**
 * 更新组件
 */
router.put('/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await ComponentLibraryService.updateComponent(id, updateData);

    if (!result) {
      res.status(404).json({
        code: 404007,
        message: '组件不存在',
        data: null
      });
      return;
    }

    const response: ApiResponse = {
      code: 0,
      message: '组件更新成功',
      data: result
    };

    res.json(response);
  } catch (error: any) {
    console.error('更新组件失败:', error);
    res.status(500).json({
      code: 500021,
      message: '更新组件失败',
      data: null
    });
  }
});

/**
 * 删除组件
 */
router.delete('/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await ComponentLibraryService.deleteComponent(id);

    if (!result) {
      res.status(404).json({
        code: 404008,
        message: '组件不存在',
        data: null
      });
      return;
    }

    const response: ApiResponse = {
      code: 0,
      message: '组件删除成功',
      data: null
    };

    res.json(response);
  } catch (error: any) {
    console.error('删除组件失败:', error);
    res.status(500).json({
      code: 500022,
      message: '删除组件失败',
      data: null
    });
  }
});

/**
 * 渲染单个组件
 */
router.post('/render', async (req, res): Promise<void> => {
  try {
    // 兼容不同的请求格式
    const { component, componentConfig, context } = req.body;
    const actualComponent = componentConfig || component;

    if (!actualComponent) {
      res.status(400).json({
        code: 400022,
        message: '缺少组件配置',
        data: null
      });
      return;
    }

    const result = await ComponentLibraryService.renderComponent(actualComponent, context || {
      pageId: 'preview',
      platform: 'admin',
      isPreview: true
    });

    const response: ApiResponse = {
      code: 0,
      message: '组件渲染成功',
      data: result
    };

    res.json(response);
  } catch (error: any) {
    console.error('渲染组件失败:', error);
    res.status(500).json({
      code: 500023,
      message: '渲染组件失败',
      data: null
    });
  }
});

/**
 * 批量渲染组件
 */
router.post('/render/batch', async (req, res): Promise<void> => {
  try {
    const { componentConfigs, context } = req.body;
    const result = await ComponentLibraryService.renderComponents(componentConfigs, context || {
      pageId: 'preview',
      platform: 'admin',
      isPreview: true
    });

    const response: ApiResponse = {
      code: 0,
      message: '组件批量渲染成功',
      data: result
    };

    res.json(response);
  } catch (error: any) {
    console.error('批量渲染组件失败:', error);
    res.status(500).json({
      code: 500024,
      message: '批量渲染组件失败',
      data: null
    });
  }
});

/**
 * 初始化系统组件
 */
router.post('/initialize', async (req, res): Promise<void> => {
  try {
    await ComponentLibraryService.initializeSystemComponents();

    const response: ApiResponse = {
      code: 0,
      message: '系统组件初始化成功',
      data: null
    };

    res.json(response);
  } catch (error: any) {
    console.error('初始化系统组件失败:', error);
    res.status(500).json({
      code: 500025,
      message: '初始化系统组件失败',
      data: null
    });
  }
});

export default router;