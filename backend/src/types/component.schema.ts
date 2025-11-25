/**
 * DIY组件配置Schema定义
 * 基于JSON Schema定义组件的可配置属性
 */

// 基础属性类型
export interface BaseProperty {
  type: 'text' | 'number' | 'boolean' | 'color' | 'image' | 'url' | 'select' | 'array' | 'object';
  title: string;
  description?: string;
  default?: any;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// 文本属性
export interface TextProperty extends BaseProperty {
  type: 'text';
  placeholder?: string;
  maxLength?: number;
}

// 数字属性
export interface NumberProperty extends BaseProperty {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

// 颜色属性
export interface ColorProperty extends BaseProperty {
  type: 'color';
  format?: 'hex' | 'rgb' | 'rgba';
  opacity?: boolean;
}

// 图片属性
export interface ImageProperty extends BaseProperty {
  type: 'image';
  allowUpload?: boolean;
  maxSize?: number;
  formats?: string[];
  aspectRatio?: string;
}

// 选择属性
export interface SelectProperty extends BaseProperty {
  type: 'select';
  multiple?: boolean;
  options: Array<{ label: string; value: any; description?: string }>;
}

// 数组属性
export interface ArrayProperty extends BaseProperty {
  type: 'array';
  itemType: BaseProperty;
  minItems?: number;
  maxItems?: number;
  collapsed?: boolean;
}

// 对象属性
export interface ObjectProperty extends BaseProperty {
  type: 'object';
  properties: Record<string, BaseProperty>;
  collapsed?: boolean;
}

// 组件属性类型联合
export type ComponentProperty =
  | TextProperty
  | NumberProperty
  | ColorProperty
  | ImageProperty
  | SelectProperty
  | ArrayProperty
  | ObjectProperty
  | (BaseProperty & { type: 'boolean' })
  | (BaseProperty & { type: 'url' });

// 组件Schema配置
export interface ComponentSchema {
  // 基础信息
  type: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  version: string;

  // 属性配置
  properties: Record<string, ComponentProperty>;

  // 事件配置
  events?: Array<{
    name: string;
    title: string;
    description?: string;
  }>;

  // 样式配置
  styleConfig?: {
    layout?: boolean;
    spacing?: boolean;
    typography?: boolean;
    border?: boolean;
    background?: boolean;
  };

