<template>
  <el-dialog
    v-model="visible"
    title="切换退款方式"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="120px"
    >
      <!-- 退款信息 -->
      <el-card class="info-card" shadow="never">
        <template #header><span class="card-title">退款信息</span></template>
        <el-descriptions :column="2" size="small">
          <el-descriptions-item label="退款单号">
            {{ refundInfo?.refundNo }}
          </el-descriptions-item>
          <el-descriptions-item label="退款金额">
            <span class="amount-text">¥{{ refundInfo?.amount?.toFixed(2) || '0.00' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="当前方式" :span="2">
            <el-tag type="info" size="small">
              {{ getRefundMethodLabel(refundInfo?.method) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="失败原因" :span="2">
            <span class="error-text">{{ refundInfo?.failureReason || '-' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 新退款方式 -->
      <el-form-item label="新退款方式" prop="newMethod">
        <el-select v-model="form.newMethod" placeholder="请选择新的退款方式" style="width: 100%">
          <el-option label="原路退回" value="original">
            <div class="option-content">
              <span>原路退回</span>
              <span class="option-desc">退回到原支付账户</span>
            </div>
          </el-option>
          <el-option label="退到余额" value="balance">
            <div class="option-content">
              <span>退到余额</span>
              <span class="option-desc">退款到用户账户余额</span>
            </div>
          </el-option>
          <el-option label="银行卡" value="bank_card">
            <div class="option-content">
              <span>银行卡</span>
              <span class="option-desc">退款到指定银行卡</span>
            </div>
          </el-option>
          <el-option label="支付宝" value="alipay">
            <div class="option-content">
              <span>支付宝</span>
              <span class="option-desc">退款到支付宝账户</span>
            </div>
          </el-option>
          <el-option label="微信" value="wechat">
            <div class="option-content">
              <span>微信</span>
              <span class="option-desc">退款到微信账户</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 银行卡信息 -->
      <template v-if="form.newMethod === 'bank_card'">
        <el-form-item label="银行卡号" prop="bankCard">
          <el-input
            v-model="form.bankCard"
            placeholder="请输入银行卡号"
            maxlength="19"
          />
        </el-form-item>
        <el-form-item label="开户行" prop="bankName">
          <el-input
            v-model="form.bankName"
            placeholder="请输入开户行名称"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="持卡人姓名" prop="cardHolder">
          <el-input
            v-model="form.cardHolder"
            placeholder="请输入持卡人姓名"
            maxlength="20"
          />
        </el-form-item>
      </template>

      <!-- 支付宝信息 -->
      <template v-if="form.newMethod === 'alipay'">
        <el-form-item label="支付宝账号" prop="alipayAccount">
          <el-input
            v-model="form.alipayAccount"
            placeholder="请输入支付宝账号（手机号或邮箱）"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input
            v-model="form.realName"
            placeholder="请输入支付宝实名认证姓名"
            maxlength="20"
          />
        </el-form-item>
      </template>

      <!-- 微信信息 -->
      <template v-if="form.newMethod === 'wechat'">
        <el-form-item label="微信账号" prop="wechatAccount">
          <el-input
            v-model="form.wechatAccount"
            placeholder="请输入微信号或手机号"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input
            v-model="form.realName"
            placeholder="请输入微信实名认证姓名"
            maxlength="20"
          />
        </el-form-item>
      </template>

      <!-- 切换原因 -->
      <el-form-item label="切换原因" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          :rows="4"
          placeholder="请详细说明切换退款方式的原因"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 风险提示 -->
      <el-alert
        title="重要提示"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #default>
          <ul class="tips-list">
            <li>切换退款方式后将使用新方式重新发起退款</li>
            <li>请确保新的退款账户信息准确无误</li>
            <li>切换记录将被保存，可在退款历史中查看</li>
            <li>部分退款方式可能需要1-3个工作日到账</li>
          </ul>
        </template>
      </el-alert>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确认切换
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

// Props
interface Props {
  modelValue: boolean
  refundInfo: any
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  refundInfo: null
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: any]
}>()

// 响应式数据
const visible = ref(props.modelValue)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  newMethod: '',
  bankCard: '',
  bankName: '',
  cardHolder: '',
  alipayAccount: '',
  wechatAccount: '',
  realName: '',
  reason: ''
})

// 表单验证规则
const formRules: FormRules = {
  newMethod: [
    { required: true, message: '请选择新的退款方式', trigger: 'change' }
  ],
  bankCard: [
    { required: true, message: '请输入银行卡号', trigger: 'blur' },
    { pattern: /^\d{16,19}$/, message: '请输入正确的银行卡号', trigger: 'blur' }
  ],
  bankName: [
    { required: true, message: '请输入开户行名称', trigger: 'blur' }
  ],
  cardHolder: [
    { required: true, message: '请输入持卡人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度为2-20个字符', trigger: 'blur' }
  ],
  alipayAccount: [
    { required: true, message: '请输入支付宝账号', trigger: 'blur' },
    { pattern: /^(1[3-9]\d{9}|[\w.-]+@[\w.-]+\.\w+)$/, message: '请输入正确的手机号或邮箱', trigger: 'blur' }
  ],
  wechatAccount: [
    { required: true, message: '请输入微信账号', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度为2-20个字符', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入切换原因', trigger: 'blur' },
    { min: 10, message: '切换原因至少10个字符', trigger: 'blur' }
  ]
}

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 获取退款方式标签
const getRefundMethodLabel = (method: string) => {
  const labelMap: Record<string, string> = {
    original: '原路退回',
    balance: '退到余额',
    bank_card: '银行卡',
    alipay: '支付宝',
    wechat: '微信'
  }
  return labelMap[method] || method
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const submitData: any = {
        refundId: props.refundInfo?.id,
        fromMethod: props.refundInfo?.method,
        toMethod: form.newMethod,
        reason: form.reason
      }

      // 根据不同的退款方式添加对应的账户信息
      if (form.newMethod === 'bank_card') {
        submitData.accountInfo = {
          bankCard: form.bankCard,
          bankName: form.bankName,
          cardHolder: form.cardHolder
        }
      } else if (form.newMethod === 'alipay') {
        submitData.accountInfo = {
          alipayAccount: form.alipayAccount,
          realName: form.realName
        }
      } else if (form.newMethod === 'wechat') {
        submitData.accountInfo = {
          wechatAccount: form.wechatAccount,
          realName: form.realName
        }
      }

      emit('submit', submitData)
      ElMessage.success('退款方式切换成功')
      handleClose()
    } catch (error) {
      console.error('切换退款方式失败:', error)
      ElMessage.error('切换退款方式失败，请重试')
    } finally {
      loading.value = false
    }
  })
}

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields()
  form.newMethod = ''
  form.bankCard = ''
  form.bankName = ''
  form.cardHolder = ''
  form.alipayAccount = ''
  form.wechatAccount = ''
  form.realName = ''
  form.reason = ''
  visible.value = false
}
</script>

<style scoped lang="scss">
.info-card {
  margin-bottom: 20px;
}

.card-title {
  font-weight: 600;
  font-size: 14px;
}

.amount-text {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.error-text {
  color: #f56c6c;
  font-size: 13px;
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .option-desc {
    color: #909399;
    font-size: 12px;
  }
}

.tips-list {
  margin: 0;
  padding-left: 20px;

  li {
    margin-bottom: 8px;
    color: #606266;
    font-size: 13px;
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-card__header) {
  padding: 12px 20px;
  background-color: #f5f7fa;
}

:deep(.el-alert) {
  margin-top: 16px;
}
</style>
