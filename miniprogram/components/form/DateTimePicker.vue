<!-- 日期时间选择器组件 -->
<template>
  <uni-card class="datetime-picker" :is-shadow="true" :margin="margin" :padding="'24rpx'">
    <!-- 选择器头部 -->
    <view class="selector-header">
      <text class="selector-title">{{ title }}</text>
      <uni-button
        v-if="showQuickSelect"
        type="default"
        size="mini"
        text="快速选择"
        @click="showQuickSelectModal = true"
      />
    </view>

    <!-- 时间选择输入框 -->
    <view class="datetime-inputs">
      <view class="input-group">
        <!-- 取车时间 -->
        <view class="input-item" @click="showDateTimePicker('pickup')">
          <view class="input-icon pickup-icon">
            <uni-icons type="calendar-filled" size="20" color="#FF9F29" />
          </view>
          <view class="input-content">
            <text class="input-label">取车时间</text>
            <text class="input-value" :class="{ placeholder: !pickupDateTime }">
              {{ formatDisplayDateTime(pickupDateTime) || '请选择取车时间' }}
            </text>
          </view>
          <view class="input-arrow">
            <uni-icons type="right" size="16" color="#999999" />
          </view>
        </view>

        <!-- 还车时间 -->
        <view class="input-item" @click="showDateTimePicker('return')">
          <view class="input-icon return-icon">
            <uni-icons type="calendar-filled" size="20" color="#4B91FF" />
          </view>
          <view class="input-content">
            <text class="input-label">还车时间</text>
            <text class="input-value" :class="{ placeholder: !returnDateTime }">
              {{ formatDisplayDateTime(returnDateTime) || '请选择还车时间' }}
            </text>
          </view>
          <view class="input-arrow">
            <uni-icons type="right" size="16" color="#999999" />
          </view>
        </view>
      </view>

      <!-- 租期信息 -->
      <view v-if="pickupDateTime && returnDateTime" class="rental-info">
        <view class="info-item">
          <view class="info-icon">
            <uni-icons type="clock-filled" size="16" color="#67C23A" />
          </view>
          <text class="info-label">租期：</text>
          <text class="info-value">{{ rentalDays }}天</text>
        </view>
        <view class="info-item">
          <view class="info-icon">
            <uni-icons type="calendar" size="16" color="#F6AD55" />
          </view>
          <text class="info-label">总计：</text>
          <text class="info-value">{{ rentalHours }}小时</text>
        </view>
      </view>
    </view>

    <!-- 快速时间段选择 -->
    <view v-if="showQuickPeriods" class="quick-periods">
      <text class="section-title">快速选择租期</text>
      <view class="period-grid">
        <view
          v-for="period in quickPeriods"
          :key="period.value"
          class="period-item"
          :class="{ active: selectedPeriod === period.value }"
          @click="selectQuickPeriod(period)"
        >
          <text class="period-name">{{ period.name }}</text>
          <text class="period-desc">{{ period.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 时间段提醒 -->
    <view v-if="pickupDateTime && returnDateTime" class="time-notice">
      <view class="notice-header">
        <uni-icons type="info-filled" size="16" color="#F6AD55" />
        <text class="notice-title">取还车须知</text>
      </view>
      <view class="notice-content">
        <text class="notice-item">• 取车时间需至少提前2小时预订</text>
        <text class="notice-item">• 营业时间：{{ businessHours }}</text>
        <text class="notice-item">• 最短租期：{{ minRentalHours }}小时</text>
        <text class="notice-item">• 最长租期：{{ maxRentalDays }}天</text>
      </view>
    </view>

    <!-- 快速选择弹窗 -->
    <view v-if="showQuickSelectModal" class="modal-overlay" @click="showQuickSelectModal = false">
      <uni-card class="quick-select-modal" @click.stop>
        <template #header>
          <view class="modal-header">
            <view class="modal-close" @click="showQuickSelectModal = false">
              <uni-icons type="close" size="18" color="#999999" />
            </view>
            <text class="modal-title">快速选择时间</text>
            <view class="modal-spacer"></view>
          </view>
        </template>

        <view class="quick-options">
          <view class="option-group">
            <text class="group-title">今天</text>
            <view class="option-list">
              <view
                v-for="option in todayOptions"
                :key="option.value"
                class="option-item"
                @click="selectQuickOption(option)"
              >
                <text class="option-text">{{ option.label }}</text>
              </view>
            </view>
          </view>

          <view class="option-group">
            <text class="group-title">明天</text>
            <view class="option-list">
              <view
                v-for="option in tomorrowOptions"
                :key="option.value"
                class="option-item"
                @click="selectQuickOption(option)"
              >
                <text class="option-text">{{ option.label }}</text>
              </view>
            </view>
          </view>

          <view class="option-group">
            <text class="group-title">周末</text>
            <view class="option-list">
              <view
                v-for="option in weekendOptions"
                :key="option.value"
                class="option-item"
                @click="selectQuickOption(option)"
              >
                <text class="option-text">{{ option.label }}</text>
              </view>
            </view>
          </view>
        </view>
      </uni-card>
    </view>

    <!-- 日期时间选择器弹窗 -->
    <view v-if="showPicker" class="picker-overlay" @click="hideDateTimePicker">
      <uni-card class="datetime-picker-modal" @click.stop>
        <template #header>
          <view class="picker-header">
            <view class="picker-close" @click="hideDateTimePicker">
              <uni-icons type="close" size="18" color="#999999" />
            </view>
            <text class="picker-title">
              {{ pickerType === 'pickup' ? '选择取车时间' : '选择还车时间' }}
            </text>
            <uni-button
              type="default"
              size="mini"
              text="确定"
              @click="confirmDateTime"
            />
          </view>
        </template>

        <view class="picker-content">
          <!-- 日期选择 -->
          <view class="date-section">
            <text class="section-title">选择日期</text>
            <scroll-view class="calendar-container" scroll-y="true">
              <view class="calendar-grid">
                <!-- 星期标题 -->
                <view class="weekday-header">
                  <text
                    v-for="weekday in weekdays"
                    :key="weekday"
                    class="weekday-text"
                  >
                    {{ weekday }}
                  </text>
                </view>

                <!-- 日期网格 -->
                <view
                  v-for="week in calendarWeeks"
                  :key="week.week"
                  class="calendar-week"
                >
                  <view
                    v-for="day in week.days"
                    :key="day.date"
                    class="calendar-day"
                    :class="{
                      'calendar-day--selected': isDateSelected(day.date),
                      'calendar-day--disabled': day.disabled,
                      'calendar-day--today': day.isToday,
                      'calendar-day--weekend': day.isWeekend
                    }"
                    @click="selectDate(day)"
                  >
                    <text class="day-number">{{ day.day }}</text>
                    <text v-if="day.isToday" class="today-mark">今</text>
                  </view>
                </view>
              </view>
            </scroll-view>
          </view>

          <!-- 时间选择 -->
          <view class="time-section">
            <text class="section-title">选择时间</text>
            <view class="time-picker">
              <!-- 小时选择 -->
              <view class="time-column">
                <text class="time-label">时</text>
                <scroll-view class="time-list" scroll-y="true">
                  <view
                    v-for="hour in hourOptions"
                    :key="hour"
                    class="time-item"
                    :class="{ active: selectedHour === hour }"
                    @click="selectedHour = hour"
                  >
                    <text class="time-text">{{ formatTimeUnit(hour) }}</text>
                  </view>
                </scroll-view>
              </view>

              <!-- 分钟选择 -->
              <view class="time-column">
                <text class="time-label">分</text>
                <scroll-view class="time-list" scroll-y="true">
                  <view
                    v-for="minute in minuteOptions"
                    :key="minute"
                    class="time-item"
                    :class="{ active: selectedMinute === minute }"
                    @click="selectedMinute = minute"
                  >
                    <text class="time-text">{{ formatTimeUnit(minute) }}</text>
                  </view>
                </scroll-view>
              </view>
            </view>
          </view>
        </view>
      </uni-card>
    </view>
  </uni-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface QuickPeriod {
  value: string;
  name: string;
  desc: string;
  days: number;
}

interface QuickOption {
  value: string;
  label: string;
  datetime: Date;
}

interface CalendarDay {
  date: string;
  day: number;
  disabled: boolean;
  isToday: boolean;
  isWeekend: boolean;
  fullDate: Date;
}

interface CalendarWeek {
  week: number;
  days: CalendarDay[];
}

interface DateTimePickerProps {
  /** 组件标题 */
  title?: string;
  /** 取车时间 */
  pickupDateTime?: string;
  /** 还车时间 */
  returnDateTime?: string;
  /** 最小租期（小时） */
  minRentalHours?: number;
  /** 最大租期（天） */
  maxRentalDays?: number;
  /** 营业时间 */
  businessHours?: string;
  /** 是否显示快速选择 */
  showQuickSelect?: boolean;
  /** 是否显示快速时间段 */
  showQuickPeriods?: boolean;
  /** 时间间隔（分钟） */
  timeInterval?: number;
  /** 外边距 */
  margin?: string | number;
}

interface DateTimePickerEmits {
  (e: 'update:pickupDateTime', datetime: string): void;
  (e: 'update:returnDateTime', datetime: string): void;
  (e: 'datetimeChange', type: 'pickup' | 'return', datetime: Date): void;
  (e: 'rentalDaysChange', days: number): void;
  (e: 'rentalHoursChange', hours: number): void;
}

const props = withDefaults(defineProps<DateTimePickerProps>(), {
  title: '时间选择',
  minRentalHours: 4,
  maxRentalDays: 30,
  businessHours: '08:00-20:00',
  showQuickSelect: true,
  showQuickPeriods: true,
  timeInterval: 30,
  margin: '0 0 24rpx 0'
});

const emit = defineEmits<DateTimePickerEmits>();

// 响应式数据
const showPicker = ref(false);
const showQuickSelectModal = ref(false);
const pickerType = ref<'pickup' | 'return'>('pickup');
const selectedPeriod = ref('');

// 日期时间选择状态
const selectedDate = ref(new Date());
const selectedHour = ref(10);
const selectedMinute = ref(0);

// 快速时间段选项
const quickPeriods = ref<QuickPeriod[]>([
  { value: '4h', name: '4小时', desc: '短途出行', days: 0.17 },
  { value: '1d', name: '1天', desc: '日租', days: 1 },
  { value: '2d', name: '2天', desc: '周末短租', days: 2 },
  { value: '3d', name: '3天', desc: '小长假', days: 3 },
  { value: '7d', name: '7天', desc: '周租', days: 7 },
  { value: '15d', name: '15天', desc: '半月租', days: 15 },
  { value: '30d', name: '30天', desc: '月租优惠', days: 30 }
]);

// 星期标题
const weekdays = ref(['日', '一', '二', '三', '四', '五', '六']);

// 计算属性
const rentalDays = computed(() => {
  if (!props.pickupDateTime || !props.returnDateTime) return 0;

  const pickup = new Date(props.pickupDateTime);
  const returnTime = new Date(props.returnDateTime);
  const diffTime = returnTime.getTime() - pickup.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const rentalHours = computed(() => {
  if (!props.pickupDateTime || !props.returnDateTime) return 0;

  const pickup = new Date(props.pickupDateTime);
  const returnTime = new Date(props.returnDateTime);
  const diffTime = returnTime.getTime() - pickup.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60));
});

const calendarWeeks = computed(() => {
  const weeks: CalendarWeek[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7); // 从一周前开始

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 60); // 显示60天

  let currentDate = new Date(startDate);
  let weekIndex = 0;

  while (currentDate <= endDate) {
    const week: CalendarWeek = {
      week: weekIndex,
      days: []
    };

    // 一周7天
    for (let i = 0; i < 7; i++) {
      const day: CalendarDay = {
        date: formatDateKey(currentDate),
        day: currentDate.getDate(),
        disabled: isDateDisabled(currentDate),
        isToday: isSameDay(currentDate, today),
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
        fullDate: new Date(currentDate)
      };

      week.days.push(day);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    weeks.push(week);
    weekIndex++;
  }

  return weeks;
});

const hourOptions = computed(() => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(i);
  }
  return hours;
});

