import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '仪表盘', requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserList',
    component: () => import('@/views/users/index.vue'),
    meta: { title: '用户管理', requiresAuth: true }
  },
  {
    path: '/users/:id',
    name: 'UserDetail',
    component: () => import('@/views/users/Detail.vue'),
    meta: { title: '用户详情', requiresAuth: true }
  },
  {
    path: '/users/:id/edit',
    name: 'UserEdit',
    component: () => import('@/views/users/Edit.vue'),
    meta: { title: '编辑用户', requiresAuth: true }
  },
  {
    path: '/diy',
    name: 'DiyProjects',
    component: () => import('@/views/diy/projects/index.vue'),
    meta: { title: 'DIY项目管理', requiresAuth: true }
  },
  {
    path: '/diy/projects/new',
    name: 'DiyProjectCreate',
    component: () => import('@/views/diy/projects/Create.vue'),
    meta: { title: '创建DIY项目', requiresAuth: true }
  },
  {
    path: '/diy/projects/:id',
    name: 'DiyProjectDetail',
    component: () => import('@/views/diy/projects/Detail.vue'),
    meta: { title: 'DIY项目详情', requiresAuth: true }
  },
  {
    path: '/diy/projects/:id/edit',
    name: 'DiyEditor',
    component: () => import('@/views/diy/editor/index.vue'),
    meta: { title: 'DIY可视化编辑器', requiresAuth: true }
  },
  {
    path: '/diy/templates',
    name: 'DiyTemplates',
    component: () => import('@/views/diy/templates/index.vue'),
    meta: { title: 'DIY模板管理', requiresAuth: true }
  },
  {
    path: '/vehicles',
    name: 'VehicleList',
    component: () => import('@/views/vehicles/index.vue'),
    meta: { title: '车辆管理', requiresAuth: true }
  },
  {
    path: '/vehicles/create',
    name: 'VehicleCreate',
    component: () => import('@/views/vehicles/Create.vue'),
    meta: { title: '添加车辆', requiresAuth: true }
  },
  {
    path: '/vehicles/:id',
    name: 'VehicleDetail',
    component: () => import('@/views/vehicles/Detail.vue'),
    meta: { title: '车辆详情', requiresAuth: true }
  },
  {
    path: '/vehicles/:id/edit',
    name: 'VehicleEdit',
    component: () => import('@/views/vehicles/Edit.vue'),
    meta: { title: '编辑车辆', requiresAuth: true }
  },
  {
    path: '/vehicles/:id/availability',
    name: 'VehicleAvailability',
    component: () => import('@/views/vehicles/Availability.vue'),
    meta: { title: '车辆可用性', requiresAuth: true }
  },
  {
    path: '/vehicles/:id/maintenance',
    name: 'VehicleMaintenance',
    component: () => import('@/views/vehicles/Maintenance.vue'),
    meta: { title: '维护记录', requiresAuth: true }
  },
  {
    path: '/vehicles/:id/bookings',
    name: 'VehicleBookings',
    component: () => import('@/views/vehicles/Bookings.vue'),
    meta: { title: '预约记录', requiresAuth: true }
  },
  {
    path: '/vehicles/:id/reviews',
    name: 'VehicleReviews',
    component: () => import('@/views/vehicles/Reviews.vue'),
    meta: { title: '车辆评价', requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: () => import('@/views/orders/index.vue'),
    meta: { title: '订单管理', requiresAuth: true }
  },
  {
    path: '/orders/create',
    name: 'OrderCreate',
    component: () => import('@/views/orders/Create.vue'),
    meta: { title: '新建订单', requiresAuth: true }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('@/views/orders/Detail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },
  {
    path: '/orders/:id/edit',
    name: 'OrderEdit',
    component: () => import('@/views/orders/Edit.vue'),
    meta: { title: '编辑订单', requiresAuth: true }
  },
  {
    path: '/orders/:id/payment',
    name: 'OrderPayment',
    component: () => import('@/views/orders/Payment.vue'),
    meta: { title: '订单支付', requiresAuth: true }
  },
  {
    path: '/orders/:id/refund',
    name: 'OrderRefund',
    component: () => import('@/views/orders/Refund.vue'),
    meta: { title: '订单退款', requiresAuth: true }
  },
  {
    path: '/orders/:id/pickup',
    name: 'OrderPickup',
    component: () => import('@/views/orders/Pickup.vue'),
    meta: { title: '取车管理', requiresAuth: true }
  },
  {
    path: '/orders/:id/return',
    name: 'OrderReturn',
    component: () => import('@/views/orders/Return.vue'),
    meta: { title: '还车管理', requiresAuth: true }
  },
  {
    path: '/orders/:id/documents',
    name: 'OrderDocuments',
    component: () => import('@/views/orders/Documents.vue'),
    meta: { title: '订单文件', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Set page title
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 叨叨房车管理后台`
  }

  // Authentication check
  if (to.meta?.requiresAuth) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      next('/login')
      return
    }
  }

  next()
})

export default router