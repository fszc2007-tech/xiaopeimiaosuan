/**
 * 短信服务配置
 *
 * 支持多地区短信发送：
 * - cn: 中国大陆（简体中文）
 * - hk/mo/tw: 港澳台（繁体中文）
 * - intl: 其他国际地区（英文）
 */
export type Region = 'cn' | 'hk' | 'mo' | 'tw' | 'intl';
export declare const smsConfig: {
    readonly tencentSecretId: string;
    readonly tencentSecretKey: string;
    readonly tencentSmsAppId: string;
    readonly tencentSmsRegion: string;
    readonly templateId: string;
    readonly codeSalt: string;
    readonly ipRateLimit: {
        readonly enabled: true;
        readonly window1h: 20;
    };
    readonly countryCodeToRegion: Record<string, Region>;
};
/**
 * 获取地区类型
 */
export declare function getRegionFromCountryCode(countryCode: string): Region;
/**
 * 多语言错误消息映射
 */
export declare const errorMessages: {
    readonly INVALID_PHONE: {
        readonly cn: "手机号格式不正确";
        readonly hk: "手機號碼格式不正確";
        readonly intl: "Invalid phone number";
    };
    readonly RATE_LIMITED_1M: {
        readonly cn: "发送过于频繁，请 60 秒后重试";
        readonly hk: "發送過於頻繁，請 60 秒後重試";
        readonly intl: "Too frequent, retry after 60 seconds";
    };
    readonly RATE_LIMITED_1H: {
        readonly cn: "1 小时内发送次数已达上限，请稍后再试";
        readonly hk: "1 小時內發送次數已達上限，請稍後再試";
        readonly intl: "Hourly limit reached, please retry later";
    };
    readonly RATE_LIMITED_24H: {
        readonly cn: "今日发送次数已达上限，请明天再试";
        readonly hk: "今日發送次數已達上限，請明天再試";
        readonly intl: "Daily limit reached, please retry tomorrow";
    };
    readonly RATE_LIMITED_IP: {
        readonly cn: "发送过于频繁，请稍后再试";
        readonly hk: "發送過於頻繁，請稍後再試";
        readonly intl: "Too frequent, please retry later";
    };
    readonly CODE_EXPIRED: {
        readonly cn: "验证码已过期，请重新获取";
        readonly hk: "驗證碼已過期，請重新獲取";
        readonly intl: "Code expired, please retry";
    };
    readonly CODE_NOT_FOUND: {
        readonly cn: "验证码已过期，请重新获取";
        readonly hk: "驗證碼已過期，請重新獲取";
        readonly intl: "Code not found, please retry";
    };
    readonly OTP_SENT: {
        readonly cn: "验证码已发送";
        readonly hk: "驗證碼已發送";
        readonly intl: "Verification code sent";
    };
    readonly CODE_NOT_SENT: {
        readonly cn: "验证码发送失败，请重新获取";
        readonly hk: "驗證碼發送失敗，請重新獲取";
        readonly intl: "Code not sent, please retry";
    };
    readonly CODE_MISMATCH: {
        readonly cn: "验证码不正确";
        readonly hk: "驗證碼不正確";
        readonly intl: "Invalid code";
    };
    readonly TOO_MANY_ATTEMPTS: {
        readonly cn: "验证码输入错误次数过多，请重新获取";
        readonly hk: "驗證碼輸入錯誤次數過多，請重新獲取";
        readonly intl: "Too many attempts, please retry";
    };
    readonly SMS_SEND_FAILED: {
        readonly cn: "短信发送失败，请稍后重试";
        readonly hk: "短信發送失敗，請稍後重試";
        readonly intl: "SMS send failed, please retry";
    };
    readonly SMS_DAILY_LIMIT_EXCEEDED: {
        readonly cn: "今日短信发送次数已达上限，请明天再试";
        readonly hk: "今日短信發送次數已達上限，請明天再試";
        readonly intl: "Daily SMS limit exceeded, please try tomorrow";
    };
    readonly PHONE_REGION_MISMATCH: {
        readonly cn: "手机号与所选地区不匹配，请检查";
        readonly hk: "手機號碼與所選地區不符，請檢查";
        readonly intl: "Phone number does not match selected region";
    };
};
export type ErrorCode = keyof typeof errorMessages;
/**
 * 获取错误消息
 */
export declare function getErrorMessage(errorCode: ErrorCode, region: Region): string;
//# sourceMappingURL=sms.d.ts.map