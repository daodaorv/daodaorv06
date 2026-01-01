<template>
  <div class="contract-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>合作协议</span>
          <el-button-group>
            <el-button type="primary" :icon="DocumentAdd" @click="handleCreateElectronic">
              电子签署
            </el-button>
            <el-button type="success" :icon="Upload" @click="handleUploadScanned">
              上传扫描件
            </el-button>
          </el-button-group>
        </div>
      </template>

      <el-table :data="contracts" border v-loading="loading">
        <el-table-column prop="contractNo" label="合同编号" width="150" />
        <el-table-column prop="contractName" label="合同名称" min-width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'electronic' ? 'primary' : 'success'">
              {{ row.type === 'electronic' ? '电子签署' : '扫描件' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="生效日期" width="120" />
        <el-table-column prop="endDate" label="到期日期" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 电子签署对话框（简化版） -->
    <el-dialog
      v-model="electronicDialogVisible"
      title="发起电子签署"
      width="600px"
      @close="handleElectronicDialogClose"
    >
      <el-form
        ref="electronicFormRef"
        :model="electronicForm"
        :rules="electronicFormRules"
        label-width="100px"
      >
        <el-form-item label="合同名称" prop="contractName">
          <el-input v-model="electronicForm.contractName" placeholder="请输入合同名称" />
        </el-form-item>

        <el-form-item label="合同编号" prop="contractNo">
          <el-input v-model="electronicForm.contractNo" placeholder="请输入合同编号" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生效日期" prop="startDate">
              <el-date-picker
                v-model="electronicForm.startDate"
                type="date"
                placeholder="选择生效日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期日期" prop="endDate">
              <el-date-picker
                v-model="electronicForm.endDate"
                type="date"
                placeholder="选择到期日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="electronicDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="electronicSubmitLoading"
          @click="handleElectronicSubmit"
        >
          发起签署
        </el-button>
      </template>
    </el-dialog>

    <!-- 扫描件上传对话框 -->
    <el-dialog
      v-model="scannedDialogVisible"
      title="上传合同扫描件"
      width="600px"
      @close="handleScannedDialogClose"
    >
      <el-form
        ref="scannedFormRef"
        :model="scannedForm"
        :rules="scannedFormRules"
        label-width="100px"
      >
        <el-form-item label="合同名称" prop="contractName">
          <el-input v-model="scannedForm.contractName" placeholder="请输入合同名称" />
        </el-form-item>

        <el-form-item label="合同编号" prop="contractNo">
          <el-input v-model="scannedForm.contractNo" placeholder="请输入合同编号" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="签署日期" prop="signDate">
              <el-date-picker
                v-model="scannedForm.signDate"
                type="date"
                placeholder="选择签署日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生效日期" prop="startDate">
              <el-date-picker
                v-model="scannedForm.startDate"
                type="date"
                placeholder="选择生效日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="到期日期" prop="endDate">
          <el-date-picker
            v-model="scannedForm.endDate"
            type="date"
            placeholder="选择到期日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="合同文件" prop="file">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            accept=".pdf,.jpg,.jpeg,.png"
            drag
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持 PDF、JPG、PNG 格式，文件大小不超过 10MB</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="scannedForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="scannedDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="scannedSubmitLoading" @click="handleScannedSubmit">
          确定上传
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
  type UploadFile,
} from 'element-plus'
import { DocumentAdd, Upload, UploadFilled } from '@element-plus/icons-vue'
import {
  getSupplierContracts,
  createElectronicContract,
  uploadScannedContract,
  deleteContract,
  downloadContract,
  type SupplierContract,
} from '@/api/supplier'
import { uploadContractFile } from '@/api/upload'
import { CONTRACT_STATUS_TEXT, CONTRACT_STATUS_TYPE } from '@/types/supplier'

interface Props {
  supplierId: number
}

const props = defineProps<Props>()

const contracts = ref<SupplierContract[]>([])
const loading = ref(false)

// 电子签署对话框
const electronicDialogVisible = ref(false)
const electronicFormRef = ref<FormInstance>()
const electronicSubmitLoading = ref(false)
const electronicForm = ref({
  contractName: '',
  contractNo: '',
  startDate: '',
  endDate: '',
})

const electronicFormRules: FormRules = {
  contractName: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
  contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }],
}

