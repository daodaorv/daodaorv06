/**
 * HTML 内容安全处理工具
 * 防止 XSS 攻击
 */

/**
 * 允许的 HTML 标签白名单
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'img', 'a'
];

/**
 * 允许的属性白名单
 */
const ALLOWED_ATTRS: Record<string, string[]> = {
  'img': ['src', 'alt', 'width', 'height'],
  'a': ['href', 'title'],
  '*': ['class', 'style']
};

/**
 * 危险的属性模式
 */
const DANGEROUS_ATTR_PATTERNS = [
  /^on/i,           // onclick, onload 等事件
  /javascript:/i,   // javascript: 协议
  /data:/i,         // data: 协议
  /vbscript:/i      // vbscript: 协议
];

/**
 * 简单的 HTML 标签清理
 * 移除不在白名单中的标签和属性
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // 移除 script 标签及其内容
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 移除 style 标签及其内容
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 移除危险的事件处理器
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // 移除 javascript: 和 data: 协议
  cleaned = cleaned.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  cleaned = cleaned.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""');

  return cleaned;
}

/**
 * 转义 HTML 特殊字符
 */
export function escapeHtml(text: string): string {
  if (!text) return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * 检查 URL 是否安全
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return false;

  const trimmed = url.trim().toLowerCase();

  // 允许的协议
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

  // 检查是否以安全协议开头
  const hasProtocol = safeProtocols.some(protocol => trimmed.startsWith(protocol));

  // 相对路径也是安全的
  const isRelative = trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../');

  // 检查危险协议
  const hasDangerousProtocol = ['javascript:', 'data:', 'vbscript:'].some(
    protocol => trimmed.startsWith(protocol)
  );

  return (hasProtocol || isRelative) && !hasDangerousProtocol;
}
