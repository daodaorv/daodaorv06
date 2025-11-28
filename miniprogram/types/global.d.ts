/**
 * uni-app全局类型声明
 */

declare const uni: any;
declare const wx: any;
declare const plus: any;

// 扩展Window接口
interface Window {
    uni: any;
    wx: any;
    plus: any;
}
