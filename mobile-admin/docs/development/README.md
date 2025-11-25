# 移动管理端开发环境搭建指南

本文档指导开发者快速搭建叨叨房车移动管理端的开发环境。

## 系统要求

- **操作系统**: Windows 10+, macOS 10.15+
- **Node.js**: 18.18.0 LTS 或更高版本
- **HBuilderX**: 3.8.0+ (推荐)
- **微信开发者工具**: 最新版本 (用于微信小程序调试)
- **Git**: 2.20+

## 快速开始

### 1. 获取代码

```bash
git clone <repository-url>
cd daodao/mobile-admin
```

### 2. 安装HBuilderX

1. 下载HBuilderX: https://www.dcloud.io/hbuilderx.html
2. 推荐版本：HBuilderX 3.8.0+
3. 安装必要插件：uni-ui、TypeScript、ESLint

### 3. 配置开发环境

1. 打开HBuilderX
2. 文件 → 打开目录 → 选择 `mobile-admin` 目录
3. 等待依赖自动安装

### 4. 安装依赖

```bash
# 在mobile-admin目录下
npm install
```

### 5. 配置微信开发者工具

1. 打开微信开发者工具
2. 导入项目 → 选择 `mobile-admin` 目录
3. 填写AppID（测试阶段可使用测试号）
4. 设置项目名称：叨叨房车移动管理端

### 6. 启动开发服务

**方法1: 使用HBuilderX**
1. 在HBuilderX中点击 运行 → 运行到小程序模拟器 → 微信开发者工具
2. 自动编译并打开微信开发者工具

**方法2: 命令行**
```bash
# 开发模式
npm run dev:mp-weixin

# 构建模式
npm run build:mp-weixin
```

## 项目特点

移动管理端专为现场业务操作设计，具有以下特点：

### 业务场景
- **现场车辆检查**: 上传车辆状况照片
- **订单状态管理**: 更新订单状态
- **用户身份验证**: 核实用户身份信息
- **实时数据同步**: 与后端实时通信

### 技术特性
- **移动优先**: 针对手机操作优化
- **离线缓存**: 支持离���数据访问
- **拍照上传**: 集成设备摄像头
- **扫码功能**: 支持二维码扫描

## 开发工作流

### 页面开发

1. **创建新页面**
   ```bash
   # 在pages目录下创建新页面
   mkdir pages/vehicle-check
   touch pages/vehicle-check/index.vue
   touch pages/vehicle-check/index.json
   ```

2. **注册页面路由**
   ```json
   // pages.json
   {
     "pages": [
       {
         "path": "pages/vehicle-check/index",
         "style": {
           "navigationBarTitleText": "车辆检查",
           "enablePullDownRefresh": true
         }
       }
     ]
   }
   ```

