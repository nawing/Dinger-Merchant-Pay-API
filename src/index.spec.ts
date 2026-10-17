import {describe, expect, it} from "bun:test";
import {DingerPay, type ICryptoProvider, type IHttpClient} from "./index";
import type {PayOptions, PayResponse} from "./types";

const baseURL = 'https://api.dinger.asia';
const portalUrl = 'https://portal.dinger.asia/gateway';
const creditUrl = 'https://creditcard-portal.dinger.asia';

const uatBaseURL = 'https://staging.dinger.asia/payment-gateway-uat';
const uatPortalUrl = 'https://staging.dinger.asia/gateway';
const uatCreditUrl = 'https://staging-creditcard-portal.dinger.asia/gateway';

// Helper to construct valid PayOptions without type assertions or `any`
const createMockPayOptions = (overrides: Partial<PayOptions> = {}): PayOptions => ({
    providerName: 'KBZ Pay',
    methodName: 'QR',
    totalAmount: 10000,
    orderId: 'ORDER-1001',
    customerPhone: '09787747310',
    customerName: 'Aung Aung',
    items: [
        {name: 'Item 1', amount: 5000, quantity: 2}
    ],
    ...overrides
});

describe('UAT Env Setting Checking', () => {
    const dingerPay = new DingerPay(
        "projectName",
        "merchantName",
        "apiKey",
        "pubKey",
        "cbkKey",
        "UAT"
    );

    it('should return UAT [appBaseUrl]', () => {
        expect(dingerPay['appBaseUrl']).toBe(uatBaseURL);
    });

    it('should return UAT [appPortalUrl]', () => {
        expect(dingerPay['appPortalUrl']).toBe(uatPortalUrl);
    });

    it('should return UAT [appCreditUrl]', () => {
        expect(dingerPay['appCreditUrl']).toBe(uatCreditUrl);
    });
});

describe('Production Env Setting Checking', () => {
    const dingerPay = new DingerPay(
        "projectName",
        "merchantName",
        "apiKey",
        "pubKey",
        "cbkKey",
        "PRODUCTION"
    );

    it('should return [projectName]', () => {
        expect(dingerPay['projectName']).toBe('projectName');
    });

    it('should return [merchantName]', () => {
        expect(dingerPay['merchantName']).toBe('merchantName');
    });

    it('should return [apiKey]', () => {
        expect(dingerPay['apiKey']).toBe('apiKey');
    });

    it('should return [pubKey]', () => {
        expect(dingerPay['pubKey']).toBe('pubKey');
    });

    it('should return [cbkKey]', () => {
        expect(dingerPay['cbkKey']).toBe('cbkKey');
    });

    it('should return [environment]', () => {
        expect(dingerPay.environment).toBe('PRODUCTION');
    });

    it('should return production [appBaseUrl]', () => {
        expect(dingerPay['appBaseUrl']).toBe(baseURL);
    });

    it('should return production [appPortalUrl]', () => {
        expect(dingerPay['appPortalUrl']).toBe(portalUrl);
    });

    it('should return production [appCreditUrl]', () => {
        expect(dingerPay['appCreditUrl']).toBe(creditUrl);
    });
});

