import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi, tagApi } from '@/api/user'
import type { User } from '@/types/user'
import type { Tag } from '@/types/tag'

/**
 * 标签对话框状态
 */
interface TagDialog {
  visible: boolean
  user: User | null
}

/**
 * 用户标签管理逻辑
 */
export function useUserTags(refreshList: () => void) {
  // 对话框状态
  const tagDialog = ref<TagDialog>({
    visible: false,
    user: null,
  })

  // 可用标签列表
  const availableTags = ref<Tag[]>([])

  // 加载状态
  const tagsLoading = ref(false)

  /**
   * 打开标签管理对话框
   */
  const handleManageTags = async (user: User): Promise<void> => {
    tagDialog.value.user = user
    tagDialog.value.visible = true
    await loadAvailableTags()
  }

  /**
   * 加载可用标签
   */
  const loadAvailableTags = async (): Promise<void> => {
    tagsLoading.value = true
    try {
      const tags = await tagApi.getTagList()
      availableTags.value = tags
    } catch (error: unknown) {
      ElMessage.error('加载标签失败')
    } finally {
      tagsLoading.value = false
    }
  }

  /**
   * 添加标签
   */
  const handleAddTag = async (userId: number, tagId: number): Promise<void> => {
    try {
      await tagApi.addUserTags(userId, [tagId])
      ElMessage.success('添加标签成功')
      refreshList()
    } catch (error: unknown) {
      ElMessage.error('添加标签失败')
    }
  }

  /**
   * 移除标签
   */
  const handleRemoveTag = async (userId: number, tagId: number): Promise<void> => {
    try {
      await tagApi.removeUserTag(userId, tagId)
      ElMessage.success('移除标签成功')
      refreshList()
    } catch (error: unknown) {
      ElMessage.error('移除标签失败')
    }
  }

  return {
    tagDialog,
    availableTags,
    tagsLoading,
    handleManageTags,
    handleAddTag,
    handleRemoveTag,
  }
}
