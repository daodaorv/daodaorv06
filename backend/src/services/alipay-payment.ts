import { Payment, PaymentChannel } from '../models';
import { PaymentService } from './payment';
import crypto from 'crypto';
import querystring from 'querystring';

export class AlipayPaymentService {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * 生成支付宝支付数据
   */
  public async generatePaymentData(payment: Payment) {
    const channel = await this.paymentService.getPaymentChannelConfig('alipay');

    if (!channel) {
      throw new Error('支付宝支付渠道未配置');
    }

    const config = channel.config as any;

    // 构建支付参数
    const paymentParams = {
      app_id: config.appId,
      method: 'alipay.trade.create',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: this.formatDate(new Date()),
      version: '1.0',
      notify_url: config.notifyUrl,
      biz_content: JSON.stringify({
        out_trade_no: payment.paymentNo,
        total_amount: payment.amount.toFixed(2),
        subject: '叨叨房车-订单支付',
        body: `订单${payment.paymentNo}支付`,
        product_code: 'QUICK_MSECURITY_PAY'
      })
    };

    // 生成签名
    paymentParams.sign = this.generateSign(paymentParams, config.privateKey);

    try {
      // 调用支付宝创建交易API
      const response = await this.createTrade(paymentParams, config);

      if (response.alipay_trade_create_response.code === '10000') {
        return {
          paymentUrl: '', // H5支付链接
          qrCode: '', // 支付宝二维码
          tradeNo: response.alipay_trade_create_response.trade_no
        };
      } else {
        throw new Error(response.alipay_trade_create_response.sub_msg || '支付宝创建交易失败');
      }
    } catch (error) {
      console.error('Generate alipay payment data error:', error);
      throw error;
    }
  }

  /**
   * 处理支付宝支付回调
   */
  public async handleNotify(notifyData: any) {
    try {
      // 验证回调数据
      if (!this.verifyNotify(notifyData)) {
        throw new Error('支付宝支付回调验证失败');
      }

      const paymentNo = notifyData.out_trade_no;
      const thirdPartyTransactionId = notifyData.trade_no;
      const totalAmount = parseFloat(notifyData.total_amount);

      // 查找支付记录
      const payment = await this.paymentService.getPaymentByNo(paymentNo);

      if (!payment) {
        throw new Error('支付记录不存在');
      }

      // 验证金额
      if (Math.abs(payment.amount - totalAmount) > 0.01) {
        throw new Error('支付金额不匹配');
      }

      // 更新支付状态
      if (notifyData.trade_status === 'TRADE_SUCCESS' || notifyData.trade_status === 'TRADE_FINISHED') {
        await this.paymentService.updatePaymentStatus(
          paymentNo,
          'success',
          thirdPartyTransactionId
        );

        return { success: true, message: '支付成功' };
      } else {
        await this.paymentService.updatePaymentStatus(
          paymentNo,
          'failed',
          thirdPartyTransactionId,
          { failureReason: notifyData.sub_msg || '支付失败' }
        );

        return { success: false, message: notifyData.sub_msg || '支付失败' };
      }
    } catch (error) {
      console.error('Handle alipay payment notify error:', error);
      throw error;
    }
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 生成签名
   */
  private generateSign(params: any, privateKey: string): string {
    // 过滤空值并排序
    const filteredParams = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== '' && key !== 'sign')
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    // 添加签名
    const stringToSign = filteredParams;

    // RSA2签名
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(stringToSign, 'utf8');
    return sign.sign(privateKey, 'base64');
  }

