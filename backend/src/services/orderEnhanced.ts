import { Op } from 'sequelize';
import {
  Order, OrderStatus, OrderTimeline, OrderReminder, OrderRefundRequest,
  OrderReviewInvitation, OrderException, OrderNotification, OrderFeeDetail,
  OrderFile, User, Vehicle, Store
} from '../models';
import { sequelize } from '../config/database';
import { generateTransactionNo, generateOrderNo } from '../utils/generator';

export interface OrderFilters {
  userId?: number;
  statusId?: number;
  vehicleId?: number;
  driverId?: number;
  storeId?: number;
  priority?: string;
  sourceChannel?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  keyword?: string;
}

export interface OrderStatusUpdate {
  statusId: number;
  operatorId?: number;
  operatorType?: 'user' | 'admin' | 'driver' | 'system';
  operatorName?: string;
  notes?: string;
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface ReminderConfig {
  reminderType: 'pickup' | 'return' | 'payment' | 'inspection';
  reminderTime: Date;
  message: string;
  channels: string[];
  enabled?: boolean;
}

export class OrderEnhancedService {
  /**
   * 获取增强的订单列表
   */
  public async getOrders(
    page: number = 1,
    limit: number = 20,
    filters: OrderFilters = {}
  ) {
    const whereClause: any = {};

    // 构建查询条件
    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters.statusId) {
      whereClause.statusId = filters.statusId;
    }

    if (filters.vehicleId) {
      whereClause.vehicleId = filters.vehicleId;
    }

    if (filters.driverId) {
      whereClause.assignedDriverId = filters.driverId;
    }

    if (filters.priority) {
      whereClause.priority = filters.priority;
    }

    if (filters.sourceChannel) {
      whereClause.sourceChannel = filters.sourceChannel;
    }

    if (filters.dateRange) {
      whereClause[Op.and] = [
        {
          createdAt: {
            [Op.gte]: filters.dateRange.startDate
          }
        },
        {
          createdAt: {
            [Op.lte]: filters.dateRange.endDate
          }
        }
      ];
    }

    if (filters.keyword) {
      whereClause[Op.or] = [
        { orderNo: { [Op.like]: `%${filters.keyword}%` } },
        { pickupContactName: { [Op.like]: `%${filters.keyword}%` } },
        { pickupContactPhone: { [Op.like]: `%${filters.keyword}%` } }
      ];
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderStatus,
          attributes: ['id', 'name', 'code']
        },
        {
          model: User,
          attributes: ['id', 'nickname', 'phone', 'avatar']
        },
        {
          model: Vehicle,
          attributes: ['id', 'name', 'brand', 'model', 'plateNumber', 'images']
        },
        {
          model: Store,
          as: 'pickupStore',
          attributes: ['id', 'name', 'address']
        },
        {
          model: Store,
          as: 'returnStore',
          attributes: ['id', 'name', 'address']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit,
      offset: (page - 1) * limit
    });

