import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  WorkflowState,
  Checkpoint,
  EnvironmentSnapshot,
  RecoveryResult,
  IntegrityResult,
  RecoveryAction,
  WorkflowError
} from '../core/types';
import { FileUtils, SystemUtils, GitUtils, Logger } from '../core/utils';

/**
 * 工作流恢复模块
 */
export class RecoveryModule {
  private checkpointDir: string;
  private readonly maxCheckpoints: number = 5;

  constructor(checkpointDir: string = '.claude/checkpoints') {
    this.checkpointDir = checkpointDir;
    this.initializeCheckpointDir();
  }

  /**
   * 初始化检查点目录
   */
  private async initializeCheckpointDir(): Promise<void> {
    try {
      await fs.ensureDir(this.checkpointDir);
    } catch (error) {
      Logger.error('无法创建检查点目录:', error);
    }
  }

  /**
   * 保存检查点
   */
  async saveCheckpoint(state: WorkflowState): Promise<void> {
    try {
      Logger.info('保存工作流检查点...');

      const checkpoint: Checkpoint = {
        id: this.generateCheckpointId(),
        timestamp: new Date(),
        state,
        environment: await this.captureEnvironment(),
        gitStatus: await GitUtils.getGitStatus()
      };

      const checkpointFile = path.join(this.checkpointDir, `${checkpoint.id}.json`);
      await fs.writeJson(checkpointFile, checkpoint, { spaces: 2 });

      // 清理旧检查点
      await this.cleanupOldCheckpoints();

      Logger.info(`检查点已保存: ${checkpoint.id}`);

    } catch (error) {
      Logger.error('保存检查点失败:', error);
      throw new Error(`保存检查点失败: ${error}`);
    }
  }

  /**
   * 恢复工作流
   */
  async recoverWorkflow(): Promise<RecoveryResult> {
    try {
      Logger.info('检查是否有未完成的工作流...');

      const checkpoints = await this.findCheckpoints();

      if (checkpoints.length === 0) {
        Logger.info('未找到检查点');
        return { hasCheckpoint: false };
      }

      Logger.info(`找到 ${checkpoints.length} 个检查点`);

      // 选择最新的检查点
      const latest = checkpoints[0];

      // 验证环境完整性
      const integrityCheck = await this.validateIntegrity(latest);

      if (!integrityCheck.isValid) {
        Logger.warn('环境完整性检查失败:', integrityCheck.issues);
        return {
          hasCheckpoint: true,
          checkpoint: latest,
          integrityIssues: integrityCheck.issues,
          recommendations: integrityCheck.recommendations
        };
      }

      Logger.info('环境完整性检查通过，可以恢复');
      return {
        hasCheckpoint: true,
        checkpoint: latest,
        canRecover: true
      };

    } catch (error) {
      Logger.error('恢复工作流失败:', error);
      return {
        hasCheckpoint: false
      };
    }
  }

  /**
   * 处理中断情况
   */
  async handleInterruption(error: WorkflowError): Promise<RecoveryAction> {
    Logger.info(`处理中断: ${error.type} - ${error.message}`);

    switch (error.type) {
      case 'NETWORK_ERROR':
        return {
          action: 'SWITCH_TO_OFFLINE',
          message: '网络连接中断，已切换到离线模式',
          offlineCapabilities: [
            '代码生成',
            '本地文档查询',
            '状态保存',
            '错误修复'
          ]
        };

      case 'COMPILATION_ERROR':
        return {
          action: 'PAUSE_AND_SUGGEST_FIX',
          message: '代码编译错误，建议修复后继续',
          suggestions: await this.generateFixSuggestions(error)
        };

      case 'DEPENDENCY_ERROR':
        return {
          action: 'RESOLVE_DEPENDENCIES',
          message: '依赖包问题，正在尝试解决...',
          commands: ['npm install', 'npm audit fix', 'npm cache clean --force']
        };

      case 'UNKNOWN_ERROR':
      default:
        return {
          action: 'SAVE_AND_PAUSE',
          message: '遇到未知错误，已保存当前状态'
        };
    }
  }