const minuteOptions = computed(() => {
  const minutes = [];
  for (let i = 0; i < 60; i += props.timeInterval) {
    minutes.push(i);
  }
  return minutes;
});

const todayOptions = computed((): QuickOption[] => {
  const today = new Date();
  const options: QuickOption[] = [];

  // 生成今天的时间选项
  [9, 10, 11, 14, 15, 16, 17, 18].forEach(hour => {
    const datetime = new Date(today);
    datetime.setHours(hour, 0, 0, 0);

    if (datetime > new Date()) {
      options.push({
        value: `today_${hour}`,
        label: `${hour}:00`,
        datetime
      });
    }
  });

  return options;
});

const tomorrowOptions = computed((): QuickOption[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const options: QuickOption[] = [];

  [8, 9, 10, 11, 14, 15, 16, 17, 18, 19].forEach(hour => {
    const datetime = new Date(tomorrow);
    datetime.setHours(hour, 0, 0, 0);

    options.push({
      value: `tomorrow_${hour}`,
      label: `明天${hour}:00`,
      datetime
    });
  });

  return options;
});

const weekendOptions = computed((): QuickOption[] => {
  const today = new Date();
  const options: QuickOption[] = [];

  // 找到下一个周末
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    if (date.getDay() === 6 || date.getDay() === 0) {
      options.push({
        value: `weekend_${i}`,
        label: `${date.getMonth() + 1}月${date.getDate()}日`,
        datetime: new Date(date)
      });

      if (options.length >= 4) break;
    }
  }

  return options;
});

