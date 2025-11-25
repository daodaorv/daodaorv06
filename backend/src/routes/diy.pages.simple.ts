import express from 'express';
import { DiyPageService, PublishService } from '../services/diy.service';
import { ApiResponse, PageConfiguration } from '../types/diy.types';

const router = express.Router();

/**
 * 获取页面列表
 */
router.get('/', async (req, res) => {
  try {
    const params = {
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 20,
      search: req.query.search as string,
      pageType: req.query.pageType as any,
      status: req.query.status as any,
      createdBy: req.query.createdBy as string
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
 * 获取页面详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DiyPageService.getPageById(id, 'mock-user-id');

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
router.post('/', async (req, res) => {
  try {
    const pageData = req.body as PageConfiguration;
    const result = await DiyPageService.createPage(pageData, 'mock-user-id');

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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await DiyPageService.updatePage(id, updateData, 'mock-user-id');

    if (!result) {
      return res.status(404).json({
        code: 404002,
        message: '页面不存在',
        data: null
      });
    }

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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DiyPageService.deletePage(id, 'mock-user-id');

    if (!result) {
      return res.status(404).json({
        code: 404003,
        message: '页面不存在',
        data: null
      });
    }

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
 * 发布页面
 */
router.post('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { versionNotes } = req.body;
    const publishRequest = { versionNotes };
    const result = await PublishService.publishPage(id, 'mock-user-id', publishRequest);

    const response: ApiResponse = {
      code: 0,
      message: '页面发布成功',
      data: result
    };

    res.json(response);
  } catch (error: any) {
    console.error('发布页面失败:', error);
    res.status(500).json({
      code: 500006,
      message: '发布页面失败',
      data: null
    });
  }
});

/**
 * 获取页面预览
 */
router.get('/:id/preview', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DiyPageService.getPageById(id, 'mock-user-id');

    if (!result) {
      return res.status(404).json({
        code: 404004,
        message: '页面不存在',
        data: null
      });
    }

    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: { config: result.config }
    };

    res.json(response);
  } catch (error: any) {
    console.error('获取页面预览失败:', error);
    res.status(500).json({
      code: 500007,
      message: '获取页面预览失败',
      data: null
    });
  }
});

export default router;