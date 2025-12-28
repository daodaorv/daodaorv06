<template>
  <el-dialog
    v-model="visible"
    title="取车管理"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
      <!-- 订单信息 -->
      <el-card class="info-card" shadow="never">
        <template #header><span class="card-title">订单信息</span></template>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <span class="label">订单号：</span>
              <span class="value">{{ orderInfo?.orderNo }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="label">用户：</span>
              <span class="value">{{ orderInfo?.userName }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="label">车辆：</span>
              <span class="value">{{ orderInfo?.vehicleName }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 车辆状况检查 -->
      <el-card class="section-card" shadow="never">
        <template #header><span class="card-title">车辆状况检查</span></template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="当前里程" prop="vehicleCondition.mileage">
              <el-input-number
                v-model="form.vehicleCondition.mileage"
                :min="0"
                :max="999999"
                :precision="0"
                placeholder="请输入当前里程"
                style="width: 100%"
              >
                <template #append>公里</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="油量" prop="vehicleCondition.fuelLevel">
              <el-slider
                v-model="form.vehicleCondition.fuelLevel"
                :min="0"
                :max="100"
                :step="10"
                :marks="fuelMarks"
                show-stops
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 车辆照片上传 -->
        <el-form-item label="车辆外观照片" prop="vehicleCondition.exterior">
          <div class="upload-section">
            <div class="upload-tip">请拍摄车辆前、后、左、右四个角度的照片</div>
            <el-upload
              v-model:file-list="form.vehicleCondition.exterior"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :limit="4"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="车辆内饰照片" prop="vehicleCondition.interior">
          <div class="upload-section">
            <div class="upload-tip">请拍摄车辆内饰整体照片</div>
            <el-upload
              v-model:file-list="form.vehicleCondition.interior"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :limit="2"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="仪表盘照片" prop="vehicleCondition.dashboard">
          <div class="upload-section">
            <div class="upload-tip">请拍摄仪表盘清晰照片，确保里程数可见</div>
            <el-upload
              v-model:file-list="form.vehicleCondition.dashboard"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :limit="1"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </div>
        </el-form-item>
      </el-card>

      <!-- 随车物品检查 -->
      <el-card class="section-card" shadow="never">
        <template #header><span class="card-title">随车物品检查</span></template>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="备胎">
              <el-switch v-model="form.checklist.spareTire" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="工具箱">
              <el-switch v-model="form.checklist.toolbox" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="灭火器">
              <el-switch v-model="form.checklist.fireExtinguisher" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="急救包">
              <el-switch v-model="form.checklist.firstAidKit" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="三角警示牌">
              <el-switch v-model="form.checklist.warningTriangle" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="千斤顶">
              <el-switch v-model="form.checklist.jack" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="行驶证">
              <el-switch v-model="form.checklist.vehicleLicense" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="保险单">
              <el-switch v-model="form.checklist.insurancePolicy" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 客户签名确认 -->
      <el-card class="section-card" shadow="never">
        <template #header><span class="card-title">客户签名确认</span></template>

        <el-form-item label="客户签名" prop="customerSignature">
          <div class="signature-section">
            <div class="signature-canvas" @click="handleSignature">
              <el-icon v-if="!form.customerSignature" class="signature-icon"><Edit /></el-icon>
              <img v-else :src="form.customerSignature" alt="客户签名" class="signature-image" />
            </div>
            <div class="signature-tip">点击区域进行签名</div>
          </div>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（选填）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-card>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确认取车</el-button>
    </template>

    <!-- 签名对话框 -->
    <el-dialog
      v-model="signatureDialogVisible"
      title="客户签名"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="signature-pad-container">
        <canvas
          ref="signatureCanvas"
          class="signature-pad"
          width="550"
          height="300"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart="startDrawing"
          @touchmove="draw"
          @touchend="stopDrawing"
        />
      </div>
      <template #footer>
        <el-button @click="clearSignature">清除</el-button>
        <el-button @click="signatureDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSignature">保存签名</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit } from '@element-plus/icons-vue'

// Props
interface Props {
  modelValue: boolean
  orderInfo: any
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  orderInfo: null,
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
  vehicleCondition: {
    mileage: 0,
    fuelLevel: 100,
    exterior: [] as any[],
    interior: [] as any[],
    dashboard: [] as any[],
  },
  checklist: {
    spareTire: true,
    toolbox: true,
    fireExtinguisher: true,
    firstAidKit: true,
    warningTriangle: true,
    jack: true,
    vehicleLicense: true,
    insurancePolicy: true,
  },
  customerSignature: '',
  notes: '',
})

// 表单验证规则
const formRules: FormRules = {
  'vehicleCondition.mileage': [
    { required: true, message: '请输入当前里程', trigger: 'blur' },
    { type: 'number', min: 0, message: '里程数不能为负数', trigger: 'blur' },
  ],
  'vehicleCondition.fuelLevel': [{ required: true, message: '请选择油量', trigger: 'change' }],
  'vehicleCondition.exterior': [
    { required: true, message: '请上传车辆外观照片', trigger: 'change' },
    {
      validator: (rule: any, value: any[], callback: any) => {
        if (value.length < 4) {
          callback(new Error('请上传至少4张外观照片（前后左右）'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
  'vehicleCondition.dashboard': [
    { required: true, message: '请上传仪表盘照片', trigger: 'change' },
    {
      validator: (rule: any, value: any[], callback: any) => {
        if (value.length === 0) {
          callback(new Error('请上传仪表盘照片'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
  customerSignature: [{ required: true, message: '请获取客户签名', trigger: 'change' }],
}

// 油量标记
const fuelMarks = {
  0: '0%',
  25: '1/4',
  50: '1/2',
  75: '3/4',
  100: '满',
}

// 签名相关
const signatureDialogVisible = ref(false)
const signatureCanvas = ref<HTMLCanvasElement>()
const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  val => {
    visible.value = val
  }
)

watch(visible, val => {
  emit('update:modelValue', val)
})

// 打开签名板
const handleSignature = () => {
  signatureDialogVisible.value = true
}

// 开始绘制
const startDrawing = (e: MouseEvent | TouchEvent) => {
  isDrawing.value = true
  const canvas = signatureCanvas.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  if (e instanceof MouseEvent) {
    lastX.value = e.clientX - rect.left
    lastY.value = e.clientY - rect.top
  } else if (e instanceof TouchEvent && e.touches.length > 0) {
    lastX.value = e.touches[0].clientX - rect.left
    lastY.value = e.touches[0].clientY - rect.top
  }
}

// 绘制
const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value) return

  const canvas = signatureCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  let currentX = 0
  let currentY = 0

  if (e instanceof MouseEvent) {
    currentX = e.clientX - rect.left
    currentY = e.clientY - rect.top
  } else if (e instanceof TouchEvent && e.touches.length > 0) {
    e.preventDefault()
    currentX = e.touches[0].clientX - rect.left
    currentY = e.touches[0].clientY - rect.top
  }

  ctx.beginPath()
  ctx.moveTo(lastX.value, lastY.value)
  ctx.lineTo(currentX, currentY)
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.stroke()

  lastX.value = currentX
  lastY.value = currentY
}

// 停止绘制
const stopDrawing = () => {
  isDrawing.value = false
}

// 清除签名
const clearSignature = () => {
  const canvas = signatureCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

// 保存签名
const saveSignature = () => {
  const canvas = signatureCanvas.value
  if (!canvas) return

  // 检查是否有签名内容
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  let hasContent = false

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      hasContent = true
      break
    }
  }

  if (!hasContent) {
    ElMessage.warning('请先进行签名')
    return
  }

  form.customerSignature = canvas.toDataURL('image/png')
  signatureDialogVisible.value = false
  ElMessage.success('签名已保存')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (!valid) return

    loading.value = true
    try {
      // 构建提交数据
      const submitData = {
        orderId: props.orderInfo?.id,
        pickupTime: new Date().toISOString(),
        vehicleCondition: {
          mileage: form.vehicleCondition.mileage,
          fuelLevel: form.vehicleCondition.fuelLevel,
          exterior: form.vehicleCondition.exterior.map(
            file => file.url || URL.createObjectURL(file.raw)
          ),
          interior: form.vehicleCondition.interior.map(
            file => file.url || URL.createObjectURL(file.raw)
          ),
          dashboard: form.vehicleCondition.dashboard.map(
            file => file.url || URL.createObjectURL(file.raw)
          ),
        },
        checklist: form.checklist,
        customerSignature: form.customerSignature,
        notes: form.notes,
      }

      emit('submit', submitData)
      ElMessage.success('取车登记成功')
      handleClose()
    } catch (error) {
      console.error('取车登记失败:', error)
      ElMessage.error('取车登记失败，请重试')
    } finally {
      loading.value = false
    }
  })
}

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields()
  form.vehicleCondition.exterior = []
  form.vehicleCondition.interior = []
  form.vehicleCondition.dashboard = []
  form.customerSignature = ''
  form.notes = ''
  visible.value = false
}
</script>

<style scoped lang="scss">
.info-card,
.section-card {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.card-title {
  font-weight: 600;
  font-size: 14px;
}

.info-item {
  margin-bottom: 12px;

  .label {
    color: #909399;
    font-size: 14px;
  }

  .value {
    color: #303133;
    font-size: 14px;
    font-weight: 500;
  }
}

.upload-section {
  .upload-tip {
    margin-bottom: 10px;
    color: #909399;
    font-size: 12px;
  }
}

.signature-section {
  .signature-canvas {
    width: 300px;
    height: 150px;
    border: 2px dashed #dcdfe6;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.3s;

    &:hover {
      border-color: #409eff;
    }

    .signature-icon {
      font-size: 48px;
      color: #c0c4cc;
    }

    .signature-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }

  .signature-tip {
    margin-top: 8px;
    color: #909399;
    font-size: 12px;
  }
}

.signature-pad-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;

  .signature-pad {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: crosshair;
    background-color: #fff;
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-card__header) {
  padding: 12px 20px;
  background-color: #f5f7fa;
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