// 监听租期变化
watch(rentalDays, (newDays) => {
  emit('rentalDaysChange', newDays);
});

watch(rentalHours, (newHours) => {
  emit('rentalHoursChange', newHours);
});

// 方法
const showDateTimePicker = (type: 'pickup' | 'return') => {
  pickerType.value = type;

  // 初始化选择器状态
  if (type === 'pickup' && props.pickupDateTime) {
    const datetime = new Date(props.pickupDateTime);
    selectedDate.value = new Date(datetime);
    selectedHour.value = datetime.getHours();
    selectedMinute.value = datetime.getMinutes();
  } else if (type === 'return' && props.returnDateTime) {
    const datetime = new Date(props.returnDateTime);
    selectedDate.value = new Date(datetime);
    selectedHour.value = datetime.getHours();
    selectedMinute.value = datetime.getMinutes();
  } else {
    selectedDate.value = new Date();
    selectedHour.value = 10;
    selectedMinute.value = 0;
  }

  showPicker.value = true;
};

const hideDateTimePicker = () => {
  showPicker.value = false;
};

const confirmDateTime = () => {
  const datetime = new Date(selectedDate.value);
  datetime.setHours(selectedHour.value, selectedMinute.value, 0, 0);

  const datetimeStr = datetime.toISOString();

  if (pickerType.value === 'pickup') {
    emit('update:pickupDateTime', datetimeStr);
    emit('datetimeChange', 'pickup', datetime);

    // 如果有取车时间但没有还车时间，自动设置还车时间
    if (!props.returnDateTime) {
      const returnTime = new Date(datetime);
      returnTime.setDate(returnTime.getDate() + 1);
      emit('update:returnDateTime', returnTime.toISOString());
      emit('datetimeChange', 'return', returnTime);
    }
  } else {
    emit('update:returnDateTime', datetimeStr);
    emit('datetimeChange', 'return', datetime);
  }

  hideDateTimePicker();
};

