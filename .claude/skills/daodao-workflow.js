/**
 * 叨叨前端开发工作流 - 零依赖版本
 * 仅使用Node.js内置模块，确保在任何环境都能运行
 */

const fs = require('fs');
const path = require('path');

/**
 * 零依赖的工作流引擎
 */
class ZeroDepWorkflowEngine {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * 检查文件是否存在
   */
  fileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }

  /**
   * 读取文件内容
   */
  readFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`读取文件失败: ${filePath} - ${error.message}`);
    }
  }

  /**
   * 写入文件内容
   */
  writeFile(filePath, content) {
    try {
      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!this.fileExists(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`写入文件失败: ${filePath} - ${error.message}`);
    }
  }

  /**
   * 执行5步开发工作流
   */
  async execute5StepWorkflow(targetProject) {
    console.log(`🔄 开始执行 ${targetProject} 的5步开发工作流`);

    try {
      // 步骤1: 阅读实施计划
      const progress = this.step1_readProgress(targetProject);
      console.log('📋 步骤1完成: 读取实施计划');

      // 步骤2: 分析需求文档
      const analysis = this.step2_analyzeRequirements(targetProject);
      console.log('🔍 步骤2完成: 分析需求文档');

      // 步骤3: 实施开发
      const development = this.step3_implementDevelopment(targetProject, analysis);
      console.log('⚙️ 步骤3完成: 实施开发');

      // 步骤4: API集成检查
      const integration = this.step4_integrateAPIs(targetProject);
      console.log('🔌 步骤4完成: API集成检查');

      // 步骤5: 更新进度
      const update = this.step5_updateProgress(targetProject);
      console.log('📊 步骤5完成: 更新进度');

      return {
        success: true,
        message: '工作流执行完成',
        results: { progress, analysis, development, integration, update }
      };

    } catch (error) {
      console.error('❌ 工作流执行失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 步骤1: 阅读实施计划
   */
  step1_readProgress(targetProject) {
    const planPath = path.join(this.projectRoot, targetProject, 'docs', '实施计划.md');

    if (!this.fileExists(planPath)) {
      throw new Error(`实施计划文件不存在: ${planPath}`);
    }

    const planContent = this.readFile(planPath);
    const completedTasks = (planContent.match(/- \[x\]/g) || []).length;
    const totalTasks = (planContent.match(/- \[ \]/g) || []).length + completedTasks;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      currentPhase: this.extractCurrentPhase(planContent),
      completedTasks,
      totalTasks,
      progressPercentage,
      nextTask: this.extractNextTask(planContent)
    };
  }

  /**
   * 步骤2: 分析需求文档
   */
  step2_analyzeRequirements(targetProject) {
    const reqDocPath = path.join(this.projectRoot, targetProject, 'docs', '产品需求文档.md');
    const techDocPath = path.join(this.projectRoot, targetProject, 'docs', '技术栈文档.md');

    const requirements = this.readFile(reqDocPath);
    const techStack = this.readFile(techDocPath);

    return {
      features: this.extractFeatures(requirements),
      techStack: this.extractTechStack(techStack),
      uiGuidelines: this.extractUIGuidelines(requirements)
    };
  }

  /**
   * 步骤3: 实施开发
   */
  step3_implementDevelopment(targetProject, analysis) {
    console.log('🛠️ 开始实施开发...');

    // 根据项目类型生成示例代码
    const generatedCode = this.generateSampleCode(targetProject);

    // 创建示例组件文件
    const componentPath = path.join(this.projectRoot, targetProject, 'src', 'components');
    const sampleFile = path.join(componentPath, 'SampleComponent.vue');

    this.writeFile(sampleFile, generatedCode);

    return {
      filesCreated: [sampleFile],
      codeGenerated: generatedCode,
      message: '示例组件已生成'
    };
  }

  /**
   * 步骤4: API集成检查
   */
  step4_integrateAPIs(targetProject) {
    const apiDocPath = path.join(this.projectRoot, targetProject, 'docs', 'API文档.md');

    if (!this.fileExists(apiDocPath)) {
      return {
        message: 'API文档不存在，跳过API集成检查',
        status: 'skipped'
      };
    }

    const apiDoc = this.readFile(apiDocPath);
    const apiCount = (apiDoc.match(/###/g) || []).length;
    const completedAPIs = (apiDoc.match(/✅/g) || []).length;

    return {
      totalAPIs: apiCount,
      completedAPIs,
      pendingAPIs: apiCount - completedAPIs,
      message: `API检查完成: ${completedAPIs}/${apiCount} 已完成`
    };
  }

  /**
   * 步骤5: 更新进度
   */
  step5_updateProgress(targetProject) {
    const planPath = path.join(this.projectRoot, targetProject, 'docs', '实施计划.md');
    const timestamp = new Date().toISOString().split('T')[0];
    const updateNote = `\n\n<!-- 自动更新: ${timestamp} - 工作流执行完成 -->`;

    fs.appendFileSync(planPath, updateNote);

    return {
      updated: true,
      timestamp,
      message: '进度已更新'
    };
  }

  /**
   * 生成示例代码
   */
  generateSampleCode(targetProject) {
    const now = new Date().toLocaleString();

    if (targetProject === 'admin-console') {
      return `<template>
  <div class="sample-component">
    <h2>PC管理端示例组件</h2>
    <p>这是一个自动生成的示例组件</p>
    <p>生成时间: ${now}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const message = ref('Hello, PC Admin!')

onMounted(() => {
  console.log('PC管理端组件已挂载')
})
</script>

<style scoped>
.sample-component {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
</style>`;
    } else if (targetProject === 'miniprogram') {
      return `<template>
  <view class="sample-component">
    <text class="title">小程序示例组件</text>
    <text>这是一个自动生成的示例组件</text>
    <text>生成时间: ${now}</text>
  </view>
</template>

<script setup lang="ts">
import { ref, onLoad } from '@dcloudio/uni-app'

const message = ref('Hello, Mini Program!')

onLoad(() => {
  console.log('小程序组件已加载')
})
</script>

<style scoped>
.sample-component {
  padding: 40rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}
</style>`;
    } else {
      return `<template>
  <div class="sample-component">
    <h3>移动管理端示例组件</h3>
    <p>这是一个自动生成的示例组件</p>
    <p>生成时间: ${now}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const message = ref('Hello, Mobile Admin!')

onMounted(() => {
  console.log('移动管理端组件已挂载')
})
</script>

<style scoped>
.sample-component {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
</style>`;
    }
  }

  // 辅助方法
  extractCurrentPhase(content) {
    const match = content.match(/当前阶段[:：]\s*(.+)/i);
    return match ? match[1].trim() : 'unknown';
  }

  extractNextTask(content) {
    const match = content.match(/下一步[:：]\s*(.+)/i);
    return match ? match[1].trim() : '无明确任务';
  }

  extractFeatures(requirements) {
    const lines = requirements.split('\n');
    return lines.filter(line => line.includes('功能') || line.includes('模块')).slice(0, 5);
  }

  extractTechStack(techStack) {
    return {
      framework: 'Vue 3',
      language: 'TypeScript',
      ui: techStack.includes('Element') ? 'Element Plus' : 'uni-app'
    };
  }

  extractUIGuidelines(requirements) {
    return [
      '遵循统一的设计规范',
      '保持响应式布局',
      '确保良好的用户体验'
    ];
  }
}

module.exports = {
  name: 'daodao-frontend-workflow',
  description: '叨叨房车前端开发工作流工具 - 零依赖版',
  version: '1.0.0-zero-deps',

  async execute(params, context) {
    const workflow = new ZeroDepWorkflowEngine();

    try {
      // 确定目标项目
      const targetProject = params.target || 'admin-console';

      console.log('🚀 启动叨叨前端开发工作流...');
      console.log(`📱 目标项目: ${targetProject}`);

      // 执行工作流
      const result = await workflow.execute5StepWorkflow(targetProject);

      if (result.success) {
        return {
          success: true,
          message: '✅ 前端开发工作流执行成功！',
          result: result.results,
          nextSteps: [
            '📁 检查生成的示例组件文件',
            '🔧 根据需求文档开发具体功能',
            '🧪 运行测试验证功能',
            '📝 更新实施计划进度'
          ]
        };
      } else {
        return {
          success: false,
          message: `❌ 工作流执行失败: ${result.error}`,
          error: result.error,
          suggestions: [
            '检查项目目录结构是否正确',
            '确认docs目录下有必要的文档文件',
            '检查权限设置是否正确'
          ]
        };
      }

    } catch (error) {
      return {
        success: false,
        message: `❌ 工具执行失败: ${error.message}`,
        error: error.stack
      };
    }
  }
};