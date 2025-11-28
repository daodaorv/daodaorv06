import * as fs from 'fs-extra';
import * as path from 'path';
import fetch from 'node-fetch';
import { marked } from 'marked';
import * as cheerio from 'cheerio';
import {
  TechStackManifest,
  QuickReference,
  DocResult,
  ValidationResult,
  DocumentationCache,
  QueryContext
} from './types';
import { Logger } from '../core/utils';

/**
 * 技术栈配置清单
 */
const TECH_MANIFEST: TechStackManifest = {
  vue3: {
    name: "Vue.js",
    version: "3.5.0",
    docUrls: {
      official: "https://vuejs.org/guide/introduction.html",
      api: "https://vuejs.org/api/",
      examples: "https://vuejs.org/examples/",
      migration: "https://vuejs.org/guide/migration/introduction.html"
    },
    criticalTopics: [
      "composition-api",
      "reactivity-system",
      "lifecycle-hooks",
      "components",
      "props",
      "emits",
      "slots",
      "provide-inject",
      "teleport",
      "suspense"
    ],
    lastUpdated: "2025-11-28"
  },

  "element-plus": {
    name: "Element Plus",
    version: "2.11.7",
    docUrls: {
      official: "https://element-plus.org/zh-CN/",
      api: "https://element-plus.org/zh-CN/component/",
      examples: "https://play.element-plus.org/"
    },
    criticalTopics: [
      "table",
      "form",
      "dialog",
      "menu",
      "breadcrumb",
      "pagination",
      "message-box",
      "notification",
      "loading",
      "tree"
    ],
    lastUpdated: "2025-11-28"
  },

  "uni-app": {
    name: "uni-app",
    version: "3.0.0",
    docUrls: {
      official: "https://uniapp.dcloud.net.cn/",
      api: "https://uniapp.dcloud.net.cn/api/",
      examples: "https://hellouniapp.dcloud.net.cn/"
    },
    criticalTopics: [
      "vue3-setup",
      "lifecycle",
      "routing",
      "api-request",
      "storage",
      "media",
      "location",
      "payment",
      "login",
      "share"
    ],
    lastUpdated: "2025-11-28"
  },

  pinia: {
    name: "Pinia",
    version: "2.2.0",
    docUrls: {
      official: "https://pinia.vuejs.org/",
      api: "https://pinia.vuejs.org/api/"
    },
    criticalTopics: [
      "stores-definition",
      "state",
      "getters",
      "actions",
      "plugins",
      "devtools",
      "ssr"
    ],
    lastUpdated: "2025-11-28"
  },

  "vue-router": {
    name: "Vue Router",
    version: "4.4.0",
    docUrls: {
      official: "https://router.vuejs.org/",
      api: "https://router.vuejs.org/api/"
    },
    criticalTopics: [
      "installation",
      "dynamic-routing",
      "navigation-guards",
      "route-props",
      "history-mode",
      "scroll-behavior",
      "data-fetching"
    ],
    lastUpdated: "2025-11-28"
  }
};

/**
 * 技术文档实时查询模块
 */
export class TechDocumentQuery {
  private cache: Map<string, DocumentationCache> = new Map();
  private cacheDir: string;
  private readonly CACHE_DURATION = 3600000; // 1小时缓存

  constructor(cacheDir: string = '.daodao-tech-docs-cache') {
    this.cacheDir = cacheDir;
    this.initializeCache();
  }

  /**
   * 初始化缓存目录
   */
  private async initializeCache(): Promise<void> {
    await fs.ensureDir(this.cacheDir);
  }

  /**
   * 查询技术文档
   */
  async queryDocumentation(
    framework: string,
    topic: string,
    context: QueryContext
  ): Promise<DocResult> {
    const cacheKey = `${framework}:${topic}:${context.usage || 'development'}`;

    // 检查缓存
    const cached = await this.getCachedDocumentation(cacheKey);
    if (cached && cached.expiresAt > new Date()) {
      Logger.debug(`使用缓存的文档: ${cacheKey}`);
      return cached.content;
    }

    try {
      Logger.info(`查询 ${framework} 关于 ${topic} 的文档`);

      // 获取官方文档
      const docUrl = this.getDocURL(framework, topic);
      const docResult = await this.fetchAndExtractDocumentation(docUrl, framework, topic, context);

      // 缓存结果
      await this.cacheDocumentation(cacheKey, docResult);

      return docResult;

    } catch (error) {
      Logger.error(`文档查询失败: ${error}`);
      // 降级到本地缓存或快速参考
      return await this.getFallbackDocumentation(framework, topic);
    }
  }

  /**
   * 验证代码使用
   */
  async validateCodeUsage(
    code: string,
    framework: string,
    context?: QueryContext
  ): Promise<ValidationResult> {
    const guidelines = await this.queryDocumentation(framework, 'usage', {
      ...context || {},
      usage: 'development'
    });

    const violations = this.analyzeCodeViolations(code, guidelines);

    return {
      isValid: violations.filter(v => v.severity === 'error').length === 0,
      warnings: violations
        .filter(v => v.severity === 'warning')
        .map(v => v.message),
      suggestions: this.generateSuggestions(violations, guidelines),
      violations
    };
  }

