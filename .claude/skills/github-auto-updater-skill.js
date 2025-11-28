/**
 * GitHub自动提交更新工具 - Claude技能配置
 */

module.exports = {
  name: 'github-auto-updater',
  description: '叨叨房车GitHub自动提交更新工具 - 自动检测代码变更并提交推送到GitHub',
  version: '1.0.0',
  category: 'git-automation',

  // 工具参数
  parameters: {
    autoCommit: {
      type: 'boolean',
      description: '是否自动提交代码变更',
      default: true
    },
    autoPush: {
      type: 'boolean',
      description: '是否自动推送到远程仓库',
      default: true
    },
    commitMessage: {
      type: 'string',
      description: '自定义提交信息模板',
      default: '自动生成后端API代码'
    }
  },

  // 工具执行入口
  async execute(params = {}) {
    const { GitHubAutoUpdater } = require('./github-auto-updater.js');

    try {
      // 创建更新器实例
      const projectRoot = require('path').resolve(__dirname, '..', '..');
      const updater = new GitHubAutoUpdater(projectRoot);

      // 显示启动信息
      console.log('\n🚀 叨叨房车GitHub自动更新工具');
      console.log('='.repeat(50));
      console.log(`📁 项目目录: ${projectRoot}`);
      console.log(`🔧 自动提交: ${params.autoCommit ? '启用' : '禁用'}`);
      console.log(`🚀 自动推送: ${params.autoPush ? '启用' : '禁用'}`);
      console.log('='.repeat(50));

      // 执行更新
      const result = await updater.updateGitHub();

      if (result.success) {
        console.log('\n✅ GitHub更新完成!');
        if (result.stats) {
          console.log(`📊 本次更新: ${result.stats.filesChanged} 个文件`);
          console.log(`📈 总计: ${result.stats.commits} 次提交, ${result.stats.pushes} 次推送`);
        }
        return {
          success: true,
          message: '✅ GitHub更新成功完成',
          result: result
        };
      } else {
        console.log('\n❌ GitHub更新失败:', result.message);
        return {
          success: false,
          message: `❌ GitHub更新失败: ${result.message}`,
          result: result
        };
      }

    } catch (error) {
      return {
        success: false,
        message: `❌ 工具执行失败: ${error.message}`,
        error: error.stack
      };
    }
  },

  // 工具帮助信息
  help: {
    description: '这个工具会自动检测代码变更，生成提交信息并推送到GitHub远程仓库。',

    usage: [
      '使用默认配置:',
      '  /github-auto-updater',
      '',
      '自定义配置:',
      '  /github-auto-updater autoCommit=true autoPush=true',
      '',
      '或者直接运行:',
      '  node .claude/skills/github-auto-updater.js'
    ],

    features: [
      '🔍 智能检测代码变更',
      '📝 自动生成提交信息',
      '🚀 自动推送到GitHub',
      '📊 完整的统计信息',
      '📋 详细的日志记录',
      '⚡ 快速批量处理',
      '🛡️ 错误处理和恢复',
      '🔧 灵活的配置选项'
    ],

    requirements: [
      'Git仓库初始化',
      '远程仓库配置',
      'Git命令行工具',
      '网络连接权限'
    ],

    commitMessages: [
      'feat: 自动生成后端API代码 (YYYY-MM-DD)',
      '新增 {count} 个API路由文件',
      '新增 {count} 个控制器文件',
      '新增 {count} 个服务文件',
      '🤖 由后端自动监控工具生成'
    ]
  }
};