3. **页面示例**
   ```vue
   <template>
     <view class="container">
       <!-- 顶部信息 -->
       <uni-card :is-shadow="false" is-full>
         <text class="title">车辆状况检查</text>
         <text class="subtitle">车牌号：{{ vehicleInfo.licensePlate }}</text>
       </uni-card>

       <!-- 检查项列表 -->
       <uni-list>
         <uni-list-item
           v-for="item in checkItems"
           :key="item.id"
           :title="item.name"
           :note="item.description"
           show-arrow
           @click="handleCheckItem(item)"
         >
           <template v-slot:header>
             <uni-icons :type="item.checked ? 'checkbox-filled' : 'checkbox'"
                       :color="item.checked ? '#007aff' : '#c0c4cc'" />
           </template>
         </uni-list-item>
       </uni-list>

       <!-- 拍照上传区域 -->
       <view class="photo-section">
         <text class="section-title">现场照片</text>
         <view class="photo-grid">
           <view
             v-for="(photo, index) in photos"
             :key="index"
             class="photo-item"
             @click="previewPhoto(index)"
           >
             <image :src="photo" mode="aspectFill" />
             <view class="delete-btn" @click.stop="deletePhoto(index)">
               <uni-icons type="clear" color="#ffffff" />
             </view>
           </view>

           <!-- 添加照片按钮 -->
           <view class="add-photo" @click="takePhoto">
             <uni-icons type="camera" size="40" color="#c0c4cc" />
             <text>拍照</text>
           </view>
         </view>
       </view>

       <!-- 操作按钮 -->
       <view class="actions">
         <button class="btn-primary" @click="submitCheck">提交检查</button>
       </view>
     </view>
   </template>

   <script setup lang="ts">
   import { ref, reactive, onMounted } from 'vue'

   // 接口定义
   interface CheckItem {
     id: number
     name: string
     description: string
     checked: boolean
   }

   interface VehicleInfo {
     id: number
     licensePlate: string
     model: string
   }

   // 响应式数据
   const vehicleInfo = ref<VehicleInfo>({
     id: 1,
     licensePlate: '沪A88888',
     model: '奔驰C200L'
   })

   const checkItems = ref<CheckItem[]>([
     {
       id: 1,
       name: '车身外观',
       description: '检查是否有刮痕、凹陷',
       checked: false
     },
     {
       id: 2,
       name: '轮胎状况',
       description: '检查轮胎磨损和气压',
       checked: false
     },
     {
       id: 3,
       name: '车内清洁',
       description: '检查内饰清洁程度',
       checked: false
     },
     {
       id: 4,
       name: '油量电量',
       description: '检查油量和电池电量',
       checked: false
     }
   ])

   const photos = ref<string[]>([])

   // 方法
   const handleCheckItem = (item: CheckItem) => {
     item.checked = !item.checked
   }

   const takePhoto = () => {
     uni.chooseImage({
       count: 1,
       sourceType: ['camera'],
       success: (res) => {
         if (res.tempFilePaths.length > 0) {
           photos.value.push(res.tempFilePaths[0])
         }
       },
       fail: (err) => {
         uni.showToast({
           title: '拍照失败',
           icon: 'none'
         })
       }
     })
   }

   const previewPhoto = (index: number) => {
     uni.previewImage({
       current: index,
       urls: photos.value
     })
   }

   const deletePhoto = (index: number) => {
     uni.showModal({
       title: '确认删除',
       content: '确定要删除这张照片吗？',
       success: (res) => {
         if (res.confirm) {
           photos.value.splice(index, 1)
         }
       }
     })
   }

   const submitCheck = () => {
     const uncheckedItems = checkItems.value.filter(item => !item.checked)

     if (uncheckedItems.length > 0) {
       uni.showToast({
         title: '请完成所有检查项',
         icon: 'none'
       })
       return
     }

     if (photos.value.length === 0) {
       uni.showToast({
         title: '请至少上传一张现场照片',
         icon: 'none'
       })
       return
     }

     // 提交检查结果
     uni.showLoading({
       title: '提交中...'
     })

     setTimeout(() => {
       uni.hideLoading()
       uni.showToast({
         title: '提交成功',
         icon: 'success'
       })

       // 返回上一页
       setTimeout(() => {
         uni.navigateBack()
       }, 1500)
     }, 2000)
   }

   onMounted(() => {
     console.log('车辆检查页面加载完成')
   })
   </script>

   <style scoped>
   .container {
     background-color: #f5f5f5;
     min-height: 100vh;
   }

   .title {
     font-size: 36rpx;
     font-weight: bold;
     color: #333;
   }

   .subtitle {
     font-size: 28rpx;
     color: #666;
     margin-top: 10rpx;
     display: block;
   }

   .photo-section {
     margin: 20rpx;
     padding: 30rpx;
     background-color: #ffffff;
     border-radius: 10rpx;
   }

   .section-title {
     font-size: 32rpx;
     font-weight: bold;
     color: #333;
     display: block;
     margin-bottom: 20rpx;
   }

   .photo-grid {
     display: flex;
     flex-wrap: wrap;
     gap: 20rpx;
   }

   .photo-item {
     position: relative;
     width: 200rpx;
     height: 200rpx;
     border-radius: 10rpx;
     overflow: hidden;
   }

   .photo-item image {
     width: 100%;
     height: 100%;
   }

   .delete-btn {
     position: absolute;
     top: 10rpx;
     right: 10rpx;
     width: 40rpx;
     height: 40rpx;
     background-color: rgba(0, 0, 0, 0.5);
     border-radius: 50%;
     display: flex;
     align-items: center;
     justify-content: center;
   }

   .add-photo {
     width: 200rpx;
     height: 200rpx;
     border: 2rpx dashed #c0c4cc;
     border-radius: 10rpx;
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     color: #c0c4cc;
   }

   .add-photo text {
     font-size: 24rpx;
     margin-top: 10rpx;
   }

   .actions {
     padding: 40rpx;
   }

   .btn-primary {
     background-color: #007aff;
     color: #ffffff;
     border: none;
     border-radius: 10rpx;
     height: 88rpx;
     line-height: 88rpx;
     font-size: 32rpx;
     font-weight: bold;
   }

   .btn-primary:active {
     background-color: #0056cc;
   }
   </style>
   ```

### API接口调用

```javascript
// api/vehicle.js
import request from '@/utils/request'

export const vehicleApi = {
  // 获取车辆列表
  getList: (params) => {
    return request({
      url: '/api/v1/admin/vehicles',
      method: 'GET',
      params
    })
  },

  // 更新车辆状态
  updateStatus: (id, status) => {
    return request({
      url: `/api/v1/admin/vehicles/${id}/status`,
      method: 'PUT',
      data: { status }
    })
  },

  // 上传车辆检查照片
  uploadPhotos: (vehicleId, photos) => {
    return request({
      url: `/api/v1/admin/vehicles/${vehicleId}/photos`,
      method: 'POST',
      data: { photos }
    })
  }
}
```

### 扫码功能

