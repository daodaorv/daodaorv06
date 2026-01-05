<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <PageHeader
      :title="`配置角色权益 - ${roleInfo?.name || ''}`"
      description="配置用户角色的权益内容、分润规则和自动分配条件"
      show-back
    />

    <!-- 配置表单 -->
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>权益配置</span>
          <el-button type="primary" @click="handleSave">保存配置</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px">
        <!-- 基础权益配置 -->
        <el-divider content-position="left">
          <el-icon><Setting /></el-icon>
          基础权益
        </el-divider>

        <el-form-item label="租车优惠折扣" prop="rentalDiscount">
          <el-input-number
            v-model="formData.rentalDiscount"
            :min="0"
            :max="100"
            :precision="1"
            :step="0.5"
          />
          <span class="form-tip">%（0表示无折扣，100表示免费）</span>
        </el-form-item>

        <el-form-item label="优先预订权" prop="priorityBooking">
          <el-switch v-model="formData.priorityBooking" />
          <span class="form-tip">开启后可优先预订热门车辆</span>
        </el-form-item>

        <el-form-item label="免费取消次数" prop="freeCancellations">
          <el-input-number
            v-model="formData.freeCancellations"
            :min="0"
            :max="99"
          />
          <span class="form-tip">次/月</span>
        </el-form-item>

        <el-form-item label="积分倍率" prop="pointsMultiplier">
          <el-input-number
            v-model="formData.pointsMultiplier"
            :min="1"
            :max="10"
            :precision="1"
            :step="0.1"
          />
          <span class="form-tip">倍（消费积分倍数）</span>
        </el-form-item>

        <!-- 分润配置 -->
        <el-divider content-position="left">
          <el-icon><Money /></el-icon>
          分润配置
        </el-divider>

        <el-form-item label="启用分润" prop="profitEnabled">
          <el-switch v-model="formData.profitEnabled" />
          <span class="form-tip">是否参与平台分润</span>
        </el-form-item>

        <template v-if="formData.profitEnabled">
          <el-form-item label="推广分润比例" prop="promotionProfitRate">
            <el-input-number
              v-model="formData.promotionProfitRate"
              :min="0"
              :max="100"
              :precision="1"
              :step="0.5"
            />
            <span class="form-tip">%（推广用户消费的分润比例）</span>
          </el-form-item>

          <el-form-item label="托管收益分成" prop="hostingProfitRate">
            <el-input-number
              v-model="formData.hostingProfitRate"
              :min="0"
              :max="100"
              :precision="1"
              :step="1"
            />
            <span class="form-tip">%（托管车辆收益分成比例）</span>
          </el-form-item>

          <el-form-item label="众筹收益分成" prop="crowdfundingProfitRate">
            <el-input-number
              v-model="formData.crowdfundingProfitRate"
              :min="0"
              :max="100"
              :precision="1"
              :step="1"
            />
            <span class="form-tip">%（众筹项目收益分成比例）</span>
          </el-form-item>
        </template>

        <!-- 自动分配规则 -->
        <el-divider content-position="left">
          <el-icon><MagicStick /></el-icon>
          自动分配规则
        </el-divider>

        <el-form-item label="启用自动分配" prop="autoAssignEnabled">
          <el-switch v-model="formData.autoAssignEnabled" />
          <span class="form-tip">满足条件时自动分配此角色</span>
        </el-form-item>

        <template v-if="formData.autoAssignEnabled">
          <el-form-item label="分配条件类型" prop="assignConditionType">
            <el-radio-group v-model="formData.assignConditionType">
              <el-radio value="payment">付费购买</el-radio>
              <el-radio value="behavior">行为触发</el-radio>
              <el-radio value="manual">仅手动分配</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            v-if="formData.assignConditionType === 'payment'"
            label="付费金额"
            prop="paymentAmount"
          >
            <el-input-number
              v-model="formData.paymentAmount"
              :min="0"
              :precision="2"
            />
            <span class="form-tip">元/年</span>
          </el-form-item>

          <el-form-item
            v-if="formData.assignConditionType === 'behavior'"
            label="触发行为"
            prop="triggerBehavior"
          >
            <el-select v-model="formData.triggerBehavior" placeholder="请选择触发行为">
              <el-option label="完成托管申请" value="hosting_completed" />
              <el-option label="完成购车托管" value="purchase_completed" />
              <el-option label="参与众筹项目" value="crowdfunding_joined" />
              <el-option label="累计消费达标" value="consumption_reached" />
            </el-select>
          </el-form-item>

          <el-form-item label="有效期" prop="validityPeriod">
            <el-input-number
              v-model="formData.validityPeriod"
              :min="0"
            />
            <span class="form-tip">天（0表示永久有效）</span>
          </el-form-item>
        </template>

        <!-- 其他配置 -->
        <el-divider content-position="left">
          <el-icon><More /></el-icon>
          其他配置
        </el-divider>

        <el-form-item label="角色说明" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入角色说明，将在小程序端展示给用户"
          />
        </el-form-item>

        <el-form-item label="权益说明" prop="benefitsDescription">
          <el-input
            v-model="formData.benefitsDescription"
            type="textarea"
            :rows="6"
            placeholder="请输入权益说明，每行一条权益"
          />
          <span class="form-tip">每行一条权益，将在小程序端展示</span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, Money, MagicStick, More } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { useErrorHandler } from '@/composables'