  // 预览配置
  preview?: {
    width?: number;
    height?: number;
    category?: string;
  };
}

// 具体组件Schema定义

// 1. 文本组件Schema
export const TextComponentSchema: ComponentSchema = {
  type: 'text',
  name: '文本',
  category: 'basic',
  icon: 'text',
  description: '显示文本内容的基础组件',
  version: '1.0.0',
  properties: {
    content: {
      type: 'text',
      title: '文本内容',
      description: '组件显示的文本内容',
      default: '文本内容',
      required: true,
      placeholder: '请输入文本内容'
    } as TextProperty,
    fontSize: {
      type: 'number',
      title: '字体大小',
      description: '文本的字体大小',
      default: 16,
      unit: 'px',
      min: 12,
      max: 72
    } as NumberProperty,
    color: {
      type: 'color',
      title: '文字颜色',
      description: '文本的颜色',
      default: '#333333'
    } as ColorProperty,
    fontWeight: {
      type: 'select',
      title: '字体粗细',
      description: '文本的字体粗细',
      default: 'normal',
      options: [
        { label: '正常', value: 'normal' },
        { label: '粗体', value: 'bold' },
        { label: '细体', value: 'lighter' }
      ]
    } as SelectProperty,
    textAlign: {
      type: 'select',
      title: '文本对齐',
      description: '文本的对齐方式',
      default: 'left',
      options: [
        { label: '左对齐', value: 'left' },
        { label: '居中', value: 'center' },
        { label: '右对齐', value: 'right' }
      ]
    } as SelectProperty,
    lineHeight: {
      type: 'number',
      title: '行高',
      description: '文本的行高',
      default: 1.5,
      min: 1,
      max: 3,
      step: 0.1
    } as NumberProperty
  },
  events: [
    {
      name: 'onClick',
      title: '点击事件',
      description: '当用户点击文本时触发'
    }
  ],
  styleConfig: {
    layout: true,
    spacing: true,
    typography: true,
    border: false,
    background: true
  }
};

// 2. 图片组件Schema
export const ImageComponentSchema: ComponentSchema = {
  type: 'image',
  name: '图片',
  category: 'media',
  icon: 'image',
  description: '显示图片内容的组件',
  version: '1.0.0',
  properties: {
    src: {
      type: 'image',
      title: '图片地址',
      description: '组件显示的图片',
      required: true,
      allowUpload: true,
      formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      maxSize: 5 * 1024 * 1024 // 5MB
    } as ImageProperty,
    alt: {
      type: 'text',
      title: '图片描述',
      description: '图片的替代文本',
      placeholder: '请输入图片描述'
    } as TextProperty,
    width: {
      type: 'number',
      title: '图片宽度',
      description: '图片的显示宽度',
      default: 100,
      unit: '%'
    } as NumberProperty,
    height: {
      type: 'number',
      title: '图片高度',
      description: '图片的显示高度',
      unit: 'px'
    } as NumberProperty,
    fit: {
      type: 'select',
      title: '图片适配方式',
      description: '图片在容器中的适配方式',
      default: 'cover',
      options: [
        { label: '填充', value: 'cover' },
        { label: '包含', value: 'contain' },
        { label: '拉伸', value: 'fill' },
        { label: '原始', value: 'none' }
      ]
    } as SelectProperty,
    borderRadius: {
      type: 'number',
      title: '圆角',
      description: '图片的圆角大小',
      default: 0,
      unit: 'px',
      min: 0,
      max: 50
    } as NumberProperty
  },
  events: [
    {
      name: 'onClick',
      title: '点击事件',
      description: '当用户点击图片时触发'
    },
    {
      name: 'onLoad',
      title: '加载完成',
      description: '图片加载完成时触发'
    }
  ],
  styleConfig: {
    layout: true,
    spacing: true,
    typography: false,
    border: true,
    background: false
  }
};

// 3. 按钮组件Schema
export const ButtonComponentSchema: ComponentSchema = {
  type: 'button',
  name: '按钮',
  category: 'basic',
  icon: 'button',
  description: '可点击的按钮组件',
  version: '1.0.0',
  properties: {
    text: {
      type: 'text',
      title: '按钮文字',
      description: '按钮显示的文字',
      default: '按钮',
      required: true,
      placeholder: '请输入按钮文字'
    } as TextProperty,
    type: {
      type: 'select',
      title: '按钮类型',
      description: '按钮的样式类型',
      default: 'primary',
      options: [
        { label: '主要', value: 'primary' },
        { label: '次要', value: 'secondary' },
        { label: '警告', value: 'warning' },
        { label: '危险', value: 'danger' },
        { label: '文本', value: 'text' }
      ]
    } as SelectProperty,
    size: {
      type: 'select',
      title: '按钮大小',
      description: '按钮的尺寸',
      default: 'medium',
      options: [
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' }
      ]
    } as SelectProperty,
    disabled: {
      type: 'boolean',
      title: '禁用状态',
      description: '按钮是否禁用',
      default: false
    },
    loading: {
      type: 'boolean',
      title: '加载状态',
      description: '按钮是否显示加载状态',
      default: false
    },
    action: {
      type: 'object',
      title: '点击动作',
      description: '按钮点击后的动作配置',
      properties: {
        type: {
          type: 'select',
          title: '动作类型',
          options: [
            { label: '页面导航', value: 'navigate' },
            { label: '网页跳转', value: 'webview' },
            { label: '拨打电话', value: 'phone' },
            { label: '自定义动作', value: 'action' }
          ]
        } as SelectProperty,
        target: {
          type: 'text',
          title: '动作目标',
          placeholder: '请输入目标页面或URL'
        } as TextProperty
      }
    } as ObjectProperty
  },
  events: [
    {
      name: 'onClick',
      title: '点击事件',
      description: '当用户点击按钮时触发'
    }
  ],
  styleConfig: {
    layout: true,
    spacing: true,
    typography: true,
    border: true,
    background: true
  }
};

// 4. 图标组件Schema
export const IconComponentSchema: ComponentSchema = {
  type: 'icon',
  name: '图标',
  category: 'basic',
  icon: 'icon',
  description: '显示图标的组件',
  version: '1.0.0',
  properties: {
    name: {
      type: 'select',
      title: '图标名称',
      description: '选择要显示的图标',
      default: 'heart',
      options: [
        { label: '心形', value: 'heart' },
        { label: '星星', value: 'star' },
        { label: '购物车', value: 'shopping-cart' },
        { label: '用户', value: 'user' },
        { label: '首页', value: 'home' },
        { label: '搜索', value: 'search' },
        { label: '设置', value: 'settings' },
        { label: '电话', value: 'phone' },
        { label: '位置', value: 'location' },
        { label: '分享', value: 'share' }
      ]
    } as SelectProperty,
    size: {
      type: 'number',
      title: '图标大小',
      description: '图标的显示大小',
      default: 24,
      unit: 'px',
      min: 12,
      max: 64
    } as NumberProperty,
    color: {
      type: 'color',
      title: '图标颜色',
      description: '图标的颜色',
      default: '#666666'
    } as ColorProperty,
    backgroundColor: {
      type: 'color',
      title: '背景颜色',
      description: '图标容器的背景颜色'
    } as ColorProperty
  },
  events: [
    {
      name: 'onClick',
      title: '点击事件',
      description: '当用户点击图标时触发'
    }
  ],
  styleConfig: {
    layout: true,
    spacing: true,
    typography: false,
    border: true,
    background: true
  }
};

// 5. 轮播图组件Schema
export const BannerComponentSchema: ComponentSchema = {
  type: 'banner',
  name: '轮播图',
  category: 'media',
  icon: 'banner',
  description: '图片轮播展示组件',
  version: '1.0.0',
  properties: {
    images: {
      type: 'array',
      title: '图片列表',
      description: '轮播显示的图片列表',
      required: true,
      minItems: 1,
      maxItems: 10,
      itemType: {
        type: 'object',
        title: '图片项',
        properties: {
          src: {
            type: 'image',
            title: '图片地址',
            required: true,
            allowUpload: true
          } as ImageProperty,
          title: {
            type: 'text',
            title: '标题',
            placeholder: '请输入图片标题'
          } as TextProperty,
          link: {
            type: 'text',
            title: '跳转链接',
            placeholder: '请输入跳转链接'
          } as TextProperty
        }
      } as ObjectProperty
    } as ArrayProperty,
    height: {
      type: 'number',
      title: '轮播图高度',
      description: '轮播图的显示高度',
      default: 200,
      unit: 'px',
      min: 100,
      max: 500
    } as NumberProperty,
    autoplay: {
      type: 'boolean',
      title: '自动播放',
      description: '是否自动播放轮播',
      default: true
    },
    interval: {
      type: 'number',
      title: '播放间隔',
      description: '自动播放的时间间隔',
      default: 3000,
      unit: 'ms',
      min: 1000,
      max: 10000
    } as NumberProperty,
    showIndicator: {
      type: 'boolean',
      title: '显示指示器',
      description: '是否显示轮播指示器',
      default: true
    }
  },
  events: [
    {
      name: 'onChange',
      title: '切换事件',
      description: '轮播图切换时触发'
    },
    {
      name: 'onClick',
      title: '点击事件',
      description: '点击轮播图时触发'
    }
  ],
  styleConfig: {
    layout: true,
    spacing: true,
    typography: false,
    border: true,
    background: false
  }
};

// 6. 商品卡片组件Schema
export const ProductCardComponentSchema: ComponentSchema = {
  type: 'productCard',
  name: '商品卡片',
  category: 'business',
  icon: 'product-card',
  description: '显示商品信息的卡片组件',
  version: '1.0.0',
  properties: {
    productId: {
      type: 'text',
      title: '商品ID',
      description: '关联的商品ID',
      required: true,
      placeholder: '请输入商品ID'
    } as TextProperty,
    title: {
      type: 'text',
      title: '商品标题',
      description: '商品的标题',
      default: '商品标题',
      placeholder: '请输入商品标题'
    } as TextProperty,
    price: {
      type: 'number',
      title: '商品价格',
      description: '商品的价格',
      default: 0,
      unit: '元',
      min: 0
    } as NumberProperty,
    originalPrice: {
      type: 'number',
      title: '原价',
      description: '商品的原价',
      unit: '元',
      min: 0
    } as NumberProperty,
    image: {
      type: 'image',
      title: '商品图片',
      description: '商品的展示图片',
      allowUpload: true
    } as ImageProperty,
    tags: {
      type: 'array',
      title: '商品标签',
      description: '商品的标签列表',
      itemType: {
        type: 'text',
        title: '标签',
        placeholder: '请输入标签'
      }
    } as ArrayProperty,
    showPrice: {
      type: 'boolean',
      title: '显示价格',
      description: '是否显示商品价格',
      default: true
    },
    showOriginalPrice: {
      type: 'boolean',
      title: '显示原价',
      description: '是否显示商品原价',
      default: false
    }
  },
  events: [
    {
      name: 'onClick',
      title: '点击事件',
      description: '当用户点击商品卡片时触发'
    },
    {
      name: 'onAddToCart',
      title: '加入购物车',
      description: '当用户点击加入购物车时触发'
    }
  ],
  styleConfig: {
    layout: true,
    spacing: true,
    typography: true,
    border: true,
    background: true
  }
};

// 7. 容器组件Schema
export const ContainerComponentSchema: ComponentSchema = {
  type: 'container',
  name: '容器',
  category: 'layout',
  icon: 'container',
  description: '容纳其他组件的容器组件',
  version: '1.0.0',
  properties: {
    direction: {
      type: 'select',
      title: '排列方向',
      description: '子组件的排列方向',
      default: 'vertical',
      options: [
        { label: '垂直', value: 'vertical' },
        { label: '水平', value: 'horizontal' }
      ]
    } as SelectProperty,
    justifyContent: {
      type: 'select',
      title: '主轴对齐',
      description: '子组件在主轴上的对齐方式',
      default: 'flex-start',
      options: [
        { label: '开始', value: 'flex-start' },
        { label: '居中', value: 'center' },
        { label: '结束', value: 'flex-end' },
        { label: '平均分布', value: 'space-between' },
        { label: '环绕分布', value: 'space-around' }
      ]
    } as SelectProperty,
    alignItems: {
      type: 'select',
      title: '交叉轴对齐',
      description: '子组件在交叉轴上的对齐方式',
      default: 'flex-start',
      options: [
        { label: '开始', value: 'flex-start' },
        { label: '居中', value: 'center' },
        { label: '结束', value: 'flex-end' },
        { label: '拉伸', value: 'stretch' }
      ]
    } as SelectProperty,
    padding: {
      type: 'number',
      title: '内边距',
      description: '容器的内边距',
      default: 16,
      unit: 'px',
      min: 0,
      max: 50
    } as NumberProperty,
    backgroundColor: {
      type: 'color',
      title: '背景颜色',
      description: '容器的背景颜色'
    } as ColorProperty,
    borderRadius: {
      type: 'number',
      title: '圆角',
      description: '容器的圆角大小',
      default: 0,
      unit: 'px',
      min: 0,
      max: 20
    } as NumberProperty
  },
  styleConfig: {
    layout: true,
    spacing: true,
    typography: false,
    border: true,
    background: true
  }
};

// 所有组件Schema集合
export const ComponentSchemas = {
  text: TextComponentSchema,
  image: ImageComponentSchema,
  button: ButtonComponentSchema,
  icon: IconComponentSchema,
  banner: BannerComponentSchema,
  productCard: ProductCardComponentSchema,
  container: ContainerComponentSchema
};

export type ComponentSchemaType = keyof typeof ComponentSchemas;