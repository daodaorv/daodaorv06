/**
 * 微信小程序API工具函数
 */

import axios from 'axios';
import { logger } from './logger';

// 微信API配置
const WECHAT_API_BASE = 'https://api.weixin.qq.com';

/**
 * 获取微信小程序access_token
 * @param appId 小程序AppID
 * @param appSecret 小程序AppSecret
 * @returns access_token
 */
export async function getAccessToken(appId: string, appSecret: string): Promise<string> {
  try {
    const url = `${WECHAT_API_BASE}/cgi-bin/token`;
    const response = await axios.get(url, {
      params: {
        grant_type: 'client_credential',
        appid: appId,
        secret: appSecret,
      },
    });

    if (response.data.errcode) {
      throw new Error(`获取access_token失败: ${response.data.errmsg}`);
    }

    return response.data.access_token;
  } catch (error) {
    logger.error('获取微信access_token失败:', error);
    throw error;
  }
}

/**
 * 获取微信用户手机号
 * @param phoneCode 手机号授权code（5分钟有效）
 * @param accessToken 小程序access_token
 * @returns 手机号信息
 */
export async function getPhoneNumber(phoneCode: string, accessToken: string) {
  try {
    const url = `${WECHAT_API_BASE}/wxa/business/getuserphonenumber`;
    const response = await axios.post(
      url,
      { code: phoneCode },
      {
        params: { access_token: accessToken },
      }
    );

    if (response.data.errcode !== 0) {
      throw new Error(`获取手机号失败: ${response.data.errmsg}`);
    }

    return response.data.phone_info;
  } catch (error) {
    logger.error('获取微信手机号失败:', error);
    throw error;
  }
}
