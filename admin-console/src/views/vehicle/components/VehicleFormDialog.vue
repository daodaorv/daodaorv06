<template>
  <FormDialog
    v-model="visible"
    :title="title"
    :fields="formFields"
    :form-data="formData"
    :rules="formRules"
    :loading="loading"
    @submit="$emit('submit')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FormDialog from '@/components/common/FormDialog.vue'
import type { FormField } from '@/components/common/FormDialog.vue'

interface Props {
  modelValue: boolean
  title: string
  formData: {
    id: number
    vehicleNumber: string
    modelId: number
    modelName: string
    ownershipType: string
    storeId: number
    status: string
    purchaseDate: string
    mileage: number
    insuranceExpiry: string
    maintenanceExpiry: string
  }
  loading: boolean
  isEdit: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 表单字段配置
const formFields = computed<FormField[]>(() => [
  {
    prop: 'vehicleNumber',
    label: '车牌号',
    type: 'input',
    placeholder: '请输入车牌号',
    required: true,
  },
  {
    prop: 'modelName',
    label: '车型',
    type: 'input',
    placeholder: '请输入车型',
    required: true,
  },
  {
    prop: 'ownershipType',
    label: '所有权类型',
    type: 'select',
    options: [
      { label: '平台自有', value: 'platform' },
      { label: '房东托管', value: 'hosting' },
      { label: '合作伙伴', value: 'cooperative' },
    ],
    required: true,
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '可用', value: 'available' },
      { label: '已租出', value: 'rented' },
      { label: '维护中', value: 'maintenance' },
      { label: '已下线', value: 'offline' },
    ],
    required: true,
  },
  {
    prop: 'mileage',
    label: '里程(km)',
    type: 'number',
    placeholder: '请输入里程',
  },
  {
    prop: 'purchaseDate',
    label: '购买日期',
    type: 'date',
    placeholder: '请选择购买日期',
  },
  {
    prop: 'insuranceExpiry',
    label: '保险到期日',
    type: 'date',
    placeholder: '请选择保险到期日',
  },
  {
    prop: 'maintenanceExpiry',
    label: '保养到期日',
    type: 'date',
    placeholder: '请选择保养到期日',
  },
])

// 表单验证规则
const formRules = {
  vehicleNumber: [
    { required: true, message: '请输入车牌号', trigger: 'blur' },
  ],
  modelName: [
    { required: true, message: '请输入车型', trigger: 'blur' },
  ],
  ownershipType: [
    { required: true, message: '请选择所有权类型', trigger: 'change' },
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' },
  ],
}
</script>
