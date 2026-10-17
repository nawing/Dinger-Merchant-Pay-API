"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DingerPay = exports.NativeCryptoProvider = exports.NativeHttpClient = void 0;
const buffer_1 = require("buffer");
const crypto_1 = require("crypto");
// ==========================================
// 2. Default Native Implementations
// ==========================================
class NativeHttpClient {
    async get(url, headers) {
        const response = await fetch(url, { method: 'GET', headers });
        return response.json();
    }
    async post(url, body, headers) {
        const response = await fetch(url, { method: 'POST', body, headers });
        return response.json();
    }
}
exports.NativeHttpClient = NativeHttpClient;
class NativeCryptoProvider {
    encryptRSA(payload, publicKey) {
        const pemKey = publicKey.includes('-----BEGIN')
            ? publicKey
            : `-----BEGIN PUBLIC KEY-----\n${publicKey.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
        return (0, crypto_1.publicEncrypt)({ key: pemKey, padding: crypto_1.constants.RSA_PKCS1_PADDING }, buffer_1.Buffer.from(payload)).toString('base64');
    }
    decryptAES(payload, callbackKey) {
        const keyBuf = buffer_1.Buffer.from(callbackKey);
        const algorithm = keyBuf.length === 16 ? 'aes-128-ecb' : 'aes-256-ecb';
        const decipher = (0, crypto_1.createDecipheriv)(algorithm, keyBuf, null);
        let decrypted = decipher.update(payload, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
exports.NativeCryptoProvider = NativeCryptoProvider;
// ==========================================
// 3. Main SDK Class
// ==========================================
const ENV_CONFIG = {
    PRODUCTION: {
        base: 'https://api.dinger.asia',
        portal: 'https://portal.dinger.asia/gateway',
        credit: 'https://creditcard-portal.dinger.asia'
    },
    UAT: {
        base: 'https://staging.dinger.asia/payment-gateway-uat',
        portal: 'https://staging.dinger.asia/gateway',
        credit: 'https://staging-creditcard-portal.dinger.asia/gateway'
    }
};
class DingerPay {
    projectName;
    merchantName;
    apiKey;
    pubKey;
    cbkKey;
    environment;
    http;
    crypto;
    appBaseUrl;
    appPortalUrl;
    appCreditUrl;
    constructor(projectName, merchantName, apiKey, pubKey, cbkKey, environment, http = new NativeHttpClient(), crypto = new NativeCryptoProvider()) {
        this.projectName = projectName;
        this.merchantName = merchantName;
        this.apiKey = apiKey;
        this.pubKey = pubKey;
        this.cbkKey = cbkKey;
        this.environment = environment;
        this.http = http;
        this.crypto = crypto;
        const config = ENV_CONFIG[environment] || ENV_CONFIG.PRODUCTION;
        this.appBaseUrl = config.base;
        this.appPortalUrl = config.portal;
        this.appCreditUrl = config.credit;
    }
    async queryBearerToken() {
        const url = new URL(`${this.appBaseUrl}/api/token`);
        url.search = new URLSearchParams({
            projectName: this.projectName,
            merchantName: this.merchantName,
            apiKey: this.apiKey
        }).toString();
        return this.http.get(url.toString());
    }
    async pay(opts) {
        const payloadStr = JSON.stringify(opts);
        const encryptedPayload = this.crypto.encryptRSA(payloadStr, this.pubKey);
        const tokenData = await this.queryBearerToken();
        const paymentToken = tokenData.response?.paymentToken;
        const body = new URLSearchParams({ payload: encryptedPayload }).toString();
        return this.http.post(`${this.appBaseUrl}/api/pay`, body, {
            'Authorization': `Bearer ${paymentToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        });
    }
    async queryCheckPerson(phoneNumber, appName) {
        const url = new URL(`${this.appBaseUrl}/checkPhone`);
        url.search = new URLSearchParams({ phoneNumber, appName }).toString();
        return this.http.get(url.toString());
    }
    async queryCountryCode() {
        return this.http.get(`${this.appBaseUrl}/api/countryCodeListEnquiry`);
    }
    async verifyCb(opts) {
        const decryptedString = this.crypto.decryptAES(opts.paymentResult, this.cbkKey);
        return JSON.parse(decryptedString);
    }
    async queryAllNameSpace() {
        return [
            { providerName: "KBZ Pay", methodName: "QR", flow: "QR", logo: "" },
            { providerName: "KBZ Pay", methodName: "PWA", flow: "REDIRECT", logo: "" },
            { providerName: "AYA Pay", methodName: "QR", flow: "QR", logo: "" },
            { providerName: "AYA Pay", methodName: "PIN", flow: "NOTIFICATION", logo: "" },
            { providerName: "Citizens Pay", methodName: "PIN", flow: "REDIRECT", logo: "" },
            { providerName: "Wave Pay", methodName: "PIN", flow: "REDIRECT", logo: "" },
            { providerName: "MPU", methodName: "OTP", flow: "REDIRECT", logo: "" },
            { providerName: "Mytel", methodName: "PIN", flow: "REDIRECT", logo: "" },
            { providerName: "Sai Sai Pay", methodName: "PIN", flow: "NOTIFICATION", logo: "" },
            { providerName: "Onepay", methodName: "PIN", flow: "NOTIFICATION", logo: "" },
            { providerName: "MPitesan", methodName: "PIN", flow: "REDIRECT", logo: "" },
            { providerName: "KBZ Direct Pay", methodName: "PWA", flow: "REDIRECT", logo: "" },
            { providerName: "Visa", methodName: "OTP", flow: "REDIRECT", logo: "" },
            { providerName: "Master", methodName: "OTP", flow: "REDIRECT", logo: "" },
            { providerName: "JCB", methodName: "OTP", flow: "REDIRECT", logo: "" },
            { providerName: "CB Pay", methodName: "QR", flow: "REDIRECT", logo: "" },
            { providerName: "MAB Bank", methodName: "OTP", flow: "REDIRECT", logo: "" },
            { providerName: "MPT Pay", methodName: "PIN", flow: "REDIRECT", logo: "" },
            { providerName: "OK Dollar", methodName: "PIN", flow: "REDIRECT", logo: "" },
            { providerName: "UAB Pay", methodName: "PIN", flow: "NOTIFICATION", logo: "" },
            { providerName: "TrueMoney", methodName: "PIN", flow: "NOTIFICATION", logo: "" },
        ];
    }
    async handleVendorResponse(opts, payResponse) {
        const data = payResponse.response || {};
        const queryParams = `?transactionNo=${data.transactionNum}&formToken=${data.formToken || ''}&merchantOrderId=${data.merchOrderId}`;
        let flowOperation = "REDIRECT";
        let redirectLink = `${this.appPortalUrl}/redirect${queryParams}`;
        let qrCode = "";
        const customRedirects = {
            "MPU": `${this.appPortalUrl}/mpu${queryParams}`,
            "MPitesan": `${this.appPortalUrl}/mpitesan${queryParams}`,
            "CB Pay": `${this.appPortalUrl}/cbpay${queryParams}`,
            "Visa": `${this.appCreditUrl}/${queryParams}`,
            "Master": `${this.appCreditUrl}/${queryParams}`,
            "JCB": `${this.appCreditUrl}/${queryParams}`,
        };
        if (customRedirects[opts.providerName]) {
            redirectLink = customRedirects[opts.providerName];
        }
        // Remove CB Pay from here so it properly falls back to REDIRECT
        const isQR = (opts.providerName === "KBZ Pay" || opts.providerName === "AYA Pay") && opts.methodName === "QR";
        const isNotification = ["Onepay", "Sai Sai Pay", "UAB Pay"].includes(opts.providerName) ||
            (opts.providerName === "AYA Pay" && opts.methodName === "PIN");
        if (isQR) {
            qrCode = data.qrCode || "";
            flowOperation = "QR";
            redirectLink = null;
        }
        else if (isNotification) {
            flowOperation = "NOTIFICATION";
            redirectLink = null;
        }
        return { flowOperation, redirectLink, qrCode };
    }
    async orderTransactionFee(amount, vendor, digital = "no") {
        const fees = {
            "KBZ Direct Pay": digital === 'yes' ? amount * 0.15 : amount * 0.019,
            "KBZ Pay": digital === 'yes' ? amount * 0.15 : amount * 0.019,
            "Citizens Pay": amount * 0.019,
            "WAVE Pay": amount * 0.034,
            "TrueMoney": (amount * 0.004) + 200,
            "Mytel Pay": amount * 0.02,
            "AYA Pay": amount * 0.007,
            "MPU": (amount * 0.008) + 200,
            "UAB Pay": amount * 0.009,
            "Sai Sai Pay": amount * 0.009,
            "MPitesan": amount * 0.019,
            "Onepay": amount * 0.016,
            "Visa": amount * 0.039,
            "Master": amount * 0.039,
            "JCB": amount * 0.039,
            "CB Pay": amount * 0.015,
            "MAB Bank": amount < 200000 ? 1200 : amount * 0.01,
            "MPT Pay": amount * 0.015,
            "OK Dollar": amount * 0.004,
        };
        return fees[vendor] || 0;
    }
    async validatePayload(opts) {
        if (!opts.providerName)
            return { pass: false, message: "[providerName] is required" };
        if (!opts.methodName)
            return { pass: false, message: "[methodName] is required" };
        if (!opts.totalAmount)
            return { pass: false, message: "[totalAmount] is required" };
        if (!opts.orderId)
            return { pass: false, message: "[orderId] is required" };
        if (!opts.customerPhone)
            return { pass: false, message: "[customerPhone] is required" };
        if (!opts.customerName)
            return { pass: false, message: "[customerName] is required" };
        if (!opts.items)
            return { pass: false, message: "[items] is required" };
        let totalAmount = 0;
        const parsedItems = typeof opts.items === 'string' ? JSON.parse(opts.items) : opts.items;
        for (const item of parsedItems) {
            totalAmount += item.amount * item.quantity;
        }
        if (opts.totalAmount !== totalAmount) {
            return { pass: false, message: "[totalAmount] not matched" };
        }
        if (["Visa", "Master", "JCB"].includes(opts.providerName)) {
            const requiredCreditFields = ['email', 'state', 'country', 'postalCode', 'billAddress', 'billCity'];
            for (const field of requiredCreditFields) {
                if (!opts[field])
                    return { pass: false, message: `[${field}] is required for Visa, Master, JCB` };
            }
        }
        if (["Sai Sai Pay", "UAB Pay"].includes(opts.providerName)) {
            const projectName = opts.projectName || this.projectName;
            const personResponse = await this.queryCheckPerson(opts.customerPhone, projectName);
            if (personResponse?.response?.Code !== "000") {
                return { pass: false, message: "[user] is not valid" };
            }
        }
        return { pass: true, message: "" };
    }
}
exports.DingerPay = DingerPay;
