<template>
  <div class="page-container">
    <!-- 内容区 -->
    <div class="coming-soon-content">
      <el-icon :size="120" color="#409eff">
        <Tools />
      </el-icon>
      <h3>功能开发中</h3>
      <p>该功能正在开发中，敬请期待...</p>
      <el-button type="primary" @click="goBack">返回上一页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;

  .page-description {
        font-size: 14px;
        color: #909399;
        margin: 0;
      }

  .coming-soon-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    h3 {
      margin: 24px 0 12px;
      font-size: 28px;
      font-weight: 600;
      color: #303133;
    }

    p {
      margin: 0 0 32px;
      font-size: 16px;
      color: #909399;
    }
  }
}
</style>