  /**
   * 验证回调签名
   */
  private verifyNotify(notifyData: any): boolean {
    const sign = notifyData.sign;
    const signType = notifyData.sign_type;
    const params = { ...notifyData };

    delete params.sign;
    delete params.sign_type;

    const channel = PaymentChannel.findOne({
      where: { methodCode: 'alipay', isEnabled: true }
    });

    if (!channel) {
      return false;
    }

    const config = channel.config as any;
    const stringToSign = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== '')
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    try {
      const verify = crypto.createVerify(signType === 'RSA2' ? 'RSA-SHA256' : 'SHA1');
      verify.update(stringToSign, 'utf8');
      return verify.verify(config.publicKey, sign, 'base64');
    } catch (error) {
      console.error('Verify alipay notify error:', error);
      return false;
    }
  }

  /**
   * 创建交易API
   */
  private async createTrade(params: any, config: any): Promise<any> {
    const url = 'https://openapi.alipay.com/gateway.do';
    const formData = querystring.stringify(params);

    const response = await this.httpsRequest(url, formData);
    return response;
  }

  /**
   * HTTPS请求
   */
  private async httpsRequest(url: string, data: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const urlObj = new URL(url);

      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res: any) => {
        let responseData = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: string) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error: Error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * 查询支付状态
   */
  public async queryPaymentStatus(paymentNo: string) {
    const channel = await this.paymentService.getPaymentChannelConfig('alipay');

    if (!channel) {
      throw new Error('支付宝支付渠道未配置');
    }

    const config = channel.config as any;

    const params = {
      app_id: config.appId,
      method: 'alipay.trade.query',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: this.formatDate(new Date()),
      version: '1.0',
      biz_content: JSON.stringify({
        out_trade_no: paymentNo
      })
    };

    params.sign = this.generateSign(params, config.privateKey);

    try {
      const url = 'https://openapi.alipay.com/gateway.do';
      const formData = querystring.stringify(params);
      const response = await this.httpsRequest(url, formData);
      const result = response.alipay_trade_query_response;

      if (result.code === '10000') {
        return {
          trade_status: result.trade_status,
          trade_no: result.trade_no,
          total_amount: parseFloat(result.total_amount),
          gmt_payment: result.gmt_payment
        };
      } else {
        throw new Error(result.sub_msg || '查询支付状态失败');
      }
    } catch (error) {
      console.error('Query alipay payment status error:', error);
      throw error;
    }
  }

  /**
   * 申请退款
   */
  public async refund(refundData: {
    paymentNo: string;
    refundNo: string;
    totalFee: number;
    refundFee: number;
    refundReason: string;
  }) {
    const channel = await this.paymentService.getPaymentChannelConfig('alipay');

    if (!channel) {
      throw new Error('支付宝支付渠道未配置');
    }

    const config = channel.config as any;

    const params = {
      app_id: config.appId,
      method: 'alipay.trade.refund',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: this.formatDate(new Date()),
      version: '1.0',
      biz_content: JSON.stringify({
        out_trade_no: refundData.paymentNo,
        refund_amount: refundData.refundFee.toFixed(2),
        refund_reason: refundData.refundReason,
        out_request_no: refundData.refundNo
      })
    };

    params.sign = this.generateSign(params, config.privateKey);

    try {
      const url = 'https://openapi.alipay.com/gateway.do';
      const formData = querystring.stringify(params);
      const response = await this.httpsRequest(url, formData);
      const result = response.alipay_trade_refund_response;

      if (result.code === '10000') {
        return {
          refund_fee: parseFloat(result.refund_fee),
          out_request_no: result.out_request_no,
          gmt_refund_pay: result.gmt_refund_pay
        };
      } else {
        throw new Error(result.sub_msg || '申请退款失败');
      }
    } catch (error) {
      console.error('Alipay refund error:', error);
      throw error;
    }
  }

  /**
   * 关闭交易
   */
  public async closeTrade(paymentNo: string) {
    const channel = await this.paymentService.getPaymentChannelConfig('alipay');

    if (!channel) {
      throw new Error('支付宝支付渠道未配置');
    }

    const config = channel.config as any;

    const params = {
      app_id: config.appId,
      method: 'alipay.trade.close',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: this.formatDate(new Date()),
      version: '1.0',
      biz_content: JSON.stringify({
        out_trade_no: paymentNo
      })
    };

    params.sign = this.generateSign(params, config.privateKey);

    try {
      const url = 'https://openapi.alipay.com/gateway.do';
      const formData = querystring.stringify(params);
      const response = await this.httpsRequest(url, formData);
      const result = response.alipay_trade_close_response;

      if (result.code === '10000') {
        return { success: true };
      } else {
        throw new Error(result.sub_msg || '关闭交易失败');
      }
    } catch (error) {
      console.error('Close alipay trade error:', error);
      throw error;
    }
  }
}