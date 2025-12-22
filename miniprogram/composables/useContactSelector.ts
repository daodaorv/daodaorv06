/**
 * 联系人选择器 Composable
 * 用于预订页面的联系人选择和管理功能
 */

import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useContactStore } from '@/stores/contact'
import { logger } from '@/utils/logger'

interface Contact {
  id: string
  name: string
  phone: string
  idCard?: string
  isDefault?: boolean
}

interface ContactForm {
  contactName: string
  contactPhone: string
  idCard?: string
}

interface UseContactSelectorReturn {
  /** 联系人列表 */
  contactList: ReturnType<typeof ref<Contact[]>>
  /** 选中的联系人ID */
  selectedContactId: ReturnType<typeof ref<string>>
  /** 联系人选择器是否可见 */
  contactSheetVisible: ReturnType<typeof ref<boolean>>
  /** 联系人加载中 */
  contactLoading: ReturnType<typeof ref<boolean>>
  /** 联系人显示文本 */
  contactDisplayText: ReturnType<typeof computed<string>>
  /** 格式化手机号（隐藏中间4位） */
  formatPhone: (phone?: string) => string
  /** 应用联系人到表单 */
  applyContactToForm: (contact: Contact, form: ContactForm) => void
  /** 尝试从联系人列表预填充 */
  tryPrefillFromContacts: (form: ContactForm) => void
  /** 加载联系人列表 */
  loadContacts: () => Promise<void>
  /** 打开联系人选择器 */
  openContactSelector: () => void
  /** 处理联系人选择 */
  handleContactSelect: (action: { id: string }, form: ContactForm) => void
  /** 跳转到联系人管理页面 */
  goToContactManage: () => void
}

/**
 * 联系人选择器 Composable
 * @returns 联系人选择相关状态和方法
 *
 * @example
 * ```ts
 * const {
 *   contactList,
 *   selectedContactId,
 *   contactSheetVisible,
 *   contactDisplayText,
 *   loadContacts,
 *   openContactSelector,
 *   handleContactSelect
 * } = useContactSelector()
 *
 * // 加载联系人
 * onMounted(() => {
 *   loadContacts()
 * })
 *
 * // 在模板中使用
 * <view @tap="openContactSelector">{{ contactDisplayText }}</view>
 * ```
 */
export function useContactSelector(): UseContactSelectorReturn {
  const contactStore = useContactStore()
  const { contactList: storeContactList } = storeToRefs(contactStore)

  const selectedContactId = ref('')
  const contactSheetVisible = ref(false)
  const contactLoading = ref(false)

  // 本地联系人列表引用
  const contactList = computed(() => storeContactList.value as Contact[])

  /**
   * 格式化手机号（隐藏中间4位）
   */
  const formatPhone = (phone?: string): string => {
    if (!phone) return '无手机号'
    return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
  }

  /**
   * 联系人显示文本
   */
  const contactDisplayText = computed(() => {
    if (contactLoading.value) {
      return '联系人加载中...'
    }
    if (selectedContactId.value) {
      const target = contactList.value.find((item) => item.id === selectedContactId.value)
      if (target) {
        return `${target.name || '联系人'} · ${formatPhone(target.phone)}`
      }
    }
    return contactList.value.length > 0 ? '请选择联系人' : '暂无联系人'
  })

  /**
   * 应用联系人到表单
   */
  const applyContactToForm = (contact: Contact, form: ContactForm): void => {
    if (!contact) return
    form.contactName = contact.name || ''
    form.contactPhone = contact.phone || ''
    if (contact.idCard) {
      form.idCard = contact.idCard
    }
    selectedContactId.value = contact.id || ''
  }

  /**
   * 尝试从联系人列表预填充
   */
  const tryPrefillFromContacts = (form: ContactForm): void => {
    if (
      selectedContactId.value ||
      form.contactName ||
      form.contactPhone ||
      !contactList.value.length
    ) {
      return
    }
    const defaultContact = contactList.value.find((item) => item.isDefault) || contactList.value[0]
    if (defaultContact) {
      applyContactToForm(defaultContact, form)
    }
  }

  /**
   * 加载联系人列表
   */
  const loadContacts = async (): Promise<void> => {
    contactLoading.value = true
    try {
      await contactStore.fetchContacts()
    } catch (error) {
      logger.error('加载联系人失败:', error)
    } finally {
      contactLoading.value = false
    }
  }

  /**
   * 打开联系人选择器
   */
  const openContactSelector = (): void => {
    if (contactLoading.value) {
      return
    }
    if (!contactList.value.length) {
      uni.showModal({
        title: '提示',
        content: '暂无常用联系人，是否前往管理页面添加？',
        confirmText: '去添加',
        cancelText: '稍后再说',
        success: (res) => {
          if (res.confirm) {
            goToContactManage()
          }
        }
      })
      return
    }
    contactSheetVisible.value = true
  }

  /**
   * 处理联系人选择
   */
  const handleContactSelect = (action: { id: string }, form: ContactForm): void => {
    const selected = contactList.value.find((item) => item.id === action.id)
    if (selected) {
      applyContactToForm(selected, form)
    }
    contactSheetVisible.value = false
  }

  /**
   * 跳转到联系人管理页面
   */
  const goToContactManage = (): void => {
    uni.navigateTo({
      url: '/pages/profile/contacts'
    })
  }

  return {
    contactList: ref(contactList.value) as ReturnType<typeof ref<Contact[]>>,
    selectedContactId,
    contactSheetVisible,
    contactLoading,
    contactDisplayText,
    formatPhone,
    applyContactToForm,
    tryPrefillFromContacts,
    loadContacts,
    openContactSelector,
    handleContactSelect,
    goToContactManage
  }
}

export default useContactSelector
