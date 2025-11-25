/**
 * DIY编辑器状态管理
 */
import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type {
  EditorState,
  BaseComponent,
  PageConfiguration,
  ComponentLibraryItem,
  DiyProject,
  DiyTemplate,
  ActionConfig
} from '@/types/diy';

export const useDiyStore = defineStore('diy', () => {
  // 状态
  const editorState = ref<EditorState>({
    currentPage: null,
    selectedComponentId: null,
    clipboardComponent: null,
    history: {
      past: [],
      present: -1,
      future: []
    },
    isPreview: false,
    zoom: 1,
    canvasSize: {
      width: 375,
      height: 667
    }
  });

  const projectList = ref<DiyProject[]>([]);
  const currentProject = ref<DiyProject | null>(null);
  const templateList = ref<DiyTemplate[]>([]);
  const componentLibrary = ref<ComponentLibraryItem[]>([]);
  const selectedComponent = computed(() => {
    if (!editorState.value.currentPage || !editorState.value.selectedComponentId) {
      return null;
    }
    return findComponentById(editorState.value.currentPage.components, editorState.value.selectedComponentId);
  });

  // 计算属性
  const hasSelectedComponent = computed(() => !!editorState.value.selectedComponentId);
  const canUndo = computed(() => editorState.value.history.present > 0);
  const canRedo = computed(() => editorState.value.history.present < editorState.value.history.past.length - 1);
  const canPaste = computed(() => !!editorState.value.clipboardComponent);
  const hasUnsavedChanges = computed(() => {
    if (!currentProject.value || !editorState.value.currentPage) return false;
    // 简化的比较逻辑，实际应该进行深度比较
    return true;
  });

  // 方法
  // 项目管理
  const setCurrentProject = (project: DiyProject | null) => {
    currentProject.value = project;
    if (project && project.pageConfig) {
      editorState.value.currentPage = project.pageConfig;
      editorState.value.history = {
        past: [],
        present: 0,
        future: []
      };
    }
  };

  const createProject = async (projectData: Partial<DiyProject>) => {
    try {
      const response = await fetch('/api/v1/diy/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      const result = await response.json();
      if (result.code === 0) {
        const newProject = result.data;
        projectList.value.push(newProject);
        await setCurrentProject(newProject);
        return newProject;
      }
      throw new Error(result.message);
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<DiyProject>) => {
    try {
      const response = await fetch(`/api/v1/diy/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await response.json();
      if (result.code === 0) {
        const updatedProject = result.data;
        const index = projectList.value.findIndex(p => p.id === id);
        if (index !== -1) {
          projectList.value[index] = updatedProject;
        }
        if (currentProject.value?.id === id) {
          setCurrentProject(updatedProject);
        }
        return updatedProject;
      }
      throw new Error(result.message);
    } catch (error) {
      console.error('更新项目失败:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/diy/projects/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.code === 0) {
        projectList.value = projectList.value.filter(p => p.id !== id);
        if (currentProject.value?.id === id) {
          setCurrentProject(null);
          editorState.value.currentPage = null;
        }
      }
    } catch (error) {
      console.error('删除项目失败:', error);
      throw error;
    }
  };

  const publishProject = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/diy/projects/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      if (result.code === 0) {
        const project = projectList.value.find(p => p.id === id);
        if (project) {
          project.status = 'published';
        }
      }
    } catch (error) {
      console.error('发布项目失败:', error);
      throw error;
    }
  };

  // 组件操作
  const selectComponent = (component: BaseComponent | null) => {
    editorState.value.selectedComponentId = component?.id || null;
  };

  const selectComponentById = (id: string) => {
    if (!editorState.value.currentPage) return null;
    const component = findComponentById(editorState.value.currentPage.components, id);
    selectComponent(component);
    return component;
  };

  const addComponent = (component: BaseComponent, parentId?: string, index?: number) => {
    if (!editorState.value.currentPage) return;

    saveToHistory(); // 保存到历史记录

    if (parentId) {
      const parent = findComponentById(editorState.value.currentPage.components, parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        const insertIndex = index !== undefined ? index : parent.children.length;
        parent.children.splice(insertIndex, 0, component);
        component.parentId = parentId;
      }
    } else {
      const insertIndex = index !== undefined ? index : editorState.value.currentPage.components.length;
      editorState.value.currentPage.components.splice(insertIndex, 0, component);
    }

    // 自动选择新添加的组件
    selectComponent(component);
  };

  const updateComponent = (id: string, updates: Partial<BaseComponent>) => {
    if (!editorState.value.currentPage) return;

    saveToHistory(); // 保存到历史记录

    const component = findComponentById(editorState.value.currentPage.components, id);
    if (component) {
      Object.assign(component, updates);
    }
  };

  const deleteComponent = (id: string) => {
    if (!editorState.value.currentPage) return;

    saveToHistory(); // 保存到历史记录

    // 递归删除组件
    const deleteRecursive = (components: BaseComponent[], targetId: string): boolean => {
      for (let i = components.length - 1; i >= 0; i--) {
        const component = components[i];
        if (component.id === targetId) {
          components.splice(i, 1);
          return true;
        }
        if (component.children && component.children.length > 0) {
          if (deleteRecursive(component.children, targetId)) {
            return true;
          }
        }
      }
      return false;
    };

    deleteRecursive(editorState.value.currentPage.components, id);

    // 如果删除的是当前选中的组件，清除选择
    if (editorState.value.selectedComponentId === id) {
      selectComponent(null);
    }
  };

  const moveComponent = (componentId: string, targetParentId?: string, targetIndex?: number) => {
    if (!editorState.value.currentPage) return;

    saveToHistory(); // 保存到历史记录

    const component = findComponentById(editorState.value.currentPage.components, componentId);
    if (!component) return;

    // 从原位置删除
    deleteComponent(componentId);

    // 添加到新位置
    addComponent(component, targetParentId, targetIndex);
  };

  const copyComponent = (component: BaseComponent) => {
    // 深拷贝组件
    const copyComponentRecursive = (comp: BaseComponent): BaseComponent => {
      const copied = { ...comp };
      copied.id = generateId();
      if (comp.children) {
        copied.children = comp.children.map(copyComponentRecursive);
      }
      return copied;
    };

    editorState.value.clipboardComponent = copyComponentRecursive(component);
  };

  const pasteComponent = () => {
    if (!editorState.value.clipboardComponent || !editorState.value.currentPage) return;

    saveToHistory(); // 保存到历史记录

    // 深拷贝剪贴板组件
    const pasteComponentRecursive = (comp: BaseComponent): BaseComponent => {
      const pasted = { ...comp };
      pasted.id = generateId();
      if (comp.children) {
        pasted.children = comp.children.map(pasteComponentRecursive);
      }
      return pasted;
    };

    const pastedComponent = pasteComponentRecursive(editorState.value.clipboardComponent);
    addComponent(pastedComponent);
  };

  // 历史记录管理
  const saveToHistory = () => {
    if (!editorState.value.currentPage) return;

    const currentState = JSON.parse(JSON.stringify(editorState.value.currentPage));
    const { past, present, future } = editorState.value.history;

    // 删除当前位置之后的所有历史记录
    past.splice(present + 1);

    // 添加当前状态到历史记录
    past.push(currentState);

    editorState.value.history.present = past.length - 1;
    editorState.value.history.future = [];
  };

  const undo = () => {
    if (canUndo.value) {
      const { past, present } = editorState.value.history;
      const previous = past[present - 1];

      editorState.value.history.present--;
      editorState.value.history.future.push(editorState.value.currentPage!);
      editorState.value.currentPage = JSON.parse(JSON.stringify(previous));
    }
  };

  const redo = () => {
    if (canRedo.value) {
      const { past, present, future } = editorState.value.history;
      const next = future[future.length - 1];

      editorState.value.history.past.push(editorState.value.currentPage!);
      editorState.value.history.present++;
      editorState.value.currentPage = JSON.parse(JSON.stringify(next));
    }
  };

  // 预览和缩放
  const togglePreview = () => {
    editorState.value.isPreview = !editorState.value.isPreview;
  };

  const setZoom = (zoom: number) => {
    editorState.value.zoom = Math.max(0.1, Math.min(3, zoom));
  };

  const setCanvasSize = (width: number, height: number) => {
    editorState.value.canvasSize = { width, height };
  };

  // 工具函数
  const findComponentById = (components: BaseComponent[], id: string): BaseComponent | null => {
    for (const component of components) {
      if (component.id === id) {
        return component;
      }
      if (component.children && component.children.length > 0) {
        const found = findComponentById(component.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const generateId = (): string => {
    return 'component_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const clearSelection = () => {
    selectComponent(null);
  };

  const resetEditor = () => {
    editorState.value.currentPage = null;
    editorState.value.selectedComponentId = null;
    editorState.value.clipboardComponent = null;
    editorState.value.history = { past: [], present: -1, future: [] };
    editorState.value.isPreview = false;
    editorState.value.zoom = 1;
  };

  return {
    // 状态
    editorState: readonly(editorState),
    projectList: readonly(projectList),
    currentProject: readonly(currentProject),
    templateList: readonly(templateList),
    componentLibrary: readonly(componentLibrary),

    // 计算属性
    selectedComponent,
    hasSelectedComponent,
    canUndo,
    canRedo,
    canPaste,
    hasUnsavedChanges,

    // 项目管理
    setCurrentProject,
    createProject,
    updateProject,
    deleteProject,
    publishProject,

    // 组件操作
    selectComponent,
    selectComponentById,
    addComponent,
    updateComponent,
    deleteComponent,
    moveComponent,
    copyComponent,
    pasteComponent,

    // 历史记录
    undo,
    redo,

    // 预览和缩放
    togglePreview,
    setZoom,
    setCanvasSize,

    // 工具函数
    findComponentById,
    generateId,
    clearSelection,
    resetEditor
  };
});