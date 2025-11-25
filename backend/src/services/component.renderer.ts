/**
 * DIY组件渲染引擎
 * 根据组件配置动态生成渲染代码和预览
 */

import {
  ComponentSchema,
  ComponentSchemas,
  ComponentSchemaType
} from '../types/component.schema';
import {
  BaseComponent,
  ComponentDefinition,
  ComponentStyles
} from '../types/diy.types';

// 组件属性类型定义（用于渲染器内部使用）
interface ComponentProperties {
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  padding?: number | string;
  margin?: number | string;
  width?: number | string;
  height?: number | string;
  backgroundColor?: string;
  backgroundImage?: string;
  borderRadius?: number | string;
  shadow?: {
    offsetX?: number;
    offsetY?: number;
    blur?: number;
    color?: string;
  };
}

// 渲染上下文接口
export interface RenderContext {
  pageId: string;
  isPreview: boolean;
  platform: 'miniprogram' | 'h5' | 'admin';
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
  };
}

// 渲染结果接口
export interface RenderResult {
  html: string;
  css: string;
  js?: string;
  data?: Record<string, any>;
}

/**
 * 组件渲染引擎类
 */
export class ComponentRenderer {
  private context: RenderContext;

  constructor(context: RenderContext) {
    this.context = context;
  }

  /**
   * 渲染单个组件
   */
  renderComponent(component: BaseComponent): RenderResult {
    const schema = this.getComponentSchema(component.type);
    if (!schema) {
      return this.renderErrorComponent(`未知组件类型: ${component.type}`);
    }

    try {
      switch (component.type) {
        case 'text':
          return this.renderTextComponent(component, schema);
        case 'image':
          return this.renderImageComponent(component, schema);
        case 'button':
          return this.renderButtonComponent(component, schema);
        case 'icon':
          return this.renderIconComponent(component, schema);
        case 'banner':
          return this.renderBannerComponent(component, schema);
        case 'productCard':
          return this.renderProductCardComponent(component, schema);
        case 'container':
          return this.renderContainerComponent(component, schema);
        default:
          return this.renderErrorComponent(`未实现的组件类型: ${component.type}`);
      }
    } catch (error) {
      console.error(`渲染组件失败: ${component.type}`, error);
      return this.renderErrorComponent(`渲染失败: ${component.type}`);
    }
  }

  /**
   * 获取组件Schema
   */
  private getComponentSchema(type: string): ComponentSchema | null {
    return ComponentSchemas[type as ComponentSchemaType] || null;
  }

  /**
   * 生成组件CSS样式
   */
  private generateStyles(styles: ComponentProperties, componentId: string): string {
    const cssRules: string[] = [];

    // 基础样式
    if (styles.display) {
      cssRules.push(`display: ${styles.display}`);
    }
    if (styles.width) {
      cssRules.push(`width: ${typeof styles.width === 'number' ? styles.width + 'px' : styles.width}`);
    }
    if (styles.height) {
      cssRules.push(`height: ${typeof styles.height === 'number' ? styles.height + 'px' : styles.height}`);
    }
    if (styles.backgroundColor) {
      cssRules.push(`background-color: ${styles.backgroundColor}`);
    }
    if (styles.borderRadius) {
      cssRules.push(`border-radius: ${typeof styles.borderRadius === 'number' ? styles.borderRadius + 'px' : styles.borderRadius}`);
    }

    // Flexbox样式
    if (styles.flexDirection) {
      cssRules.push(`flex-direction: ${styles.flexDirection}`);
    }
    if (styles.justifyContent) {
      cssRules.push(`justify-content: ${styles.justifyContent}`);
    }
    if (styles.alignItems) {
      cssRules.push(`align-items: ${styles.alignItems}`);
    }

    // 边距样式
    if (styles.padding) {
      cssRules.push(`padding: ${typeof styles.padding === 'number' ? styles.padding + 'px' : styles.padding}`);
    }
    if (styles.margin) {
      cssRules.push(`margin: ${typeof styles.margin === 'number' ? styles.margin + 'px' : styles.margin}`);
    }

    // 阴影样式
    if (styles.shadow) {
      const shadow = styles.shadow;
      cssRules.push(`box-shadow: ${shadow.offsetX || 0}px ${shadow.offsetY || 0}px ${shadow.blur || 0}px ${shadow.color || 'rgba(0,0,0,0.1)'}`);
    }

    return `.component-${componentId} { ${cssRules.join('; ')} }`;
  }

