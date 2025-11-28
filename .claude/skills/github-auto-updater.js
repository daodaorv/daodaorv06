#!/usr/bin/env node

/**
 * 叨叨房车GitHub自动提交更新工具
 * 自动检测代码变更并提交推送到GitHub仓库
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * GitHub自动提交更新引擎
 */
class GitHubAutoUpdater {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.backendPath = path.join(projectRoot, 'backend');
    this.isRepoClean = true;
    this.stats = {
      startTime: new Date(),
      totalCommits: 0,
      totalPushes: 0,
      totalFilesChanged: 0,
      errors: 0
    };

    // 创建日志目录
    this.logDir = path.join(projectRoot, '.claude', 'logs');
    this.ensureDirectory(this.logDir);
    this.logFile = path.join(this.logDir, `github-updater-${new Date().toISOString().split('T')[0]}.log`);
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
   * 日志记录
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'error':
        console.log('\x1b[31m%s\x1b[0m', logMessage);
        break;
      case 'warn':
        console.log('\x1b[33m%s\x1b[0m', logMessage);
        break;
      case 'success':
        console.log('\x1b[32m%s\x1b[0m', logMessage);
        break;
      default:
        console.log('\x1b[35m%s\x1b[0m', logMessage); // 紫色
    }

    try {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    } catch (error) {
      console.error('写入日志文件失败:', error.message);
    }
  }

  /**
   * 检查Git仓库状态
   */
  async checkGitStatus() {
    try {
      // 检查是否为Git仓库
      if (!fs.existsSync(path.join(this.projectRoot, '.git'))) {
        this.log('❌ 当前目录不是Git仓库', 'error');
        return false;
      }

      // 检查是否有未提交的变更
      const status = this.executeCommand('git status --porcelain', this.projectRoot);
      this.isRepoClean = !status.trim();

      if (this.isRepoClean) {
        this.log('✅ Git仓库是干净的，无需提交');
        return false;
      } else {
        this.log('🔍 检测到代码变更，准备提交...');
        return true;
      }

    } catch (error) {
      this.log(`❌ 检查Git状态失败: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * 获取变更文件列表
   */
  async getChangedFiles() {
    try {
      const status = this.executeCommand('git status --porcelain', this.projectRoot);
      const changedFiles = [];

      status.split('\n').forEach(line => {
        if (line.trim()) {
          const statusChar = line[0];
          const filePath = line.slice(3);

          if (filePath.startsWith('backend/')) {
            changedFiles.push({
              path: filePath,
              status: this.getStatusDescription(statusChar),
              type: this.getChangeType(statusChar)
            });
          }
        }
      });

      this.stats.totalFilesChanged += changedFiles.length;
      return changedFiles;

    } catch (error) {
      this.log(`❌ 获取变更文件失败: ${error.message}`, 'error');
      return [];
    }
  }

  /**
   * 生成提交信息
   */
  generateCommitMessage(changedFiles) {
    const now = new Date().toISOString().split('T')[0];
    const fileCount = changedFiles.length;

    // 分析变更类型
    const newAPIs = changedFiles.filter(f => f.path.includes('.routes.ts')).length;
    const controllers = changedFiles.filter(f => f.path.includes('.controller.ts')).length;
    const services = changedFiles.filter(f => f.path.includes('.service.ts')).length;

    let message = `feat: 自动生成后端API代码 (${now})\n\n`;

    if (newAPIs > 0) {
      message += `- 新增 ${newAPIs} 个API路由文件\n`;
    }
    if (controllers > 0) {
      message += `- 新增 ${controllers} 个控制器文件\n`;
    }
    if (services > 0) {
      message += `- 新增 ${services} 个服务文件\n`;
    }

    message += `\n🤖 由后端自动监控工具生成\n`;
    message += `📁 共变更 ${fileCount} 个文件`;

    return message;
  }

  /**
   * 执行Git提交
   */
  async gitCommit(changedFiles) {
    try {
      this.log('📝 开始执行Git提交...');

      // 1. 添加变更文件
      this.log('📋 添加变更文件到暂存区...');
      const backendFiles = changedFiles.map(f => f.path).filter(file => {
        const fullPath = path.join(this.projectRoot, file);
        const exists = fs.existsSync(fullPath);
        if (!exists) {
          this.log(`⚠️ 跳过已删除文件: ${file}`, 'warn');
        }
        return exists;
      });

      if (backendFiles.length === 0) {
        this.log('⚠️ 没有有效文件可添加，跳过提交', 'warn');
        return false;
      }

      const filesToAdd = backendFiles.join(' ');
      this.executeCommand(`git add ${filesToAdd}`, this.projectRoot);

      // 2. 检查暂存状态（使用基本命令）
      const diffCache = this.executeCommand('git diff --cached --name-only', this.projectRoot);
      if (!diffCache.trim()) {
        this.log('⚠️ 没有文件被暂存，跳过提交', 'warn');
        return false;
      }

      // 3. 生成并执行提交
      const commitMessage = this.generateCommitMessage(changedFiles);
      this.log('💾 执行Git提交...');
      this.executeCommand('git commit -m "' + commitMessage.replace(/"/g, '\\"') + '"', this.projectRoot);

      this.stats.totalCommits++;
      this.log(`✅ Git提交成功 (提交 #${this.stats.totalCommits})`, 'success');
      return true;

    } catch (error) {
      this.log(`❌ Git提交失败: ${error.message}`, 'error');
      this.stats.errors++;
      return false;
    }
  }

  /**
   * 推送到远程仓库
   */
  async gitPush() {
    try {
      this.log('🚀 推送到GitHub远程仓库...');

      // 检查是否有远程仓库
      const remotes = this.executeCommand('git remote', this.projectRoot);
      if (!remotes.trim()) {
        this.log('⚠️ 没有配置远程仓库，跳过推送', 'warn');
        return false;
      }

      // 获取当前分支
      const currentBranch = this.executeCommand('git branch --show-current', this.projectRoot).trim();

      // 推送到远程
      this.executeCommand(`git push origin ${currentBranch}`, this.projectRoot);

      this.stats.totalPushes++;
      this.log(`🎉 成功推送到GitHub (推送 #${this.stats.totalPushes})`, 'success');
      return true;

    } catch (error) {
      this.log(`❌ 推送到GitHub失败: ${error.message}`, 'error');
      this.stats.errors++;

      // 检查是否是网络问题
      if (error.message.includes('network') || error.message.includes('connection')) {
        this.log('💡 可能是网络连接问题，请稍后重试', 'warn');
      }

      return false;
    }
  }

  /**
   * 完整的更新流程
   */
  async updateGitHub() {
    try {
      this.log('🔄 开始GitHub自动更新流程...');

      // 1. 检查是否有变更
      const hasChanges = await this.checkGitStatus();
      if (!hasChanges) {
        return {
          success: true,
          message: '没有变更需要提交',
          action: 'none'
        };
      }

      // 2. 获取变更文件列表
      const changedFiles = await this.getChangedFiles();
      if (changedFiles.length === 0) {
        return {
          success: true,
          message: '没有后端文件变更',
          action: 'none'
        };
      }

      this.log(`📁 检测到 ${changedFiles.length} 个后端文件变更`);

      // 3. 显示变更详情
      changedFiles.forEach(file => {
        this.log(`   ${file.status} ${file.path}`);
      });

      // 4. 执行Git提交
      const commitSuccess = await this.gitCommit(changedFiles);
      if (!commitSuccess) {
        return {
          success: false,
          message: 'Git提交失败',
          action: 'commit_failed'
        };
      }

      // 5. 推送到GitHub
      const pushSuccess = await this.gitPush();
      if (!pushSuccess) {
        return {
          success: false,
          message: '推送失败（提交已完成）',
          action: 'push_failed'
        };
      }

      // 6. 保存统计信息
      this.saveStats();

      return {
        success: true,
        message: 'GitHub更新完成',
        action: 'completed',
        stats: {
          filesChanged: changedFiles.length,
          commits: this.stats.totalCommits,
          pushes: this.stats.totalPushes
        }
      };

    } catch (error) {
      this.log(`❌ GitHub更新失败: ${error.message}`, 'error');
      this.stats.errors++;

      return {
        success: false,
        message: error.message,
        action: 'error'
      };
    }
  }

  /**
   * 保存统计信息
   */
  saveStats() {
    const statsFile = path.join(this.logDir, `github-stats-${new Date().toISOString().split('T')[0]}.json`);

    try {
      fs.writeFileSync(statsFile, JSON.stringify({
        ...this.stats,
        endTime: new Date(),
        runtime: Date.now() - this.stats.startTime.getTime()
      }, null, 2));

      this.log(`📊 GitHub统计信息已保存: ${statsFile}`);
    } catch (error) {
      this.log(`⚠️ 保存GitHub统计信息失败: ${error.message}`, 'warn');
    }
  }

  /**
   * 执行命令
   */
  executeCommand(command, cwd = this.projectRoot) {
    try {
      const result = execSync(command, {
        cwd: cwd,
        encoding: 'utf8',
        stdio: 'pipe' // 静默执行
      });
      return result;
    } catch (error) {
      throw new Error(`命令执行失败: ${command} - ${error.message}`);
    }
  }

  // 辅助方法
  getStatusDescription(statusChar) {
    const statusMap = {
      'A': '新增',
      'M': '修改',
      'D': '删除',
      'R': '重命名',
      'C': '复制',
      '??': '未跟踪'
    };
    return statusMap[statusChar] || '未知';
  }

  getChangeType(statusChar) {
    const typeMap = {
      'A': 'added',
      'M': 'modified',
      'D': 'deleted',
      'R': 'renamed',
      'C': 'copied',
      '??': 'untracked'
    };
    return typeMap[statusChar] || 'unknown';
  }
}

/**
 * 主程序入口
 */
async function main() {
  const projectRoot = path.resolve(__dirname, '..', '..');
  const updater = new GitHubAutoUpdater(projectRoot);

  try {
    console.log('\n🚀 启动叨叨房车GitHub自动更新工具');
    console.log('='.repeat(50));

    const result = await updater.updateGitHub();

    console.log('\n' + '='.repeat(50));
    if (result.success) {
      console.log('✅ GitHub更新完成:', result.message);
    } else {
      console.log('❌ GitHub更新失败:', result.message);
    }
    console.log('='.repeat(50));

    // 显示统计信息
    if (result.stats) {
      console.log(`📊 本次更新: ${result.stats.filesChanged} 个文件`);
      console.log(`📈 总计统计: ${updater.stats.totalCommits} 次提交, ${updater.stats.totalPushes} 次推送`);
    }

  } catch (error) {
    console.error('❌ 工具执行失败:', error);
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

module.exports = { GitHubAutoUpdater };