  /**
   * 查找检查点
   */
  async findCheckpoints(): Promise<Checkpoint[]> {
    try {
      const files = await fs.readdir(this.checkpointDir);
      const checkpointFiles = files.filter(file => file.endsWith('.json'));

      const checkpoints: Checkpoint[] = [];

      for (const file of checkpointFiles) {
        try {
          const filePath = path.join(this.checkpointDir, file);
          const checkpoint = await fs.readJson(filePath) as Checkpoint;
          checkpoints.push(checkpoint);
        } catch (error) {
          Logger.warn(`读取检查点文件失败: ${file}`, error);
        }
      }

      // 按时间戳降序排序
      checkpoints.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return checkpoints;

    } catch (error) {
      Logger.error('查找检查点失败:', error);
      return [];
    }
  }

  /**
   * 获取最新检查点
   */
  async getLatestCheckpoint(): Promise<Checkpoint | null> {
    const checkpoints = await this.findCheckpoints();
    return checkpoints.length > 0 ? checkpoints[0] : null;
  }

  /**
   * 删除检查点
   */
  async deleteCheckpoint(checkpointId: string): Promise<boolean> {
    try {
      const checkpointFile = path.join(this.checkpointDir, `${checkpointId}.json`);
      if (await fs.pathExists(checkpointFile)) {
        await fs.remove(checkpointFile);
        Logger.info(`检查点已删除: ${checkpointId}`);
        return true;
      }
      return false;
    } catch (error) {
      Logger.error(`删除检查点失败: ${checkpointId}`, error);
      return false;
    }
  }

  /**
   * 清理所有检查点
   */
  async clearAllCheckpoints(): Promise<void> {
    try {
      await fs.emptyDir(this.checkpointDir);
      Logger.info('所有检查点已清理');
    } catch (error) {
      Logger.error('清理检查点失败:', error);
    }
  }

  /**
   * 验证环境完整性
   */
  private async validateIntegrity(checkpoint: Checkpoint): Promise<IntegrityResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // 检查文件变更
      const fileChanges = await this.checkFileChanges(checkpoint.state.developmentContext.modifiedFiles);
      if (fileChanges.length > 0) {
        issues.push(`检测到${fileChanges.length}个文件被外部修改`);
        recommendations.push('检查并解决文件冲突后继续');
      }

      // 检查依赖变更
      const depChanges = await this.checkDependencyChanges(checkpoint.environment.dependencies);
      if (depChanges.length > 0) {
        issues.push(`${depChanges.join(', ')} 版本发生变化`);
        recommendations.push('运行 npm install 更新依赖');
      }

      // 检查Git状态
      const currentGitStatus = await GitUtils.getGitStatus();
      if (currentGitStatus !== checkpoint.gitStatus && checkpoint.gitStatus !== 'not_a_git_repo') {
        issues.push('Git工作区状态发生变化');
        recommendations.push('检查Git状态变化是否影响开发');
      }

      // 检查Node版本
      const currentNodeVersion = await SystemUtils.getNodeVersion();
      if (currentNodeVersion !== checkpoint.environment.nodeVersion) {
        issues.push(`Node版本发生变化: ${checkpoint.environment.nodeVersion} -> ${currentNodeVersion}`);
        recommendations.push('确认Node版本兼容性');
      }

