<template>
  <el-dialog v-model="visible" title="管理用户标签" width="600px">
    <div v-if="user">
      <h4>当前标签</h4>
      <div class="current-tags">
        <el-tag
          v-for="tag in userTags"
          :key="tag.id"
          :type="(tag.color as any)"
          :effect="tag.name === 'PLUS会员' ? 'dark' : 'light'"
          closable
          @close="$emit('remove-tag', user.id, tag.id)"
          style="margin-right: 8px; margin-bottom: 8px"
        >
          <el-icon v-if="tag.name === 'PLUS会员'" style="margin-right: 2px">
            <Star />
          </el-icon>
          {{ tag.name }}
        </el-tag>
        <span v-if="!userTags || userTags.length === 0" class="empty-text">暂无标签</span>
      </div>

      <el-divider />

      <h4>添加标签</h4>
      <div v-loading="loading" class="available-tags">
        <el-tag
          v-for="tag in availableTagsToAdd"
          :key="tag.id"
          :type="(tag.color as any)"
          :effect="tag.name === 'PLUS会员' ? 'dark' : 'light'"
          style="margin-right: 8px; margin-bottom: 8px; cursor: pointer"
          @click="$emit('add-tag', user.id, tag.id)"
        >
          <el-icon style="margin-right: 2px">
            <Plus />
          </el-icon>
          {{ tag.name }}
        </el-tag>
        <span v-if="availableTagsToAdd.length === 0" class="empty-text">
          {{ loading ? '加载中...' : '没有可添加的标签' }}
        </span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Star, Plus } from '@element-plus/icons-vue'

interface Tag {
  id: number
  name: string
  color: string
}

interface User {
  id: number
  tags?: Tag[]
}

interface Props {
  modelValue: boolean
  user: User | null
  availableTags: Tag[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'add-tag': [userId: number, tagId: number]
  'remove-tag': [userId: number, tagId: number]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 用户当前标签
const userTags = computed(() => props.user?.tags || [])

// 可添加的标签（排除已有标签）
const availableTagsToAdd = computed(() => {
  const userTagIds = userTags.value.map((tag) => tag.id)
  return props.availableTags.filter((tag) => !userTagIds.includes(tag.id))
})
</script>

<style scoped>
h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.current-tags,
.available-tags {
  min-height: 40px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.empty-text {
  color: #909399;
  font-size: 14px;
}

.el-divider {
  margin: 20px 0;
}
</style>
