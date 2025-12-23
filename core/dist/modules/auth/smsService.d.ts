/**
 * 腾讯云短信服务
 *
 * 负责调用腾讯云 SMS API 发送验证码短信
 */
/**
 * 发送验证码短信结果
 */
export interface SendSmsResult {
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
    serialNo?: string;
}
/**
 * 发送验证码短信
 *
 * @param phone E.164 格式手机号（如 "+85291234567"）
 * @param code 验证码（6 位数字）
 * @returns 发送结果
 */
export declare function sendVerificationCode(phone: string, code: string): Promise<SendSmsResult>;
/**
 * 验证短信服务配置是否完整
 */
export declare function validateSmsConfig(): {
    valid: boolean;
    missingFields: string[];
};
//# sourceMappingURL=smsService.d.ts.map