// 扫描件上传对话框
const scannedDialogVisible = ref(false)
const scannedFormRef = ref<FormInstance>()
const scannedSubmitLoading = ref(false)
const uploadRef = ref()
const uploadedFile = ref<UploadFile | null>(null)
const scannedForm = ref({
  contractName: '',
  contractNo: '',
  signDate: '',
  startDate: '',
  endDate: '',
  remark: '',
})

const scannedFormRules: FormRules = {
  contractName: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
  contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
  signDate: [{ required: true, message: '请选择签署日期', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }],
}

// 获取合作协议列表
async function fetchContracts() {
  loading.value = true
  try {
    contracts.value = await getSupplierContracts(props.supplierId)
  } catch (error) {
    console.error('获取合作协议列表失败:', error)
    ElMessage.error('获取合作协议列表失败')
  } finally {
    loading.value = false
  }
}

// 获取状态文本
function getStatusText(status: string) {
  return CONTRACT_STATUS_TEXT[status as keyof typeof CONTRACT_STATUS_TEXT] || status
}

// 获取状态类型
function getStatusType(status: string) {
  return CONTRACT_STATUS_TYPE[status as keyof typeof CONTRACT_STATUS_TYPE] || 'info'
}

// 发起电子签署
function handleCreateElectronic() {
  electronicDialogVisible.value = true
}

// 上传扫描件
function handleUploadScanned() {
  scannedDialogVisible.value = true
}

// 查看协议
function handleView(row: SupplierContract) {
  ElMessage.info('查看协议功能开发中...')
}

// 下载协议
async function handleDownload(row: SupplierContract) {
  try {
    const blob = await downloadContract(row.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${row.contractName}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

// 删除协议
async function handleDelete(row: SupplierContract) {
  try {
    await ElMessageBox.confirm(`确定要删除协议"${row.contractName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteContract(row.id)
    ElMessage.success('删除成功')
    fetchContracts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交电子签署
async function handleElectronicSubmit() {
  if (!electronicFormRef.value) return

  try {
    await electronicFormRef.value.validate()
    electronicSubmitLoading.value = true

    await createElectronicContract({
      supplierId: props.supplierId,
      ...electronicForm.value,
      signers: [
        {
          name: '供应商代表',
          mobile: '13900139001',
          role: 'supplier',
          signOrder: 1,
        },
        {
          name: '公司代表',
          mobile: '13900139999',
          role: 'company',
          signOrder: 2,
        },
      ],
    })

    ElMessage.success('电子签署发起成功')
    electronicDialogVisible.value = false
    fetchContracts()
  } catch (error) {
    if (error !== false) {
      console.error('发起签署失败:', error)
      ElMessage.error('发起签署失败')
    }
  } finally {
    electronicSubmitLoading.value = false
  }
}

// 文件变化
function handleFileChange(file: UploadFile) {
  uploadedFile.value = file
}

// 提交扫描件上传
async function handleScannedSubmit() {
  if (!scannedFormRef.value) return
  if (!uploadedFile.value) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  try {
    await scannedFormRef.value.validate()
    scannedSubmitLoading.value = true

    // 上传文件
    const fileResult = await uploadContractFile(uploadedFile.value.raw!)

    // 创建扫描件合同
    await uploadScannedContract(props.supplierId, {
      ...scannedForm.value,
      scannedFileUrl: fileResult.url,
      scannedFileName: fileResult.fileName,
      scannedFileSize: fileResult.fileSize,
    })

    ElMessage.success('上传成功')
    scannedDialogVisible.value = false
    fetchContracts()
  } catch (error) {
    if (error !== false) {
      console.error('上传失败:', error)
      ElMessage.error('上传失败')
    }
  } finally {
    scannedSubmitLoading.value = false
  }
}

// 关闭电子签署对话框
function handleElectronicDialogClose() {
  electronicForm.value = {
    contractName: '',
    contractNo: '',
    startDate: '',
    endDate: '',
  }
  electronicFormRef.value?.clearValidate()
}

// 关闭扫描件上传对话框
function handleScannedDialogClose() {
  scannedForm.value = {
    contractName: '',
    contractNo: '',
    signDate: '',
    startDate: '',
    endDate: '',
    remark: '',
  }
  uploadedFile.value = null
  uploadRef.value?.clearFiles()
  scannedFormRef.value?.clearValidate()
}

onMounted(() => {
  fetchContracts()
})
</script>

<style scoped lang="scss">
.contract-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