const selectDate = (day: CalendarDay) => {
  if (day.disabled) return;
  selectedDate.value = new Date(day.fullDate);
};

const selectTime = (type: 'hour' | 'minute', value: number) => {
  if (type === 'hour') {
    selectedHour.value = value;
  } else {
    selectedMinute.value = value;
  }
};

const isDateSelected = (dateKey: string) => {
  return formatDateKey(selectedDate.value) === dateKey;
};

const isDateDisabled = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  // 过去的日期不能选择
  if (compareDate < today) return true;

  // 超过最大租期的日期不能选择
  if (props.pickupDateTime) {
    const pickup = new Date(props.pickupDateTime);
    const maxDate = new Date(pickup);
    maxDate.setDate(maxDate.getDate() + props.maxRentalDays);

    if (compareDate > maxDate) return true;
  }

  return false;
};

const selectQuickPeriod = (period: QuickPeriod) => {
  selectedPeriod.value = period.value;

  if (props.pickupDateTime) {
    const pickup = new Date(props.pickupDateTime);
    const returnTime = new Date(pickup);
    returnTime.setDate(returnTime.getDate() + period.days);

    emit('update:returnDateTime', returnTime.toISOString());
    emit('datetimeChange', 'return', returnTime);
  }
};

const selectQuickOption = (option: QuickOption) => {
  const datetime = new Date(option.datetime);

  if (pickerType.value === 'pickup' || !props.pickupDateTime) {
    emit('update:pickupDateTime', datetime.toISOString());
    emit('datetimeChange', 'pickup', datetime);

    // 自动设置还车时间（默认1天后）
    const returnTime = new Date(datetime);
    returnTime.setDate(returnTime.getDate() + 1);
    emit('update:returnDateTime', returnTime.toISOString());
    emit('datetimeChange', 'return', returnTime);
  } else {
    emit('update:returnDateTime', datetime.toISOString());
    emit('datetimeChange', 'return', datetime);
  }

  showQuickSelectModal.value = false;
};

