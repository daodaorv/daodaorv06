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
import type { FormRules } from 'element-plus'

interface Props {
  modelValue: boolean
  title: string
  formData: {
    id: number
    username: string
    phone: string
    email: string
    password: string
    realName: string
    status: string
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
    prop: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名',
    required: true,
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    placeholder: '请输入手机号',
    required: !props.isEdit,
    disabled: props.isEdit,
  },
  {
    prop: 'password',
    label: '密码',
    type: 'password',
    placeholder: props.isEdit ? '不修改请留空' : '请输入密码',
    required: !props.isEdit,
  },
  {
    prop: 'realName',
    label: '真实姓名',
    type: 'input',
    placeholder: '请输入真实姓名',
  },
  {
    prop: 'email',
    label: '邮箱',
    type: 'input',
    placeholder: '请输入邮箱',
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '正常', value: 'active' },
      { label: '未激活', value: 'inactive' },
      { label: '已封禁', value: 'banned' },
    ],
    required: true,
  },
])

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  password: [
    { required: !props.isEdit, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' },
  ],
}
</script>
