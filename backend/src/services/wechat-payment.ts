import { Payment, PaymentChannel } from '../models';
import { PaymentService } from './payment';
import crypto from 'crypto';

export class WechatPaymentService {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * 生成微信支付数据
   */
  public async generatePaymentData(payment: Payment) {
    const channel = await this.paymentService.getPaymentChannelConfig('wechat');

    if (!channel) {
      throw new Error('微信支付渠道未配置');
    }

    const config = channel.config as any;

    // 构建支付参数
    const paymentParams = {
      appid: config.appId,
      mch_id: config.merchantId,
      nonce_str: this.generateNonceStr(),
      body: `叨叨房车-订单支付`,
      out_trade_no: payment.paymentNo,
      total_fee: Math.round(payment.amount * 100), // 转换为分
      spbill_create_ip: payment.clientIp || '127.0.0.1',
      notify_url: config.notifyUrl,
      trade_type: 'JSAPI', // 小程序支付
      openid: payment.userId.toString() // 这里应该从用户表中获取真实的openid
    };

    // 添加签名
    paymentParams.sign = this.generateSign(paymentParams, config.appSecret);

    try {
      // 调用微信统一下单API
      const response = await this.unifiedOrder(paymentParams, config);

      if (response.return_code === 'SUCCESS' && response.result_code === 'SUCCESS') {
        // 返回小程序支付参数
        const timeStamp = Math.floor(Date.now() / 1000).toString();
        const paySignParams = {
          appId: config.appId,
          timeStamp,
          nonceStr: this.generateNonceStr(),
          package: `prepay_id=${response.prepay_id}`,
          signType: 'MD5'
        };

        paySignParams.paySign = this.generateSign(paySignParams, config.appSecret);

        return {
          prepayId: response.prepay_id,
          paySign: paySignParams.paySign,
          timeStamp,
          nonceStr: paySignParams.nonceStr,
          package: paySignParams.package,
          signType: 'MD5'
        };
      } else {
        throw new Error(response.err_code_des || '微信支付统一下单失败');
      }
    } catch (error) {
      console.error('Generate wechat payment data error:', error);
      throw error;
    }
  }

  /**
   * 处理微信支付回调
   */
  public async handleNotify(notifyData: any) {
    try {
      // 验证回调数据
      if (!this.verifyNotify(notifyData)) {
        throw new Error('微信支付回调验证失败');
      }

      const paymentNo = notifyData.out_trade_no;
      const thirdPartyTransactionId = notifyData.transaction_id;
      const totalFee = parseInt(notifyData.total_fee) / 100; // 转换为元

      // 查找支付记录
      const payment = await this.paymentService.getPaymentByNo(paymentNo);

      if (!payment) {
        throw new Error('支付记录不存在');
      }

      // 验证金额
      if (Math.abs(payment.amount - totalFee) > 0.01) {
        throw new Error('支付金额不匹配');
      }

      // 更新支付状态
      if (notifyData.result_code === 'SUCCESS') {
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
          { failureReason: notifyData.err_code_des }
        );

        return { success: false, message: notifyData.err_code_des || '支付失败' };
      }
    } catch (error) {
      console.error('Handle wechat payment notify error:', error);
      throw error;
    }
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成签名
   */
  private generateSign(params: any, key: string): string {
    // 过滤空值并排序
    const filteredParams = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== '' && key !== 'sign')
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // 添加商户密钥
    const stringToSign = filteredParams + `&key=${key}`;

