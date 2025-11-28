import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/components/layout/AdminLayout.vue'
import { useUserStore } from '@/stores/user'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '工作台', icon: 'House' },
      },
      {
        path: '/vehicles',
        name: 'Vehicles',
        component: () => import('@/views/vehicles/VehicleList.vue'),
        meta: { title: '车辆管理', icon: 'Van' },
      },
      {
        path: '/vehicles/create',
        name: 'VehicleCreate',
        component: () => import('@/views/vehicles/VehicleForm.vue'),
        meta: { title: '添加车辆', hidden: true },
      },
      {
        path: '/vehicles/:id/edit',
        name: 'VehicleEdit',
        component: () => import('@/views/vehicles/VehicleForm.vue'),
        meta: { title: '编辑车辆', hidden: true },
      },
      {
        path: '/orders',
        name: 'Orders',
        component: () => import('@/views/orders/OrderList.vue'),
        meta: { title: '订单管理', icon: 'List' },
      },
      {
        path: '/orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/orders/OrderDetail.vue'),
        meta: { title: '订单详情', hidden: true },
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import('@/views/users/UserList.vue'),
        meta: { title: '用户管理', icon: 'User' },
      },
      {
        path: '/payments',
        name: 'Payments',
        component: () => import('@/views/payments/PaymentList.vue'),
        meta: { title: '财务管理', icon: 'Money' },
      },
      {
        path: '/coupons',
        name: 'Coupons',
        component: () => import('@/views/marketing/CouponList.vue'),
        meta: { title: '优惠券管理', icon: 'Ticket' },
      },
      {
        path: '/reviews',
        name: 'Reviews',
        component: () => import('@/views/marketing/ReviewList.vue'),
        meta: { title: '评价管理', icon: 'ChatDotRound' },
      },
    ],
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '页面不存在' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isAuthenticated

  if (to.meta.requiresAuth !== false && !isAuthenticated) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    // 已登录用户访问登录页，跳转到工作台
    next('/dashboard')
  } else {
    next()
  }

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 叨叨房车租赁管理平台`
  }
})

export default router