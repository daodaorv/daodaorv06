<template>
  <view class="reminder-page">
    <!-- 头部导航 -->
    <view class="header">
      <view class="nav-bar">
        <view class="nav-item back-btn" @tap="goBack">
          <uni-icons type="arrowleft" size="20" color="#333"></uni-icons>
        </view>
        <text class="nav-title">订单提醒</text>
        <view class="nav-item"></view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="order-info" v-if="order.vehicle">
      <view class="order-card">
        <image
          class="order-image"
          :src="order.vehicle.images?.[0] || '/static/default-vehicle.png'"
          mode="aspectFill"
        ></image>
        <view class="order-details">
          <text class="order-vehicle">{{ order.vehicle.name }}</text>
          <view class="order-meta">
            <text class="order-no">订单号：{{ order.orderNo }}</text>
            <text class="order-time">{{ formatDateTime(order.pickupTime) }} - {{ formatDateTime(order.returnTime) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 提醒设置 -->
    <view class="reminder-settings">
      <view class="section-title">
        <text class="title-text">提醒设置</text>
        <text class="desc-text">开启后将按时推送提醒消息</text>
      </view>

      <view class="setting-list">
        <!-- 取车提醒 -->
        <view class="setting-item">
          <view class="setting-info">
            <view class="setting-header">
              <uni-icons type="notification" size="20" color="#FF9F29"></uni-icons>
              <text class="setting-title">取车提醒</text>
            </view>
            <text class="setting-desc">提前2小时提醒取车时间</text>
          </view>
          <switch
            :checked="reminders.pickup?.enabled"
            @change="toggleReminder('pickup', $event)"
            color="#FF9F29"
          />
        </view>

        <!-- 还车提醒 -->
        <view class="setting-item">
          <view class="setting-info">
            <view class="setting-header">
              <uni-icons type="flag" size="20" color="#52C41A"></uni-icons>
              <text class="setting-title">还车提醒</text>
            </view>
            <text class="setting-desc">提前1小时提醒还车时间</text>
          </view>
          <switch
            :checked="reminders.return?.enabled"
            @change="toggleReminder('return', $event)"
            color="#FF9F29"
          />
        </view>

        <!-- 支付提醒 -->
        <view class="setting-item" v-if="order.statusId === 1">
          <view class="setting-info">
            <view class="setting-header">
              <uni-icons type="wallet" size="20" color="#1890FF"></uni-icons>
              <text class="setting-title">支付提醒</text>
            </view>
            <text class="setting-desc">订单即将过期的支付提醒</text>
          </view>
          <switch
            :checked="reminders.payment?.enabled"
            @change="toggleReminder('payment', $event)"
            color="#FF9F29"
          />
        </view>
      </view>
    </view>

    <!-- 提醒渠道 -->
    <view class="channel-settings">
      <view class="section-title">
        <text class="title-text">提醒渠道</text>
        <text class="desc-text">选择接收提醒的方式</text>
      </view>

      <view class="channel-list">
        <view class="channel-item">
          <view class="channel-info">
            <uni-icons type="wechat" size="20" color="#1AAD19"></uni-icons>
            <text class="channel-title">微信通知</text>
          </view>
          <checkbox
            :checked="channels.wechat"
            @tap="toggleChannel('wechat')"
            color="#FF9F29"
          />
        </view>

        <view class="channel-item">
          <view class="channel-info">
            <uni-icons type="phone" size="20" color="#FF9F29"></uni-icons>
            <text class="channel-title">短信通知</text>
          </view>
          <checkbox
            :checked="channels.sms"
            @tap="toggleChannel('sms')"
            color="#FF9F29"
          />
        </view>

        <view class="channel-item">
          <view class="channel-info">
            <uni-icons type="email" size="20" color="#1890FF"></uni-icons>
            <text class="channel-title">邮件通知</text>
          </view>
          <checkbox
            :checked="channels.email"
            @tap="toggleChannel('email')"
            color="#FF9F29"
          />
        </view>
      </view>
    </view>

    <!-- 自定义提醒 -->
    <view class="custom-reminder">
      <view class="section-title">
        <text class="title-text">自定义提醒</text>
      </view>

      <view class="custom-list">
        <view
          v-for="(reminder, index) in customReminders"
          :key="reminder.id"
          class="custom-item"
        >
          <view class="custom-content">
            <view class="custom-header">
              <text class="custom-title">{{ reminder.title }}</text>
              <view class="custom-time">{{ formatReminderTime(reminder.reminderTime) }}</view>
            </view>
            <text class="custom-desc">{{ reminder.message }}</text>
          </view>
          <view class="custom-actions">
            <view class="action-btn" @tap="editCustomReminder(index)">
              <uni-icons type="compose" size="16" color="#666"></uni-icons>
            </view>
            <view class="action-btn" @tap="deleteCustomReminder(index)">
              <uni-icons type="trash" size="16" color="#FF4D4F"></uni-icons>
            </view>
          </view>
        </view>

        <view class="add-custom" @tap="addCustomReminder">
          <uni-icons type="plus" size="20" color="#FF9F29"></uni-icons>
          <text class="add-text">添加自定义提醒</text>
        </view>
      </view>
    </view>

    <!-- 添加/编辑提醒弹窗 -->
    <uni-popup ref="reminderPopup" type="center">
      <view class="reminder-popup">
        <view class="popup-header">
          <text class="popup-title">{{ editingIndex >= 0 ? '编辑提醒' : '添加提醒' }}</text>
          <view class="close-btn" @tap="closeReminderPopup">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        <view class="form-content">
          <view class="form-item">
            <text class="form-label">提醒标题</text>
            <input
              class="form-input"
              v-model="reminderForm.title"
              placeholder="请输入提醒标题"
              maxlength="20"
            />
          </view>

          <view class="form-item">
            <text class="form-label">提醒时间</text>
            <picker
              mode="datetime"
              :value="reminderForm.reminderTime"
              @change="onReminderTimeChange"
            >
              <view class="picker-input">
                <text class="picker-text" v-if="reminderForm.reminderTime">
                  {{ formatReminderTime(reminderForm.reminderTime) }}
                </text>
                <text class="picker-placeholder" v-else>请选择提醒时间</text>
                <uni-icons type="right" size="16" color="#ccc"></uni-icons>
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label">提醒内容</text>
            <textarea
              class="form-textarea"
              v-model="reminderForm.message"
              placeholder="请输入提醒内容"
              maxlength="200"
            ></textarea>
          </view>
        </view>
        <view class="popup-actions">
          <button class="cancel-btn" @tap="closeReminderPopup">取消</button>
          <button class="confirm-btn" @tap="saveCustomReminder">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 操作按钮 -->
    <view class="action-section">
      <button class="save-btn" @tap="saveAllSettings">
        保存设置
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { orderApi } from '@/api/order';
import { orderEnhancedApi } from '@/api/orderEnhanced';

const userStore = useUserStore();

const props = defineProps({
  orderId: {
    type: Number,
    required: true
  }
});

// 状态管理
const order = ref({});
const reminders = ref({
  pickup: { enabled: true },
  return: { enabled: true },
  payment: { enabled: true }
});
const channels = ref({
  wechat: true,
  sms: false,
  email: false
});
const customReminders = ref([]);
const editingIndex = ref(-1);
const reminderPopup = ref(null);

// 提醒表单
const reminderForm = ref({
  title: '',
  reminderTime: '',
  message: ''
});

// 页面加载
onMounted(() => {
  loadOrderDetail();
  loadReminders();
});

// 加载订单详情
const loadOrderDetail = async () => {
  try {
    const response = await orderApi.getOrderDetail(props.orderId);
    order.value = response.data;
  } catch (error) {
    console.error('加载订单详情失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  }
};

// 加载提醒设置
const loadReminders = async () => {
  try {
    const response = await orderEnhancedApi.getOrderReminders(props.orderId);
    const reminderList = response.data || [];

    // 解析提醒数据
    reminderList.forEach(reminder => {
      if (reminder.reminderType === 'pickup') {
        reminders.value.pickup = { enabled: reminder.status === 'sent' || reminder.status === 'pending' };
      } else if (reminder.reminderType === 'return') {
        reminders.value.return = { enabled: reminder.status === 'sent' || reminder.status === 'pending' };
      } else if (reminder.reminderType === 'payment') {
        reminders.value.payment = { enabled: reminder.status === 'sent' || reminder.status === 'pending' };
      }
    });
  } catch (error) {
    console.error('加载提醒设置失败:', error);
    // 使用默认设置
  }
};

// 切换提醒开关
const toggleReminder = (type, event) => {
  reminders.value[type].enabled = event.detail.value;
};

// 切换提醒渠道
const toggleChannel = (channel) => {
  channels.value[channel] = !channels.value[channel];
};

// 添加自定义提醒
const addCustomReminder = () => {
  editingIndex.value = -1;
  resetReminderForm();
  reminderPopup.value.open();
};

// 编辑自定义提醒
const editCustomReminder = (index) => {
  editingIndex.value = index;
  const reminder = customReminders.value[index];
  reminderForm.value = {
    title: reminder.title,
    reminderTime: reminder.reminderTime,
    message: reminder.message
  };
  reminderPopup.value.open();
};

// 删除自定义提醒
const deleteCustomReminder = (index) => {
  uni.showModal({
    title: '删除提醒',
    content: '确定要删除这个提醒吗？',
    success: (res) => {
      if (res.confirm) {
        customReminders.value.splice(index, 1);
      }
    }
  });
};

// 关闭提醒弹窗
const closeReminderPopup = () => {
  reminderPopup.value.close();
  resetReminderForm();
};

// 重置提醒表单
const resetReminderForm = () => {
  reminderForm.value = {
    title: '',
    reminderTime: '',
    message: ''
  };
};

// 提醒时间选择
const onReminderTimeChange = (e) => {
  reminderForm.value.reminderTime = e.detail.value;
};

// 保存自定义提醒
const saveCustomReminder = () => {
  if (!reminderForm.value.title.trim()) {
    uni.showToast({
      title: '请输入提醒标题',
      icon: 'none'
    });
    return;
  }

  if (!reminderForm.value.reminderTime) {
    uni.showToast({
      title: '请选择提醒时间',
      icon: 'none'
    });
    return;
  }

  if (!reminderForm.value.message.trim()) {
    uni.showToast({
      title: '请输入提醒内容',
      icon: 'none'
    });
    return;
  }

  const reminder = {
    id: Date.now(),
    title: reminderForm.value.title.trim(),
    reminderTime: reminderForm.value.reminderTime,
    message: reminderForm.value.message.trim()
  };

  if (editingIndex.value >= 0) {
    customReminders.value[editingIndex.value] = reminder;
  } else {
    customReminders.value.push(reminder);
  }

  closeReminderPopup();
  uni.showToast({
    title: '提醒设置成功',
    icon: 'success'
  });
};

// 保存所有设置
const saveAllSettings = async () => {
  try {
    uni.showLoading({ title: '保存中...' });

    // 保存提醒设置
    if (reminders.value.pickup.enabled) {
      await orderEnhancedApi.setOrderReminder(props.orderId, {
        reminderType: 'pickup',
        reminderTime: new Date(order.value.pickupTime.getTime() - 2 * 60 * 60 * 1000),
        message: `您有订单将在2小时后取车，订单号：${order.value.orderNo}`,
        channels: getEnabledChannels()
      });
    }

    if (reminders.value.return.enabled) {
      await orderEnhancedApi.setOrderReminder(props.orderId, {
        reminderType: 'return',
        reminderTime: new Date(order.value.returnTime.getTime() - 1 * 60 * 60 * 1000),
        message: `您有订单将在1小时后到期，请及时还车`,
        channels: getEnabledChannels()
      });
    }

    // 保存自定义提醒
    for (const reminder of customReminders.value) {
      await orderEnhancedApi.setOrderReminder(props.orderId, {
        reminderType: 'custom',
        reminderTime: reminder.reminderTime,
        message: reminder.message,
        channels: getEnabledChannels()
      });
    }

    uni.hideLoading();
    uni.showToast({
      title: '设置保存成功',
      icon: 'success'
    });

    // 延迟返回
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    uni.hideLoading();
    console.error('保存提醒设置失败:', error);
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none'
    });
  }
};

// 获取已启用的提醒渠道
const getEnabledChannels = () => {
  const enabled = [];
  if (channels.value.wechat) enabled.push('wechat');
  if (channels.value.sms) enabled.push('sms');
  if (channels.value.email) enabled.push('email');
  return enabled;
};

// 工具方法
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${month}-${day} ${hours}:${minutes}`;
};

const formatReminderTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${month}-${day} ${hours}:${minutes}`;
};

// 返回
const goBack = () => {
  uni.navigateBack();
};
</script>

<style>
.reminder-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 头部
.header {
  background-color: #ffffff;

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 32rpx;
    height: 88rpx;

    .nav-item {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-title {
      font-size: 36rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }
  }
}

// 订单信息
.order-info {
  background-color: #ffffff;
  padding: 0 32rpx 32rpx;
  margin-bottom: 24rpx;

  .order-card {
    display: flex;
    gap: 24rpx;
    padding: 24rpx 0;

    .order-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
      flex-shrink: 0;
    }

    .order-details {
      flex: 1;

      .order-vehicle {
        font-size: 30rpx;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.9);
        margin-bottom: 12rpx;
        display: block;
      }

      .order-meta  { .order-no,
        .order-time { font-size: 24rpx;
          color: rgba(0, 0, 0, 0.6);
          display: block;
          margin-bottom: 4rpx; } }
    }
  }
}

