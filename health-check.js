#!/usr/bin/env node

/**
 * 叨叨房车项目健康检查脚本
 * 检查所有四端项目的依赖、配置和运行状态
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(level, message) {
  const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const prefix = `[${timestamp}]`;

  switch (level) {
    case 'success':
      console.log(`${colors.green}✓${colors.reset} ${prefix} ${message}`);
      break;
    case 'error':
      console.log(`${colors.red}✗${colors.reset} ${prefix} ${message}`);
      break;
    case 'warning':
      console.log(`${colors.yellow}⚠${colors.reset} ${prefix} ${message}`);
      break;
    case 'info':
      console.log(`${colors.blue}ℹ${colors.reset} ${prefix} ${message}`);
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}

function checkDirectoryExists(dirPath, description) {
  if (fs.existsSync(dirPath)) {
    log('success', `${description} 存在: ${dirPath}`);
    return true;
  } else {
    log('error', `${description} 不存在: ${dirPath}`);
    return false;
  }
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log('success', `${description} 存在: ${path.basename(filePath)}`);
    return true;
  } else {
    log('error', `${description} 不存在: ${path.basename(filePath)}`);
    return false;
  }
}

function checkNodeModules(projectPath, projectName) {
  const nodeModulesPath = path.join(projectPath, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    try {
      const files = fs.readdirSync(nodeModulesPath);
      if (files.length > 0) {
        log('success', `${projectName} node_modules 依赖完整 (${files.length} 个包)`);
        return true;
      }
    } catch (error) {
      log('warning', `${projectName} node_modules 目录为空`);
      return false;
    }
  } else {
    log('error', `${projectName} node_modules 依赖缺失`);
    return false;
  }
  return false;
}

function checkPackageJson(projectPath, projectName) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (checkFileExists(packageJsonPath, `${projectName} package.json`)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      log('success', `${projectName} package.json 格式正确 - 版本: ${packageJson.version || '未知'}`);
      return true;
    } catch (error) {
      log('error', `${projectName} package.json 格式错误: ${error.message}`);
      return false;
    }
  }
  return false;
}

function checkPagesConfig(projectPath, projectName) {
  const pagesJsonPath = path.join(projectPath, 'pages.json');
  if (checkFileExists(pagesJsonPath, `${projectName} pages.json`)) {
    try {
      const pagesJson = JSON.parse(fs.readFileSync(pagesJsonPath, 'utf8'));
      log('success', `${projectName} pages.json 格式正确`);

      // 检查tabBar配置一致性
      if (pagesJson.tabBar && pagesJson.tabBar.list) {
        const tabBarPages = pagesJson.tabBar.list;
        const registeredPages = pagesJson.pages.map(p => p.path);

        let tabBarValid = true;
        tabBarPages.forEach((tab, index) => {
          const pagePath = tab.pagePath;
          const vueFilePath = path.join(projectPath, `${pagePath}.vue`);

          // 检查页面是否在pages数组中注册
          if (!registeredPages.includes(pagePath)) {
            log('error', `${projectName} TabBar页面 ${index + 1} 未注册: ${pagePath}`);
            tabBarValid = false;
          }

          // 检查Vue文件是否存在
          if (!fs.existsSync(vueFilePath)) {
            log('error', `${projectName} TabBar页面文件不存在: ${pagePath}.vue`);
            tabBarValid = false;
          }

          // 检查图标文件是否存在（如果有图标配置）
          if (tab.iconPath) {
            const iconFilePath = path.join(projectPath, tab.iconPath);
            if (!fs.existsSync(iconFilePath)) {
              log('warning', `${projectName} TabBar图标不存在: ${tab.iconPath}`);
            }
          }

          if (tab.selectedIconPath) {
            const iconFilePath = path.join(projectPath, tab.selectedIconPath);
            if (!fs.existsSync(iconFilePath)) {
              log('warning', `${projectName} TabBar选中图标不存在: ${tab.selectedIconPath}`);
            }
          }
        });

        if (tabBarValid) {
          log('success', `${projectName} TabBar配置一致 (${tabBarPages.length}个页面)`);
        }

        return tabBarValid;
      }

      return true;
    } catch (error) {
      log('error', `${projectName} pages.json 格式错误: ${error.message}`);
      return false;
    }
  }
  return false;
}

function checkUniAppStyles(projectPath, projectName) {
  // 检查styles目录（仅对uni-app项目）
  const stylesPath = path.join(projectPath, 'styles');
  if (fs.existsSync(stylesPath)) {
    log('success', `${projectName} styles 目录存在`);

    // 检查variables.scss
    const variablesPath = path.join(stylesPath, 'variables.scss');
    if (fs.existsSync(variablesPath)) {
      log('success', `${projectName} variables.scss 文件存在`);
      return true;
    } else {
      log('warning', `${projectName} variables.scss 文件不存在`);
    }
  } else {
    log('info', `${projectName} styles 目录不存在（可选）`);
  }
  return true;
}

function checkManifestJson(projectPath, projectName) {
  const manifestPath = path.join(projectPath, 'manifest.json');
  if (checkFileExists(manifestPath, `${projectName} manifest.json`)) {
    try {
      // uni-app manifest.json 可能包含注释，需要先清理
      let manifestContent = fs.readFileSync(manifestPath, 'utf8');
      // 移除JavaScript风格的注释
      manifestContent = manifestContent.replace(/\/\*[\s\S]*?\*\//g, '');
      manifestContent = manifestContent.replace(/\/\/.*$/gm, '');
      const manifest = JSON.parse(manifestContent);
      log('success', `${projectName} manifest.json 配置正确 - AppID: ${manifest.appid || '未知'}`);
      return true;
    } catch (error) {
      log('warning', `${projectName} manifest.json 包含注释（uni-app格式），这是正常的`);
      // 尝试基本的语法检查
      try {
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        if (manifestContent.includes('"name"') && manifestContent.includes('"appid"')) {
          log('success', `${projectName} manifest.json 基本配置存在`);
          return true;
        }
      } catch (readError) {
        log('error', `${projectName} manifest.json 无法读取`);
      }
      return false;
    }
  }
  return false;
}

function checkDockerServices() {
  log('info', '检查 Docker 服务状态...');
  try {
    const dockerPs = execSync('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"', { encoding: 'utf8' });
    const lines = dockerPs.split('\n');

    let mysqlRunning = false;
    let redisRunning = false;

    lines.forEach(line => {
      if (line.includes('mysql') && line.includes('Up')) {
        mysqlRunning = true;
        log('success', 'MySQL 服务运行正常');
      }
      if (line.includes('redis') && line.includes('Up')) {
        redisRunning = true;
        log('success', 'Redis 服务运行正常');
      }
    });

    if (!mysqlRunning) {
      log('error', 'MySQL 服务未运行');
    }
    if (!redisRunning) {
      log('error', 'Redis 服务未运行');
    }

    return mysqlRunning && redisRunning;
  } catch (error) {
    log('error', `Docker 检查失败: ${error.message}`);
    return false;
  }
}

function checkPortAvailable(port, serviceName) {
  try {
    execSync(`netstat -an | findstr :${port}`, { stdio: 'ignore' });
    log('info', `${serviceName} 端口 ${port} 被占用（服务可能正在运行）`);
    return true;
  } catch (error) {
    log('info', `${serviceName} 端口 ${port} 可用`);
    return false;
  }
}

function runHealthCheck() {
  console.log(`${colors.cyan}
========================================
      叨叨房车项目健康检查
      Health Check Starting...
========================================${colors.reset}
  `);

  let allChecksPass = true;
  const projectRoot = process.cwd();

  // 1. 检查项目结构
  log('info', '检查项目基本结构...');

  const projects = [
    { path: 'backend', name: '后端API服务', hasPackageJson: true, hasManifest: false },
    { path: 'admin-console', name: 'PC管理后台', hasPackageJson: true, hasManifest: false },
    { path: 'miniprogram', name: '微信小程序', hasPackageJson: false, hasManifest: true },
    { path: 'mobile-admin', name: '移动管理端', hasPackageJson: false, hasManifest: true }
  ];

  projects.forEach(project => {
    const projectPath = path.join(projectRoot, project.path);
    log('info', `检查 ${project.name}...`);

    if (!checkDirectoryExists(projectPath, project.name)) {
      allChecksPass = false;
      return;
    }

    if (project.hasPackageJson && !checkPackageJson(projectPath, project.name)) {
      allChecksPass = false;
    }

    if (project.hasManifest && !checkManifestJson(projectPath, project.name)) {
      allChecksPass = false;
    }

    // 检查pages.json配置（仅对uni-app项目）
    if (project.hasManifest && !checkPagesConfig(projectPath, project.name)) {
      allChecksPass = false;
    }

    // 检查uni-app样式文件（仅对uni-app项目）
    if (project.hasManifest && !checkUniAppStyles(projectPath, project.name)) {
      allChecksPass = false;
    }

    // 检查 node_modules（仅对需要的项目）
    if (project.hasPackageJson && !checkNodeModules(projectPath, project.name)) {
      allChecksPass = false;
    }
  });

  // 2. 检查 Docker 服务
  log('info', '检查基础设施服务...');
  if (!checkDockerServices()) {
    allChecksPass = false;
  }

  // 3. 检查端口状态
  log('info', '检查服务端口...');
  checkPortAvailable(3000, 'Backend API');
  checkPortAvailable(5173, 'Admin Console');
  checkPortAvailable(3306, 'MySQL');
  checkPortAvailable(6379, 'Redis');

  // 4. 检查 Git 状态
  log('info', '检查 Git 仓库状态...');
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      log('warning', 'Git 工作目录有未提交的文件');
    } else {
      log('success', 'Git 工作目录干净');
    }
  } catch (error) {
    log('error', 'Git 仓库检查失败');
  }

  // 总结
  console.log(`\n${colors.cyan}========================================
      健康检查完成
      Health Check Complete
========================================${colors.reset}`);

  if (allChecksPass) {
    log('success', '🎉 所有检查通过！项目状态良好。');
    console.log(`\n${colors.green}项目启动命令:${colors.reset}`);
    console.log(`${colors.cyan}Backend API:${colors.reset}     cd backend && npm run dev`);
    console.log(`${colors.cyan}Admin Console:${colors.reset}  cd admin-console && npm run dev`);
    console.log(`${colors.cyan}Miniprogram:${colors.reset}    使用 HBuilderX 打开 miniprogram 目录`);
    console.log(`${colors.cyan}Mobile Admin:${colors.reset}   使用 HBuilderX 打开 mobile-admin 目录`);
  } else {
    log('error', '❌ 发现问题！请查看上述错误信息并修复。');
    console.log(`\n${colors.yellow}建议修复步骤:${colors.reset}`);
    console.log('1. 对有问题的项目运行: npm install');
    console.log('2. 启动 Docker 服务: docker compose up -d mysql redis');
    console.log('3. 检查配置文件是否正确');
  }
}

// 运行检查
if (require.main === module) {
  runHealthCheck();
}

module.exports = { runHealthCheck };