import type { RouteRecordRaw } from 'vue-router'

/**
 * 固定路由（不需要权限的路由）
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      hidden: true,
      noAuth: true
    }
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '403 Forbidden',
      hidden: true,
      noAuth: true
    }
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '404 Not Found',
      hidden: true,
      noAuth: true
    }
  },
  {
    path: '/500',
    name: '500',
    component: () => import('@/views/error/500.vue'),
    meta: {
      title: '500 Server Error',
      hidden: true,
      noAuth: true
    }
  },
  {
    path: '/',
    redirect: '/dashboard',
    meta: {
      hidden: true
    }
  }
]

/**
 * 异步路由（需要权限的路由）
 */
export const asyncRoutes: RouteRecordRaw[] = [
  // 工作台
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard/index',
    meta: {
      title: '工作台',
      icon: 'Odometer',
      sort: 1,
      permission: 'dashboard:view'
    },
    children: [
      {
        path: 'index',
        name: 'DashboardIndex',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '概览',
          icon: 'Odometer',
          sort: 1,
          isLeaf: true,
          permission: 'dashboard:view'
        }
      }
    ]
  },

  // 核心业务管理
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/users/list',
    meta: {
      title: '用户管理',
      icon: 'User',
      sort: 2,
      permission: 'user:view'
    },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/users/list.vue'),
        meta: {
          title: '用户列表',
          icon: 'User',
          sort: 1,
          isLeaf: true,
          permission: 'user:view'
        }
      },
      {
        path: 'create',
        name: 'UserCreate',
        component: () => import('@/views/users/create.vue'),
        meta: {
          title: '创建用户',
          hidden: true,
          permission: 'user:create'
        }
      },
      {
        path: ':id/edit',
        name: 'UserEdit',
        component: () => import('@/views/users/edit.vue'),
        meta: {
          title: '编辑用户',
          hidden: true,
          permission: 'user:edit'
        }
      },
      {
        path: ':id',
        name: 'UserDetail',
        component: () => import('@/views/users/detail.vue'),
        meta: {
          title: '用户详情',
          hidden: true,
          permission: 'user:view'
        }
      }
    ]
  },

  {
    path: '/vehicles',
    name: 'VehicleManagement',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/vehicles/list',
    meta: {
      title: '车辆管理',
      icon: 'Truck',
      sort: 3,
      permission: 'vehicle:view'
    },
    children: [
      {
        path: 'list',
        name: 'VehicleList',
        component: () => import('@/views/vehicles/list.vue'),
        meta: {
          title: '车辆列表',
          icon: 'Truck',
          sort: 1,
          isLeaf: true,
          permission: 'vehicle:view'
        }
      },
      {
        path: 'create',
        name: 'VehicleCreate',
        component: () => import('@/views/vehicles/create.vue'),
        meta: {
          title: '添加车辆',
          hidden: true,
          permission: 'vehicle:create'
        }
      },
      {
        path: ':id/edit',
        name: 'VehicleEdit',
        component: () => import('@/views/vehicles/edit.vue'),
        meta: {
          title: '编辑车辆',
          hidden: true,
          permission: 'vehicle:edit'
        }
      },
      {
        path: ':id',
        name: 'VehicleDetail',
        component: () => import('@/views/vehicles/detail.vue'),
        meta: {
          title: '车辆详情',
          hidden: true,
          permission: 'vehicle:view'
        }
      }
    ]
  },

  {
    path: '/stores',
    name: 'StoreManagement',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/stores/list',
    meta: {
      title: '门店管理',
      icon: 'Shop',
      sort: 4,
      permission: 'store:view'
    },
    children: [
      {
        path: 'list',
        name: 'StoreList',
        component: () => import('@/views/stores/list.vue'),
        meta: {
          title: '门店列表',
          icon: 'Shop',
          sort: 1,
          isLeaf: true,
          permission: 'store:view'
        }
      },
      {
        path: 'create',
        name: 'StoreCreate',
        component: () => import('@/views/stores/create.vue'),
        meta: {
          title: '添加门店',
          hidden: true,
          permission: 'store:create'
        }
      },
      {
        path: ':id/edit',
        name: 'StoreEdit',
        component: () => import('@/views/stores/edit.vue'),
        meta: {
          title: '编辑门店',
          hidden: true,
          permission: 'store:edit'
        }
      }
    ]
  },

  {
    path: '/orders',
    name: 'OrderManagement',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/orders/list',
    meta: {
      title: '订单管理',
      icon: 'Document',
      sort: 5,
      permission: 'order:view'
    },
    children: [
      {
        path: 'list',
        name: 'OrderList',
        component: () => import('@/views/orders/list.vue'),
        meta: {
          title: '订单列表',
          icon: 'Document',
          sort: 1,
          isLeaf: true,
          permission: 'order:view'
        }
      },
      {
        path: ':id',
        name: 'OrderDetail',
        component: () => import('@/views/orders/detail.vue'),
        meta: {
          title: '订单详情',
          hidden: true,
          permission: 'order:view'
        }
      }
    ]
  },

  // 众筹管理
  {
    path: '/crowdfunding',
    name: 'CrowdfundingManagement',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/crowdfunding/projects',
    meta: {
      title: '众筹管理',
      icon: 'Money',
      sort: 6,
      permission: 'crowdfunding:view'
    },
    children: [
      {
        path: 'projects',
        name: 'CrowdfundingProjects',
        component: () => import('@/views/crowdfunding/projects/list.vue'),
        meta: {
          title: '众筹项目',
          icon: 'Money',
          sort: 1,
          isLeaf: true,
          permission: 'crowdfunding:view'
        }
      },
      {
        path: 'projects/create',
        name: 'CrowdfundingProjectCreate',
        component: () => import('@/views/crowdfunding/projects/create.vue'),
        meta: {
          title: '创建项目',
          hidden: true,
          permission: 'crowdfunding:create'
        }
      }
    ]
  },

  // 营销管理
  {
    path: '/marketing',
    name: 'MarketingManagement',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/marketing/coupons',
    meta: {
      title: '营销管理',
      icon: 'Megaphone',
      sort: 7,
      permission: 'marketing:view'
    },
    children: [
      {
        path: 'coupons',
        name: 'CouponManagement',
        component: () => import('@/views/marketing/coupons/list.vue'),
        meta: {
          title: '优惠券管理',
          icon: 'Ticket',
          sort: 1,
          isLeaf: true,
          permission: 'coupon:view'
        }
      },
      {
        path: 'pricing',
        name: 'PricingManagement',
        component: () => import('@/views/marketing/pricing/list.vue'),
        meta: {
          title: '价格策略',
          icon: 'PriceTag',
          sort: 2,
          isLeaf: true,
          permission: 'pricing:view'
        }
      }
    ]
  },

  // 系统管理
  {
    path: '/system',
    name: 'SystemManagement',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/system/permissions',
    meta: {
      title: '系统管理',
      icon: 'Setting',
      sort: 8,
      roles: ['platform_admin', 'super_admin']
    },
    children: [
      {
        path: 'permissions',
        name: 'PermissionManagement',
        component: () => import('@/views/system/permissions/list.vue'),
        meta: {
          title: '权限管理',
          icon: 'Lock',
          sort: 1,
          isLeaf: true,
          permission: 'permission:view'
        }
      },
      {
        path: 'employees',
        name: 'EmployeeManagement',
        component: () => import('@/views/system/employees/list.vue'),
        meta: {
          title: '员工管理',
          icon: 'Avatar',
          sort: 2,
          isLeaf: true,
          permission: 'employee:view'
        }
      },
      {
        path: 'config',
        name: 'SystemConfig',
        component: () => import('@/views/system/config/index.vue'),
        meta: {
          title: '系统配置',
          icon: 'Tools',
          sort: 3,
          isLeaf: true,
          permission: 'system:config'
        }
      },
      {
        path: 'logs',
        name: 'SystemLogs',
        component: () => import('@/views/system/logs/list.vue'),
        meta: {
          title: '审计日志',
          icon: 'Document',
          sort: 4,
          isLeaf: true,
          permission: 'log:view'
        }
      }
    ]
  },

  // 财务管理
  {
    path: '/finance',
    name: 'FinanceManagement',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/finance/overview',
    meta: {
      title: '财务管理',
      icon: 'Coin',
      sort: 9,
      permission: 'finance:view'
    },
    children: [
      {
        path: 'overview',
        name: 'FinanceOverview',
        component: () => import('@/views/finance/overview.vue'),
        meta: {
          title: '财务概览',
          icon: 'Coin',
          sort: 1,
          isLeaf: true,
          permission: 'finance:view'
        }
      },
      {
        path: 'revenue',
        name: 'RevenueManagement',
        component: () => import('@/views/finance/revenue.vue'),
        meta: {
          title: '收入统计',
          icon: 'TrendCharts',
          sort: 2,
          isLeaf: true,
          permission: 'finance:revenue'
        }
      }
    ]
  },

  // 个人中心
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/profile/index',
    meta: {
      title: '个人中心',
      hidden: true,
      permission: 'profile:view'
    },
    children: [
      {
        path: 'index',
        name: 'ProfileIndex',
        component: () => import('@/views/profile/index.vue'),
        meta: {
          title: '个人信息',
          hidden: true,
          permission: 'profile:view'
        }
      },
      {
        path: 'password',
        name: 'ProfilePassword',
        component: () => import('@/views/profile/password.vue'),
        meta: {
          title: '修改密码',
          hidden: true,
          permission: 'profile:password'
        }
      }
    ]
  },

  // 404页面必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/404',
    meta: {
      hidden: true,
      noAuth: true
    }
  }
]

/**
 * 所有路由
 */
export const allRoutes = [...constantRoutes, ...asyncRoutes]