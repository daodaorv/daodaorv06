import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 文件工具类
 */
export class FileUtils {
  /**
   * 读取文件内容
   */
  static async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`读取文件失败: ${filePath} - ${error}`);
    }
  }

  /**
   * 写入文件内容
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`写入文件失败: ${filePath} - ${error}`);
    }
  }

  /**
   * 检查文件是否存在
   */
  static async exists(filePath: string): Promise<boolean> {
    return await fs.pathExists(filePath);
  }

  /**
   * 获取文件列表
   */
  static async getFileList(dir: string, pattern: string = '**/*'): Promise<string[]> {
    const glob = require('glob');
    return new Promise((resolve, reject) => {
      glob(pattern, { cwd: dir }, (err: any, files: string[]) => {
        if (err) reject(err);
        else resolve(files);
      });
    });
  }
}

/**
 * 系统工具类
 */
export class SystemUtils {
  /**
   * 执行命令
   */
  static async execCommand(command: string, cwd?: string): Promise<{ stdout: string; stderr: string }> {
    try {
      const options = cwd ? { cwd } : {};
      return await execAsync(command, options);
    } catch (error) {
      throw new Error(`命令执行失败: ${command} - ${error}`);
    }
  }

  /**
   * 获取当前Node版本
   */
  static async getNodeVersion(): Promise<string> {
    try {
      const { stdout } = await execAsync('node --version');
      return stdout.trim();
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * 获取当前工作目录
   */
  static getCurrentWorkingDirectory(): string {
    return process.cwd();
  }

  /**
   * 获取系统信息
   */
  static getSystemInfo(): {
    platform: string;
    arch: string;
    nodeVersion: string;
  } {
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version
    };
  }
}

/**
 * Git工具类
 */
export class GitUtils {
  /**
   * 获取Git状态
   */
  static async getGitStatus(cwd?: string): Promise<string> {
    try {
      const options = cwd ? { cwd } : {};
      const { stdout } = await execAsync('git status --porcelain', options);
      return stdout.trim();
    } catch (error) {
      return 'not_a_git_repo';
    }
  }

  /**
   * 获取当前分支
   */
  static async getCurrentBranch(cwd?: string): Promise<string> {
    try {
      const options = cwd ? { cwd } : {};
      const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD', options);
      return stdout.trim();
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * 获取已修改的文件列表
   */
  static async getModifiedFiles(cwd?: string): Promise<string[]> {
    try {
      const options = cwd ? { cwd } : {};
      const { stdout } = await execAsync('git diff --name-only', options);
      return stdout.trim() ? stdout.trim().split('\n') : [];
    } catch (error) {
      return [];
    }
  }
}

/**
 * 依赖工具类
 */
export class DependencyUtils {
  /**
   * 获取package.json中的依赖
   */
  static async getDependencies(packageJsonPath: string): Promise<Record<string, string>> {
    try {
      const packageJson = await fs.readJson(packageJsonPath);
      return {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };
    } catch (error) {
      throw new Error(`读取package.json失败: ${packageJsonPath} - ${error}`);
    }
  }

  /**
   * 检查依赖是否安装
   */
  static async checkDependency(dependency: string): Promise<boolean> {
    try {
      await execAsync(`npm list ${dependency}`);
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * 日志工具类
 */
export class Logger {
  private static logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  static setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.logLevel = level;
  }

  static debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  static info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  static warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  static error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  private static shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }
}