      return {
        isValid: issues.length === 0,
        issues,
        recommendations
      };

    } catch (error) {
      Logger.error('环境完整性验证失败:', error);
      return {
        isValid: false,
        issues: ['环境完整性验证失败'],
        recommendations: ['手动检查环境状态']
      };
    }
  }

  /**
   * 捕获环境快照
   */
  private async captureEnvironment(): Promise<EnvironmentSnapshot> {
    return {
      nodeVersion: await SystemUtils.getNodeVersion(),
      platform: process.platform,
      dependencies: await this.getCurrentDependencies(),
      envVars: this.getRelevantEnvVars()
    };
  }

  /**
   * 检查文件变更
   */
  private async checkFileChanges(modifiedFiles: string[]): Promise<string[]> {
    const changedFiles: string[] = [];

    for (const file of modifiedFiles) {
      try {
        // 这里可以添加更复杂的文件变更检测逻辑
        // 简化版本：检查文件是否存在且可读
        if (await FileUtils.exists(file)) {
          // 可以添加文件内容或修改时间的比较
        } else {
          changedFiles.push(`${file} (文件不存在)`);
        }
      } catch (error) {
        changedFiles.push(`${file} (检查失败)`);
      }
    }

    return changedFiles;
  }

  /**
   * 检查依赖变更
   */
  private async checkDependencyChanges(savedDependencies: Record<string, string>): Promise<string[]> {
    try {
      const currentDependencies = await this.getCurrentDependencies();
      const changes: string[] = [];

      for (const [name, version] of Object.entries(savedDependencies)) {
        if (currentDependencies[name] && currentDependencies[name] !== version) {
          changes.push(`${name} (${version} -> ${currentDependencies[name]})`);
        } else if (!currentDependencies[name]) {
          changes.push(`${name} (已移除)`);
        }
      }

      return changes;
    } catch (error) {
      Logger.error('检查依赖变更失败:', error);
      return ['依赖检查失败'];
    }
  }

  /**
   * 获取当前依赖
   */
  private async getCurrentDependencies(): Promise<Record<string, string>> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (await FileUtils.exists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        return {
          ...packageJson.dependencies || {},
          ...packageJson.devDependencies || {}
        };
      }
    } catch (error) {
      Logger.error('获取当前依赖失败:', error);
    }
    return {};
  }

  /**
   * 获取相关环境变量
   */
  private getRelevantEnvVars(): Record<string, string> {
    const relevantVars = [
      'NODE_ENV',
      'VITE_API_BASE_URL',
      'VUE_APP_API_BASE_URL',
      'UNI_PLATFORM'
    ];

    const envVars: Record<string, string> = {};
    for (const varName of relevantVars) {
      if (process.env[varName]) {
        envVars[varName] = process.env[varName]!;
      }
    }

    return envVars;
  }

  /**
   * 生成修复建议
   */
  private async generateFixSuggestions(error: WorkflowError): Promise<string[]> {
    const suggestions: string[] = [];

    if (error.message.includes('TypeScript')) {
      suggestions.push('检查TypeScript类型定义');
      suggestions.push('运行 tsc --noEmit 检查类型错误');
    }

    if (error.message.includes('module') || error.message.includes('import')) {
      suggestions.push('检查模块导入路径');
      suggestions.push('确认依赖包已正确安装');
    }

    if (error.message.includes('component') || error.message.includes('template')) {
      suggestions.push('检查组件注册和使用');
      suggestions.push('验证模板语法');
    }

    // 通用建议
    suggestions.push('查看错误堆栈获取更多细节');
    suggestions.push('检查相关文档和示例');

    return suggestions;
  }

  /**
   * 生成检查点ID
   */
  private generateCheckpointId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uuid = uuidv4().substring(0, 8);
    return `checkpoint-${timestamp}-${uuid}`;
  }

  /**
   * 清理旧检查点
   */
  private async cleanupOldCheckpoints(): Promise<void> {
    try {
      const checkpoints = await this.findCheckpoints();

      if (checkpoints.length > this.maxCheckpoints) {
        // 保留最新的检查点，删除较旧的
        const toDelete = checkpoints.slice(this.maxCheckpoints);

        for (const checkpoint of toDelete) {
          await this.deleteCheckpoint(checkpoint.id);
        }

        Logger.info(`已清理 ${toDelete.length} 个旧检查点`);
      }
    } catch (error) {
      Logger.error('清理旧检查点失败:', error);
    }
  }
}