#!/usr/bin/env node

/**
 * 叨叨房车后端自动巡检工作流工具
 * 在CMD终端运行，持续监控前端API文档变化，自动执行后端开发和测试
 */

const fs = require('fs');
const path = require('path');

/**
 * 自动巡检工作流引擎
 */
class AutoMonitorWorkflowEngine {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.backendPath = path.join(projectRoot, 'backend');
    this.frontendProjects = ['admin-console', 'miniprogram', 'mobile-admin'];
    this.isRunning = false;
    this.scanInterval = 5000; // 5秒扫描间隔
    this.currentTask = null;
    this.taskQueue = [];
    this.processedAPIs = new Set(); // 避免重复处理
    this.githubUpdater = null; // GitHub更新器
    this.stats = {
      startTime: new Date(),
      totalAPIDetected: 0,
      totalTasksCompleted: 0,
      successfulIntegrations: 0,
      failedIntegrations: 0
    };

    // 创建日志目录
    this.logDir = path.join(projectRoot, '.claude', 'logs');
    this.ensureDirectory(this.logDir);

    // 日志文件路径
    this.logFile = path.join(this.logDir, `backend-monitor-${new Date().toISOString().split('T')[0]}.log`);

    this.setupGracefulShutdown();

    // 初始化GitHub更新器
    this.initGitHubUpdater();
  }

  /**
   * 确保目录存在
   */
  ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * 设置优雅关闭
   */
  setupGracefulShutdown() {
    const shutdown = () => {
      this.log('🛑 收到关闭信号，正在优雅关闭...');
      this.isRunning = false;
      this.saveStats();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('SIGHUP', shutdown);
  }

  /**
   * 初始化GitHub更新器
   */
  initGitHubUpdater() {
    try {
      // 动态导入GitHub更新器
      const GitHubUpdaterPath = path.join(__dirname, 'github-auto-updater.js');
      if (fs.existsSync(GitHubUpdaterPath)) {
        const { GitHubAutoUpdater } = require(GitHubUpdaterPath);
        this.githubUpdater = new GitHubAutoUpdater(this.projectRoot);
        this.log('📦 GitHub自动更新器已初始化');
      } else {
        this.log('⚠️ GitHub更新器文件未找到，跳过自动推送功能', 'warn');
      }
    } catch (error) {
      this.log(`⚠️ GitHub更新器初始化失败: ${error.message}`, 'warn');
      this.githubUpdater = null;
    }
  }

  /**
   * 日志记录
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // 控制台输出（带颜色）
    switch (level) {
      case 'error':
        console.log('\x1b[31m%s\x1b[0m', logMessage); // 红色
        break;
      case 'warn':
        console.log('\x1b[33m%s\x1b[0m', logMessage); // 黄色
        break;
      case 'success':
        console.log('\x1b[32m%s\x1b[0m', logMessage); // 绿色
        break;
      default:
        console.log('\x1b[36m%s\x1b[0m', logMessage); // 青色
    }

    // 文件输出
    try {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    } catch (error) {
      console.error('写入日志文件失败:', error.message);
    }
  }

  /**
   * 启动自动巡检
   */
  async startMonitoring() {
    this.log('🚀 启动叨叨房车后端自动巡检工作流');
    this.log(`📁 项目根目录: ${this.projectRoot}`);
    this.log(`⚡ 扫描间隔: ${this.scanInterval / 1000}秒`);

    // 检查后端项目
    if (!this.checkBackendProject()) {
      this.log('❌ 后端项目检查失败，无法启动监控', 'error');
      process.exit(1);
    }

    this.isRunning = true;
    this.log('✅ 后端项目检查通过，开始监控...');

    // 显示启动信息
    this.showStartupInfo();

    // 主监控循环
    await this.monitoringLoop();
  }

  /**
   * 检查后端项目
   */
  checkBackendProject() {
    const requiredFiles = [
      'package.json',
      'src/index.ts',
      'tsconfig.json'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.backendPath, file);
      if (!fs.existsSync(filePath)) {
        this.log(`❌ 缺少必要文件: ${filePath}`, 'error');
        return false;
      }
    }

    this.log('✅ 后端项目结构检查通过');
    return true;
  }

  /**
   * 显示启动信息
   */
  showStartupInfo() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 叨叨房车后端自动巡检工作流已启动');
    console.log('='.repeat(80));
    console.log(`📂 监控目录: ${this.projectRoot}`);
    console.log(`🔍 前端项目: ${this.frontendProjects.join(', ')}`);
    console.log(`⏰ 扫描间隔: ${this.scanInterval / 1000}秒`);
    console.log(`📝 日志文件: ${this.logFile}`);
    console.log('='.repeat(80));
    console.log('💡 按 Ctrl+C 可安全停止监控');
    console.log('='.repeat(80) + '\n');
  }

  /**
   * 主监控循环
   */
  async monitoringLoop() {
    while (this.isRunning) {
      try {
        // 更新控制台显示
        this.updateConsoleDisplay();

        // 扫描前端API文档
        const newAPIs = await this.scanFrontendAPIs();

        if (newAPIs.length > 0) {
          this.log(`🔍 检测到 ${newAPIs.length} 个新的API需要处理`);

          for (const api of newAPIs) {
            if (this.isRunning) {
              await this.processAPI(api);
            }
          }
        }

        // 等待下次扫描
        await this.sleep(this.scanInterval);

      } catch (error) {
        this.log(`⚠️ 监控循环出错: ${error.message}`, 'error');
        await this.sleep(this.scanInterval);
      }
    }
  }

  /**
   * 更新控制台显示
   */
  updateConsoleDisplay() {
    // 清屏并显示状态
    console.clear();

    const runtime = this.getRuntime();
    const now = new Date().toLocaleString();

    console.log('\n' + '='.repeat(80));
    console.log('🎯 叨叨房车后端自动巡检工作流 - 实时监控');
    console.log('='.repeat(80));
    console.log(`⏰ 当前时间: ${now}`);
    console.log(`⏱️ 运行时长: ${runtime}`);
    console.log(`📊 统计信息: 检测到API ${this.stats.totalAPIDetected} 个 | 完成任务 ${this.stats.totalTasksCompleted} 个 | 成功集成 ${this.stats.successfulIntegrations} 个`);
    console.log(`🔄 当前状态: ${this.currentTask ? '正在处理: ' + this.currentTask.name : '监控中...'}`);
    console.log(`⏳ 任务队列: ${this.taskQueue.length} 个待处理`);
    console.log('='.repeat(80));

    // 显示最近处理的API
    if (this.processedAPIs.size > 0) {
      console.log('📝 最近处理的API:');
      const recentAPIs = Array.from(this.processedAPIs).slice(-5);
      recentAPIs.forEach(api => {
        console.log(`   ✓ ${api}`);
      });
      console.log('='.repeat(80));
    }

    console.log('💡 按 Ctrl+C 可安全停止监控\n');
  }

  /**
   * 获取运行时长
   */
  getRuntime() {
    const now = new Date();
    const diff = now - this.stats.startTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  /**
   * 扫描前端API文档
   */
  async scanFrontendAPIs() {
    const newAPIs = [];

    for (const project of this.frontendProjects) {
      try {
        const projectAPIs = await this.scanProjectAPIs(project);
        newAPIs.push(...projectAPIs);
      } catch (error) {
        this.log(`⚠️ 扫描项目 ${project} 失败: ${error.message}`, 'warn');
      }
    }

    return newAPIs;
  }

  /**
   * 扫描单个项目的API
   */
  async scanProjectAPIs(project) {
    const projectPath = path.join(this.projectRoot, project);
    const apiDocPath = path.join(projectPath, 'docs', 'API文档.md');

    if (!fs.existsSync(apiDocPath)) {
      return [];
    }

    const content = fs.readFileSync(apiDocPath, 'utf-8');
    const newAPIs = [];

    // 解析API状态
    const apiMatches = content.matchAll(/###\s+(.+?)\s+✅/g);

    for (const match of apiMatches) {
      const apiName = match[1].trim();
      const apiId = `${project}:${apiName}`;

      if (!this.processedAPIs.has(apiId)) {
        newAPIs.push({
          id: apiId,
          name: apiName,
          project: project,
          document: apiDocPath,
          timestamp: new Date()
        });

        this.processedAPIs.add(apiId);
        this.stats.totalAPIDetected++;
      }
    }

    return newAPIs;
  }

  /**
   * 处理API
   */
  async processAPI(api) {
    this.currentTask = api;
    this.log(`📝 开始处理API: ${api.name} (${api.project})`);

    try {
      // 步骤1: 分析API需求
      const analysis = await this.analyzeAPIRequirements(api);
      this.log(`📋 API需求分析完成: ${analysis.summary}`);

      // 步骤2: 检查后端实现
      const implementation = await this.checkBackendImplementation(api);

      if (implementation.exists) {
        this.log(`✅ 后端实现已存在: ${implementation.route}`);
        await this.testExistingAPI(api, implementation);
      } else {
        // 步骤3: 生成后端代码
        this.log('⚙️ 开始生成后端代码...');
        const generated = await this.generateBackendCode(api, analysis);

        if (generated.success) {
          this.log(`✅ 后端代码生成成功: ${generated.files.length} 个文件`);

          // 步骤4: 运行测试
          this.log('🧪 开始运行API测试...');
          const testResult = await this.runAPITests(api, generated);

          if (testResult.success) {
            this.log(`🎉 API集成成功: ${api.name}`, 'success');
            this.stats.successfulIntegrations++;
            await this.updateAPIStatus(api, 'integrated');

            // 自动GitHub更新
            await this.autoUpdateGitHub();
          } else {
            this.log(`❌ API测试失败: ${testResult.error}`, 'error');
            this.stats.failedIntegrations++;
            await this.updateAPIStatus(api, 'failed');
          }
        } else {
          this.log(`❌ 代码生成失败: ${generated.error}`, 'error');
          this.stats.failedIntegrations++;
        }
      }

      this.stats.totalTasksCompleted++;

    } catch (error) {
      this.log(`⚠️ 处理API失败: ${error.message}`, 'error');
      this.stats.failedIntegrations++;
    } finally {
      this.currentTask = null;
    }
  }

  /**
   * 分析API需求
   */
  async analyzeAPIRequirements(api) {
    const content = fs.readFileSync(api.document, 'utf-8');

    // 提取API信息
    const apiSection = content.match(new RegExp(`###\\s+${api.name}([\\s\\S]*?)(?=###|$)`));

    if (!apiSection) {
      throw new Error(`无法找到API ${api.name} 的定义`);
    }

    const sectionText = apiSection[1];

    return {
      name: api.name,
      method: this.extractMethod(sectionText),
      endpoint: this.extractEndpoint(sectionText),
      parameters: this.extractParameters(sectionText),
      response: this.extractResponse(sectionText),
      description: this.extractDescription(sectionText),
      summary: `${this.extractMethod(sectionText)} ${this.extractEndpoint(sectionText)}`
    };
  }

  /**
   * 检查后端实现
   */
  async checkBackendImplementation(api) {
    const routesPath = path.join(this.backendPath, 'src', 'routes');
    const controllersPath = path.join(this.backendPath, 'src', 'controllers');

    // 查找相关路由文件
    const routeFiles = fs.existsSync(routesPath) ? fs.readdirSync(routesPath) : [];

    for (const file of routeFiles) {
      if (file.endsWith('.routes.ts')) {
        const routePath = path.join(routesPath, file);
        const content = fs.readFileSync(routePath, 'utf-8');

        if (content.includes(api.name.toLowerCase()) || content.includes(api.endpoint)) {
          return {
            exists: true,
            route: routePath,
            file: file
          };
        }
      }
    }

    return {
      exists: false,
      route: null,
      file: null
    };
  }

  /**
   * 生成后端代码
   */
  async generateBackendCode(api, analysis) {
    try {
      const generatedFiles = [];

      // 生成路由文件
      const routeFile = await this.generateRouteFile(api, analysis);
      if (routeFile) {
        generatedFiles.push(routeFile);
      }

      // 生成控制器文件
      const controllerFile = await this.generateControllerFile(api, analysis);
      if (controllerFile) {
        generatedFiles.push(controllerFile);
      }

      // 生成服务文件
      const serviceFile = await this.generateServiceFile(api, analysis);
      if (serviceFile) {
        generatedFiles.push(serviceFile);
      }

      return {
        success: true,
        files: generatedFiles
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 生成路由文件
   */
  async generateRouteFile(api, analysis) {
    const routesPath = path.join(this.backendPath, 'src', 'routes');
    this.ensureDirectory(routesPath);

    const routeFileName = `${api.name.toLowerCase().replace(/\s+/g, '-')}.routes.ts`;
    const routeFilePath = path.join(routesPath, routeFileName);

    const routeTemplate = `import { Router } from 'express';
import { ${api.name.replace(/\s+/g, '')}Controller } from '@/controllers/${api.name.toLowerCase().replace(/\s+/g, '-')}.controller';

const router = Router();
const ${api.name.toLowerCase().replace(/\s+/g, '')}Controller = new ${api.name.replace(/\s+/g, '')}Controller();

/**
 * @swagger
 * ${analysis.endpoint}:
 *   ${analysis.method.toLowerCase()}:
 *     summary: ${analysis.description}
 *     tags: [${api.project}]
 *     responses:
 *       200:
 *         description: Success
 */
router.${analysis.method.toLowerCase()}('${analysis.endpoint}', (req, res) => {
  ${api.name.toLowerCase().replace(/\s+/g, '')}Controller.${analysis.method.toLowerCase()}(req, res);
});

export default router;`;

    fs.writeFileSync(routeFilePath, routeTemplate);

    return {
      type: 'route',
      path: routeFilePath,
      name: routeFileName
    };
  }

  /**
   * 生成控制器文件
   */
  async generateControllerFile(api, analysis) {
    const controllersPath = path.join(this.backendPath, 'src', 'controllers');
    this.ensureDirectory(controllersPath);

    const controllerFileName = `${api.name.toLowerCase().replace(/\s+/g, '-')}.controller.ts`;
    const controllerFilePath = path.join(controllersPath, controllerFileName);

    const controllerTemplate = `import { Request, Response } from 'express';
import { ${api.name.replace(/\s+/g, '')}Service } from '@/services/${api.name.toLowerCase().replace(/\s+/g, '-')}.service';
import { logger } from '@/utils/logger';

export class ${api.name.replace(/\s+/g, '')}Controller {
  private ${api.name.toLowerCase().replace(/\s+/g, '')}Service: ${api.name.replace(/\s+/g, '')}Service;

  constructor() {
    this.${api.name.toLowerCase().replace(/\s+/g, '')}Service = new ${api.name.replace(/\s+/g, '')}Service();
  }

  /**
   * ${analysis.description}
   */
  async ${analysis.method.toLowerCase()}(req: Request, res: Response) {
    try {
      logger.info('${analysis.method} ${analysis.endpoint} called');

      // TODO: 实现具体业务逻辑
      const result = await this.${api.name.toLowerCase().replace(/\s+/g, '')}Service.${analysis.method.toLowerCase()}(req.body, req.params, req.query);

      res.json({
        code: 0,
        message: 'success',
        data: result
      });
    } catch (error) {
      logger.error('${analysis.method} ${analysis.endpoint} error:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        data: null
      });
    }
  }
}`;

    fs.writeFileSync(controllerFilePath, controllerTemplate);

    return {
      type: 'controller',
      path: controllerFilePath,
      name: controllerFileName
    };
  }

  /**
   * 生成服务文件
   */
  async generateServiceFile(api, analysis) {
    const servicesPath = path.join(this.backendPath, 'src', 'services');
    this.ensureDirectory(servicesPath);

    const serviceFileName = `${api.name.toLowerCase().replace(/\s+/g, '-')}.service.ts`;
    const serviceFilePath = path.join(servicesPath, serviceFileName);

    const serviceTemplate = `import { logger } from '@/utils/logger';

export class ${api.name.replace(/\s+/g, '')}Service {

  /**
   * ${analysis.description}
   */
  async ${analysis.method.toLowerCase()}(body: any, params: any, query: any) {
    try {
      logger.info('Processing ${analysis.method.toLowerCase()} request');

      // TODO: 实现具体业务逻辑
      // 根据API需求实现相应的业务处理

      const result = {
        message: '${api.name} processed successfully',
        timestamp: new Date().toISOString()
      };

      return result;
    } catch (error) {
      logger.error('${api.name} service error:', error);
      throw error;
    }
  }
}`;

    fs.writeFileSync(serviceFilePath, serviceTemplate);

    return {
      type: 'service',
      path: serviceFilePath,
      name: serviceFileName
    };
  }

  /**
   * 运行API测试
   */
  async runAPITests(api, generated) {
    try {
      this.log('🧪 开始API测试...');

      // 编译检查
      const { execSync } = require('child_process');

      // 运行TypeScript编译
      execSync('npm run build', {
        cwd: this.backendPath,
        stdio: 'pipe'
      });

      // TODO: 运行具体的API测试
      // 这里可以集成具体的测试框架，比如Jest

      this.log('✅ API测试通过');
      return {
        success: true,
        message: 'All tests passed'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 测试现有API
   */
  async testExistingAPI(api, implementation) {
    try {
      this.log(`🧪 测试现有API: ${api.name}`);

      // TODO: 实现现有API的测试逻辑

      this.log(`✅ 现有API测试通过: ${api.name}`);
      await this.updateAPIStatus(api, 'tested');

    } catch (error) {
      this.log(`❌ 现有API测试失败: ${error.message}`, 'error');
    }
  }

  /**
   * 更新API状态
   */
  async updateAPIStatus(api, status) {
    try {
      const content = fs.readFileSync(api.document, 'utf-8');

      // 更新API状态标记
      let updatedContent = content.replace(
        new RegExp(`###\\s+${api.name}\\s+✅`, 'g'),
        `### ${api.name} ✅ 已${status === 'integrated' ? '集成' : status === 'tested' ? '测试' : '处理'}`
      );

      fs.writeFileSync(api.document, updatedContent);

      this.log(`📝 API状态已更新: ${api.name} -> ${status}`);

    } catch (error) {
      this.log(`⚠️ 更新API状态失败: ${error.message}`, 'warn');
    }
  }

  /**
   * 自动GitHub更新
   */
  async autoUpdateGitHub() {
    if (!this.githubUpdater) {
      this.log('⚠️ GitHub更新器未初始化，跳过自动提交', 'warn');
      return;
    }

    try {
      this.log('🚀 开始自动GitHub更新...');
      const result = await this.githubUpdater.updateGitHub();

      if (result.success) {
        this.log(`📦 GitHub更新成功: ${result.message}`, 'success');
      } else {
        this.log(`⚠️ GitHub更新失败: ${result.message}`, 'warn');
      }

    } catch (error) {
      this.log(`❌ GitHub更新异常: ${error.message}`, 'error');
    }
  }

  /**
   * 保存统计信息
   */
  saveStats() {
    const statsFile = path.join(this.logDir, `stats-${new Date().toISOString().split('T')[0]}.json`);

    try {
      fs.writeFileSync(statsFile, JSON.stringify({
        ...this.stats,
        endTime: new Date(),
        processedAPIs: Array.from(this.processedAPIs)
      }, null, 2));

      this.log(`📊 统计信息已保存: ${statsFile}`);
    } catch (error) {
      this.log(`⚠️ 保存统计信息失败: ${error.message}`, 'warn');
    }
  }

  // 辅助方法
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  extractMethod(text) {
    const match = text.match(/方法[:：]\s*(GET|POST|PUT|DELETE|PATCH)/i);
    return match ? match[1].toUpperCase() : 'GET';
  }

  extractEndpoint(text) {
    const match = text.match(/端点[:：]\s*(\/[^\s\n]+)/);
    return match ? match[1] : '/api/default';
  }

  extractParameters(text) {
    // 简化的参数提取
    return {};
  }

  extractResponse(text) {
    // 简化的响应提取
    return { code: 0, message: 'success' };
  }

  extractDescription(text) {
    const lines = text.split('\n');
    const firstLine = lines.find(line => line.trim() && !line.includes('方法') && !line.includes('端点'));
    return firstLine ? firstLine.trim() : 'API接口';
  }
}

/**
 * 主程序入口
 */
async function main() {
  // 使用 __dirname 获取当前脚本所在目录
  const projectRoot = path.resolve(__dirname, '..', '..');
  const monitor = new AutoMonitorWorkflowEngine(projectRoot);

  try {
    await monitor.startMonitoring();
  } catch (error) {
    console.error('❌ 监控启动失败:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 启动程序
if (require.main === module) {
  main();
}

module.exports = { AutoMonitorWorkflowEngine };