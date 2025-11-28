<template>
  <div class="vehicle-form">
    <div class="page-card">
      <div class="card-header">
        <h2>{{ isEdit ? '编辑车辆' : '添加车辆' }}</h2>
      </div>
      <div class="card-content">
        <p>车辆表单页面正在开发中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isEdit = computed(() => !!route.params.id)
</script>

<style scoped>
.vehicle-form {
  padding: 20px;
}
.card-header {
  margin-bottom: 20px;
}
.card-header h2 {
  margin: 0;
}
</style>