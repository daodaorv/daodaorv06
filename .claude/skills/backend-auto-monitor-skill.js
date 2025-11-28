/**
 * 叨叨房车后端自动巡检工作流工具 - Claude技能配置
 */

module.exports = {
  name: 'backend-auto-monitor',
  description: '叨叨房车后端自动巡检工作流工具 - 持续监控前端API变化并自动生成后端代码',
  version: '1.0.0',
  category: 'backend-development',

  // 工具参数
  parameters: {
    interval: {
      type: 'number',
      description: '监控扫描间隔（毫秒）',
      default: 5000
    },
    projects: {
      type: 'array',
      description: '监控的前端项目列表',
      default: ['admin-console', 'miniprogram', 'mobile-admin']
    },
    autoTest: {
      type: 'boolean',
      description: '是否自动运行测试',
      default: true
    },
    dryRun: {
      type: 'boolean',
      description: '试运行模式（只检测不生成代码）',
      default: false
    }
  },

  // 工具执行入口
  async execute(params = {}) {
    const { AutoMonitorWorkflowEngine } = require('./backend-auto-monitor.js');

    try {
      // 创建监控引擎实例
      const projectRoot = require('path').resolve(__dirname, '..', '..');
      const monitor = new AutoMonitorWorkflowEngine(projectRoot);

      // 应用参数配置
      if (params.interval) {
        monitor.scanInterval = params.interval;
      }

      if (params.projects) {
        monitor.frontendProjects = params.projects;
      }

      if (params.dryRun) {
        monitor.dryRun = true;
        monitor.log('🧪 试运行模式已启用 - 仅检测，不生成代码');
      }

      // 显示启动信息
      console.log('\n🎯 叨叨房车后端自动巡检工作流工具');
      console.log('='.repeat(50));
      console.log(`📁 监控目录: ${projectRoot}`);
      console.log(`🔍 ��端项目: ${monitor.frontendProjects.join(', ')}`);
      console.log(`⏰ 扫描间隔: ${monitor.scanInterval / 1000}秒`);
      console.log(`🧪 试运行: ${params.dryRun ? '是' : '否'}`);
      console.log('='.repeat(50));

      // 启动监控
      await monitor.startMonitoring();

      return {
        success: true,
        message: '✅ 后端自动巡检工具已启动'
      };

    } catch (error) {
      return {
        success: false,
        message: `❌ 启动失败: ${error.message}`,
        error: error.stack
      };
    }
  },

  // 工具帮助信息
  help: {
    description: '这个工具会自动监控前端API文档状态，当检测到已开发的API时，自动生成对应的后端代码并运行测试。',

    usage: [
      '使用默认配置启动:',
      '  /backend-auto-monitor',
      '',
      '自定义配置启动:',
      '  /backend-auto-monitor interval=10000 projects=["admin-console","miniprogram"]',
      '',
      '试运行模式:',
      '  /backend-auto-monitor dryRun=true',
      '',
      '或者在CMD中直接运行:',
      '  node .claude/skills/backend-auto-monitor.js',
      '  或双击 start-backend-monitor.bat'
    ],

    features: [
      '🔍 实时监控前端API文档变化',
      '🤖 智能分析API需求和规范',
      '⚙️ 自动生成完整的后端代码',
      '🧪 集成编译和自动化测试',
      '📝 更新API集成状态',
      '📊 实时统计和进度跟踪',
      '📋 完整的日志记录系统',
      '💾 自动保存统计信息'
    ],

    requirements: [
      'Node.js >= 18.18.0',
      '完整的项目目录结构',
      '前端API文档包含 ✅ 标记'
    ]
  }
};