  /**
   * 渲染文本组件
   */
  private renderTextComponent(component: BaseComponent, schema: ComponentSchema): RenderResult {
    const { props, styles, id } = component;
    const componentId = id || `text-${Date.now()}`;

    const textProps = {
      content: props.content || '文本内容',
      fontSize: props.fontSize || 16,
      color: props.color || '#333333',
      fontWeight: props.fontWeight || 'normal',
      textAlign: props.textAlign || 'left',
      lineHeight: props.lineHeight || 1.5
    };

    const html = `
      <div class="component component-text ${componentId}" data-component-type="text" data-component-id="${componentId}">
        <span class="text-content">${textProps.content}</span>
      </div>
    `;

    const css = `
      .${componentId} {
        ${this.generateStyles(styles || {}, componentId)}
      }
      .${componentId} .text-content {
        font-size: ${textProps.fontSize}px;
        color: ${textProps.color};
        font-weight: ${textProps.fontWeight};
        text-align: ${textProps.textAlign};
        line-height: ${textProps.lineHeight};
        word-wrap: break-word;
      }
    `;

    return { html, css };
  }

  /**
   * 渲染图片组件
   */
  private renderImageComponent(component: BaseComponent, schema: ComponentSchema): RenderResult {
    const { props, styles, id } = component;
    const componentId = id || `image-${Date.now()}`;

    const imageProps = {
      src: props.src || '',
      alt: props.alt || '',
      width: props.width || '100%',
      height: props.height || 'auto',
      fit: props.fit || 'cover',
      borderRadius: props.borderRadius || 0
    };

    const html = `
      <div class="component component-image ${componentId}" data-component-type="image" data-component-id="${componentId}">
        <img
          class="image-content"
          src="${imageProps.src}"
          alt="${imageProps.alt}"
          onerror="this.style.display='none'"
          onload="this.style.display='block'"
        />
      </div>
    `;

    const css = `
      .${componentId} {
        ${this.generateStyles(styles || {}, componentId)}
      }
      .${componentId} .image-content {
        width: ${typeof imageProps.width === 'number' ? imageProps.width + 'px' : imageProps.width};
        height: ${typeof imageProps.height === 'number' ? imageProps.height + 'px' : imageProps.height};
        object-fit: ${imageProps.fit};
        border-radius: ${imageProps.borderRadius}px;
        display: block;
      }
    `;

    return { html, css };
  }

