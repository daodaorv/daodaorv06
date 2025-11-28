<template>
  <div class="vehicle-list">
    <div class="page-card">
      <div class="card-header">
        <h2>车辆管理</h2>
        <el-button type="primary" @click="$router.push('/vehicles/create')">
          <el-icon><Plus /></el-icon>
          添加车辆
        </el-button>
      </div>
      <div class="card-content">
        <p>车辆列表页面正在开发中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 车辆列表页面
</script>

<style scoped>
.vehicle-list {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.card-header h2 {
  margin: 0;
}
</style>