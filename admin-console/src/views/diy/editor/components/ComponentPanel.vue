<!--
  组件面板
  显示可拖拽的组件库列表
-->
<template>
  <div class="component-panel">
    <div class="panel-header">
      <h3>组件库</h3>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索组件"
        :prefix-icon="Search"
        size="small"
      />
    </div>

    <div class="panel-content">
      <div
        v-for="category in filteredCategories"
        :key="category.key"
        class="category-section"
      >
        <div class="category-header">
          <el-icon class="category-icon">
            <component :is="category.icon" />
          </el-icon>
          <span>{{ category.name }}</span>
          <el-button
            :icon="category.expanded ? ArrowDown : ArrowRight"
            text
            size="small"
            @click="toggleCategory(category.key)"
          />
        </div>

        <el-collapse-transition>
          <div v-show="category.expanded" class="category-content">
            <div
              v-for="component in category.components"
              :key="component.type"
              class="component-item"
              draggable="true"
              @dragstart="handleDragStart(component, $event)"
              @dragend="handleDragEnd"
            >
              <div class="component-icon">
                <img v-if="component.previewImage" :src="component.previewImage" />
                <el-icon v-else>
                  <component :is="component.icon" />
                </el-icon>
              </div>
              <div class="component-info">
                <div class="component-name">{{ component.name }}</div>
                <div class="component-desc">{{ component.description }}</div>
              </div>
            </div>
          </div>
        </el-collapse-transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Search, ArrowDown, ArrowRight } from '@element-plus/icons-vue';
import { getComponentSchemas } from '@/api/diy';
import { useDiyStore } from '@/stores/diy';

import type { ComponentLibraryItem, ComponentCategory } from '@/types/diy';

interface CategoryGroup {
  key: ComponentCategory;
  name: string;
  icon: any;
  expanded: boolean;
  components: ComponentLibraryItem[];
}

const diyStore = useDiyStore();

// 响应式数据
const searchKeyword = ref('');
const categories = ref<CategoryGroup[]>([]);

// 分类图标映射
const categoryIcons: Record<ComponentCategory, any> = {
  basic: 'Document',
  layout: 'Grid',
  business: 'ShoppingBag',
  navigation: 'Compass',
  media: 'Picture',
  form: 'EditPen'
};

// 分类名称映射
const categoryNames: Record<ComponentCategory, string> = {
  basic: '基础组件',
  layout: '布局组件',
  business: '业务组件',
  navigation: '导航组件',
  media: '媒体组件',
  form: '表单组件'
};

// 计算属性
const filteredCategories = computed(() => {
  if (!searchKeyword.value) {
    return categories.value;
  }

  return categories.value.map(category => ({
    ...category,
    components: category.components.filter(component =>
      component.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      component.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  })).filter(category => category.components.length > 0);
});

// 方法
const loadComponentLibrary = async () => {
  try {
    const response = await getComponentSchemas();

    if (response.code === 0) {
      const schemas = response.data;

      // 按分类组织组件
      const groupedSchemas: Record<ComponentCategory, ComponentLibraryItem[]> = {
        basic: [],
        layout: [],
        business: [],
        navigation: [],
        media: [],
        form: []
      };

      Object.values(schemas).forEach(schema => {
        const component: ComponentLibraryItem = {
          type: schema.type,
          name: schema.name,
          icon: schema.icon,
          category: schema.category,
          description: schema.description,
          defaultProps: schema.defaultProps || {},
          previewImage: schema.previewImage,
          schema
        };

        groupedSchemas[schema.category].push(component);
      });

      // 转换为分类组数组
      categories.value = Object.entries(groupedSchemas).map(([key, components]) => ({
        key: key as ComponentCategory,
        name: categoryNames[key as ComponentCategory],
        icon: categoryIcons[key as ComponentCategory],
        expanded: true, // 默认展开
        components
      }));
    }
  } catch (error) {
    console.error('加载组件库失败:', error);
  }
};

const toggleCategory = (categoryKey: ComponentCategory) => {
  const category = categories.value.find(c => c.key === categoryKey);
  if (category) {
    category.expanded = !category.expanded;
  }
};

// 拖拽事件处理
const handleDragStart = (component: ComponentLibraryItem, event: DragEvent) => {
  if (event.dataTransfer) {
    // 存储组件信息到拖拽数据中
    event.dataTransfer.setData('application/json', JSON.stringify({
      componentType: component.type,
      componentData: {
        type: component.type,
        props: { ...component.defaultProps },
        styles: getDefaultStyles(component.type),
        sortIndex: 0
      }
    }));

    // 设置拖拽效果
    event.dataTransfer.effectAllowed = 'copy';

    // 添加拖拽样式
    if (event.target instanceof HTMLElement) {
      event.target.classList.add('dragging');
    }
  }
};

const handleDragEnd = (event: DragEvent) => {
  // 移除拖拽样式
  if (event.target instanceof HTMLElement) {
    event.target.classList.remove('dragging');
  }
};

// 获取组件默认样式
const getDefaultStyles = (componentType: string) => {
  const baseStyles = {
    position: 'relative',
    display: 'block',
    width: 'auto',
    height: 'auto',
    padding: 8,
    margin: 0
  };

  switch (componentType) {
    case 'text':
      return {
        ...baseStyles,
        fontSize: 14,
        color: '#333333',
        textAlign: 'left'
      };
    case 'image':
      return {
        ...baseStyles,
        width: 100,
        height: 100,
        objectFit: 'cover'
      };
    case 'button':
      return {
        ...baseStyles,
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8px 16px',
        fontSize: 14,
        fontWeight: 500,
        color: '#ffffff',
        backgroundColor: '#007aff',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer'
      };
    case 'icon':
      return {
        ...baseStyles,
        fontSize: 20,
        color: '#333333',
        display: 'inline-flex'
      };
    default:
      return baseStyles;
  }
};

onMounted(() => {
  loadComponentLibrary();
});
</script>

<style lang="scss" scoped>
.component-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.category-section {
  margin-bottom: 16px;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  .category-icon {
    margin-right: 8px;
    color: var(--el-color-primary);
  }

  span {
    flex: 1;
    font-weight: 500;
  }
}

.category-content {
  padding-left: 12px;
}

.component-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 4px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:active,
  &.dragging {
    cursor: grabbing;
    opacity: 0.5;
    transform: scale(0.98);
  }
}

.component-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  font-size: 18px;
  color: var(--el-color-primary);

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
}

.component-info {
  flex: 1;
  min-width: 0;
}

.component-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.component-desc {
  font-size: 12px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>