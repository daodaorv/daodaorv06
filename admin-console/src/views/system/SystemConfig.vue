<template>
  <div class="page-container">
    <PageHeader title="系统配置" description="管理平台基础配置与业务规则" />

    <el-card class="tabs-card" shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础配置" name="basic">
          <BasicConfig />
        </el-tab-pane>
        <el-tab-pane label="业务规则" name="business">
          <BusinessRules />
        </el-tab-pane>
        <el-tab-pane label="支付配置" name="payment">
          <PaymentConfig />
        </el-tab-pane>
        <el-tab-pane label="通知配置" name="notification">
          <NotificationConfig />
        </el-tab-pane>
        <el-tab-pane label="第三方服务" name="thirdparty">
          <ThirdPartyConfig />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import BasicConfig from './components/BasicConfig.vue'
import BusinessRules from './components/BusinessRules.vue'
import PaymentConfig from './components/PaymentConfig.vue'
import NotificationConfig from './components/NotificationConfig.vue'
import ThirdPartyConfig from './components/ThirdPartyConfig.vue'

type TabName = 'basic' | 'business' | 'payment' | 'notification' | 'thirdparty'
const activeTab = ref<TabName>('basic')
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);

  .tabs-card {
    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
    }
  }
}
</style>
