<template>
  <u-action-sheet
    :show="show"
    :actions="actions"
    title="分享到"
    :description="description"
    @select="handleSelect"
    @close="handleClose"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 分享面板组件
 * @description 基于 uView Plus 的 u-action-sheet 封装的分享选项面板
 */

interface Props {
  /** 是否显示 */
  show: boolean
  /** 分享描述 */
  description?: string
  /** 是否显示复制链接选项 */
  showCopyLink?: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'select', index: number): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  description: '选择分享方式',
  showCopyLink: true
})

const emit = defineEmits<Emits>()

/**
 * 分享选项配置
 * 注意：微信小程序限制，无法通过 JS 直接触发分享，只能通过右上角菜单或 button 的 open-type="share"
 */
const actions = computed(() => {
  const baseActions = [
    {
      id: 'poster',
      name: '生成海报',
      subname: '保存图片分享到朋友圈',
      icon: 'photo-fill',
      color: '#FFB84D'
    }
  ]

  if (props.showCopyLink) {
    baseActions.push({
      id: 'copy',
      name: '复制链接',
      subname: '复制小程序路径',
      icon: 'copy-fill',
      color: '#909399'
    })
  }

  return baseActions
})

/**
 * 处理选项选择
 */
const handleSelect = (item: unknown) => {
  let index: number

  // 如果直接是数字索引
  if (typeof item === 'number') {
    index = item
  }
  // 如果是对象，通过匹配 name 和 icon 找到索引
  else if (item && typeof item === 'object') {
    const itemObj = item as { name?: string; icon?: string }
    index = actions.value.findIndex(action =>
      action.name === itemObj.name && action.icon === itemObj.icon
    )

    if (index === -1) {
      return
    }
  }
  // 其他情况
  else {
    return
  }

  emit('select', index)
  emit('update:show', false)
}

/**
 * 处理关闭
 */
const handleClose = () => {
  emit('close')
  emit('update:show', false)
}
</script>

<style lang="scss" scoped>
.share-description {
  padding: 20rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #909399;
}
</style>