// 通用标题样式
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 16rpx;

  .title-text {
    font-size: 32rpx;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.9);
  }

  .desc-text {
    font-size: 24rpx;
    color: rgba(0, 0, 0, 0.6);
  }
}

// 提醒设置
.reminder-settings {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .setting-list  { .setting-item { display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx 32rpx;
      border-bottom: 2rpx solid #f8f8f8;

      .last-child { border-bottom: none; }.setting-info { flex: 1;

        .setting-header { display: flex;
          align-items: center;
          gap: 12rpx;
          margin-bottom: 8rpx;

          .setting-title { font-size: 28rpx;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.9); } }

        .setting-desc {
          font-size: 24rpx;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }
  }
}

// 提醒渠道
.channel-settings {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .channel-list  { .channel-item { display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx 32rpx;
      border-bottom: 2rpx solid #f8f8f8;

      .last-child { border-bottom: none; }.channel-info { display: flex;
        align-items: center;
        gap: 12rpx;

        .channel-title { font-size: 28rpx;
          color: rgba(0, 0, 0, 0.8); } }
    }
  }
}

// 自定义提醒
.custom-reminder {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .custom-list  { .custom-item { display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 24rpx 32rpx;
      border-bottom: 2rpx solid #f8f8f8;

      .custom-content { flex: 1;

        .custom-header { display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8rpx;

          .custom-title { font-size: 28rpx;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.9); }.custom-time { font-size: 24rpx;
            color: #FF9F29; } }

        .custom-desc {
          font-size: 24rpx;
          color: rgba(0, 0, 0, 0.6);
          line-height: 1.4;
        }
      }

      .custom-actions {
        display: flex;
        gap: 16rpx;
        margin-left: 24rpx;

        .action-btn {
          width: 40rpx;
          height: 40rpx;
          border-radius: 20rpx;
          background-color: #f8f8f8;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .add-custom {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      padding: 32rpx;
      border: 2rpx dashed #cccccc;
      border-radius: 12rpx;
      margin: 24rpx 32rpx 32rpx;

      .add-text {
        font-size: 28rpx;
        color: #FF9F29;
      }
    }
  }
}

// 弹窗样式
.reminder-popup {
  background-color: #ffffff;
  border-radius: 16rpx;
  width: 560rpx;
  padding: 32rpx;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }

    .close-btn {
      padding: 8rpx;
    }
  }

  .form-content {
    margin-bottom: 48rpx;

    .form-item {
      margin-bottom: 32rpx;

      .last-child {
        margin-bottom: 0;
      }

      .form-label {
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.8);
        margin-bottom: 16rpx;
        display: block;
      }

      .form-input {
        width: 100%;
        height: 80rpx;
        padding: 0 24rpx;
        border: 2rpx solid #f0f0f0;
        border-radius: 12rpx;
        font-size: 28rpx;
        background-color: #fafafa;
      }

      .picker-input {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 80rpx;
        padding: 0 24rpx;
        border: 2rpx solid #f0f0f0;
        border-radius: 12rpx;
        background-color: #fafafa;

        .picker-text {
          font-size: 28rpx;
          color: rgba(0, 0, 0, 0.8);
        }

        .picker-placeholder {
          font-size: 28rpx;
          color: rgba(0, 0, 0, 0.4);
        }
      }

      .form-textarea {
        width: 100%;
        min-height: 120rpx;
        padding: 24rpx;
        border: 2rpx solid #f0f0f0;
        border-radius: 12rpx;
        font-size: 28rpx;
        background-color: #fafafa;
        line-height: 1.5;
      }
    }
  }

  .popup-actions {
    display: flex;
    gap: 24rpx;

    .cancel-btn,
    .confirm-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      border: none;

      &::after {
        border: none;
      }
    }

    .cancel-btn {
      background-color: #f8f8f8;
      color: rgba(0, 0, 0, 0.6);
    }

    .confirm-btn {
      background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
      color: #ffffff;
    }
  }
}

// 操作按钮
.action-section {
  padding: 32rpx;

  .save-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
    color: #ffffff;
    border: none;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;

    &::after {
      border: none;
    }
  }
}
</style>