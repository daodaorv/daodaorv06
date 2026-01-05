<template>
  <div class="page-container">
    <PageHeader title="用户详情" description="查看用户基础信息" :show-back="true" />
    <ComingSoon />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/common/PageHeader.vue'
import ComingSoon from '@/views/common/ComingSoon.vue'
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}
</style>

