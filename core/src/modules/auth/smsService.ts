/**
 * 腾讯云短信服务
 * 
 * 负责调用腾讯云 SMS API 发送验证码短信
 */

import * as tencentcloud from 'tencentcloud-sdk-nodejs-sms';
import { smsConfig } from '../../config/sms';

// 腾讯云 SMS 客户端实例
let smsClient: any = null;

/**
 * 初始化腾讯云 SMS 客户端
 */
function getSmsClient() {
  if (smsClient) {
    return smsClient;
  }
  
  const SmsClient = tencentcloud.sms.v20210111.Client;
  
  // 打印配置信息（脱敏）
  console.log('[smsService] Initializing with config (Overseas Account):', {
    secretId: smsConfig.tencentSecretId ? `${smsConfig.tencentSecretId.substring(0, 8)}***` : 'MISSING',
    secretKey: smsConfig.tencentSecretKey ? '***' : 'MISSING',
    appId: smsConfig.tencentSmsAppId,
    templateId: smsConfig.templateId,
    region: 'ap-singapore' // 海外账户使用新加坡region（国际短信）
  });
  
  const clientConfig: any = {
    credential: {
      secretId: smsConfig.tencentSecretId,
      secretKey: smsConfig.tencentSecretKey,
    },
    region: 'ap-singapore',  // 海外账户国际短信使用新加坡region
    profile: {
      httpProfile: {
        endpoint: 'sms.tencentcloudapi.com',
      },
    },
  };
  
  smsClient = new SmsClient(clientConfig);
  
  console.log('[smsService] Tencent Cloud SMS client initialized (Overseas Account)');
  
  return smsClient;
}

/**
 * 发送验证码短信结果
 */
export interface SendSmsResult {
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  serialNo?: string;  // 腾讯云返回的发送流水号
}

/**
 * 发送验证码短信
 * 
 * @param phone E.164 格式手机号（如 "+85291234567"）
 * @param code 验证码（6 位数字）
 * @returns 发送结果
 */
export async function sendVerificationCode(
  phone: string,
  code: string
): Promise<SendSmsResult> {
  try {
    console.log(`[smsService] Sending verification code to ${phone.replace(/\d(?=\d{4})/g, '*')}`);
    
    // 获取 SMS 客户端
    const client = getSmsClient();
    
    // 构建请求参数
    const params = {
      // 短信应用 ID
      SmsSdkAppId: smsConfig.tencentSmsAppId,
      
      // 模板 ID（腾讯云已申请的模板）
      TemplateId: smsConfig.templateId,
      
      // 模板参数（验证码）
      TemplateParamSet: [code],
      
      // 手机号（E.164 格式，如 "+85291234567"）
      PhoneNumberSet: [phone],
      
      // 签名（暂时不传，因为未申请）
      // SignName: smsConfig.signNames.intl,
    };
    
    // 调用腾讯云 API
    const response = await client.SendSms(params);
    
    // 解析响应
    const sendStatusSet = response.SendStatusSet;
    if (!sendStatusSet || sendStatusSet.length === 0) {
      console.error('[smsService] SendStatusSet is empty');
      return {
        success: false,
        errorCode: 'SMS_SEND_FAILED',
        errorMessage: 'SendStatusSet is empty',
      };
    }
    
    const status = sendStatusSet[0];
    
    // 检查发送状态
    if (status.Code === 'Ok') {
      console.log(`[smsService] ✅ SMS sent successfully, SerialNo: ${status.SerialNo}`);
      return {
        success: true,
        serialNo: status.SerialNo,
      };
    } else {
      console.error(`[smsService] ❌ SMS send failed: ${status.Code} - ${status.Message}`);
      return {
        success: false,
        errorCode: status.Code,
        errorMessage: status.Message,
        serialNo: status.SerialNo,
      };
    }
    
  } catch (error) {
    console.error('[smsService] Exception during SMS send:', error);
    
    // 解析腾讯云错误
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      errorCode: 'SMS_SEND_EXCEPTION',
      errorMessage,
    };
  }
}

/**
 * 验证短信服务配置是否完整
 */
export function validateSmsConfig(): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  if (!smsConfig.tencentSecretId) {
    missingFields.push('XIAOPEI_TENCENT_SECRET_ID');
  }
  
  if (!smsConfig.tencentSecretKey) {
    missingFields.push('XIAOPEI_TENCENT_SECRET_KEY');
  }
  
  if (!smsConfig.tencentSmsAppId) {
    missingFields.push('XIAOPEI_TENCENT_SMS_APP_ID');
  }
  
  if (!smsConfig.templateId) {
    missingFields.push('XIAOPEI_TENCENT_SMS_TEMPLATE_ID');
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

