import { Request, Response } from 'express';
import { HelpService } from '../services/help';
import { ApiResponse } from '../utils/response';

export class HelpController {
  private helpService: HelpService;

  constructor() {
    this.helpService = new HelpService();
  }

  /**
   * 获取帮助分类列表
   */
  public async getCategories(req: Request, res: Response) {
    try {
      const { includeInactive } = req.query;

      const categories = await this.helpService.getCategories(
        includeInactive === 'true'
      );

      res.json(
        ApiResponse.success('获取成功', categories)
      );
    } catch (error: any) {
      console.error('Get categories error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取分类及统计信息
   */
  public async getCategoriesWithStats(req: Request, res: Response) {
    try {
      const categories = await this.helpService.getCategoriesWithStats();

      res.json(
        ApiResponse.success('获取成功', categories)
      );
    } catch (error: any) {
      console.error('Get categories with stats error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取文章列表
   */
  public async getArticles(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const {
        categoryId,
        keyword,
        isTop,
        authorId
      } = req.query;

      const filters = {
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        keyword: keyword as string,
        isTop: isTop === 'true' ? true : isTop === 'false' ? false : undefined,
        authorId: authorId ? parseInt(authorId as string) : undefined
      };

      const result = await this.helpService.getArticles(page, limit, filters);

      const pagination = {
        current: page,
        pageSize: limit,
        total: result.total,
        pages: result.totalPages
      };

      res.json(
        ApiResponse.success('获取成功', {
          articles: result.articles,
          pagination
        })
      );
    } catch (error: any) {
      console.error('Get articles error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 搜索帮助文章
   */
  public async searchArticles(req: Request, res: Response) {
    try {
      const {
        keyword,
        page,
        limit,
        categoryId
      } = req.query;

      if (!keyword) {
        return res.status(400).json(
          ApiResponse.error('搜索关键词不能为空', 400001)
        );
      }

      const searchParams = {
        keyword: keyword as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined
      };

      const result = await this.helpService.searchArticles(searchParams);

      const pagination = result.page ? {
        current: result.page,
        pageSize: result.limit,
        total: result.total,
        pages: result.totalPages
      } : undefined;

      res.json(
        ApiResponse.success('搜索成功', {
          keyword: result.keyword,
          articles: result.articles,
          total: result.total,
          pagination
        })
      );
    } catch (error: any) {
      console.error('Search articles error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取文章详情
   */
  public async getArticleDetail(req: Request, res: Response) {
    try {
      const articleId = parseInt(req.params.articleId);
      const { incrementView } = req.query;

      const article = await this.helpService.getArticleDetail(
        articleId,
        incrementView !== 'false'
      );

      res.json(
        ApiResponse.success('获取成功', article)
      );
    } catch (error: any) {
      console.error('Get article detail error:', error);

      if (error.message === 'ARTICLE_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('文章不存在', 404001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取热门文章
   */
  public async getPopularArticles(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const articles = await this.helpService.getPopularArticles(limit);

      res.json(
        ApiResponse.success('获取成功', articles)
      );
    } catch (error: any) {
      console.error('Get popular articles error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取推荐文章
   */
  public async getRecommendedArticles(req: Request, res: Response) {
    try {
      const articleId = parseInt(req.params.articleId);
      const limit = parseInt(req.query.limit as string) || 5;

      // 先获取当前文章的分类
      const currentArticle = await this.helpService.getArticleDetail(articleId, false);
      const categoryId = currentArticle.categoryId;

      const articles = await this.helpService.getRecommendedArticles(
        categoryId,
        articleId,
        limit
      );

      res.json(
        ApiResponse.success('获取成功', articles)
      );
    } catch (error: any) {
      console.error('Get recommended articles error:', error);

      if (error.message === 'ARTICLE_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('文章不存在', 404001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 提交用户反馈
   */
  public async submitFeedback(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const {
        articleId,
        type,
        content,
        contactInfo
      } = req.body;

      const feedback = await this.helpService.submitFeedback({
        userId,
        articleId,
        type,
        content,
        contactInfo
      });

      res.json(
        ApiResponse.success('反馈提交成功', feedback)
      );
    } catch (error: any) {
      console.error('Submit feedback error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取标签列表
   */
  public async getTags(req: Request, res: Response) {
    try {
      const tags = await this.helpService.getTags();

      res.json(
        ApiResponse.success('获取成功', tags)
      );
    } catch (error: any) {
      console.error('Get tags error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取帮助统计
   */
  public async getHelpStats(req: Request, res: Response) {
    try {
      const stats = await this.helpService.getHelpStats();

      res.json(
        ApiResponse.success('获取成功', stats)
      );
    } catch (error: any) {
      console.error('Get help stats error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }
}