const route = useRoute()
const router = useRouter()
const { handleApiError } = useErrorHandler()

// 角色信息
const roleInfo = ref<any>(null)

// 表单数据
const formData = reactive({
  // 基础权益
  rentalDiscount: 0,
  priorityBooking: false,
  freeCancellations: 0,
  pointsMultiplier: 1,

  // 分润配置
  profitEnabled: false,
  promotionProfitRate: 0,
  hostingProfitRate: 0,
  crowdfundingProfitRate: 0,

  // 自动分配规则
  autoAssignEnabled: false,
  assignConditionType: 'manual',
  paymentAmount: 0,
  triggerBehavior: '',
  validityPeriod: 0,

  // 其他配置
  description: '',
  benefitsDescription: '',
})

// 表单验证规则
const formRules = {
  rentalDiscount: [
    { required: true, message: '请输入租车优惠折扣', trigger: 'blur' },
  ],
  paymentAmount: [
    { required: true, message: '请输入付费金额', trigger: 'blur' },
  ],
  triggerBehavior: [
    { required: true, message: '请选择触发行为', trigger: 'change' },
  ],
}

const formRef = ref()

// 加载角色信息
onMounted(async () => {
  const roleId = route.query.roleId
  if (!roleId) {
    ElMessage.error('缺少角色ID参数')
    router.back()
    return
  }

  try {
    // 模拟加载角色信息
    roleInfo.value = {
      id: roleId,
      name: 'PLUS用户',
      code: 'plus',
    }

    // 模拟加载配置数据
    Object.assign(formData, {
      rentalDiscount: 9.5,
      priorityBooking: true,
      freeCancellations: 3,
      pointsMultiplier: 2,
      profitEnabled: true,
      promotionProfitRate: 5,
      hostingProfitRate: 0,
      crowdfundingProfitRate: 0,
      autoAssignEnabled: true,
      assignConditionType: 'payment',
      paymentAmount: 99,
      validityPeriod: 365,
      description: 'PLUS会员享受更多优惠和特权',
      benefitsDescription: '9.5折租车优惠\n优先预订热门车辆\n每月3次免费取消\n双倍积分奖励\n5%推广分润',
    })
  } catch (error) {
    handleApiError(error, '加载角色信息失败')
  }
})

// 保存配置
async function handleSave() {
  try {
    await formRef.value?.validate()

    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('保存成功')
  } catch (error) {
    if (error !== false) {
      handleApiError(error, '保存失败')
    }
  }
}
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.config-card {
  margin-top: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.form-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

:deep(.el-divider) {
  margin: 30px 0 20px;

  .el-divider__text {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #303133;
  }
}
</style>
