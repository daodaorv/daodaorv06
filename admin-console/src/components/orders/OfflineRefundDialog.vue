<template>
  <el-dialog
    v-model="visible"
    title="线下退款登记"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
      <!-- 退款信息 -->
      <el-card class="info-card" shadow="never">
        <template #header><span class="card-title">退款信息</span></template>
        <el-descriptions :column="2" size="small">
          <el-descriptions-item label="退款单号">
            {{ refundInfo?.refundNo }}
          </el-descriptions-item>
          <el-descriptions-item label="应退金额">
            <span class="amount-text">¥{{ refundInfo?.amount?.toFixed(2) || '0.00' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="订单号" :span="2">
            {{ refundInfo?.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="用户姓名" :span="2">
            {{ refundInfo?.userName }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 线下退款方式 -->
      <el-form-item label="退款方式" prop="method">
        <el-select v-model="form.method" placeholder="请选择线下退款方式" style="width: 100%">
          <el-option label="银行转账" value="bank_transfer">
            <div class="option-content">
              <span>银行转账</span>
              <span class="option-desc">通过银行转账退款</span>
            </div>
          </el-option>
          <el-option label="现金退款" value="cash">
            <div class="option-content">
              <span>现金退款</span>
              <span class="option-desc">现场现金退款</span>
            </div>
          </el-option>
          <el-option label="支票退款" value="check">
            <div class="option-content">
              <span>支票退款</span>
              <span class="option-desc">开具支票退款</span>
            </div>
          </el-option>
          <el-option label="其他方式" value="other">
            <div class="option-content">
              <span>其他方式</span>
              <span class="option-desc">其他线下退款方式</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 实际退款金额 -->
      <el-form-item label="实际退款金额" prop="actualAmount">
        <el-input-number
          v-model="form.actualAmount"
          :min="0"
          :max="refundInfo?.amount || 999999"
          :precision="2"
          placeholder="请输入实际退款金额"
          style="width: 100%"
        >
          <template #append>元</template>
        </el-input-number>
        <div class="field-tip">应退金额：¥{{ refundInfo?.amount?.toFixed(2) || '0.00' }}</div>
      </el-form-item>

      <!-- 银行转账信息 -->
      <template v-if="form.method === 'bank_transfer'">
        <el-form-item label="转账银行" prop="bankName">
          <el-input v-model="form.bankName" placeholder="请输入转账银行名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="转账账号" prop="accountNumber">
          <el-input v-model="form.accountNumber" placeholder="请输入转账账号" maxlength="30" />
        </el-form-item>
        <el-form-item label="转账流水号" prop="transactionNo">
          <el-input v-model="form.transactionNo" placeholder="请输入转账流水号" maxlength="50" />
        </el-form-item>
      </template>

      <!-- 支票信息 -->
      <template v-if="form.method === 'check'">
        <el-form-item label="支票号码" prop="checkNumber">
          <el-input v-model="form.checkNumber" placeholder="请输入支票号码" maxlength="30" />
        </el-form-item>
        <el-form-item label="开票银行" prop="bankName">
          <el-input v-model="form.bankName" placeholder="请输入开票银行名称" maxlength="50" />
        </el-form-item>
      </template>

      <!-- 其他方式说明 -->
      <template v-if="form.method === 'other'">
        <el-form-item label="方式说明" prop="methodDescription">
          <el-input
            v-model="form.methodDescription"
            type="textarea"
            :rows="3"
            placeholder="请详细说明退款方式"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </template>

      <!-- 退款凭证 -->
      <el-form-item label="退款凭证" prop="vouchers">
        <div class="upload-section">
          <div class="upload-tip">请上传退款凭证（转账记录、收据等）</div>
          <el-upload
            v-model:file-list="form.vouchers"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="5"
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </div>
      </el-form-item>

      <!-- 完成时间 -->
      <el-form-item label="完成时间" prop="completedAt">
        <el-date-picker
          v-model="form.completedAt"
          type="datetime"
          placeholder="请选择退款完成时间"
          style="width: 100%"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>

      <!-- 经办人 -->
      <el-form-item label="经办人" prop="operator">
        <el-input v-model="form.operator" placeholder="请输入经办人姓名" maxlength="20" />
      </el-form-item>

      <!-- 备注说明 -->
      <el-form-item label="备注说明" prop="note">
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="4"
          placeholder="请输入备注说明（选填）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 风险提示 -->
      <el-alert title="重要提示" type="warning" :closable="false" show-icon>
        <template #default>
          <ul class="tips-list">
            <li>请确保退款凭证真实有效</li>
            <li>线下退款记录将被永久保存</li>
            <li>请妥善保管退款凭证原件</li>
            <li>如有疑问请联系财务部门确认</li>
          </ul>
        </template>
      </el-alert>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit"> 确认登记 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// Props
interface Props {
  modelValue: boolean
  refundInfo: any
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  refundInfo: null,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: any]
}>()

// 响应式数据
const visible = ref(props.modelValue)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  method: '',
  actualAmount: 0,
  bankName: '',
  accountNumber: '',
  transactionNo: '',
  checkNumber: '',
  methodDescription: '',
  vouchers: [] as any[],
  completedAt: '',
  operator: '',
  note: '',
})

// 表单验证规则
const formRules: FormRules = {
  method: [{ required: true, message: '请选择退款方式', trigger: 'change' }],
  actualAmount: [
    { required: true, message: '请输入实际退款金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '退款金额必须大于0', trigger: 'blur' },
  ],
  bankName: [{ required: true, message: '请输入银行名称', trigger: 'blur' }],
  accountNumber: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  transactionNo: [{ required: true, message: '请输入流水号', trigger: 'blur' }],
  checkNumber: [{ required: true, message: '请输入支票号码', trigger: 'blur' }],
  methodDescription: [
    { required: true, message: '请说明退款方式', trigger: 'blur' },
    { min: 10, message: '说明至少10个字符', trigger: 'blur' },
  ],
  completedAt: [{ required: true, message: '请选择完成时间', trigger: 'change' }],
  operator: [
    { required: true, message: '请输入经办人', trigger: 'blur' },
    { min: 2, max: 20, message: '经办人姓名为2-20个字符', trigger: 'blur' },
  ],
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  val => {
    visible.value = val
    if (val && props.refundInfo) {
      // 初始化实际退款金额为应退金额
      form.actualAmount = props.refundInfo.amount || 0
    }
  }
)

watch(visible, val => {
  emit('update:modelValue', val)
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  // 检查是否上传凭证
  if (form.vouchers.length === 0) {
    ElMessage.warning('请上传至少一张退款凭证')
    return
  }

  await formRef.value.validate(async valid => {
    if (!valid) return

    loading.value = true
    try {
      const submitData: any = {
        refundId: props.refundInfo?.id,
        method: form.method,
        actualAmount: form.actualAmount,
        vouchers: form.vouchers.map(file => file.url || URL.createObjectURL(file.raw)),
        completedAt: form.completedAt,
        operator: form.operator,
        note: form.note,
      }

      // 根据不同的退款方式添加对应的信息
      if (form.method === 'bank_transfer') {
        submitData.transferInfo = {
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          transactionNo: form.transactionNo,
        }
      } else if (form.method === 'check') {
        submitData.checkInfo = {
          checkNumber: form.checkNumber,
          bankName: form.bankName,
        }
      } else if (form.method === 'other') {
        submitData.methodDescription = form.methodDescription
      }

      emit('submit', submitData)
      ElMessage.success('线下退款登记成功')
      handleClose()
    } catch (error) {
      console.error('线下退款登记失败:', error)
      ElMessage.error('线下退款登记失败，请重试')
    } finally {
      loading.value = false
    }
  })
}

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields()
  form.method = ''
  form.actualAmount = 0
  form.bankName = ''
  form.accountNumber = ''
  form.transactionNo = ''
  form.checkNumber = ''
  form.methodDescription = ''
  form.vouchers = []
  form.completedAt = ''
  form.operator = ''
  form.note = ''
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

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .option-desc {
    color: #909399;
    font-size: 12px;
  }
}

.upload-section {
  .upload-tip {
    margin-bottom: 10px;
    color: #909399;
    font-size: 12px;
  }
}

.field-tip {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
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

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}
</style>
