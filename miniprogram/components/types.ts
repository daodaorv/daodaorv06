/**
 * 组件类型定义
 */

// 公告通知类型
export interface Notice {
    id: string;
    content: string;
    link?: string;
    type?: 'info' | 'warning' | 'error';
}

// 空状态类型
export type EmptyStateType = 'default' | 'search' | 'network' | 'error';

// Toast类型
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// 对话框类型
export type DialogType = 'success' | 'error' | 'warn' | 'info';
export type DialogMode = 'base' | 'input';

// 加载状态尺寸
export type LoadingSize = 'small' | 'medium' | 'large';
