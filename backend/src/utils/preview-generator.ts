import { PageConfiguration, BaseComponent, KingKongConfig } from '../types/diy.types';

/**
 * 生成页面预览HTML
 */
export function generatePreviewHtml(config: PageConfiguration): string {
  const {
    pageSettings,
    diyAreas,
    kingKongConfig,
    promotions
  } = config;

  let html = '<!DOCTYPE html><html lang="zh-CN"><head>';
  html += '<meta charset="UTF-8">';
  html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
  html += `<title>${pageSettings.navigationBar.title}</title>`;
  html += '<style>';
  html += generatePreviewStyles();
  html += '</style>';
  html += '</head><body>';

  // 生成页面内容
  html += '<div class="preview-container">';
  html += generatePageHeader(pageSettings);
  html += generateKingKongArea(kingKongConfig);
  html += generateDiyAreas(diyAreas);
  html += generatePromotionAreas(promotions);
  html += '</div>';

  html += '</body></html>';

  return html;
}

/**
 * 生成预览样式
 */
function generatePreviewStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
    }

    .preview-container {
      max-width: 375px;
      margin: 0 auto;
      background-color: white;
      min-height: 100vh;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }

    .page-header {
      background-color: #FF9F29;
      color: white;
      padding: 12px 16px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
    }

    .kingkong-section {
      padding: 16px;
      background-color: #fff;
      margin-bottom: 8px;
    }

    .kingkong-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 16px;
      text-align: center;
      color: #333;
    }

    .kingkong-grid {
      display: grid;
      gap: 16px;
      margin-bottom: 8px;
    }

    .kingkong-grid.columns-2 { grid-template-columns: repeat(2, 1fr); }
    .kingkong-grid.columns-3 { grid-template-columns: repeat(3, 1fr); }
    .kingkong-grid.columns-4 { grid-template-columns: repeat(4, 1fr); }
    .kingkong-grid.columns-5 { grid-template-columns: repeat(5, 1fr); }

    .kingkong-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px 8px;
      border-radius: 8px;
      transition: background-color 0.2s;
      cursor: pointer;
    }

    .kingkong-item:hover {
      background-color: #f8f9fa;
    }

    .kingkong-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FF9F29 0%, #FFB833 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
    }

    .kingkong-title-text {
      font-size: 12px;
      color: #333;
      text-align: center;
    }

    .diy-area {
      margin: 8px 0;
      padding: 16px;
      background-color: #fff;
    }

    .component {
      margin-bottom: 12px;
    }

    .component-text {
      padding: 8px 12px;
      border: 1px dashed #ccc;
      border-radius: 4px;
      background-color: #f9f9f9;
    }

    .component-image {
      max-width: 100%;
      height: 200px;
      background-color: #f0f0f0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 14px;
    }

    .component-button {
      padding: 12px 24px;
      background-color: #FF9F29;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      text-align: center;
    }

    .promotion-area {
      margin: 8px 0;
      padding: 16px;
    }

    .banner-carousel {
      width: 100%;
      height: 200px;
      background: linear-gradient(135deg, #FF9F29 0%, #FFB833 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: bold;
    }

    @media (max-width: 480px) {
      .preview-container {
        max-width: 100%;
        box-shadow: none;
      }
    }
  `;
}

/**
 * 生成页面头部
 */
function generatePageHeader(pageSettings: any): string {
  if (!pageSettings.navigationBar.showTitle) {
    return '';
  }

  return `<div class="page-header" style="background-color: ${pageSettings.navigationBar.backgroundColor}; color: ${pageSettings.navigationBar.textColor};">
    ${pageSettings.navigationBar.title}
  </div>`;
}

/**
 * 生成金刚区
 */
function generateKingKongArea(config?: KingKongConfig): string {
  if (!config || !config.items || config.items.length === 0) {
    return '';
  }

  let html = '<div class="kingkong-section">';

  if (config.showHeader && config.title) {
    html += `<div class="kingkong-title">${config.title}</div>`;
  }

  html += `<div class="kingkong-grid columns-${config.columns}">`;

  config.items.forEach(item => {
    html += '<div class="kingkong-item">';
    html += `<div class="kingkong-icon" style="width: ${config.iconSize}px; height: ${config.iconSize}px; background-color: ${item.iconColor};">`;
    html += item.iconType ? item.iconType[0].toUpperCase() : 'I'; // 简单显示图标类型首字母
    html += '</div>';
    html += `<div class="kingkong-title-text">${item.title}</div>`;
    html += '</div>';
  });

  html += '</div>';
  html += '</div>';

  return html;
}

/**
 * 生成DIY区域
 */
function generateDiyAreas(diyAreas: { [key: string]: any }): string {
  if (!diyAreas || Object.keys(diyAreas).length === 0) {
    return '';
  }

  let html = '';

  for (const [areaId, area] of Object.entries(diyAreas)) {
    html += `<div class="diy-area" data-area="${areaId}">`;

    if (area.components && Array.isArray(area.components)) {
      area.components.forEach((component: BaseComponent) => {
        html += generateComponent(component);
      });
    }

    html += '</div>';
  }

  return html;
}

/**
 * 生成组件
 */
function generateComponent(component: BaseComponent): string {
  const styles = generateComponentStyles(component.styles);

  switch (component.type) {
    case 'text':
      return `<div class="component component-text" style="${styles}">${component.props.content || '文本内容'}</div>`;

    case 'image':
      return `<div class="component component-image" style="${styles}">
        ${component.props.src ? `<img src="${component.props.src}" alt="${component.props.alt || ''}" style="max-width: 100%; height: auto;" />` : '图片'}
      </div>`;

    case 'button':
      return `<button class="component component-button" style="${styles}">${component.props.text || '按钮'}</button>`;

    case 'banner':
      return `<div class="component banner-carousel" style="${styles}">
        ${component.props.images?.[0]?.title || '轮播图'}
      </div>`;

    case 'productCard':
      return `<div class="component component-product-card" style="${styles}">
        <div style="padding: 12px; border: 1px solid #eee; border-radius: 8px;">
          <div style="font-weight: bold; margin-bottom: 8px;">${component.props.name || '商品名称'}</div>
          <div style="color: #FF9F29; font-size: 16px; font-weight: bold;">¥${component.props.price || '0'}</div>
        </div>
      </div>`;

    default:
      return `<div class="component" style="${styles}">[${component.type} 组件]</div>`;
  }
}

/**
 * 生成组件样式
 */
function generateComponentStyles(styles: any): string {
  if (!styles || typeof styles !== 'object') {
    return '';
  }

  const styleRules: string[] = [];

  for (const [property, value] of Object.entries(styles)) {
    if (value !== null && value !== undefined) {
      // 转换驼峰命名为CSS属性名
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      styleRules.push(`${cssProperty}: ${value}`);
    }
  }

  return styleRules.join('; ');
}

/**
 * 生成推广区域
 */
function generatePromotionAreas(promotions: { [key: string]: any }): string {
  if (!promotions || Object.keys(promotions).length === 0) {
    return '';
  }

  let html = '';

  for (const [position, promotion] of Object.entries(promotions)) {
    if (promotion.enabled) {
      html += `<div class="promotion-area" data-position="${position}">`;
      html += generatePromotionComponent(promotion.type, promotion.config);
      html += '</div>';
    }
  }

  return html;
}

/**
 * 生成推广组件
 */
function generatePromotionComponent(type: string, config: any): string {
  switch (type) {
    case 'banner':
      return '<div class="banner-carousel">推广轮播图</div>';

    case 'coupon':
      return '<div style="padding: 16px; background: linear-gradient(135deg, #FF9F29 0%, #FFB833 100%); color: white; border-radius: 8px; text-align: center;">优惠券推广</div>';

    case 'product':
      return '<div style="padding: 16px; background: #f8f9fa; border-radius: 8px;">商品推广</div>';

    default:
      return `<div style="padding: 16px; background: #e9ecef; border-radius: 8px; text-align: center;">[${type} 推广]</div>`;
  }
}