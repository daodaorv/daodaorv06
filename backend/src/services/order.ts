import { Op } from 'sequelize';
import { Order, OrderStatus, Vehicle, Store, User, Coupon, Payment, OrderRating } from '../models';
import { sequelize } from '../config/database';
import { generateOrderNo, generatePaymentNo } from '../utils/generator';
import { calculateRentalPrice } from '../utils/pricing';

export interface CreateOrderData {
  userId: number;
  vehicleId: number;
  pickupStoreId: number;
  returnStoreId?: number;
  pickupTime: Date;
  returnTime: Date;
  contactName: string;
  contactPhone: string;
  idCardNumber: string;
  driverLicenseNumber?: string;
  couponId?: number;
  userRemark?: string;
  isDifferentReturn?: boolean;
}

export interface PriceCalculationData {
  userId: number;
  vehicleId: number;
  pickupTime: Date;
  returnTime: Date;
  couponId?: number;
}

export interface ExtensionRequestData {
  orderId: number;
  userId: number;
  extensionHours: number;
  remark?: string;
}

export class OrderService {
  /**
   * 创建订单
   */
  public async createOrder(orderData: CreateOrderData) {
    const transaction = await sequelize.transaction();

    try {
      // 检查车辆可用性
      const isAvailable = await this.checkVehicleAvailability(
        orderData.vehicleId,
        orderData.pickupTime,
        orderData.returnTime,
        transaction
      );

      if (!isAvailable) {
        throw new Error('车辆在指定时间段内不可用');
      }

      // 获取车辆信息
      const vehicle = await Vehicle.findByPk(orderData.vehicleId, {
        transaction
      });

      if (!vehicle) {
        throw new Error('车辆不存在');
      }

      // 获取门店信息
      const pickupStore = await Store.findByPk(orderData.pickupStoreId, {
        transaction
      });

      if (!pickupStore) {
        throw new Error('取车门店不存在');
      }

      let returnStore = pickupStore;
      if (orderData.returnStoreId) {
        returnStore = await Store.findByPk(orderData.returnStoreId, {
          transaction
        });
        if (!returnStore) {
          throw new Error('还车门店不存在');
        }
      }

      // 计算价格
      const priceCalculation = await this.calculatePrice({
        userId: orderData.userId,
        vehicleId: orderData.vehicleId,
        pickupTime: orderData.pickupTime,
        returnTime: orderData.returnTime,
        couponId: orderData.couponId
      }, transaction);

      // 获取订单状态
      const pendingPaymentStatus = await OrderStatus.findOne({
        where: { code: 'pending_payment' },
        transaction
      });

      if (!pendingPaymentStatus) {
        throw new Error('订单状态不存在');
      }

      // 创建订单
      const order = await Order.create({
        orderNo: generateOrderNo(),
        userId: orderData.userId,
        vehicleId: orderData.vehicleId,
        pickupStoreId: orderData.pickupStoreId,
        returnStoreId: orderData.returnStoreId || orderData.pickupStoreId,
        statusId: pendingPaymentStatus.id,
        pickupTime: orderData.pickupTime,
        returnTime: orderData.returnTime,
        totalAmount: priceCalculation.totalAmount,
        vehicleFee: priceCalculation.vehicleFee,
        insuranceFee: priceCalculation.insuranceFee,
        serviceFee: priceCalculation.serviceFee,
        depositAmount: priceCalculation.depositAmount,
        couponDiscount: priceCalculation.couponDiscount || 0,
        actualAmount: priceCalculation.actualAmount,
        contactName: orderData.contactName,
        contactPhone: orderData.contactPhone,
        idCardNumber: orderData.idCardNumber,
        driverLicenseNumber: orderData.driverLicenseNumber,
        couponId: orderData.couponId,
        userRemark: orderData.userRemark
      }, { transaction });

      // 创建支付记录
      await Payment.create({
        paymentNo: generatePaymentNo(),
        orderId: order.id,
        userId: orderData.userId,
        paymentType: 'full_payment',
        paymentMethod: 'wechat',
        amount: priceCalculation.actualAmount,
        status: 'pending'
      }, { transaction });

      // 创建押金支付记录
      if (priceCalculation.depositAmount > 0) {
        await Payment.create({
          paymentNo: generatePaymentNo(),
          orderId: order.id,
          userId: orderData.userId,
          paymentType: 'deposit',
          paymentMethod: 'wechat',
          amount: priceCalculation.depositAmount,
          status: 'pending'
        }, { transaction });
      }

      // 记录状态变更日志
      await this.createOrderStatusLog({
        orderId: order.id,
        fromStatusId: null,
        toStatusId: pendingPaymentStatus.id,
        operatorId: orderData.userId,
        operatorType: 'user',
        remark: '订单创建'
      }, transaction);

      await transaction.commit();

      // 重新查询订单详情（包含关联数据）
      return await this.getOrderDetail(order.id, orderData.userId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取用户订单列表
   */
  public async getUserOrders(
    userId: number,
    page: number = 1,
    limit: number = 20,
    status?: string
  ) {
    const whereClause: any = { userId };

    if (status) {
      const statusRecord = await OrderStatus.findOne({ where: { code: status } });
      if (statusRecord) {
        whereClause.statusId = statusRecord.id;
      }
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Vehicle,
          attributes: ['id', 'name', 'brandId', 'modelId', 'dailyPrice', 'images']
        },
        {
          model: Store,
          as: 'pickupStore',
          attributes: ['id', 'name', 'address', 'phone']
        },
        {
          model: Store,
          as: 'returnStore',
          attributes: ['id', 'name', 'address', 'phone']
        },
        {
          model: OrderStatus,
          attributes: ['id', 'name', 'code', 'description']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      orders: rows,
      total: count
    };
  }

  /**
   * 获取订单详情
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
          model: Vehicle,
          attributes: ['id', 'name', 'brandId', 'modelId', 'dailyPrice', 'images', 'specifications']
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
        },
        {
          model: OrderStatus,
          attributes: ['id', 'name', 'code', 'description']
        },
        {
          model: Coupon,
          attributes: ['id', 'name', 'type', 'discount'],
          required: false
        },
        {
          model: Payment,
          attributes: ['id', 'paymentNo', 'paymentType', 'amount', 'status', 'paidTime']
        },
        {
          model: OrderRating,
          attributes: ['id', 'rating', 'comment', 'createdAt'],
          required: false
        }
      ]
    });

    return order;
  }

  /**
   * 取消订单
   */
  public async cancelOrder(orderId: number, userId: number, reason?: string) {
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.findByPk(orderId, { transaction });

      if (!order) {
        throw new Error('订单不存在');
      }

      if (order.userId !== userId) {
        throw new Error('无权限操作此订单');
      }

      // 获取取消状态
      const cancelledStatus = await OrderStatus.findOne({
        where: { code: 'cancelled' },
        transaction
      });

      if (!cancelledStatus) {
        throw new Error('订单状态不存在');
      }

      const oldStatusId = order.statusId;

      // 更新订单状态
      await order.update({
        statusId: cancelledStatus.id,
        cancelReason: reason,
        cancelTime: new Date(),
        cancelBy: 'user'
      }, { transaction });

      // 记录状态变更日志
      await this.createOrderStatusLog({
        orderId,
        fromStatusId: oldStatusId,
        toStatusId: cancelledStatus.id,
        operatorId: userId,
        operatorType: 'user',
        remark: reason || '用户取消'
      }, transaction);

      // 处理退款（如果已支付）
      const payments = await Payment.findAll({
        where: {
          orderId,
          status: 'success'
        },
        transaction
      });

      for (const payment of payments) {
        // 这里应该调用第三方支付退款接口
        // 暂时标记为退款中状态
        await payment.update({
          status: 'refunded',
          refundTime: new Date(),
          refundAmount: payment.amount
        }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 计算订单价格
   */
  public async calculatePrice(
    priceData: PriceCalculationData,
    transaction: any = null
  ) {
    const vehicle = await Vehicle.findByPk(priceData.vehicleId, {
      transaction
    });

    if (!vehicle) {
      throw new Error('车辆不存在');
    }

    // 计算租赁天数
    const pickupTime = new Date(priceData.pickupTime);
    const returnTime = new Date(priceData.returnTime);
    const rentalDays = Math.ceil((returnTime.getTime() - pickupTime.getTime()) / (1000 * 60 * 60 * 24));

    if (rentalDays <= 0) {
      throw new Error('租赁时间无效');
    }

    // 计算基础费用
    const vehicleFee = await calculateRentalPrice(
      priceData.vehicleId,
      pickupTime,
      returnTime,
      transaction
    );

    const insuranceFee = Math.round(vehicleFee * 0.1); // 保险费用为租赁费的10%
    const serviceFee = Math.round(vehicleFee * 0.05); // 服务费用为租赁费的5%
    const depositAmount = vehicle.dailyPrice * 3; // 押金为3天日租金

    let couponDiscount = 0;

    // 计算优惠券折扣
    if (priceData.couponId) {
      const coupon = await Coupon.findByPk(priceData.couponId, {
        where: {
          userId: priceData.userId,
          status: 'available',
          minAmount: { [Op.lte]: vehicleFee + insuranceFee + serviceFee }
        },
        transaction
      });

      if (coupon) {
        if (coupon.type === 'fixed') {
          couponDiscount = Math.min(coupon.discount, vehicleFee + insuranceFee + serviceFee);
        } else if (coupon.type === 'percentage') {
          couponDiscount = Math.round((vehicleFee + insuranceFee + serviceFee) * coupon.discount / 100);
        }
      }
    }

    const totalAmount = vehicleFee + insuranceFee + serviceFee - couponDiscount;
    const actualAmount = totalAmount; // 实际支付金额（不含押金）

    return {
      rentalDays,
      vehicleFee,
      insuranceFee,
      serviceFee,
      couponDiscount,
      totalAmount,
      depositAmount,
      actualAmount: actualAmount + depositAmount // 包含押金的总支付金额
    };
  }

  /**
   * 获取订单状态列表
   */
  public async getOrderStatusList() {
    return await OrderStatus.findAll({
      order: [['sortOrder', 'ASC']]
    });
  }

  /**
   * 申请订单延期
   */
  public async requestOrderExtension(extensionData: ExtensionRequestData) {
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.findByPk(extensionData.orderId, {
        transaction
      });

      if (!order) {
        throw new Error('订单不存在');
      }

      if (order.userId !== extensionData.userId) {
        throw new Error('无权限操作此订单');
      }

      // 计算新的还车时间
      const newReturnTime = new Date(order.returnTime);
      newReturnTime.setHours(newReturnTime.getHours() + extensionData.extensionHours);

      // 计算延期费用
      const extensionFee = await calculateRentalPrice(
        order.vehicleId,
        order.returnTime,
        newReturnTime,
        transaction
      );

      // 创建延期申请记录
      const extension = await sequelize.model('OrderExtension').create({
        orderId: extensionData.orderId,
        originalReturnTime: order.returnTime,
        newReturnTime: newReturnTime,
        extensionHours: extensionData.extensionHours,
        extensionFee,
        requestTime: new Date(),
        status: 'pending',
        remark: extensionData.remark
      }, { transaction });

      await transaction.commit();

      return extension;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 检查车辆可用性
   */
  private async checkVehicleAvailability(
    vehicleId: number,
    pickupTime: Date,
    returnTime: Date,
    transaction: any
  ): Promise<boolean> {
    const conflictingOrders = await Order.count({
      where: {
        vehicleId,
        statusId: {
          [Op.notIn]: [
            (await OrderStatus.findOne({ where: { code: 'cancelled' } }))?.id,
            (await OrderStatus.findOne({ where: { code: 'completed' } }))?.id
          ]
        },
        [Op.and]: [
          {
            pickupTime: { [Op.lt]: returnTime }
          },
          {
            returnTime: { [Op.gt]: pickupTime }
          }
        ]
      },
      transaction
    });

    return conflictingOrders === 0;
  }

  /**
   * 创建订单状态日志
   */
  private async createOrderStatusLog(
    logData: {
      orderId: number;
      fromStatusId: number | null;
      toStatusId: number;
      operatorId: number;
      operatorType: string;
      remark?: string;
    },
    transaction: any
  ) {
    await sequelize.model('OrderStatusLog').create(logData, { transaction });
  }
}