describe('[Vendors] Order Response Test', () => {
    const dingerPay = new DingerPay(
        "projectName",
        "merchantName",
        "apiKey",
        "pubKey",
        "cbkKey",
        "PRODUCTION"
    );

    const redirectResponse: PayResponse = {
        code: "000",
        message: "Success",
        response: {transactionNum: 'YYYYYY', formToken: 'XXXXXX', merchOrderId: 'ZZZZZZ'}
    };

    const qrResponse: PayResponse = {
        code: "000",
        message: "Success",
        response: {transactionNum: 'YYYYYY', qrCode: 'XXXXXX', merchOrderId: 'ZZZZZZ'}
    };

    it('CASE :: KBZ Pay | PWA', async () => {
        const payload = createMockPayOptions({providerName: 'KBZ Pay', methodName: 'PWA'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toContain(portalUrl);
        expect(response.flowOperation).toBe("REDIRECT");
    });

    it('CASE :: KBZ Pay | QR', async () => {
        const payload = createMockPayOptions({providerName: 'KBZ Pay', methodName: 'QR'});
        const response = await dingerPay.handleVendorResponse(payload, qrResponse);
        expect(response.qrCode).toContain(qrResponse.response.qrCode ?? "");
        expect(response.flowOperation).toBe("QR");
    });

    it('CASE :: KBZ Direct Pay | PWA', async () => {
        const payload = createMockPayOptions({providerName: 'KBZ Direct Pay', methodName: 'PWA'});
        const response = await dingerPay.handleVendorResponse(payload, qrResponse);
        expect(response.redirectLink).toContain(portalUrl);
        expect(response.flowOperation).toBe("REDIRECT");
    });

    it('CASE :: AYA Pay | PIN', async () => {
        const payload = createMockPayOptions({providerName: 'AYA Pay', methodName: 'PIN'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toBeNull();
        expect(response.flowOperation).toBe("NOTIFICATION");
    });

    it('CASE :: AYA Pay | QR', async () => {
        const payload = createMockPayOptions({providerName: 'AYA Pay', methodName: 'QR'});
        const response = await dingerPay.handleVendorResponse(payload, qrResponse);
        expect(response.qrCode).toContain(qrResponse.response.qrCode ?? "");
        expect(response.flowOperation).toBe("QR");
    });

    it('CASE :: Onepay | PIN', async () => {
        const payload = createMockPayOptions({providerName: 'Onepay', methodName: 'PIN'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toBeNull();
        expect(response.flowOperation).toBe("NOTIFICATION");
    });

    it('CASE :: Sai Sai Pay | PIN', async () => {
        const payload = createMockPayOptions({providerName: 'Sai Sai Pay', methodName: 'PIN'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toBeNull();
        expect(response.flowOperation).toBe("NOTIFICATION");
    });

    it('CASE :: UAB Pay | PIN', async () => {
        const payload = createMockPayOptions({providerName: 'UAB Pay', methodName: 'PIN'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toBeNull();
        expect(response.flowOperation).toBe("NOTIFICATION");
    });

    it('CASE :: Visa | OTP', async () => {
        const payload = createMockPayOptions({providerName: 'Visa', methodName: 'OTP'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toContain(creditUrl);
        expect(response.flowOperation).toBe("REDIRECT");
    });

    it('CASE :: Master | OTP', async () => {
        const payload = createMockPayOptions({providerName: 'Master', methodName: 'OTP'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toContain(creditUrl);
        expect(response.flowOperation).toBe("REDIRECT");
    });

    it('CASE :: JCB | OTP', async () => {
        const payload = createMockPayOptions({providerName: 'JCB', methodName: 'OTP'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toContain(creditUrl);
        expect(response.flowOperation).toBe("REDIRECT");
    });

    it('CASE :: MPU | OTP', async () => {
        const payload = createMockPayOptions({providerName: 'MPU', methodName: 'OTP'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toContain(portalUrl);
        expect(response.redirectLink).toContain('mpu');
        expect(response.flowOperation).toBe("REDIRECT");
    });

    it('CASE :: MPitesan | PIN', async () => {
        const payload = createMockPayOptions({providerName: 'MPitesan', methodName: 'PIN'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toContain(portalUrl);
        expect(response.redirectLink).toContain('mpitesan');
        expect(response.flowOperation).toBe("REDIRECT");
    });

    it('CASE :: CB Pay | QR', async () => {
        const payload = createMockPayOptions({providerName: 'CB Pay', methodName: 'QR'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toContain(portalUrl);
        expect(response.redirectLink).toContain('cbpay');
    });

    it('CASE :: Citizens Pay | PIN', async () => {
        const payload = createMockPayOptions({providerName: 'Citizens Pay', methodName: 'PIN'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toContain(portalUrl);
        expect(response.flowOperation).toBe("REDIRECT");
    });

    it('CASE :: Wave Pay | PIN', async () => {
        const payload = createMockPayOptions({providerName: 'Wave Pay', methodName: 'PIN'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toContain(portalUrl);
        expect(response.flowOperation).toBe("REDIRECT");
    });

    it('CASE :: MPT Pay | PWA', async () => {
        const payload = createMockPayOptions({providerName: 'MPT Pay', methodName: 'PWA'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toContain(portalUrl);
        expect(response.flowOperation).toBe("REDIRECT");
    });

    it('CASE :: MAB Bank | OTP', async () => {
        const payload = createMockPayOptions({providerName: 'MAB Bank', methodName: 'OTP'});
        const response = await dingerPay.handleVendorResponse(payload, redirectResponse);
        expect(response.redirectLink).toContain(portalUrl);
        expect(response.flowOperation).toBe("REDIRECT");
    });
});

describe('[Vendors] Tx Fee Test', () => {
    const dingerPay = new DingerPay(
        "projectName",
        "merchantName",
        "apiKey",
        "pubKey",
        "cbkKey",
        "PRODUCTION"
    );

    const inputAmount = 10000;

    it('CASE :: KBZ Direct Pay [Virtual]', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'KBZ Direct Pay', 'yes');
        expect(tx).toBe(inputAmount * 0.15);
    });

    it('CASE :: KBZ Direct Pay [Non Virtual]', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'KBZ Direct Pay', 'no');
        expect(tx).toBe(inputAmount * 0.019);
    });

    it('CASE :: KBZ Pay [Virtual]', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'KBZ Pay', 'yes');
        expect(tx).toBe(inputAmount * 0.15);
    });

    it('CASE :: KBZ Pay [Non Virtual]', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'KBZ Pay', 'no');
        expect(tx).toBe(inputAmount * 0.019);
    });

    it('CASE :: Citizens Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'Citizens Pay');
        expect(tx).toBe(inputAmount * 0.019);
    });

    it('CASE :: WAVE Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'WAVE Pay');
        expect(tx).toBe(inputAmount * 0.034);
    });

    it('CASE :: TrueMoney', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'TrueMoney');
        expect(tx).toBe((inputAmount * 0.004) + 200);
    });

    it('CASE :: Mytel Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'Mytel Pay');
        expect(tx).toBe(inputAmount * 0.02);
    });

    it('CASE :: AYA Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'AYA Pay');
        expect(tx).toBe(inputAmount * 0.007);
    });

    it('CASE :: MPU', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'MPU');
        expect(tx).toBe((inputAmount * 0.008) + 200);
    });

    it('CASE :: UAB Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'UAB Pay');
        expect(tx).toBe(inputAmount * 0.009);
    });

    it('CASE :: Sai Sai Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'Sai Sai Pay');
        expect(tx).toBe(inputAmount * 0.009);
    });

    it('CASE :: MPitesan', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'MPitesan');
        expect(tx).toBe(inputAmount * 0.019);
    });

    it('CASE :: Onepay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'Onepay');
        expect(tx).toBe(inputAmount * 0.016);
    });

    it('CASE :: Visa', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'Visa');
        expect(tx).toBe(inputAmount * 0.039);
    });

    it('CASE :: Master', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'Master');
        expect(tx).toBe(inputAmount * 0.039);
    });

    it('CASE :: JCB', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'JCB');
        expect(tx).toBe(inputAmount * 0.039);
    });

    it('CASE :: CB Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'CB Pay');
        expect(tx).toBe(inputAmount * 0.015);
    });

    it('CASE :: MAB Bank < 200000', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'MAB Bank');
        expect(tx).toBe(1200);
    });

    it('CASE :: MAB Bank > 200000', async () => {
        const highAmount = 200000;
        const tx = await dingerPay.orderTransactionFee(highAmount, 'MAB Bank');
        expect(tx).toBe(highAmount * 0.01);
    });

    it('CASE :: MPT Pay', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'MPT Pay');
        expect(tx).toBe(inputAmount * 0.015);
    });

    it('CASE :: OK Dollar', async () => {
        const tx = await dingerPay.orderTransactionFee(inputAmount, 'OK Dollar');
        expect(tx).toBe(inputAmount * 0.004);
    });
});