  /**
   * 渲染按钮组件
   */
  private renderButtonComponent(component: BaseComponent, schema: ComponentSchema): RenderResult {
    const { props, styles, id } = component;
    const componentId = id || `button-${Date.now()}`;

    const buttonProps = {
      text: props.text || '按钮',
      type: props.type || 'primary',
      size: props.size || 'medium',
      disabled: props.disabled || false,
      loading: props.loading || false
    };

    const html = `
      <button
        class="component component-button ${componentId} button-${buttonProps.type} button-${buttonProps.size}"
        data-component-type="button"
        data-component-id="${componentId}"
        ${buttonProps.disabled ? 'disabled' : ''}
      >
        ${buttonProps.loading ? '<span class="loading-spinner"></span>' : ''}
        <span class="button-text">${buttonProps.text}</span>
      </button>
    `;

    const css = `
      .${componentId} {
        ${this.generateStyles(styles || {}, componentId)}
      }

      /* 按钮基础样式 */
      .${componentId} {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        font-family: inherit;
        text-decoration: none;
        transition: all 0.2s ease;
      }

      .${componentId}:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* 按钮类型样式 */
      .${componentId}.button-primary {
        background-color: ${this.context.theme?.primaryColor || '#FF9F29'};
        color: white;
      }

      .${componentId}.button-secondary {
        background-color: #f0f0f0;
        color: #333333;
      }

      .${componentId}.button-warning {
        background-color: #ff9800;
        color: white;
      }

      .${componentId}.button-danger {
        background-color: #f44336;
        color: white;
      }

      .${componentId}.button-text {
        background-color: transparent;
        color: ${this.context.theme?.primaryColor || '#FF9F29'};
      }

      /* 按钮尺寸样式 */
      .${componentId}.button-small {
        padding: 6px 12px;
        font-size: 12px;
      }

      .${componentId}.button-medium {
        padding: 8px 16px;
        font-size: 14px;
      }

      .${componentId}.button-large {
        padding: 12px 24px;
        font-size: 16px;
      }

      /* 加载动画 */
      .${componentId} .loading-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 6px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    return { html, css };
  }

  /**
   * 渲染图标组件
   */
  private renderIconComponent(component: BaseComponent, schema: ComponentSchema): RenderResult {
    const { props, styles, id } = component;
    const componentId = id || `icon-${Date.now()}`;

    const iconProps = {
      name: props.name || 'heart',
      size: props.size || 24,
      color: props.color || '#666666'
    };

    const html = `
      <div class="component component-icon ${componentId}" data-component-type="icon" data-component-id="${componentId}">
        <i class="icon-${iconProps.name}" style="font-size: ${iconProps.size}px; color: ${iconProps.color};">
          ${this.getIconSvg(iconProps.name)}
        </i>
      </div>
    `;

    const css = `
      .${componentId} {
        ${this.generateStyles(styles || {}, componentId)}
      }
      .${componentId} i {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    `;

    return { html, css };
  }

  /**
   * 渲染轮播图组件
   */
  private renderBannerComponent(component: BaseComponent, schema: ComponentSchema): RenderResult {
    const { props, styles, id } = component;
    const componentId = id || `banner-${Date.now()}`;

    const bannerProps = {
      images: props.images || [],
      height: props.height || 200,
      autoplay: props.autoplay !== false,
      interval: props.interval || 3000,
      showIndicator: props.showIndicator !== false
    };

    const imagesHtml = bannerProps.images.map((img: any, index: number) => `
      <div class="banner-slide ${index === 0 ? 'active' : ''}">
        <img src="${img.src || ''}" alt="${img.title || ''}" />
        ${img.title ? `<div class="banner-title">${img.title}</div>` : ''}
      </div>
    `).join('');

    const indicatorsHtml = bannerProps.showIndicator ? `
      <div class="banner-indicators">
        ${bannerProps.images.map((_: any, index: number) => `
          <span class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></span>
        `).join('')}
      </div>
    ` : '';

    const html = `
      <div class="component component-banner ${componentId}" data-component-type="banner" data-component-id="${componentId}">
        <div class="banner-container">
          ${imagesHtml}
        </div>
        ${indicatorsHtml}
      </div>
    `;

    const css = `
      .${componentId} {
        ${this.generateStyles(styles || {}, componentId)}
      }
      .${componentId} .banner-container {
        position: relative;
        height: ${bannerProps.height}px;
        overflow: hidden;
      }
      .${componentId} .banner-slide {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      .${componentId} .banner-slide.active {
        opacity: 1;
      }
      .${componentId} .banner-slide img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .${componentId} .banner-title {
        position: absolute;
        bottom: 20px;
        left: 20px;
        color: white;
        font-size: 16px;
        font-weight: bold;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      }
      .${componentId} .banner-indicators {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
      }
      .${componentId} .indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: rgba(255,255,255,0.5);
        cursor: pointer;
        transition: background-color 0.3s ease;
      }
      .${componentId} .indicator.active {
        background-color: white;
      }
    `;

    const js = bannerProps.autoplay ? `
      let currentSlide = 0;
      const slides = document.querySelectorAll('.${componentId} .banner-slide');
      const indicators = document.querySelectorAll('.${componentId} .indicator');

      function showSlide(index) {
        slides.forEach((slide, i) => {
          slide.classList.toggle('active', i === index);
        });
        indicators.forEach((indicator, i) => {
          indicator.classList.toggle('active', i === index);
        });
      }

      function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      }

      setInterval(nextSlide, ${bannerProps.interval});

      indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
          currentSlide = index;
          showSlide(currentSlide);
        });
      });
    ` : '';

    return { html, css, js };
  }

  /**
   * 渲染商品卡片组件
   */
  private renderProductCardComponent(component: BaseComponent, schema: ComponentSchema): RenderResult {
    const { props, styles, id } = component;
    const componentId = id || `product-card-${Date.now()}`;

    const productProps = {
      title: props.title || '商品标题',
      price: props.price || 0,
      originalPrice: props.originalPrice,
      image: props.image || '',
      tags: props.tags || [],
      showPrice: props.showPrice !== false,
      showOriginalPrice: props.showOriginalPrice || false
    };

    const priceHtml = productProps.showPrice ? `
      <div class="product-price">
        <span class="current-price">¥${productProps.price}</span>
        ${productProps.showOriginalPrice && productProps.originalPrice ?
          `<span class="original-price">¥${productProps.originalPrice}</span>` : ''
        }
      </div>
    ` : '';

    const tagsHtml = productProps.tags.length > 0 ? `
      <div class="product-tags">
        ${productProps.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
      </div>
    ` : '';

    const html = `
      <div class="component component-product-card ${componentId}" data-component-type="productCard" data-component-id="${componentId}">
        <div class="product-image-container">
          ${productProps.image ? `<img src="${productProps.image}" alt="${productProps.title}" />` : '<div class="placeholder-image">暂无图片</div>'}
        </div>
        <div class="product-content">
          <h3 class="product-title">${productProps.title}</h3>
          ${tagsHtml}
          ${priceHtml}
        </div>
      </div>
    `;

    const css = `
      .${componentId} {
        ${this.generateStyles(styles || {}, componentId)}
      }
      .${componentId} {
        border: 1px solid #eee;
        border-radius: 8px;
        overflow: hidden;
        background: white;
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      .${componentId}:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      .${componentId} .product-image-container {
        width: 100%;
        height: 200px;
        overflow: hidden;
        background-color: #f5f5f5;
      }
      .${componentId} .product-image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .${componentId} .placeholder-image {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        font-size: 14px;
      }
      .${componentId} .product-content {
        padding: 12px;
      }
      .${componentId} .product-title {
        font-size: 14px;
        font-weight: bold;
        color: #333;
        margin: 0 0 8px 0;
        line-height: 1.4;
      }
      .${componentId} .product-tags {
        margin-bottom: 8px;
      }
      .${componentId} .tag {
        display: inline-block;
        font-size: 12px;
        color: #FF9F29;
        background-color: #FFF7E6;
        padding: 2px 6px;
        border-radius: 4px;
        margin-right: 4px;
        margin-bottom: 4px;
      }
      .${componentId} .product-price {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .${componentId} .current-price {
        font-size: 16px;
        font-weight: bold;
        color: #FF9F29;
      }
      .${componentId} .original-price {
        font-size: 12px;
        color: #999;
        text-decoration: line-through;
      }
    `;

    return { html, css };
  }

  /**
   * 渲染容器组件
   */
  private renderContainerComponent(component: BaseComponent, schema: ComponentSchema): RenderResult {
    const { props, styles, id } = component;
    const componentId = id || `container-${Date.now()}`;

    const containerProps = {
      direction: props.direction || 'vertical',
      justifyContent: props.justifyContent || 'flex-start',
      alignItems: props.alignItems || 'flex-start',
      padding: props.padding || 16,
      backgroundColor: props.backgroundColor || 'transparent',
      borderRadius: props.borderRadius || 0
    };

    const html = `
      <div class="component component-container ${componentId}" data-component-type="container" data-component-id="${componentId}">
        <div class="container-content">
          <!-- 子组件将在这里渲染 -->
        </div>
      </div>
    `;

    const css = `
      .${componentId} {
        ${this.generateStyles(styles || {}, componentId)}
      }
      .${componentId} .container-content {
        display: flex;
        flex-direction: ${containerProps.direction === 'vertical' ? 'column' : 'row'};
        justify-content: ${containerProps.justifyContent};
        align-items: ${containerProps.alignItems};
        padding: ${containerProps.padding}px;
        background-color: ${containerProps.backgroundColor};
        border-radius: ${containerProps.borderRadius}px;
      }
    `;

    return { html, css };
  }

  /**
   * 渲染错误组件
   */
  private renderErrorComponent(message: string): RenderResult {
    const html = `
      <div class="component component-error">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <div class="error-message">${message}</div>
        </div>
      </div>
    `;

    const css = `
      .component-error {
        padding: 20px;
        border: 2px dashed #ff6b6b;
        border-radius: 8px;
        background-color: #fff5f5;
        color: #c92a2a;
        text-align: center;
      }
      .error-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }
      .error-message {
        font-size: 14px;
        line-height: 1.4;
      }
    `;

    return { html, css };
  }

  /**
   * 获取图标SVG
   */
  private getIconSvg(iconName: string): string {
    const icons: Record<string, string> = {
      heart: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
      star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
      'shopping-cart': '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
      user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12"/>',
      search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 9.96l4.24 4.24m12.44 0l4.24 4.24M1.54 14.04l4.24-4.24"/>',
      phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
      location: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13 9-5 9-5 9-5 9 6 9 13z"/><circle cx="12" cy="10" r="3"/>',
      share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>'
    };

    return icons[iconName] || '<rect width="24" height="24" fill="currentColor"/>';
  }
}

// 导出组件渲染器工具函数
export function createRenderer(context: RenderContext): ComponentRenderer {
  return new ComponentRenderer(context);
}

/**
 * 验证组件配置
 */
export function validateComponentConfig(component: BaseComponent): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!component.type) {
    errors.push('组件类型不能为空');
    return { valid: false, errors };
  }

  const schema = ComponentSchemas[component.type as ComponentSchemaType];
  if (!schema) {
    errors.push(`未知的组件类型: ${component.type}`);
    return { valid: false, errors };
  }

  // 验证必需的属性
  for (const [key, property] of Object.entries(schema.properties)) {
    if (property.required && !component.props[key]) {
      errors.push(`缺少必需的属性: ${key}`);
    }

    // 验证属性类型和值
    if (component.props[key] !== undefined) {
      const value = component.props[key];
      switch (property.type) {
        case 'number':
          if (typeof value !== 'number') {
            errors.push(`属性 ${key} 必须是数字类型`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`属性 ${key} 必须是布尔类型`);
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`属性 ${key} 必须是数组类型`);
          }
          break;
      }
    }
  }

  return { valid: errors.length === 0, errors };
}