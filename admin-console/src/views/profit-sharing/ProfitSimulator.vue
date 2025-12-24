<template>
  <div class="profit-simulator-container">
    <el-page-header @back="$router.back()" class="page-header">
      <template #content>
        <span class="page-title">分润模拟器</span>
      </template>
    </el-page-header>

    <el-alert
      title="模拟器说明"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <p>输入订单参数，实时模拟分润计算结果，验证分润规则配置和总额平衡</p>
    </el-alert>

    <el-row :gutter="20">
      <!-- 左侧：输入参数 -->
      <el-col :span="10">
        <el-card class="input-card">
          <template #header>
            <div class="card-header">
              <span>输入参数</span>
              <el-button type="primary" size="small" @click="handleSimulate" :loading="simulating">
                开始模拟
              </el-button>
            </div>
          </template>

          <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
            <el-form-item label="产品类型" prop="productType">
              <el-select v-model="formData.productType" placeholder="请选择">
                <el-option label="房车租赁" value="vehicle_rental" />
                <el-option label="营地产品" value="campsite" />
                <el-option label="房车旅游" value="tour" />
              </el-select>
            </el-form-item>

            <el-form-item label="订单金额" prop="orderAmount">
              <el-input-number v-model="formData.orderAmount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>

            <el-form-item label="直接成本" prop="directCost">
              <el-input-number v-model="formData.directCost" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>

            <el-divider />

            <!-- 房车租赁特有参数 -->
            <template v-if="formData.productType === 'vehicle_rental'">
              <el-form-item label="托管类型">
                <el-select v-model="formData.hostingType" placeholder="请选择">
                  <el-option label="自有车托管" value="own_car" />
                  <el-option label="购车托管" value="new_car" />
                  <el-option label="众筹托管" value="crowdfunding" />
                </el-select>
              </el-form-item>
            </template>

            <!-- 营地产品特有参数 -->
            <template v-if="formData.productType === 'campsite'">
              <el-form-item label="合作类型">
                <el-select v-model="formData.cooperationType" placeholder="请选择">
                  <el-option label="地面合作" value="ground_cooperation" />
                  <el-option label="场地租赁" value="venue_rental" />
                </el-select>
              </el-form-item>
              <el-form-item label="捆绑销售">
                <el-switch v-model="formData.isBundled" />
              </el-form-item>
            </template>

            <!-- 旅游产品特有参数 -->
            <template v-if="formData.productType === 'tour'">
              <el-form-item label="产品类型">
                <el-select v-model="formData.tourProductType" placeholder="请选择">
                  <el-option label="自驾线路" value="self_drive" />
                  <el-option label="管家路线" value="butler_route" />
                </el-select>
              </el-form-item>
              <el-form-item label="评分">
                <el-rate v-model="formData.rating" show-score />
              </el-form-item>
              <el-form-item label="众筹模式">
                <el-switch v-model="formData.isCrowdfunding" />
              </el-form-item>
            </template>

            <el-divider />

            <el-form-item label="有推广者">
              <el-switch v-model="formData.hasPromoter" />
            </el-form-item>

            <template v-if="formData.hasPromoter">
              <el-form-item label="推广级别">
                <el-radio-group v-model="formData.promotionLevel">
                  <el-radio :value="1">一级推广</el-radio>
                  <el-radio :value="2">二级推广</el-radio>
                </el-radio-group>
              </el-form-item>
            </template>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：模拟结果 -->
      <el-col :span="14">
        <el-card class="result-card">
          <template #header>
            <div class="card-header">
              <span>模拟结果</span>
              <el-tag v-if="result" :type="result.isBalanced ? 'success' : 'danger'">
                {{ result.isBalanced ? '总额平衡' : '总额不平衡' }}
              </el-tag>
            </div>
          </template>

          <div v-if="!result" class="empty-result">
            <el-empty description="请输入参数并点击「开始模拟」" />
          </div>

          <div v-else class="result-content">
            <!-- 利润概览 -->
            <div class="profit-overview">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="订单利润">
                  <span class="profit-value">¥{{ formatNumber(result.orderProfit) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="总分配金额">
                  <span class="profit-value">¥{{ formatNumber(result.totalDistributed) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="平台利润">
                  <span class="profit-value platform">¥{{ formatNumber(result.platformProfit) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="平衡状态">
                  <el-tag :type="result.isBalanced ? 'success' : 'danger'">
                    {{ result.isBalanced ? '平衡' : '不平衡' }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 分润明细 -->
            <div class="profit-details">
              <h4>分润明细</h4>
              <el-table :data="result.profitRecords" border stripe>
                <el-table-column prop="recipientName" label="接收者" width="150" />
                <el-table-column prop="recipientType" label="类型" width="120" />
                <el-table-column prop="ratio" label="比例" width="100" align="right">
                  <template #default="{ row }">{{ row.ratio }}%</template>
                </el-table-column>
                <el-table-column prop="profitAmount" label="分润金额" width="120" align="right">
                  <template #default="{ row }">
                    <span style="color: #f56c6c; font-weight: bold">¥{{ formatNumber(row.profitAmount) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="说明" min-width="200" />
              </el-table>
            </div>

            <!-- 应用规则 -->
            <div class="applied-rules">
              <h4>应用规则</h4>
              <el-timeline>
                <el-timeline-item
                  v-for="(rule, index) in result.appliedRules"
                  :key="index"
                  :timestamp="rule"
                  placement="top"
                >
                  {{ rule }}
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { ProfitSimulatorInput, ProfitSimulatorOutput } from '@/types/profit'
import { simulateProfit } from '@/api/profit'

const simulating = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive<ProfitSimulatorInput>({
  productType: 'vehicle_rental',
  orderAmount: 5000,
  directCost: 1500,
  hasPromoter: false,
  isBundled: false,
  isCrowdfunding: false,
})

const formRules: FormRules = {
  productType: [{ required: true, message: '请选择产品类型', trigger: 'change' }],
  orderAmount: [{ required: true, message: '请输入订单金额', trigger: 'blur' }],
  directCost: [{ required: true, message: '请输入直接成本', trigger: 'blur' }],
}

const result = ref<ProfitSimulatorOutput | null>(null)

const handleSimulate = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    simulating.value = true
    try {
      const res = await simulateProfit(formData)
      result.value = res.data
      ElMessage.success('模拟计算完成')
    } catch (error) {
      console.error('模拟失败:', error)
      ElMessage.error('模拟失败')
    } finally {
      simulating.value = false
    }
  })
}

const formatNumber = (num: number) => num.toFixed(2)
</script>

<style scoped lang="scss">
.profit-simulator-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
    background: #fff;
    padding: 16px 20px;
    border-radius: 4px;

    .page-title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .input-card {
    height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .result-card {
    height: calc(100vh - 200px);
    overflow-y: auto;

    .empty-result {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 400px;
    }

    .result-content {
      .profit-overview {
        margin-bottom: 30px;

        .profit-value {
          font-size: 18px;
          font-weight: 600;
          color: #f56c6c;

          &.platform {
            color: #409eff;
          }
        }
      }

      .profit-details {
        margin-bottom: 30px;

        h4 {
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
        }
      }

      .applied-rules {
        h4 {
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