describe('Validation Logic Test', () => {
    const dingerPay = new DingerPay(
        "projectName",
        "merchantName",
        "apiKey",
        "pubKey",
        "cbkKey",
        "PRODUCTION"
    );

    it('should fail when items total does not match totalAmount', async () => {
        const payload = createMockPayOptions({
            totalAmount: 9999, // Mismatched
            items: [{name: 'Test', amount: 500, quantity: 2}] // sums to 1000
        });
        const res = await dingerPay.validatePayload(payload);
        expect(res.pass).toBe(false);
        expect(res.message).toBe("[totalAmount] not matched");
    });

    it('should fail when Visa is missing billing fields', async () => {
        const payload = createMockPayOptions({
            providerName: 'Visa',
            methodName: 'OTP',
            totalAmount: 1000,
            items: [{name: 'Test', amount: 1000, quantity: 1}]
            // email, state, country, postalCode, billAddress, billCity are omitted
        });
        const res = await dingerPay.validatePayload(payload);
        expect(res.pass).toBe(false);
        expect(res.message).toContain("is required for Visa, Master, JCB");
    });
});

describe('Dependency Injection (DI) Test', () => {
    it('should use injected mock HTTP and Crypto providers', async () => {
        const mockHttp: IHttpClient = {
            get: async <T>(url: string): Promise<T> => {
                if (url.includes('/api/token')) {
                    return {
                        code: '000',
                        message: 'Success',
                        response: {paymentToken: 'mock-token-xyz'}
                    } as T;
                }
                return {} as T;
            },
            post: async <T>(_url: string, body: string): Promise<T> => {
                return {
                    code: '000',
                    message: 'Success',
                    response: {
                        transactionNum: 'TX123456',
                        merchOrderId: 'ORD9999',
                        formToken: 'FT999'
                    }
                } as T;
            }
        };

        const mockCrypto: ICryptoProvider = {
            encryptRSA: (_payload: string, _key: string): string => 'mock-encrypted-base64',
            decryptAES: (_payload: string, _key: string): string => JSON.stringify({
                transactionStatus: 'SUCCESS',
                transactionNum: 'TX123456',
                merchOrderId: 'ORD9999',
                amount: 10000
            })
        };

        const customDinger = new DingerPay(
            'proj',
            'merch',
            'key',
            'pub',
            'cbk',
            'PRODUCTION',
            mockHttp,
            mockCrypto
        );

        const orderResult = await customDinger.pay(createMockPayOptions());
        expect(orderResult.response.transactionNum).toBe('TX123456');

        const callbackResult = await customDinger.verifyCb({paymentResult: 'mock-cipher'});
        expect(callbackResult.transactionStatus).toBe('SUCCESS');
        expect(callbackResult.merchOrderId).toBe('ORD9999');
    });
});
