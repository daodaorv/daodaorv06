<template>
  <view class="contact-edit-page">
    <view class="form-container">
      <u-form ref="form" :model="formData" :rules="rules" label-width="160">
        <u-form-item label="姓名" prop="name" required>
          <u-input v-model="formData.name" placeholder="请输入真实姓名" border="none" />
        </u-form-item>
        <u-form-item label="手机号" prop="phone" required>
          <u-input v-model="formData.phone" placeholder="请输入手机号" type="number" maxlength="11" border="none" />
        </u-form-item>
        <u-form-item label="身份证" prop="idCard" required>
          <u-input v-model="formData.idCard" placeholder="请输入身份证号码" maxlength="18" border="none" />
        </u-form-item>
        <u-form-item label="驾驶证号" prop="driverLicenseNo" required>
          <u-input v-model="formData.driverLicenseNo" placeholder="请输入驾驶证号码" maxlength="20" border="none" />
        </u-form-item>
        <u-form-item label="驾驶证正面" prop="driverLicenseFront" required>
          <view class="upload-wrapper">
            <u-upload
              :fileList="licenseFrontFiles"
              @afterRead="onLicenseSelect('front', $event)"
              @delete="onLicenseDelete('front', $event)"
              :maxCount="1"
              :previewFullImage="true"
              width="200"
              height="200"
            ></u-upload>
          </view>
        </u-form-item>
        <u-form-item label="驾驶证反面" prop="driverLicenseBack" required>
          <view class="upload-wrapper">
            <u-upload
              :fileList="licenseBackFiles"
              @afterRead="onLicenseSelect('back', $event)"
              @delete="onLicenseDelete('back', $event)"
              :maxCount="1"
              :previewFullImage="true"
              width="200"
              height="200"
            ></u-upload>
          </view>
        </u-form-item>
        <u-form-item label="设为默认" prop="isDefault">
          <switch :checked="formData.isDefault" @change="handleSwitchChange" color="#FF9F29" style="transform: scale(0.8)" />
        </u-form-item>
      </u-form>
    </view>

    <view class="footer-btn">
      <button class="submit-btn" @tap="handleSubmit" :loading="submitting">保存</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { logger } from '@/utils/logger';
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useContactStore } from '@/stores/contact'

const contactStore = useContactStore()
const form = ref<any>(null)
const submitting = ref(false)
const isEdit = ref(false)
const contactId = ref('')

const formData = ref({
  name: '',
  phone: '',
  idCard: '',
  driverLicenseNo: '',
  driverLicenseFront: '',
  driverLicenseBack: '',
  isDefault: false
})

// u-upload 组件需要的文件列表格式
const licenseFrontFiles = ref<any[]>([])
const licenseBackFiles = ref<any[]>([])

const rules = {
  name: {
    rules: [{ required: true, errorMessage: '请输入姓名' }]
  },
  phone: {
    rules: [
      { required: true, errorMessage: '请输入手机号' },
      { pattern: /^1[3-9]\d{9}$/, errorMessage: '手机号格式不正确' }
    ]
  },
  idCard: {
    rules: [
      { required: true, errorMessage: '请输入身份证号' },
      { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, errorMessage: '身份证号格式不正确' }
    ]
  },
  driverLicenseNo: {
    rules: [
      { required: true, errorMessage: '请输入驾驶证号' },
      { pattern: /^[A-Za-z0-9]{6,20}$/, errorMessage: '驾驶证号格式不正确' }
    ]
  },
  driverLicenseFront: {
    rules: [{ required: true, errorMessage: '请上传驾驶证正面照片' }]
  },
  driverLicenseBack: {
    rules: [{ required: true, errorMessage: '请上传驾驶证反面照片' }]
  }
}

onLoad(async (options: any) => {
  if (options.id) {
    isEdit.value = true
    contactId.value = options.id
    uni.setNavigationBarTitle({ title: '编辑联系人' })

    if (!contactStore.contactList.length) {
      await contactStore.fetchContacts()
    }

    // ID 类型转换：确保比较时类型一致
    const contact = contactStore.contactList.find((c: any) => String(c.id) === String(options.id))
    if (contact) {
      formData.value = {
        name: contact.name || '',
        phone: contact.phone || '',
        idCard: contact.idCard || '',
        driverLicenseNo: contact.driverLicenseNo || '',
        driverLicenseFront: contact.driverLicenseFront || '',
        driverLicenseBack: contact.driverLicenseBack || '',
        isDefault: !!contact.isDefault
      }
      // u-upload 组件需要的文件格式
      if (contact.driverLicenseFront) {
        licenseFrontFiles.value = [{
          url: contact.driverLicenseFront,
          status: 'success'
        }]
      }
      if (contact.driverLicenseBack) {
        licenseBackFiles.value = [{
          url: contact.driverLicenseBack,
          status: 'success'
        }]
      }
    } else {
      uni.showToast({ title: '联系人不存在', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  } else {
    uni.setNavigationBarTitle({ title: '添加联系人' })
    formData.value = {
      name: '',
      phone: '',
      idCard: '',
      driverLicenseNo: '',
      driverLicenseFront: '',
      driverLicenseBack: '',
      isDefault: false
    }
    licenseFrontFiles.value = []
    licenseBackFiles.value = []
  }
})

const handleSwitchChange = (e: any) => {
  formData.value.isDefault = e.detail.value
}

// u-upload 组件的 afterRead 回调
const onLicenseSelect = (type: 'front' | 'back', event: any) => {
  logger.debug('图片选择事件', { type, event })

  // u-upload 组件返回的文件对象
  const file = event.file
  if (!file) {
    logger.warn('未获取到文件对象')
    return
  }

  // 获取临时文件路径
  const tempPath = file.url || file.path || ''
  if (!tempPath) {
    logger.warn('未获取到文件路径')
    return
  }

  logger.debug('获取到文件路径', { tempPath })

  // 更新文件列表和表单数据
  if (type === 'front') {
    licenseFrontFiles.value = [{
      url: tempPath,
      status: 'success'
    }]
    formData.value.driverLicenseFront = tempPath
  } else {
    licenseBackFiles.value = [{
      url: tempPath,
      status: 'success'
    }]
    formData.value.driverLicenseBack = tempPath
  }
}

// u-upload 组件的 delete 回调
const onLicenseDelete = (type: 'front' | 'back', event: any) => {
  logger.debug('图片删除事件', { type, event })

  if (type === 'front') {
    licenseFrontFiles.value = []
    formData.value.driverLicenseFront = ''
  } else {
    licenseBackFiles.value = []
    formData.value.driverLicenseBack = ''
  }
}

const handleSubmit = () => {
  form.value.validate().then(async () => {
    submitting.value = true
    let success = false

    if (isEdit.value) {
      success = await contactStore.editContact(contactId.value, formData.value)
    } else {
      success = await contactStore.addContact(formData.value)
    }

    submitting.value = false

    if (success) {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }).catch((err: any) => {
    logger.debug('表单校验失败', err)
  })
}
</script>

<style scoped lang="scss">
.contact-edit-page {
  min-height: 100vh;
  background-color: $uni-bg-color;
  padding: $uni-spacing-xl;
}

.form-container {
  background-color: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.upload-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.footer-btn {
  margin-top: 60rpx;
}

.submit-btn {
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  font-size: $uni-font-size-lg;
  border-radius: $uni-radius-btn;
  height: 88rpx;
  line-height: 88rpx;
  box-shadow: $uni-shadow-glow;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  &::after {
    border: none;
  }
}
</style>
