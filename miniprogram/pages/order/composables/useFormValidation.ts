/**
 * 表单验证 Composable
 * 负责租车人表单的验证逻辑
 */

import { ref } from 'vue';
import { VALIDATION, VALIDATION_MESSAGES } from '@/constants/validation';

export interface RenterFormData {
  name: string;
  phone: string;
  driverLicenseNo: string;
  driverLicenseFront: string;
  driverLicenseBack: string;
}

export function useFormValidation() {
  const errors = ref<Record<string, string>>({});

  /**
   * 验证姓名
   */
  const validateName = (name: string): boolean => {
    if (!name || !name.trim()) {
      errors.value.name = '请输入租车人姓名';
      return false;
    }
    delete errors.value.name;
    return true;
  };

  /**
   * 验证手机号
   */
  const validatePhone = (phone: string): boolean => {
    if (!phone) {
      errors.value.phone = VALIDATION_MESSAGES.PHONE_REQUIRED;
      return false;
    }
    if (!VALIDATION.PHONE_REGEX.test(phone)) {
      errors.value.phone = VALIDATION_MESSAGES.PHONE_INVALID;
      return false;
    }
    delete errors.value.phone;
    return true;
  };

  /**
   * 验证驾驶证号
   */
  const validateDriverLicense = (licenseNo: string): boolean => {
    if (!licenseNo) {
      errors.value.driverLicenseNo = VALIDATION_MESSAGES.DRIVER_LICENSE_REQUIRED;
      return false;
    }
    if (!VALIDATION.DRIVER_LICENSE_REGEX.test(licenseNo)) {
      errors.value.driverLicenseNo = VALIDATION_MESSAGES.DRIVER_LICENSE_INVALID;
      return false;
    }
    delete errors.value.driverLicenseNo;
    return true;
  };

  /**
   * 验证驾驶证照片
   */
  const validateLicensePhotos = (front: string, back: string): boolean => {
    if (!front) {
      errors.value.driverLicenseFront = VALIDATION_MESSAGES.LICENSE_PHOTO_FRONT_REQUIRED;
      return false;
    }
    if (!back) {
      errors.value.driverLicenseBack = VALIDATION_MESSAGES.LICENSE_PHOTO_BACK_REQUIRED;
      return false;
    }
    delete errors.value.driverLicenseFront;
    delete errors.value.driverLicenseBack;
    return true;
  };

  /**
   * 验证整个表单
   */
  const validateForm = (formData: RenterFormData): boolean => {
    const isNameValid = validateName(formData.name);
    const isPhoneValid = validatePhone(formData.phone);
    const isLicenseNoValid = validateDriverLicense(formData.driverLicenseNo);
    const isPhotosValid = validateLicensePhotos(
      formData.driverLicenseFront,
      formData.driverLicenseBack
    );

    return isNameValid && isPhoneValid && isLicenseNoValid && isPhotosValid;
  };

  /**
   * 清除所有错误
   */
  const clearErrors = () => {
    errors.value = {};
  };

  /**
   * 显示错误提示
   */
  const showError = (field: keyof RenterFormData) => {
    const errorMessage = errors.value[field];
    if (errorMessage) {
      uni.showToast({
        title: errorMessage,
        icon: 'none'
      });
    }
  };

  return {
    errors,
    validateName,
    validatePhone,
    validateDriverLicense,
    validateLicensePhotos,
    validateForm,
    clearErrors,
    showError
  };
}