  /**
   * 获取框架快速参考
   */
  getFrameworkQuickReference(framework: string): QuickReference | null {
    const manifest = TECH_MANIFEST[framework.toLowerCase()];
    if (!manifest) return null;

    // 返回预定义的快速参考信息
    return {
      commonPitfalls: this.getCommonPitfalls(framework),
      breakingChanges: this.getBreakingChanges(framework),
      bestPractices: this.getBestPractices(framework)
    };
  }

  /**
   * 获取技术栈清单
   */
  getTechStackManifest(): TechStackManifest {
    return TECH_MANIFEST;
  }

  /**
   * 检查框架支持
   */
  isFrameworkSupported(framework: string): boolean {
    return framework.toLowerCase() in TECH_MANIFEST;
  }

  /**
   * 获取文档URL
   */
  private getDocURL(framework: string, topic: string): string {
    const manifest = TECH_MANIFEST[framework.toLowerCase()];
    if (!manifest) {
      throw new Error(`不支持的框架: ${framework}`);
    }

    // 根据主题返回具体的URL
    if (topic.includes('api') || topic.includes('component')) {
      return manifest.docUrls.api;
    } else if (topic.includes('example') || topic.includes('demo')) {
      return manifest.docUrls.examples || manifest.docUrls.official;
    } else if (topic.includes('migration') || topic.includes('upgrade')) {
      return manifest.docUrls.migration || manifest.docUrls.official;
    }

    return manifest.docUrls.official;
  }

