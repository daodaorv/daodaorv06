<template>
  <div class="page-container">
    <div class="login-form">
      <!-- Logo和标题 -->
      <div class="login-header">
        <h2 class="title">叨叨房车租赁管理平台</h2>
        <p class="page-description">专业的房车租赁管理解决方案</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        size="large"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入手机号"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.remember"> 记住密码 </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" class="login-btn">
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>

        <!-- 注册入口 -->
        <el-form-item>
          <el-button text type="primary" @click="handleRegister" class="register-link">
            还没有账号？申请注册
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部信息 -->
      <div class="login-footer">
        <p>默认账号: 13800138000 / 密码: 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { LoginForm } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive<LoginForm>({
  username: '13800138000',
  password: '123456',
  remember: false,
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为2-20个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' },
  ],
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    await userStore.login(loginForm)

    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error: any) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

// 处理注册申请
const handleRegister = () => {
  router.push('/register')
}

// 初始化
onMounted(() => {
  // 如果已登录，直接跳转到工作台
  if (userStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;

  .login-form {
    width: 400px;
    padding: 40px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    .login-header {
      text-align: center;
      margin-bottom: 30px;

      .title {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;
      }

      .page-description {
        font-size: 14px;
        color: #909399;
        margin: 0;
      }
    }

    .login-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
    }

    .register-link {
      width: 100%;
      text-align: center;
      font-size: 14px;
    }

    .login-footer {
      text-align: center;
      margin-top: 20px;

      p {
        font-size: 12px;
        color: #909399;
        margin: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 20px;

    .login-form {
      width: 100%;
      padding: 30px 20px;
    }
  }
}
</style>
