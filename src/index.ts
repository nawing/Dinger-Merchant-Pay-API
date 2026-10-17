import {Buffer} from "buffer";
import {constants, createDecipheriv, publicEncrypt} from "crypto";
import type {
    CallbackResponse,
    CheckPersonResponse,
    CountryCodeResponse,
    Environment,
    FlowResponse,
    PayOptions,
    PayResponse,
    TokenResponse,
    ValidationResponse,
    VendorNamespace
} from "./types";

// ==========================================
// 1. Dependency Interfaces (The Contracts)
// ==========================================

export interface IHttpClient {
    get<T>(url: string, headers?: Record<string, string>): Promise<T>;
    post<T>(url: string, body: string, headers?: Record<string, string>): Promise<T>;
}

export interface ICryptoProvider {
    encryptRSA(payload: string, publicKey: string): string;
    decryptAES(payload: string, callbackKey: string): string;
}

// ==========================================
// 2. Default Native Implementations
// ==========================================

export class NativeHttpClient implements IHttpClient {
    public async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
        const response = await fetch(url, {method: 'GET', headers});
        return response.json() as Promise<T>;
    }

    public async post<T>(url: string, body: string, headers?: Record<string, string>): Promise<T> {
        const response = await fetch(url, {method: 'POST', body, headers});
        return response.json() as Promise<T>;
    }
}