    return {
      orders: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * 获取订单完整详情
   */
  public async getOrderDetail(orderId: number, userId?: number) {
    const whereClause: any = { id: orderId };
    if (userId) {
      whereClause.userId = userId;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: OrderStatus,
          attributes: ['id', 'name', 'code', 'description']
        },
        {
          model: User,
          attributes: ['id', 'nickname', 'phone', 'avatar', 'isVip']
        },
        {
          model: Vehicle,
          attributes: ['id', 'name', 'brand', 'model', 'plateNumber', 'images', 'features']
        },
        {
          model: Store,
          as: 'pickupStore',
          attributes: ['id', 'name', 'address', 'phone', 'businessHours']
        },
        {
          model: Store,
          as: 'returnStore',
          attributes: ['id', 'name', 'address', 'phone', 'businessHours']
        }
      ]
    });

    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    // 获取订单时间线
    const timeline = await OrderTimeline.findAll({
      where: { orderId },
      order: [['createdAt', 'ASC']]
    });

    // 获取订单费用明细
    const feeDetails = await OrderFeeDetail.findAll({
      where: { orderId },
      order: [['createdAt', 'ASC']]
    });

    // 获取订单文件
    const files = await OrderFile.findAll({
      where: { orderId },
      order: [['createdAt', 'DESC']]
    });

    // 获取订单提醒
    const reminders = await OrderReminder.findAll({
      where: { orderId },
      order: [['reminderTime', 'ASC']]
    });

    // 获取订单异常
    const exceptions = await OrderException.findAll({
      where: { orderId },
      order: [['createdAt', 'DESC']]
    });

    return {
      ...order.toJSON(),
      timeline,
      feeDetails,
      files,
      reminders,
      exceptions
    };
  }

  /**
   * 更新订单状态
   */
  public async updateOrderStatus(
    orderId: number,
    statusUpdate: OrderStatusUpdate,
    userId?: number
  ) {
    const transaction = await sequelize.transaction();

    try {
      // 检查订单是否存在
      const order = await Order.findByPk(orderId, { transaction });
      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }

      // 如果是用户操作，检查权限
      if (userId && order.userId !== userId) {
        throw new Error('PERMISSION_DENIED');
      }

      // 检查状态流转是否合法
      await this.validateStatusTransition(order.statusId, statusUpdate.statusId);

      // 更新订单状态
      const updatedOrder = await order.update({
        statusId: statusUpdate.statusId,
        lastStatusChangeAt: new Date()
      }, { transaction });

      // 记录状态变更时间线
      const statusInfo = await OrderStatus.findByPk(statusUpdate.statusId, { transaction });
      if (statusInfo) {
        await OrderTimeline.create({
          orderId,
          statusCode: statusInfo.code,
          statusName: statusInfo.name,
          description: statusUpdate.notes || `状态变更为: ${statusInfo.name}`,
          operatorId: statusUpdate.operatorId,
          operatorType: statusUpdate.operatorType || 'user',
          operatorName: statusUpdate.operatorName,
          notes: statusUpdate.notes,
          images: statusUpdate.images || [],
          location: statusUpdate.location
        }, { transaction });
      }

      // 处理特定状态的逻辑
      await this.handleStatusChange(updatedOrder, statusUpdate, transaction);

      await transaction.commit();
      return updatedOrder;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 设置订单提醒
   */
  public async setOrderReminder(orderId: number, config: ReminderConfig) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    // 删除相同类型的未发送提醒
    await OrderReminder.destroy({
      where: {
        orderId,
        reminderType: config.reminderType,
        status: 'pending'
      }
    });

    // 创建新提醒
    const reminder = await OrderReminder.create({
      orderId,
      userId: order.userId,
      reminderType: config.reminderType,
      reminderTime: config.reminderTime,
      message: config.message,
      channels: config.channels,
      status: 'pending'
    });

    return reminder;
  }

  /**
   * 申请退款
   */
  public async requestRefund(orderId: number, userId: number, refundData: {
    refundType: 'full' | 'partial';
    refundAmount: number;
    refundReason: string;
    detailedReason?: string;
    evidenceImages?: string[];
  }) {
    const transaction = await sequelize.transaction();

    try {
      // 检查订单是否存在且属于该用户
      const order = await Order.findOne({
        where: { id: orderId, userId },
        transaction
      });

      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }

      // 检查是否已有退款申请
      const existingRefund = await OrderRefundRequest.findOne({
        where: { orderId },
        transaction
      });

      if (existingRefund) {
        throw new Error('REFUND_REQUEST_EXISTS');
      }

      // 检查退款条件
      await this.validateRefundConditions(order, refundData.refundType, refundData.refundAmount);

      // 创建退款申请
      const refundRequest = await OrderRefundRequest.create({
        orderId,
        userId,
        refundType: refundData.refundType,
        refundAmount: refundData.refundAmount,
        refundReason: refundData.refundReason,
        detailedReason: refundData.detailedReason,
        evidenceImages: refundData.evidenceImages || [],
        status: 'pending'
      }, { transaction });

      // 更新订单状态（如果需要）
      if (order.statusId === 6) { // 已完成的订单
        await order.update({
          statusId: 8 // 退款中
        }, { transaction });
      }

      // 发送通知给管理员
      await this.sendNotification({
        orderId,
        recipientType: 'admin',
        notificationType: 'refund_request',
        title: '新的退款申请',
        content: `订单 ${order.orderNo} 申请退款，金额：¥${refundData.refundAmount}`,
        relatedData: { refundRequestId: refundRequest.id }
      }, transaction);

      await transaction.commit();
      return refundRequest;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 上传订单文件
   */
  public async uploadOrderFile(orderId: number, fileData: {
    fileType: 'contract' | 'id_card' | 'driver_license' | 'vehicle_photo' | 'inspection_photo' | 'evidence' | 'other';
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    fileFormat?: string;
    description?: string;
    uploadedBy?: number;
    uploaderType?: 'user' | 'driver' | 'admin';
  }) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    const file = await OrderFile.create({
      orderId,
      fileType: fileData.fileType,
      fileName: fileData.fileName,
      fileUrl: fileData.fileUrl,
      fileSize: fileData.fileSize,
      fileFormat: fileData.fileFormat,
      description: fileData.description,
      uploadedBy: fileData.uploadedBy || order.userId,
      uploaderType: fileData.uploaderType || 'user'
    });

    return file;
  }

  /**
   * 获取订单统计信息
   */
  public async getOrderStats(filters: {
    userId?: number;
    dateRange?: {
      startDate: string;
      endDate: string;
    };
  } = {}) {
    const whereClause: any = {};

    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters.dateRange) {
      whereClause.createdAt = {
        [Op.between]: [filters.dateRange.startDate, filters.dateRange.endDate]
      };
    }

    // 按状态统计
    const statusStats = await Order.findAll({
      where: whereClause,
      attributes: [
        'statusId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalAmount']
      ],
      include: [
        {
          model: OrderStatus,
          attributes: ['name', 'code']
        }
      ],
      group: ['statusId', 'OrderStatus.id'],
      raw: false
    });

    // 总体统计
    const totalStats = await Order.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalRevenue'],
        [sequelize.fn('AVG', sequelize.col('totalAmount')), 'avgOrderValue']
      ],
      raw: true
    });

    return {
      statusStats,
      totalStats: totalStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0
      }
    };
  }

  /**
   * 验证状态流转是否合法
   */
  private async validateStatusTransition(currentStatusId: number, newStatusId: number) {
    // 定义合法的状态流转
    const validTransitions = {
      1: [2, 7],  // 待支付 -> 待确认, 已取消
      2: [3, 7],  // 待确认 -> 待取车, 已取消
      3: [4, 7],  // 待取车 -> 使用中, 已取消
      4: [5, 7],  // 使用中 -> 待还车, 已取消
      5: [6],     // 待还车 -> 已完成
      6: [8],     // 已完成 -> 已退款（特殊情况）
      7: [],      // 已取消 -> 无
      8: []       // 已退款 -> 无
    };

    if (!validTransitions[currentStatusId]?.includes(newStatusId)) {
      throw new Error('INVALID_STATUS_TRANSITION');
    }
  }

  /**
   * 处理状态变更的特殊逻辑
   */
  private async handleStatusChange(order: any, statusUpdate: OrderStatusUpdate, transaction: any) {
    switch (statusUpdate.statusId) {
      case 2: // 待确认
        // 发送确认通知给门店
        await this.sendNotification({
          orderId: order.id,
          recipientType: 'admin',
          notificationType: 'status_change',
          title: '新订单待确认',
          content: `订单 ${order.orderNo} 待确认`,
          relatedData: { storeId: order.pickupStoreId }
        }, transaction);
        break;

      case 3: // 待取车
        // 设置取车提醒
        await this.setOrderReminder(order.id, {
          reminderType: 'pickup',
          reminderTime: new Date(order.pickupTime.getTime() - 2 * 60 * 60 * 1000), // 提前2小时
          message: `您有订单将在2小时后取车，订单号：${order.orderNo}`,
          channels: ['wechat', 'sms']
        });
        break;

      case 6: // 已完成
        // 发送评价邀请
        await this.sendReviewInvitation(order.id, transaction);
        break;
    }
  }

  /**
   * 验证退款条件
   */
  private async validateRefundConditions(order: any, refundType: string, refundAmount: number) {
    // 检查退款金额
    if (refundType === 'partial' && refundAmount >= order.actualAmount) {
      throw new Error('INVALID_REFUND_AMOUNT');
    }

    if (refundType === 'full' && refundAmount !== order.actualAmount) {
      throw new Error('REFUND_AMOUNT_MISMATCH');
    }

    // 检查退款时限（例如：订单开始前24小时可全额退款）
    const now = new Date();
    const pickupTime = new Date(order.pickupTime);
    const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilPickup < 24 && refundType === 'full') {
      throw new Error('FULL_REFUND_TIME_LIMIT_EXCEEDED');
    }
  }

  /**
   * 发送通知
   */
  private async sendNotification(notificationData: any, transaction: any) {
    // 这里简化处理，实际应该集成消息队列
    await OrderNotification.create({
      ...notificationData,
      channels: ['wechat', 'app'], // 默认渠道
      readStatus: 'unread'
    }, { transaction });
  }

  /**
   * 发送评价邀请
   */
  private async sendReviewInvitation(orderId: number, transaction: any) {
    const order = await Order.findByPk(orderId, { transaction });
    if (order) {
      await OrderReviewInvitation.create({
        orderId,
        userId: order.userId,
        vehicleId: order.vehicleId,
        invitationType: 'overall',
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
        channel: 'wechat'
      }, { transaction });
    }
  }
}