  /**
   * 获取并提取文档内容
   */
  private async fetchAndExtractDocumentation(
    url: string,
    framework: string,
    topic: string,
    context: QueryContext
  ): Promise<DocResult> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    return {
      framework,
      topic,
      guidelines: this.extractGuidelines($, framework, topic),
      examples: this.extractExamples($, framework, topic),
      pitfalls: this.extractPitfalls($, framework, topic),
      bestPractices: this.extractBestPractices($, framework, topic),
      lastUpdated: new Date(),
      sourceUrl: url
    };
  }

  /**
   * 提取指导原则
   */
  private extractGuidelines($: cheerio.CheerioAPI, framework: string, topic: string): string[] {
    const guidelines: string[] = [];

    // Vue.js 指导原则提取
    if (framework === 'vue3') {
      $('h2, h3, h4').each((i, element) => {
        const text = $(element).text();
        if (text.includes('指南') || text.includes('最佳') || text.includes('推荐')) {
          const nextElement = $(element).next();
          if (nextElement.length) {
            guidelines.push($(nextElement).text().trim());
          }
        }
      });
    }

    return guidelines.slice(0, 10); // 限制数量
  }

  /**
   * 提取示例代码
   */
  private extractExamples($: cheerio.CheerioAPI, framework: string, topic: string): string[] {
    const examples: string[] = [];

    // 提取代码块
    $('pre code, .language-js, .language-ts, .language-vue').each((i, element) => {
      const code = $(element).text().trim();
      if (code.length > 20) { // 过滤掉太短的代码片段
        examples.push(code);
      }
    });

    return examples.slice(0, 5); // 限制数量
  }

  /**
   * 提取常见陷阱
   */
  private extractPitfalls($: cheerio.CheerioAPI, framework: string, topic: string): string[] {
    const pitfalls: string[] = [];

    // 查找警告、注意等关键词
    $('blockquote.warning, .callout-warning, .alert-warning').each((i, element) => {
      const text = $(element).text().trim();
      if (text) pitfalls.push(text);
    });

    return pitfalls.slice(0, 5);
  }

  /**
   * 提取最佳实践
   */
  private extractBestPractices($: cheerio.CheerioAPI, framework: string, topic: string): string[] {
    const practices: string[] = [];

    $('h2, h3').each((i, element) => {
      const text = $(element).text();
      if (text.includes('最佳实践') || text.includes('推荐') || text.includes('建议')) {
        practices.push(text);
      }
    });

    return practices.slice(0, 5);
  }

  /**
   * 缓存文档
   */
  private async cacheDocumentation(key: string, content: DocResult): Promise<void> {
    const cacheItem: DocumentationCache = {
      topic: key,
      content,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + this.CACHE_DURATION)
    };

    // 内存缓存
    this.cache.set(key, cacheItem);

    // 磁盘缓存
    const cacheFile = path.join(this.cacheDir, `${key.replace(/[:\/]/g, '_')}.json`);
    await fs.writeJson(cacheFile, cacheItem, { spaces: 2 });
  }

  /**
   * 获取缓存的文档
   */
  private async getCachedDocumentation(key: string): Promise<DocumentationCache | null> {
    // 先检查内存缓存
    const memoryCache = this.cache.get(key);
    if (memoryCache && memoryCache.expiresAt > new Date()) {
      return memoryCache;
    }

    // 检查磁盘缓存
    const cacheFile = path.join(this.cacheDir, `${key.replace(/[:\/]/g, '_')}.json`);
    if (await fs.pathExists(cacheFile)) {
      try {
        const diskCache = await fs.readJson(cacheFile);
        if (new Date(diskCache.expiresAt) > new Date()) {
          this.cache.set(key, diskCache);
          return diskCache;
        }
      } catch (error) {
        Logger.warn(`读取缓存文件失败: ${cacheFile}`);
      }
    }

    return null;
  }

  /**
   * 获取降级文档
   */
  private async getFallbackDocumentation(framework: string, topic: string): Promise<DocResult> {
    const quickRef = this.getFrameworkQuickReference(framework);

    return {
      framework,
      topic,
      guidelines: quickRef?.bestPractices || [],
      examples: [],
      pitfalls: quickRef?.commonPitfalls || [],
      bestPractices: quickRef?.bestPractices || [],
      lastUpdated: new Date(),
      sourceUrl: 'fallback://local-cache'
    };
  }

  /**
   * 分析代码违规
   */
  private analyzeCodeViolations(code: string, guidelines: DocResult): any[] {
    const violations = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Vue.js 特定的检查
      if (guidelines.framework === 'vue3') {
        // 检查是否使用了已废弃的选项式API
        if (line.includes('data()') || line.includes('methods:')) {
          violations.push({
            line: index + 1,
            column: line.indexOf('data') + 1,
            message: '建议使用Composition API替代Options API',
            severity: 'warning' as const,
            rule: 'vue3-composition-api-preferred'
          });
        }

        // 检查响应式声明
        if (line.includes('ref(') || line.includes('reactive(')) {
          if (!line.includes('import') && index < 5) {
            violations.push({
              line: index + 1,
              column: 1,
              message: '使用ref/reactive需要从Vue中导入',
              severity: 'error' as const,
              rule: 'vue3-import-required'
            });
          }
        }
      }
    });

    return violations;
  }

  /**
   * 生成建议
   */
  private generateSuggestions(violations: any[], guidelines: DocResult): string[] {
    const suggestions = [];

    if (violations.some(v => v.rule === 'vue3-composition-api-preferred')) {
      suggestions.push('考虑使用Vue 3的Composition API来获得更好的代码组织');
    }

    if (violations.some(v => v.rule === 'vue3-import-required')) {
      suggestions.push('确保在使用Vue 3的响应式API之前正确导入');
    }

    return suggestions;
  }

  /**
   * 获取常见陷阱
   */
  private getCommonPitfalls(framework: string): string[] {
    const pitfalls: Record<string, string[]> = {
      vue3: [
        '忘记在使用ref/reactive之前导入它们',
        '在模板中直接修改props',
        '在setup函数中没有正确返回响应式数据',
        '滥用reactive而应该使用ref的场景',
        '忽略响应式对象的ref包装特性'
      ],
      'element-plus': [
        '忘记导入组件和样式文件',
        '在表单验证时rules定义不正确',
        '表格组件数据格式不符合要求',
        '忽略组件的版本兼容性问题',
        '动态组件使用时命名不规范'
      ],
      'uni-app': [
        '小程序API在不同平台的兼容性问题',
        '生命周期钩子使用不当',
        '页面路径配置错误',
        '条件编译语法使用错误',
        '跨平台样式处理不当'
      ]
    };

    return pitfalls[framework.toLowerCase()] || [];
  }

  /**
   * 获取破坏性变更
   */
  private getBreakingChanges(framework: string): string[] {
    const changes: Record<string, string[]> = {
      vue3: [
        '过滤器(filter)已被移除',
        '$on, $off, $once 实例方法已被移除',
        '全局API变更：Vue.use -> app.use',
        'v-model默认行为改变',
        'key属性现在必须设置在template标签上'
      ],
      'element-plus': [
        '部分组件API重命名',
        '主题变量命名规范变更',
        '部分图标组件迁移',
        '国际化配置方式变更'
      ]
    };

    return changes[framework.toLowerCase()] || [];
  }

  /**
   * 获取最佳实践
   */
  private getBestPractices(framework: string): string[] {
    const practices: Record<string, string[]> = {
      vue3: [
        '优先使用Composition API',
        '合理使用ref和reactive',
        '遵循单一职责原则组织代码',
        '使用TypeScript增强类型安全',
        '合理使用computed和watch',
        '避免过度嵌套的响应式对象'
      ],
      'element-plus': [
        '按需导入组件减少打包体积',
        '使用TypeScript定义组件props',
        '遵循组件命名规范',
        '合理使用表单验证',
        '注意表格性能优化'
      ],
      'uni-app': [
        '使用条件编译处理平台差异',
        '合理使用生命周期函数',
        '注意页面层级管理',
        '优化图片资源使用',
        '遵循小程序平台规范'
      ]
    };

    return practices[framework.toLowerCase()] || [];
  }
}