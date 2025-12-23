"use strict";
/**
 * 腾讯云短信服务
 *
 * 负责调用腾讯云 SMS API 发送验证码短信
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationCode = sendVerificationCode;
exports.validateSmsConfig = validateSmsConfig;
const tencentcloud = __importStar(require("tencentcloud-sdk-nodejs-sms"));
const sms_1 = require("../../config/sms");
// 腾讯云 SMS 客户端实例
let smsClient = null;
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
        secretId: sms_1.smsConfig.tencentSecretId ? `${sms_1.smsConfig.tencentSecretId.substring(0, 8)}***` : 'MISSING',
        secretKey: sms_1.smsConfig.tencentSecretKey ? '***' : 'MISSING',
        appId: sms_1.smsConfig.tencentSmsAppId,
        templateId: sms_1.smsConfig.templateId,
        region: 'ap-singapore' // 海外账户使用新加坡region（国际短信）
    });
    const clientConfig = {
        credential: {
            secretId: sms_1.smsConfig.tencentSecretId,
            secretKey: sms_1.smsConfig.tencentSecretKey,
        },
        region: 'ap-singapore', // 海外账户国际短信使用新加坡region
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
 * 发送验证码短信
 *
 * @param phone E.164 格式手机号（如 "+85291234567"）
 * @param code 验证码（6 位数字）
 * @returns 发送结果
 */
async function sendVerificationCode(phone, code) {
    try {
        console.log(`[smsService] Sending verification code to ${phone.replace(/\d(?=\d{4})/g, '*')}`);
        // 获取 SMS 客户端
        const client = getSmsClient();
        // 构建请求参数
        const params = {
            // 短信应用 ID
            SmsSdkAppId: sms_1.smsConfig.tencentSmsAppId,
            // 模板 ID（腾讯云已申请的模板）
            TemplateId: sms_1.smsConfig.templateId,
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
        }
        else {
            console.error(`[smsService] ❌ SMS send failed: ${status.Code} - ${status.Message}`);
            return {
                success: false,
                errorCode: status.Code,
                errorMessage: status.Message,
                serialNo: status.SerialNo,
            };
        }
    }
    catch (error) {
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
function validateSmsConfig() {
    const missingFields = [];
    if (!sms_1.smsConfig.tencentSecretId) {
        missingFields.push('XIAOPEI_TENCENT_SECRET_ID');
    }
    if (!sms_1.smsConfig.tencentSecretKey) {
        missingFields.push('XIAOPEI_TENCENT_SECRET_KEY');
    }
    if (!sms_1.smsConfig.tencentSmsAppId) {
        missingFields.push('XIAOPEI_TENCENT_SMS_APP_ID');
    }
    if (!sms_1.smsConfig.templateId) {
        missingFields.push('XIAOPEI_TENCENT_SMS_TEMPLATE_ID');
    }
    return {
        valid: missingFields.length === 0,
        missingFields,
    };
}
//# sourceMappingURL=smsService.js.map