export class NativeCryptoProvider implements ICryptoProvider {
    public encryptRSA(payload: string, publicKey: string): string {
        const pemKey = publicKey.includes('-----BEGIN')
            ? publicKey
            : `-----BEGIN PUBLIC KEY-----\n${publicKey.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;

        return publicEncrypt(
            {key: pemKey, padding: constants.RSA_PKCS1_PADDING},
            Buffer.from(payload)
        ).toString('base64');
    }

    public decryptAES(payload: string, callbackKey: string): string {
        const keyBuf = Buffer.from(callbackKey);
        const algorithm = keyBuf.length === 16 ? 'aes-128-ecb' : 'aes-256-ecb';
        const decipher = createDecipheriv(algorithm, keyBuf, null);

        let decrypted = decipher.update(payload, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}

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
} as const;

export class DingerPay {
    private readonly appBaseUrl: string;
    private readonly appPortalUrl: string;
    private readonly appCreditUrl: string;

    constructor(
        private readonly projectName: string,
        private readonly merchantName: string,
        private readonly apiKey: string,
        private readonly pubKey: string,
        private readonly cbkKey: string,
        public readonly environment: Environment,
        private readonly http: IHttpClient = new NativeHttpClient(),
        private readonly crypto: ICryptoProvider = new NativeCryptoProvider()
    ) {
        const config = ENV_CONFIG[environment] || ENV_CONFIG.PRODUCTION;
        this.appBaseUrl = config.base;
        this.appPortalUrl = config.portal;
        this.appCreditUrl = config.credit;
    }

    public async queryBearerToken(): Promise<TokenResponse> {
        const url = new URL(`${this.appBaseUrl}/api/token`);
        url.search = new URLSearchParams({
            projectName: this.projectName,
            merchantName: this.merchantName,
            apiKey: this.apiKey
        }).toString();

        return this.http.get<TokenResponse>(url.toString());
    }

    public async pay(opts: PayOptions): Promise<PayResponse> {
        const payloadStr = JSON.stringify(opts);
        const encryptedPayload = this.crypto.encryptRSA(payloadStr, this.pubKey);

        const tokenData = await this.queryBearerToken();
        const paymentToken = tokenData.response?.paymentToken;

        const body = new URLSearchParams({payload: encryptedPayload}).toString();

        return this.http.post<PayResponse>(`${this.appBaseUrl}/api/pay`, body, {
            'Authorization': `Bearer ${paymentToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        });
    }

    public async queryCheckPerson(phoneNumber: string, appName: string): Promise<CheckPersonResponse> {
        const url = new URL(`${this.appBaseUrl}/checkPhone`);
        url.search = new URLSearchParams({phoneNumber, appName}).toString();
        return this.http.get<CheckPersonResponse>(url.toString());
    }

    public async queryCountryCode(): Promise<CountryCodeResponse> {
        return this.http.get<CountryCodeResponse>(`${this.appBaseUrl}/api/countryCodeListEnquiry`);
    }

    public async verifyCb(opts: {paymentResult: string}): Promise<CallbackResponse> {
        const decryptedString = this.crypto.decryptAES(opts.paymentResult, this.cbkKey);
        return JSON.parse(decryptedString) as CallbackResponse;
    }

    public async queryAllNameSpace(): Promise<VendorNamespace[]> {
        return [
            {providerName: "KBZ Pay", methodName: "QR", flow: "QR", logo: ""},
            {providerName: "KBZ Pay", methodName: "PWA", flow: "REDIRECT", logo: ""},
            {providerName: "AYA Pay", methodName: "QR", flow: "QR", logo: ""},
            {providerName: "AYA Pay", methodName: "PIN", flow: "NOTIFICATION", logo: ""},
            {providerName: "Citizens Pay", methodName: "PIN", flow: "REDIRECT", logo: ""},
            {providerName: "Wave Pay", methodName: "PIN", flow: "REDIRECT", logo: ""},
            {providerName: "MPU", methodName: "OTP", flow: "REDIRECT", logo: ""},
            {providerName: "Mytel", methodName: "PIN", flow: "REDIRECT", logo: ""},
            {providerName: "Sai Sai Pay", methodName: "PIN", flow: "NOTIFICATION", logo: ""},
            {providerName: "Onepay", methodName: "PIN", flow: "NOTIFICATION", logo: ""},
            {providerName: "MPitesan", methodName: "PIN", flow: "REDIRECT", logo: ""},
            {providerName: "KBZ Direct Pay", methodName: "PWA", flow: "REDIRECT", logo: ""},
            {providerName: "Visa", methodName: "OTP", flow: "REDIRECT", logo: ""},
            {providerName: "Master", methodName: "OTP", flow: "REDIRECT", logo: ""},
            {providerName: "JCB", methodName: "OTP", flow: "REDIRECT", logo: ""},
            {providerName: "CB Pay", methodName: "QR", flow: "REDIRECT", logo: ""},
            {providerName: "MAB Bank", methodName: "OTP", flow: "REDIRECT", logo: ""},
            {providerName: "MPT Pay", methodName: "PIN", flow: "REDIRECT", logo: ""},
            {providerName: "OK Dollar", methodName: "PIN", flow: "REDIRECT", logo: ""},
            {providerName: "UAB Pay", methodName: "PIN", flow: "NOTIFICATION", logo: ""},
            {providerName: "TrueMoney", methodName: "PIN", flow: "NOTIFICATION", logo: ""},
        ];
    }

    public async handleVendorResponse(opts: PayOptions, payResponse: PayResponse): Promise<FlowResponse> {
        const data = payResponse.response || {};
        const queryParams = `?transactionNo=${data.transactionNum}&formToken=${data.formToken || ''}&merchantOrderId=${data.merchOrderId}`;

        let flowOperation: "REDIRECT" | "QR" | "NOTIFICATION" = "REDIRECT";
        let redirectLink: string | null = `${this.appPortalUrl}/redirect${queryParams}`;
        let qrCode = "";

        const customRedirects: Record<string, string> = {
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
        } else if (isNotification) {
            flowOperation = "NOTIFICATION";
            redirectLink = null;
        }

        return {flowOperation, redirectLink, qrCode};
    }

    public async orderTransactionFee(amount: number, vendor: string, digital: "yes" | "no" = "no"): Promise<number> {
        const fees: Record<string, number> = {
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

    public async validatePayload(opts: PayOptions): Promise<ValidationResponse> {
        if (!opts.providerName) return {pass: false, message: "[providerName] is required"};
        if (!opts.methodName) return {pass: false, message: "[methodName] is required"};
        if (!opts.totalAmount) return {pass: false, message: "[totalAmount] is required"};
        if (!opts.orderId) return {pass: false, message: "[orderId] is required"};
        if (!opts.customerPhone) return {pass: false, message: "[customerPhone] is required"};
        if (!opts.customerName) return {pass: false, message: "[customerName] is required"};
        if (!opts.items) return {pass: false, message: "[items] is required"};

        let totalAmount = 0;
        const parsedItems = typeof opts.items === 'string' ? JSON.parse(opts.items) : opts.items;

        for (const item of parsedItems) {
            totalAmount += item.amount * item.quantity;
        }

        if (opts.totalAmount !== totalAmount) {
            return {pass: false, message: "[totalAmount] not matched"};
        }

        if (["Visa", "Master", "JCB"].includes(opts.providerName)) {
            const requiredCreditFields: (keyof PayOptions)[] = ['email', 'state', 'country', 'postalCode', 'billAddress', 'billCity'];
            for (const field of requiredCreditFields) {
                if (!opts[field]) return {pass: false, message: `[${field}] is required for Visa, Master, JCB`};
            }
        }

        if (["Sai Sai Pay", "UAB Pay"].includes(opts.providerName)) {
            const projectName = opts.projectName || this.projectName;
            const personResponse = await this.queryCheckPerson(opts.customerPhone, projectName);
            if (personResponse?.response?.Code !== "000") {
                return {pass: false, message: "[user] is not valid"};
            }
        }

        return {pass: true, message: ""};
    }
}
