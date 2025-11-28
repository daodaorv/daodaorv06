/**
 * 技术文档查询相关类型定义
 */
export interface TechStackManifest {
  [framework: string]: {
    name: string;
    version: string;
    docUrls: {
      official: string;
      api: string;
      examples?: string;
      migration?: string;
    };
    criticalTopics: string[];
    lastUpdated: string;
  };
}

export interface QuickReference {
  commonPitfalls: string[];
  breakingChanges: string[];
  bestPractices: string[];
}

export interface DocResult {
  framework: string;
  topic: string;
  guidelines: string[];
  examples: string[];
  pitfalls: string[];
  bestPractices: string[];
  lastUpdated: Date;
  sourceUrl: string;
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
  violations: CodeViolation[];
}

export interface CodeViolation {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rule: string;
}

export interface DocumentationCache {
  topic: string;
  content: DocResult;
  timestamp: Date;
  expiresAt: Date;
}

export interface QueryContext {
  framework: string;
  component?: string;
  usage?: 'development' | 'troubleshooting' | 'learning';
  platform?: 'web' | 'mobile' | 'miniprogram';
}