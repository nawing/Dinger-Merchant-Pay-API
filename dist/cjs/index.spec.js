"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const index_1 = require("./index");
const baseURL = 'https://api.dinger.asia';
const portalUrl = 'https://portal.dinger.asia/gateway';
const creditUrl = 'https://creditcard-portal.dinger.asia';
const uatBaseURL = 'https://staging.dinger.asia/payment-gateway-uat';
const uatPortalUrl = 'https://staging.dinger.asia/gateway';
const uatCreditUrl = 'https://staging-creditcard-portal.dinger.asia/gateway';
// Helper to construct valid PayOptions without type assertions or `any`
const createMockPayOptions = (overrides = {}) => ({
    providerName: 'KBZ Pay',
    methodName: 'QR',
    totalAmount: 10000,
    orderId: 'ORDER-1001',
    customerPhone: '09787747310',
    customerName: 'Aung Aung',
    items: [
        { name: 'Item 1', amount: 5000, quantity: 2 }
    ],
    ...overrides
});
(0, bun_test_1.describe)('UAT Env Setting Checking', () => {
    const dingerPay = new index_1.DingerPay("projectName", "merchantName", "apiKey", "pubKey", "cbkKey", "UAT");
    (0, bun_test_1.it)('should return UAT [appBaseUrl]', () => {
        (0, bun_test_1.expect)(dingerPay['appBaseUrl']).toBe(uatBaseURL);
    });
    (0, bun_test_1.it)('should return UAT [appPortalUrl]', () => {
        (0, bun_test_1.expect)(dingerPay['appPortalUrl']).toBe(uatPortalUrl);
    });
    (0, bun_test_1.it)('should return UAT [appCreditUrl]', () => {
        (0, bun_test_1.expect)(dingerPay['appCreditUrl']).toBe(uatCreditUrl);
    });
});
(0, bun_test_1.describe)('Production Env Setting Checking', () => {
    const dingerPay = new index_1.DingerPay("projectName", "merchantName", "apiKey", "pubKey", "cbkKey", "PRODUCTION");
    (0, bun_test_1.it)('should return [projectName]', () => {
        (0, bun_test_1.expect)(dingerPay['projectName']).toBe('projectName');
    });
    (0, bun_test_1.it)('should return [merchantName]', () => {
        (0, bun_test_1.expect)(dingerPay['merchantName']).toBe('merchantName');
    });
    (0, bun_test_1.it)('should return [apiKey]', () => {
        (0, bun_test_1.expect)(dingerPay['apiKey']).toBe('apiKey');
    });
    (0, bun_test_1.it)('should return [pubKey]', () => {
        (0, bun_test_1.expect)(dingerPay['pubKey']).toBe('pubKey');
    });
    (0, bun_test_1.it)('should return [cbkKey]', () => {
        (0, bun_test_1.expect)(dingerPay['cbkKey']).toBe('cbkKey');
    });
    (0, bun_test_1.it)('should return [environment]', () => {
        (0, bun_test_1.expect)(dingerPay.environment).toBe('PRODUCTION');
    });
    (0, bun_test_1.it)('should return production [appBaseUrl]', () => {
        (0, bun_test_1.expect)(dingerPay['appBaseUrl']).toBe(baseURL);
    });
    (0, bun_test_1.it)('should return production [appPortalUrl]', () => {
        (0, bun_test_1.expect)(dingerPay['appPortalUrl']).toBe(portalUrl);
    });
    (0, bun_test_1.it)('should return production [appCreditUrl]', () => {
        (0, bun_test_1.expect)(dingerPay['appCreditUrl']).toBe(creditUrl);
    });
});
(0, bun_test_1.describe)('[Vendors] Order Response Test', () => {
    const dingerPay = new index_1.DingerPay("projectName", "merchantName", "apiKey", "pubKey", "cbkKey", "PRODUCTION");
    const redirectResponse = {
        code: "000",
        message: "Success",
        response: { transactionNum: 'YYYYYY', formToken: 'XXXXXX', merchOrderId: 'ZZZZZZ' }
    };
    const qrResponse = {
        code: "000",
        message: "Success",
        response: { transactionNum: 'YYYYYY', qrCode: 'XXXXXX', merchOrderId: 'ZZZZZZ' }
    };
    (0, bun_test_1.it)('CASE :: KBZ Pay | PWA', async () => {
        const payload = createMockPayOptions({ providerName: 'KBZ Pay', methodName: 'PWA' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toContain(portalUrl);
        (0, bun_test_1.expect)(response.flowOperation).toBe("REDIRECT");
    });
    (0, bun_test_1.it)('CASE :: KBZ Pay | QR', async () => {
        const payload = createMockPayOptions({ providerName: 'KBZ Pay', methodName: 'QR' });
        const response = await dingerPay.handleVendorResponse(payload, qrResponse);
        (0, bun_test_1.expect)(response.qrCode).toContain(qrResponse.response.qrCode ?? "");
        (0, bun_test_1.expect)(response.flowOperation).toBe("QR");
    });
    (0, bun_test_1.it)('CASE :: KBZ Direct Pay | PWA', async () => {
        const payload = createMockPayOptions({ providerName: 'KBZ Direct Pay', methodName: 'PWA' });
        const response = await dingerPay.handleVendorResponse(payload, qrResponse);
        (0, bun_test_1.expect)(response.redirectLink).toContain(portalUrl);
        (0, bun_test_1.expect)(response.flowOperation).toBe("REDIRECT");
    });
    (0, bun_test_1.it)('CASE :: AYA Pay | PIN', async () => {
        const payload = createMockPayOptions({ providerName: 'AYA Pay', methodName: 'PIN' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toBeNull();
        (0, bun_test_1.expect)(response.flowOperation).toBe("NOTIFICATION");
    });
    (0, bun_test_1.it)('CASE :: AYA Pay | QR', async () => {
        const payload = createMockPayOptions({ providerName: 'AYA Pay', methodName: 'QR' });
        const response = await dingerPay.handleVendorResponse(payload, qrResponse);
        (0, bun_test_1.expect)(response.qrCode).toContain(qrResponse.response.qrCode ?? "");
        (0, bun_test_1.expect)(response.flowOperation).toBe("QR");
    });
    (0, bun_test_1.it)('CASE :: Onepay | PIN', async () => {
        const payload = createMockPayOptions({ providerName: 'Onepay', methodName: 'PIN' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toBeNull();
        (0, bun_test_1.expect)(response.flowOperation).toBe("NOTIFICATION");
    });
    (0, bun_test_1.it)('CASE :: Sai Sai Pay | PIN', async () => {
        const payload = createMockPayOptions({ providerName: 'Sai Sai Pay', methodName: 'PIN' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toBeNull();
        (0, bun_test_1.expect)(response.flowOperation).toBe("NOTIFICATION");
    });
    (0, bun_test_1.it)('CASE :: UAB Pay | PIN', async () => {
        const payload = createMockPayOptions({ providerName: 'UAB Pay', methodName: 'PIN' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toBeNull();
        (0, bun_test_1.expect)(response.flowOperation).toBe("NOTIFICATION");
    });
    (0, bun_test_1.it)('CASE :: Visa | OTP', async () => {
        const payload = createMockPayOptions({ providerName: 'Visa', methodName: 'OTP' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toContain(creditUrl);
        (0, bun_test_1.expect)(response.flowOperation).toBe("REDIRECT");
    });
    (0, bun_test_1.it)('CASE :: Master | OTP', async () => {
        const payload = createMockPayOptions({ providerName: 'Master', methodName: 'OTP' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toContain(creditUrl);
        (0, bun_test_1.expect)(response.flowOperation).toBe("REDIRECT");
    });
    (0, bun_test_1.it)('CASE :: JCB | OTP', async () => {
        const payload = createMockPayOptions({ providerName: 'JCB', methodName: 'OTP' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toContain(creditUrl);
        (0, bun_test_1.expect)(response.flowOperation).toBe("REDIRECT");
    });
    (0, bun_test_1.it)('CASE :: MPU | OTP', async () => {
        const payload = createMockPayOptions({ providerName: 'MPU', methodName: 'OTP' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toContain(portalUrl);
        (0, bun_test_1.expect)(response.redirectLink).toContain('mpu');
        (0, bun_test_1.expect)(response.flowOperation).toBe("REDIRECT");
    });
    (0, bun_test_1.it)('CASE :: MPitesan | PIN', async () => {
        const payload = createMockPayOptions({ providerName: 'MPitesan', methodName: 'PIN' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toContain(portalUrl);
        (0, bun_test_1.expect)(response.redirectLink).toContain('mpitesan');
        (0, bun_test_1.expect)(response.flowOperation).toBe("REDIRECT");
    });
    (0, bun_test_1.it)('CASE :: CB Pay | QR', async () => {
        const payload = createMockPayOptions({ providerName: 'CB Pay', methodName: 'QR' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toContain(portalUrl);
        (0, bun_test_1.expect)(response.redirectLink).toContain('cbpay');
    });
    (0, bun_test_1.it)('CASE :: Citizens Pay | PIN', async () => {
        const payload = createMockPayOptions({ providerName: 'Citizens Pay', methodName: 'PIN' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toContain(portalUrl);
        (0, bun_test_1.expect)(response.flowOperation).toBe("REDIRECT");
    });
    (0, bun_test_1.it)('CASE :: Wave Pay | PIN', async () => {
        const payload = createMockPayOptions({ providerName: 'Wave Pay', methodName: 'PIN' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toContain(portalUrl);
        (0, bun_test_1.expect)(response.flowOperation).toBe("REDIRECT");
    });
    (0, bun_test_1.it)('CASE :: MPT Pay | PWA', async () => {
        const payload = createMockPayOptions({ providerName: 'MPT Pay', methodName: 'PWA' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toContain(portalUrl);
        (0, bun_test_1.expect)(response.flowOperation).toBe("REDIRECT");
    });
    (0, bun_test_1.it)('CASE :: MAB Bank | OTP', async () => {
        const payload = createMockPayOptions({ providerName: 'MAB Bank', methodName: 'OTP' });
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        (0, bun_test_1.expect)(response.redirectLink).toContain(portalUrl);
        (0, bun_test_1.expect)(response.flowOperation).toBe("REDIRECT");
    });
});
(0, bun_test_1.describe)('[Vendors] Tx Fee Test', () => {
    const dingerPay = new index_1.DingerPay("projectName", "merchantName", "apiKey", "pubKey", "cbkKey", "PRODUCTION");
    const inputAmount = 10000;
    (0, bun_test_1.it)('CASE :: KBZ Direct Pay [Virtual]', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'KBZ Direct Pay', 'yes');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.15);
    });
    (0, bun_test_1.it)('CASE :: KBZ Direct Pay [Non Virtual]', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'KBZ Direct Pay', 'no');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.019);
    });
    (0, bun_test_1.it)('CASE :: KBZ Pay [Virtual]', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'KBZ Pay', 'yes');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.15);
    });
    (0, bun_test_1.it)('CASE :: KBZ Pay [Non Virtual]', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'KBZ Pay', 'no');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.019);
    });
    (0, bun_test_1.it)('CASE :: Citizens Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'Citizens Pay');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.019);
    });
    (0, bun_test_1.it)('CASE :: WAVE Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'WAVE Pay');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.034);
    });
    (0, bun_test_1.it)('CASE :: TrueMoney', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'TrueMoney');
        (0, bun_test_1.expect)(tx).toBe((inputAmount * 0.004) + 200);
    });
    (0, bun_test_1.it)('CASE :: Mytel Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'Mytel Pay');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.02);
    });
    (0, bun_test_1.it)('CASE :: AYA Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'AYA Pay');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.007);
    });
    (0, bun_test_1.it)('CASE :: MPU', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'MPU');
        (0, bun_test_1.expect)(tx).toBe((inputAmount * 0.008) + 200);
    });
    (0, bun_test_1.it)('CASE :: UAB Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'UAB Pay');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.009);
    });
    (0, bun_test_1.it)('CASE :: Sai Sai Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'Sai Sai Pay');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.009);
    });
    (0, bun_test_1.it)('CASE :: MPitesan', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'MPitesan');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.019);
    });
    (0, bun_test_1.it)('CASE :: Onepay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'Onepay');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.016);
    });
    (0, bun_test_1.it)('CASE :: Visa', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'Visa');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.039);
    });
    (0, bun_test_1.it)('CASE :: Master', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'Master');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.039);
    });
    (0, bun_test_1.it)('CASE :: JCB', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'JCB');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.039);
    });
    (0, bun_test_1.it)('CASE :: CB Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'CB Pay');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.015);
    });
    (0, bun_test_1.it)('CASE :: MAB Bank < 200000', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'MAB Bank');
        (0, bun_test_1.expect)(tx).toBe(1200);
    });
    (0, bun_test_1.it)('CASE :: MAB Bank > 200000', async () => {
        const highAmount = 200000;
        const tx = await dingerPay.orderTransactionFee(highAmount, 'MAB Bank');
        (0, bun_test_1.expect)(tx).toBe(highAmount * 0.01);
    });
    (0, bun_test_1.it)('CASE :: MPT Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'MPT Pay');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.015);
    });
    (0, bun_test_1.it)('CASE :: OK Dollar', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'OK Dollar');
        (0, bun_test_1.expect)(tx).toBe(inputAmount * 0.004);
    });
});
(0, bun_test_1.describe)('Validation Logic Test', () => {
    const dingerPay = new index_1.DingerPay("projectName", "merchantName", "apiKey", "pubKey", "cbkKey", "PRODUCTION");
    (0, bun_test_1.it)('should fail when items total does not match totalAmount', async () => {
        const payload = createMockPayOptions({
            totalAmount: 9999, // Mismatched
            items: [{ name: 'Test', amount: 500, quantity: 2 }] // sums to 1000
        });
        const res = await dingerPay.validatePayload(payload);
        (0, bun_test_1.expect)(res.pass).toBe(false);
        (0, bun_test_1.expect)(res.message).toBe("[totalAmount] not matched");
    });
    (0, bun_test_1.it)('should fail when Visa is missing billing fields', async () => {
        const payload = createMockPayOptions({
            providerName: 'Visa',
            methodName: 'OTP',
            totalAmount: 1000,
            items: [{ name: 'Test', amount: 1000, quantity: 1 }]
            // email, state, country, postalCode, billAddress, billCity are omitted
        });
        const res = await dingerPay.validatePayload(payload);
        (0, bun_test_1.expect)(res.pass).toBe(false);
        (0, bun_test_1.expect)(res.message).toContain("is required for Visa, Master, JCB");
    });
});
(0, bun_test_1.describe)('Dependency Injection (DI) Test', () => {
    (0, bun_test_1.it)('should use injected mock HTTP and Crypto providers', async () => {
        const mockHttp = {
            get: async (url) => {
                if (url.includes('/api/token')) {
                    return {
                        code: '000',
                        message: 'Success',
                        response: { paymentToken: 'mock-token-xyz' }
                    };
                }
                return {};
            },
            post: async (_url, body) => {
                return {
                    code: '000',
                    message: 'Success',
                    response: {
                        transactionNum: 'TX123456',
                        merchOrderId: 'ORD9999',
                        formToken: 'FT999'
                    }
                };
            }
        };
        const mockCrypto = {
            encryptRSA: (_payload, _key) => 'mock-encrypted-base64',
            decryptAES: (_payload, _key) => JSON.stringify({
                transactionStatus: 'SUCCESS',
                transactionNum: 'TX123456',
                merchOrderId: 'ORD9999',
                amount: 10000
            })
        };
        const customDinger = new index_1.DingerPay('proj', 'merch', 'key', 'pub', 'cbk', 'PRODUCTION', mockHttp, mockCrypto);
        const orderResult = await customDinger.pay(createMockPayOptions());
        (0, bun_test_1.expect)(orderResult.response.transactionNum).toBe('TX123456');
        const callbackResult = await customDinger.verifyCb({ paymentResult: 'mock-cipher' });
        (0, bun_test_1.expect)(callbackResult.transactionStatus).toBe('SUCCESS');
        (0, bun_test_1.expect)(callbackResult.merchOrderId).toBe('ORD9999');
    });
});