    // MD5加密并转为大写
    return crypto.createHash('md5').update(stringToSign, 'utf8').digest('hex').toUpperCase();
  }

  /**
   * 验证回调签名
   */
  private verifyNotify(notifyData: any): boolean {
    const sign = notifyData.sign;
    const params = { ...notifyData };

    delete params.sign;

    const channel = PaymentChannel.findOne({
      where: { methodCode: 'wechat', isEnabled: true }
    });

    if (!channel) {
      return false;
    }

    const config = channel.config as any;
    const calculatedSign = this.generateSign(params, config.appSecret);

    return calculatedSign === sign;
  }

  /**
   * 统一下单API
   */
  private async unifiedOrder(params: any, config: any): Promise<any> {
    const url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';

    // 构建XML请求体
    const xmlData = this.buildXml(params);

    const response = await this.httpsRequest(url, xmlData);

    // 解析XML响应
    return this.parseXml(response);
  }

  /**
   * 构建XML
   */
  private buildXml(params: any): string {
    let xml = '<xml>';
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== '') {
        xml += `<${key}><![CDATA[${params[key]}]]></${key}>`;
      }
    }
    xml += '</xml>';
    return xml;
  }

  /**
   * 解析XML
   */
  private parseXml(xml: string): any {
    const result: any = {};
    const xml2js = require('xml2js');
    let data: any = {};

    xml2js.parseString(xml, { explicitArray: false }, (err: any, parsed: any) => {
      data = parsed.xml || {};
    });

    for (const key in data) {
      result[key] = data[key];
    }

    return result;
  }

  /**
   * HTTPS请求
   */
  private async httpsRequest(url: string, data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const urlObj = new URL(url);

      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
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
          resolve(responseData);
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
    const channel = await this.paymentService.getPaymentChannelConfig('wechat');

    if (!channel) {
      throw new Error('微信支付渠道未配置');
    }

    const config = channel.config as any;

    const params = {
      appid: config.appId,
      mch_id: config.merchantId,
      out_trade_no: paymentNo,
      nonce_str: this.generateNonceStr()
    };

    params.sign = this.generateSign(params, config.appSecret);

    try {
      const url = 'https://api.mch.weixin.qq.com/pay/orderquery';
      const xmlData = this.buildXml(params);
      const response = await this.httpsRequest(url, xmlData);
      const result = this.parseXml(response);

      if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
        return {
          trade_state: result.trade_state,
          transaction_id: result.transaction_id,
          total_fee: parseInt(result.total_fee) / 100,
          time_end: result.time_end
        };
      } else {
        throw new Error(result.err_code_des || '查询支付状态失败');
      }
    } catch (error) {
      console.error('Query wechat payment status error:', error);
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
    const channel = await this.paymentService.getPaymentChannelConfig('wechat');

    if (!channel) {
      throw new Error('微信支付渠道未配置');
    }

    const config = channel.config as any;

    const params = {
      appid: config.appId,
      mch_id: config.merchantId,
      nonce_str: this.generateNonceStr(),
      out_trade_no: refundData.paymentNo,
      out_refund_no: refundData.refundNo,
      total_fee: Math.round(refundData.totalFee * 100),
      refund_fee: Math.round(refundData.refundFee * 100),
      refund_desc: refundData.refundReason
    };

    params.sign = this.generateSign(params, config.appSecret);

    try {
      const url = 'https://api.mch.weixin.qq.com/secapi/pay/refund';
      const xmlData = this.buildXml(params);

      // 这里需要使用证书进行请求，简化处理
      const response = await this.httpsRequestWithCert(url, xmlData, config);
      const result = this.parseXml(response);

      if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
        return {
          refund_id: result.refund_id,
          refund_fee: parseInt(result.refund_fee) / 100,
          out_refund_no: result.out_refund_no
        };
      } else {
        throw new Error(result.err_code_des || '申请退款失败');
      }
    } catch (error) {
      console.error('Wechat refund error:', error);
      throw error;
    }
  }

  /**
   * 带证书的HTTPS请求
   */
  private async httpsRequestWithCert(url: string, data: string, config: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const urlObj = new URL(url);

      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        key: config.privateKey,
        cert: config.certificate,
        headers: {
          'Content-Type': 'application/xml',
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
          resolve(responseData);
        });
      });

      req.on('error', (error: Error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }
}