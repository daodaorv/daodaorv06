<template>
  <div class="page-container">
    <!-- 错误内容 -->
    <div class="error-content">
      <div class="error-icon">
        <el-icon size="120" color="#409eff">
          <WarningFilled />
        </el-icon>
      </div>
      <h3 class="error-title">抱歉，您访问的页面不存在</h3>
      <div class="error-actions">
        <el-button type="primary" @click="$router.push('/dashboard')"> 返回工作台 </el-button>
        <el-button @click="$router.go(-1)"> 返回上页 </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404页面组件
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

  .error-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    .error-icon {
      margin-bottom: 20px;
    }

    .error-title {
      font-size: 18px;
      color: #909399;
      margin-bottom: 32px;
    }

    .error-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
  }
}
</style>