// 工具函数
const formatDisplayDateTime = (datetimeStr: string) => {
  if (!datetimeStr) return '';

  const datetime = new Date(datetimeStr);
  return `${datetime.getMonth() + 1}月${datetime.getDate()}日 ${datetime.getHours()}:${String(datetime.getMinutes()).padStart(2, '0')}`;
};

const formatDateKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatTimeUnit = (value: number) => {
  return String(value).padStart(2, '0');
};

const isSameDay = (date1: Date, date2: Date) => {
  return formatDateKey(date1) === formatDateKey(date2);
};
</script>

<style>
// 色彩系统
#FF9F29: #FF9F29;
#67C23A: #67C23A;
#FF4D4F: #FF4D4F;
#4B91FF: #4B91FF;
#F6AD55: #F6AD55;
#333333: #1A1A1A;
#666666: #667085;
#999999: #999999;
#F8F8F8: #F7F8FA;
#FFFFFF: #FFFFFF;
#E8E8E8: #EEF0F3;

.datetime-picker {
  // 选择器头部
  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .selector-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333333;
    }
  }

  // 时间选择输入框
  .datetime-inputs {
    .input-group {
      .input-item {
        display: flex;
        align-items: center;
        padding: 24rpx;
        background: #F8F8F8;
        border: 2rpx solid #E8E8E8;
        border-radius: 16rpx;
        margin-bottom: 16rpx;
        transition: all 0.3s ease;
        cursor: pointer;

        .last-child {
          margin-bottom: 0;
        }

        .active {
          background: rgba(#FF9F29, 0.05);
          border-color: #FF9F29;
        }

        .input-icon {
          width: 56rpx;
          height: 56rpx;
          border-radius: 12rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20rpx;

          &.pickup-icon {
            background: rgba(#FF9F29, 0.1);
          }

          &.return-icon {
            background: rgba(#4B91FF, 0.1);
          }
        }

        .input-content {
          flex: 1;

          .input-label {
            font-size: 24rpx;
            color: #666666;
            margin-bottom: 4rpx;
            display: block;
          }

          .input-value {
            font-size: 30rpx;
            color: #333333;
            font-weight: 500;

            &.placeholder {
              color: #999999;
              font-weight: normal;
            }
          }
        }

        .input-arrow {
          margin-left: 16rpx;
        }
      }
    }

    // 租期信息
    .rental-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      background: rgba(#67C23A, 0.05);
      border: 1rpx solid rgba(#67C23A, 0.2);
      border-radius: 12rpx;
      margin-top: 16rpx;

      .info-item {
        display: flex;
        align-items: center;

        .info-icon {
          margin-right: 8rpx;
        }

        .info-label {
          font-size: 24rpx;
          color: #666666;
        }

        .info-value {
          font-size: 26rpx;
          color: #67C23A;
          font-weight: 600;
          margin-left: 4rpx;
        }
      }
    }
  }

  // 区块标题
  .section-title {
    font-size: 28rpx;
    font-weight: 500;
    color: #333333;
    margin-bottom: 16rpx;
    display: block;
  }

  // 快速时间段选择
  .quick-periods {
    margin: 32rpx 0;

    .period-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12rpx;

      .period-item {
        padding: 16rpx 12rpx;
        background: #F8F8F8;
        border: 2rpx solid #E8E8E8;
        border-radius: 12rpx;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;

        &.active {
          background: rgba(#FF9F29, 0.1);
          border-color: #FF9F29;
        }

        .active {
          transform: scale(0.98);
        }

        .period-name {
          font-size: 26rpx;
          color: #333333;
          font-weight: 500;
          display: block;
          margin-bottom: 4rpx;
        }

        .period-desc {
          font-size: 22rpx;
          color: #666666;
        }
      }
    }
  }

  // 时间段提醒
  .time-notice {
    margin: 32rpx 0;
    padding: 20rpx;
    background: rgba(#F6AD55, 0.05);
    border-radius: 12rpx;
    border-left: 4rpx solid #F6AD55;

    .notice-header {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;

      .notice-title {
        font-size: 26rpx;
        color: #F6AD55;
        font-weight: 600;
        margin-left: 12rpx;
      }
    }

    .notice-content  { .notice-item { font-size: 24rpx;
        color: #666666;
        line-height: 1.6;
        margin-bottom: 4rpx;
        display: block; } }
  }
}

// 弹窗样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 48rpx;
}

// 快速选择弹窗
.quick-select-modal {
  width: 100%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow: hidden;

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 1px solid #E8E8E8;

    .modal-close,
    .modal-spacer {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #F7F8FA;
      transition: all 0.3s ease;
      cursor: pointer;

      .active {
        background: #E5E7EB;
        transform: scale(0.95);
      }
    }

    .modal-spacer {
      background: transparent;
      cursor: default;

      .active {
        transform: none;
      }
    }

    .modal-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333333;
      flex: 1;
      text-align: center;
      margin: 0 24rpx;
    }
  }

  .quick-options {
    padding: 32rpx;
    max-height: 60vh;
    overflow-y: auto;

    .option-group {
      margin-bottom: 32rpx;

      .last-child {
        margin-bottom: 0;
      }

      .group-title {
        font-size: 28rpx;
        color: #333333;
        font-weight: 600;
        margin-bottom: 16rpx;
        display: block;
      }

      .option-list {
        display: flex;
        flex-direction: column;
        gap: 12rpx;

        .option-item {
          padding: 20rpx;
          background: #F8F8F8;
          border: 2rpx solid #E8E8E8;
          border-radius: 12rpx;
          cursor: pointer;
          transition: all 0.3s ease;

          .active {
            background: rgba(#FF9F29, 0.05);
            border-color: #FF9F29;
          }

          .option-text {
            font-size: 28rpx;
            color: #333333;
          }
        }
      }
    }
  }
}

// 日期时间选择器弹窗
.datetime-picker-modal {
  width: 100%;
  max-width: 700rpx;
  height: 85vh;
  max-height: 1000rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 1px solid #E8E8E8;

    .picker-close {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #F7F8FA;
      transition: all 0.3s ease;
      cursor: pointer;

      .active {
        background: #E5E7EB;
        transform: scale(0.95);
      }
    }

    .picker-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333333;
      flex: 1;
      text-align: center;
      margin: 0 24rpx;
    }
  }

  .picker-content {
    flex: 1;
    display: flex;
    flex-direction: column;

    .date-section,
    .time-section {
      padding: 32rpx;
      border-bottom: 1px solid #E8E8E8;

      .last-child {
        border-bottom: none;
      }
    }

    // 日期选择
    .date-section  { .calendar-container { max-height: 300rpx; }.calendar-grid { .weekday-header { display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8rpx;
          margin-bottom: 16rpx;

          .weekday-text { font-size: 24rpx;
            color: #666666;
            text-align: center;
            font-weight: 500; } }

        .calendar-week {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8rpx;
          margin-bottom: 8rpx;

          .calendar-day {
            position: relative;
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8rpx;
            cursor: pointer;
            transition: all 0.3s ease;

            .active {
              transform: scale(0.95);
            }

            .day-number {
              font-size: 26rpx;
              color: #333333;
            }

            .today-mark {
              position: absolute;
              top: 4rpx;
              right: 4rpx;
              font-size: 18rpx;
              color: #FF9F29;
              background: rgba(#FF9F29, 0.1);
              padding: 2rpx 4rpx;
              border-radius: 4rpx;
            }

            &.calendar-day--today {
              border: 2rpx solid #FF9F29;
            }

            &.calendar-day--selected {
              background: #FF9F29;
              color: #FFFFFF;

              .day-number {
                color: #FFFFFF;
              }

              .today-mark {
                color: #FFFFFF;
                background: rgba(255, 255, 255, 0.2);
              }
            }

            &.calendar-day--weekend  { .day-number { color: #FF4D4F; } }

            &.calendar-day--disabled {
              opacity: 0.3;
              cursor: not-allowed;

              .day-number {
                color: #999999;
              }
            }
          }
        }
      }
    }

    // 时间选择
    .time-section {
      .time-picker {
        display: flex;
        gap: 24rpx;

        .time-column {
          flex: 1;

          .time-label {
            font-size: 26rpx;
            color: #666666;
            text-align: center;
            margin-bottom: 16rpx;
            display: block;
          }

          .time-list {
            height: 200rpx;
            border: 2rpx solid #E8E8E8;
            border-radius: 12rpx;
            padding: 8rpx;

            .time-item {
              height: 60rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 8rpx;
              cursor: pointer;
              transition: all 0.3s ease;

              .active {
                background: rgba(#FF9F29, 0.05);
              }

              &.active {
                background: #FF9F29;
                color: #FFFFFF;
              }

              .time-text {
                font-size: 28rpx;
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 750rpx) {
  .datetime-picker  { .quick-periods { .period-grid { grid-template-columns: repeat(3, 1fr); } }
  }

  .datetime-picker-modal  { .picker-content { .time-section { .time-picker { gap: 16rpx; } }
    }
  }
}
</style>