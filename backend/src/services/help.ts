import { Op } from 'sequelize';
import { HelpArticle, HelpCategory, HelpTag, HelpArticleTag, HelpFeedback, HelpStats } from '../models';
import { sequelize } from '../config/database';

export interface HelpFilters {
  categoryId?: number;
  keyword?: string;
  isTop?: boolean;
  tags?: string[];
  authorId?: number;
}

export interface SearchParams {
  keyword: string;
  page?: number;
  limit?: number;
  categoryId?: number;
}

export interface FeedbackData {
  userId?: number;
  articleId?: number;
  type: 'helpful' | 'not_helpful' | 'suggestion' | 'complaint';
  content: string;
  contactInfo?: string;
}

export class HelpService {
  /**
   * 获取帮助分类列表
   */
  public async getCategories(includeInactive: boolean = false) {
    const whereClause: any = {};
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    const categories = await HelpCategory.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
      include: [
        {
          model: HelpCategory,
          as: 'children',
          where: includeInactive ? {} : { isActive: true },
          required: false
        }
      ]
    });

    // 只返回顶级分类
    return categories.filter(cat => cat.parentId === null);
  }

  /**
   * 获取文章列表
   */
  public async getArticles(
    page: number = 1,
    limit: number = 20,
    filters: HelpFilters = {}
  ) {
    const whereClause: any = {
      isActive: true
    };

    // 构建查询条件
    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.keyword) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${filters.keyword}%` } },
        { content: { [Op.like]: `%${filters.keyword}%` } },
        { keywords: { [Op.like]: `%${filters.keyword}%` } }
      ];
    }

    if (filters.isTop !== undefined) {
      whereClause.isTop = filters.isTop;
    }

    if (filters.authorId) {
      whereClause.authorId = filters.authorId;
    }

    const { count, rows } = await HelpArticle.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: HelpCategory,
          attributes: ['id', 'name', 'color']
        },
        {
          model: HelpTag,
          attributes: ['id', 'name', 'color'],
          through: { attributes: [] }
        }
      ],
      order: [['isTop', 'DESC'], ['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      articles: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * 搜索帮助文章
   */
  public async searchArticles(params: SearchParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;

    const whereClause: any = {
      isActive: true
    };

    if (params.categoryId) {
      whereClause.categoryId = params.categoryId;
    }

    if (params.keyword) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${params.keyword}%` } },
        { content: { [Op.like]: `%${params.keyword}%` } },
        { keywords: { [Op.like]: `%${params.keyword}%` } }
      ];
    }

    const { count, rows } = await HelpArticle.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: HelpCategory,
          attributes: ['id', 'name', 'color']
        },
        {
          model: HelpTag,
          attributes: ['id', 'name', 'color'],
          through: { attributes: [] }
        }
      ],
      order: [
        // 优先显示标题匹配的结果
        [sequelize.literal('CASE WHEN title LIKE :keyword THEN 1 ELSE 2 END'), 'ASC'],
        ['isTop', 'DESC'],
        ['viewCount', 'DESC'],
        ['createdAt', 'DESC']
      ],
      replacements: { keyword: `%${params.keyword}%` },
      limit,
      offset: (page - 1) * limit
    });

    // 记录搜索日志（这里简化处理）
    this.logSearch(params.keyword, count);

    return {
      articles: rows,
      keyword: params.keyword,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * 获取文章详情
   */
  public async getArticleDetail(articleId: number, incrementView: boolean = true) {
    const article = await HelpArticle.findByPk(articleId, {
      include: [
        {
          model: HelpCategory,
          attributes: ['id', 'name', 'color']
        },
        {
          model: HelpTag,
          attributes: ['id', 'name', 'color'],
          through: { attributes: [] }
        }
      ]
    });

    if (!article || !article.isActive) {
      throw new Error('ARTICLE_NOT_FOUND');
    }

    // 增加浏览量
    if (incrementView) {
      await article.increment('viewCount');
      await this.updateViewStats();
    }

    return article;
  }

  /**
   * 获取热门文章
   */
  public async getPopularArticles(limit: number = 10) {
    return await HelpArticle.findAll({
      where: {
        isActive: true
      },
      include: [
        {
          model: HelpCategory,
          attributes: ['id', 'name', 'color']
        }
      ],
      order: [['viewCount', 'DESC'], ['likeCount', 'DESC']],
      limit
    });
  }

  /**
   * 获取推荐文章（基于分类）
   */
  public async getRecommendedArticles(categoryId: number, currentArticleId: number, limit: number = 5) {
    return await HelpArticle.findAll({
      where: {
        categoryId,
        isActive: true,
        id: { [Op.ne]: currentArticleId }
      },
      order: [['viewCount', 'DESC'], ['sortOrder', 'ASC']],
      limit
    });
  }

  /**
   * 提交用户反馈
   */
  public async submitFeedback(data: FeedbackData) {
    const feedback = await HelpFeedback.create({
      userId: data.userId,
      articleId: data.articleId,
      type: data.type,
      content: data.content,
      contactInfo: data.contactInfo
    });

    // 如果是文章有用性反馈，更新文章统计
    if (data.articleId && (data.type === 'helpful' || data.type === 'not_helpful')) {
      await this.updateArticleFeedback(data.articleId, data.type);
    }

    return feedback;
  }

  /**
   * 获取标签列表
   */
  public async getTags() {
    return await HelpTag.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
    });
  }

  /**
   * 获取帮助统计
   */
  public async getHelpStats() {
    const today = new Date().toISOString().split('T')[0];

    let stats = await HelpStats.findOne({
      where: { date: today }
    });

    if (!stats) {
      // 如果没有今日统计数据，创建一个
      stats = await HelpStats.create({
        date: today,
        totalViews: 0,
        uniqueVisitors: 0,
        articleViews: 0,
        searches: 0,
        feedbackCount: 0,
        helpfulCount: 0
      });
    }

    return stats;
  }

  /**
   * 更新文章有用性统计
   */
  private async updateArticleFeedback(articleId: number, type: string) {
    if (type === 'helpful') {
      await HelpArticle.increment('helpfulCount', {
        where: { id: articleId }
      });
    }
  }

  /**
   * 更新浏览统计
   */
  private async updateViewStats() {
    const today = new Date().toISOString().split('T')[0];

    await HelpStats.increment(
      {
        totalViews: 1,
        articleViews: 1
      },
      {
        where: { date: today }
      }
    );
  }

  /**
   * 记录搜索日志
   */
  private async logSearch(keyword: string, resultCount: number) {
    // 这里简化处理，实际应该记录用户IP、User Agent等信息
    try {
      // 可以异步记录，避免影响搜索性能
      setTimeout(async () => {
        try {
          // 实际项目中这里应该创建 HelpSearchLog 模型来记录
          console.log(`Search logged: ${keyword}, results: ${resultCount}`);
        } catch (error) {
          console.error('Failed to log search:', error);
        }
      }, 0);
    } catch (error) {
      console.error('Log search error:', error);
    }
  }

  /**
   * 获取分类下的文章数量
   */
  public async getCategoryArticleCount(categoryId: number) {
    return await HelpArticle.count({
      where: {
        categoryId,
        isActive: true
      }
    });
  }

  /**
   * 批量获取分类统计信息
   */
  public async getCategoriesWithStats() {
    const categories = await HelpCategory.findAll({
      where: {
        isActive: true,
        parentId: null
      },
      include: [
        {
          model: HelpCategory,
          as: 'children',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: HelpArticle,
              attributes: [[sequelize.fn('COUNT', sequelize.col('children->help_articles.id')), 'articleCount']],
              where: { isActive: true },
              required: false
            }
          ]
        }
      ],
      order: [['sortOrder', 'ASC']]
    });

    // 为每个分类添加文章统计
    for (const category of categories) {
      const articleCount = await this.getCategoryArticleCount(category.id);
      category.setDataValue('articleCount', articleCount);

      // 处理子分类统计
      if (category.children && category.children.length > 0) {
        for (const child of category.children) {
          const childCount = await this.getCategoryArticleCount(child.id);
          child.setDataValue('articleCount', childCount);
        }
      }
    }

    return categories;
  }
}