/**
 * 叨叨前端开发工作流工具套件主入口
 */
import { CoreWorkflowEngine } from './core/engine';
import { TechDocumentQuery } from './tech-docs/query';
import { RecoveryModule } from './core/recovery';
import { Logger } from './core/utils';

// 导出所有类
export { CoreWorkflowEngine } from './core/engine';
export { TechDocumentQuery } from './tech-docs/query';
export { RecoveryModule } from './core/recovery';

// 导出类型
export * from './core/types';

/**
 * 工具套件信息
 */
export const SUITE_INFO = {
  name: 'Daodao Frontend Workflow Suite',
  version: '1.0.0',
  description: '叨叨房车前端开发工作流工具套件',
  author: 'Daodao Tech Team',
  supportedProjects: ['admin-console', 'miniprogram', 'mobile-admin']
};

/**
 * 创建工作流引擎
 */
export function createWorkflowEngine(projectRoot?: string): CoreWorkflowEngine {
  Logger.info(`创建叨叨工作流引擎: ${SUITE_INFO.name} v${SUITE_INFO.version}`);
  return new CoreWorkflowEngine(projectRoot);
}

/**
 * 创建技术文档查询器
 */
export function createTechDocQuery(cacheDir?: string): TechDocumentQuery {
  return new TechDocumentQuery(cacheDir);
}

/**
 * 创建恢复模块
 */
export function createRecoveryModule(checkpointDir?: string): RecoveryModule {
  return new RecoveryModule(checkpointDir);
}

/**
 * 默认导出
 */
export default {
  SUITE_INFO,
  createWorkflowEngine,
  createTechDocQuery,
  createRecoveryModule
};