"use strict";
/**
 * 短信服务配置
 *
 * 支持多地区短信发送：
 * - cn: 中国大陆（简体中文）
 * - hk/mo/tw: 港澳台（繁体中文）
 * - intl: 其他国际地区（英文）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMessages = exports.smsConfig = void 0;
exports.getRegionFromCountryCode = getRegionFromCountryCode;
exports.getErrorMessage = getErrorMessage;
exports.smsConfig = {
    // ===== 腾讯云基础配置 =====
    tencentSecretId: process.env.XIAOPEI_TENCENT_SECRET_ID || 'IKIDJl3B8sPmxvfGesumTyQqDf6MRM8rOipj',
    tencentSecretKey: process.env.XIAOPEI_TENCENT_SECRET_KEY || 'oG1ayEI9pId3MoHZebO0ShmhaMwPm382',
    tencentSmsAppId: process.env.XIAOPEI_TENCENT_SMS_APP_ID || '2400003800',
    tencentSmsRegion: process.env.XIAOPEI_TENCENT_SMS_REGION || 'ap-guangzhou',
    // ===== 签名配置（暂时不使用，未申请） =====
    // signNames: {
    //   cn: process.env.XIAOPEI_TENCENT_SMS_SIGN_CN || '小佩命理',
    //   intl: process.env.XIAOPEI_TENCENT_SMS_SIGN_INTL || 'XiaoPei',
    // },
    // ===== 模板 ID 配置 =====
    // 模板 ID: 2929187（腾讯云已申请）
    // 暂时所有地区使用同一个模板
    templateId: process.env.XIAOPEI_TENCENT_SMS_TEMPLATE_ID || '2929187',
    // ===== 验证码安全配置 =====
    codeSalt: process.env.XIAOPEI_SMS_CODE_SALT || 'xiaopei-sms-salt-2024',
    // ===== IP 限流配置 =====
    ipRateLimit: {
        enabled: true,
        window1h: 20, // 同一 IP 1 小时最多 20 次
    },
    // ===== 国家代码映射到地区 =====
    countryCodeToRegion: {
        '+86': 'cn',
        '+852': 'hk',
        '+853': 'mo',
        '+886': 'tw',
        // 其他国家代码默认映射为 'intl'
    },
};
/**
 * 获取地区类型
 */
function getRegionFromCountryCode(countryCode) {
    return (exports.smsConfig.countryCodeToRegion[countryCode] || 'intl');
}
/**
 * 多语言错误消息映射
 */
exports.errorMessages = {
    INVALID_PHONE: {
        cn: '手机号格式不正确',
        hk: '手機號碼格式不正確',
        intl: 'Invalid phone number',
    },
    RATE_LIMITED_1M: {
        cn: '发送过于频繁，请 60 秒后重试',
        hk: '發送過於頻繁，請 60 秒後重試',
        intl: 'Too frequent, retry after 60 seconds',
    },
    RATE_LIMITED_1H: {
        cn: '1 小时内发送次数已达上限，请稍后再试',
        hk: '1 小時內發送次數已達上限，請稍後再試',
        intl: 'Hourly limit reached, please retry later',
    },
    RATE_LIMITED_24H: {
        cn: '今日发送次数已达上限，请明天再试',
        hk: '今日發送次數已達上限，請明天再試',
        intl: 'Daily limit reached, please retry tomorrow',
    },
    RATE_LIMITED_IP: {
        cn: '发送过于频繁，请稍后再试',
        hk: '發送過於頻繁，請稍後再試',
        intl: 'Too frequent, please retry later',
    },
    CODE_EXPIRED: {
        cn: '验证码已过期，请重新获取',
        hk: '驗證碼已過期，請重新獲取',
        intl: 'Code expired, please retry',
    },
    CODE_NOT_FOUND: {
        cn: '验证码已过期，请重新获取',
        hk: '驗證碼已過期，請重新獲取',
        intl: 'Code not found, please retry',
    },
    OTP_SENT: {
        cn: '验证码已发送',
        hk: '驗證碼已發送',
        intl: 'Verification code sent',
    },
    CODE_NOT_SENT: {
        cn: '验证码发送失败，请重新获取',
        hk: '驗證碼發送失敗，請重新獲取',
        intl: 'Code not sent, please retry',
    },
    CODE_MISMATCH: {
        cn: '验证码不正确',
        hk: '驗證碼不正確',
        intl: 'Invalid code',
    },
    TOO_MANY_ATTEMPTS: {
        cn: '验证码输入错误次数过多，请重新获取',
        hk: '驗證碼輸入錯誤次數過多，請重新獲取',
        intl: 'Too many attempts, please retry',
    },
    SMS_SEND_FAILED: {
        cn: '短信发送失败，请稍后重试',
        hk: '短信發送失敗，請稍後重試',
        intl: 'SMS send failed, please retry',
    },
    SMS_DAILY_LIMIT_EXCEEDED: {
        cn: '今日短信发送次数已达上限，请明天再试',
        hk: '今日短信發送次數已達上限，請明天再試',
        intl: 'Daily SMS limit exceeded, please try tomorrow',
    },
    PHONE_REGION_MISMATCH: {
        cn: '手机号与所选地区不匹配，请检查',
        hk: '手機號碼與所選地區不符，請檢查',
        intl: 'Phone number does not match selected region',
    },
};
/**
 * 获取错误消息
 */
function getErrorMessage(errorCode, region) {
    const messages = exports.errorMessages[errorCode];
    // 港澳台使用繁体中文
    if (['hk', 'mo', 'tw'].includes(region)) {
        return messages.hk;
    }
    // 国际使用英文
    if (region === 'intl') {
        return messages.intl;
    }
    // 默认使用简体中文
    return messages.cn;
}
//# sourceMappingURL=sms.js.map