```vue
<template>
  <view class="scanner-container">
    <button @click="scanQRCode">扫码核验</button>
  </view>
</template>

<script setup lang="ts">
const scanQRCode = () => {
  uni.scanCode({
    success: (res) => {
      console.log('扫码结果:', res.result)

      // 处理扫码结果
      handleScanResult(res.result)
    },
    fail: (err) => {
      uni.showToast({
        title: '扫码失败',
        icon: 'none'
      })
    }
  })
}

const handleScanResult = (result: string) => {
  // 解析二维码内容
  try {
    const data = JSON.parse(result)

    // 根据二维码类型处理
    switch (data.type) {
      case 'order':
        // 处理订单二维码
        uni.navigateTo({
          url: `/pages/order/detail?id=${data.orderId}`
        })
        break
      case 'vehicle':
        // 处理车辆二维码
        uni.navigateTo({
          url: `/pages/vehicle/check?id=${data.vehicleId}`
        })
        break
      case 'user':
        // 处理用户二维码
        uni.navigateTo({
          url: `/pages/user/verify?id=${data.userId}`
        })
        break
      default:
        uni.showToast({
          title: '无效的二维码',
          icon: 'none'
        })
    }
  } catch (error) {
    uni.showToast({
      title: '二维码格式错误',
      icon: 'none'
    })
  }
}
</script>
```

## 开发规范

### uni-app开发要求

**组件使用优先级：**
1. **第一优先级**: uni-app内置组件
2. **第二优先级**: uni-ui组件库
3. **第三优先级**: 自定义业务组件

**移动端优化：**
- 使用upx单位确保跨端兼容
- 优化触摸区域大小（最小88rpx）
- 考虑网络状况，添加loading状态
- 合理使用缓存提升性能

### 代码规范

**Vue 3 + TypeScript：**
```typescript
// ✅ 正确：使用 Composition API
<script setup lang="ts">
interface VehicleCheck {
  id: number
  status: string
  photos: string[]
}

const checkData = ref<VehicleCheck>({
  id: 0,
  status: '',
  photos: []
})

const takePhoto = async (): Promise<void> => {
  // 实现拍照逻辑
}
</script>

// ❌ 错误：使用 Options API
<script>
export default {
  data() {
    return {
      checkData: {}
    }
  }
}
</script>
```

### 性能优化

```vue
<!-- ✅ 正确：使用key优化列表渲染 -->
<uni-list>
  <uni-list-item
    v-for="item in checkList"
    :key="item.id"
    :title="item.name"
  />
</uni-list>

<!-- ✅ 正确：图片懒加载 -->
<image
  :src="imageUrl"
  mode="aspectFill"
  lazy-load
/>

<!-- ❌ 错误：不使用key -->
<uni-list>
  <uni-list-item
    v-for="item in checkList"
    :title="item.name"
  />
</uni-list>
```

## 测试和调试

### 真机调试

1. **微信小程序调试**
   - 手机扫码预览
   - 真机运行效果检查
   - 性能监控

2. **功能测试要点**
   - 拍照上传功能
   - 扫码识别功能
   - 网络异常处理
   - 离线数据缓存

### 调试技巧

```javascript
// 开发环境调试信息
if (process.env.NODE_ENV === 'development') {
  console.log('调试信息:', data)

  // 显示调试面板
  uni.showModal({
    title: '调试信息',
    content: JSON.stringify(data),
    showCancel: false
  })
}
```

## 常见问题

### Q: 相机权限被拒绝
A: 解决方案：
```javascript
const checkCameraPermission = () => {
  uni.getSetting({
    success: (res) => {
      if (!res.authSetting['scope.camera']) {
        uni.authorize({
          scope: 'scope.camera',
          success: () => {
            // 权限获取成功
          },
          fail: () => {
            // 引导用户手动开启权限
            uni.showModal({
              title: '需要相机权限',
              content: '请在设置中开启相机权限',
              success: (res) => {
                if (res.confirm) {
                  uni.openSetting()
                }
              }
            })
          }
        })
      }
    }
  })
}
```

### Q: 扫码功能不工作
A: 检查要点：
1. 确认设备有摄像头
2. 检查小程序权限配置
3. 确认二维码格式正确

### Q: 图片上传失败
A: 排查步骤：
1. 检查网络连接
2. 确认API接口正常
3. 查看图片文件大小

## 发布流程

### 1. 代码检查
```bash
npm run lint
npm run type-check
```

### 2. 构建生产版本
```bash
npm run build:mp-weixin
```

### 3. 上传发布
1. 微信开发者工具中点击"上传"
2. 填写版本号和更新说明
3. 提交审核

## 专用功能模块

### 车辆检查模块
- 外观检查记录
- 油量电量检查
- 现场照片上传
- 检查报告生成

### 订单管理模块
- 订单状态更新
- 用户身份核验
- 现场拍照记录
- 异常情况上报

### 用户验证模块
- 身份证识别
- 人脸比对
- 手写签名
- 验证记录保存

## 获取帮助

- **uni-app官方文档**: https://uniapp.dcloud.io/
- **项目文档**: `../../shared/docs/`
- **技术支持**: 联系项目维护者
- **问题反馈**: 提交Issue到项目仓库

---

**提示**: 移动端开发需特别关注用户体验和性能优化，建议在真机上充分测试。