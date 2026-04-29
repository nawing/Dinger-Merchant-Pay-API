import cryptolib from 'aes-ecb';
import NodeRSA from 'node-rsa';
const baseURL = 'https://api.dinger.asia';
const portalUrl = 'https://portal.dinger.asia/gateway';
const creditUrl = 'https://creditcard-portal.dinger.asia';
const uatBaseURL = 'https://staging.dinger.asia/payment-gateway-uat';
const uatPortalUrl = 'https://staging.dinger.asia/gateway';
const uatCreditUrl = 'https://staging-creditcard-portal.dinger.asia/gateway';
export class DingerPay {
    constructor(projectName, merchantName, apiKey, pubKey, cbkKey, environment) {
        this.queryBearerToken = async () => {
            const url = new URL(`${this.appBaseUrl}/api/token`);
            url.search = new URLSearchParams({
                projectName: this.projectName,
                merchantName: this.merchantName,
                apiKey: this.apiKey
            }).toString();
            const response = await fetch(url.toString(), {
                method: 'GET'
            });
            return await response.json();
        };
        this.pay = async (opts) => {
            const payload = JSON.stringify(opts);
            const publicKey = new NodeRSA();
            publicKey.importKey(this.pubKey, 'pkcs8-public');
            publicKey.setOptions({ encryptionScheme: 'pkcs1' });
            const token = await this.queryBearerToken();
            const body = new URLSearchParams({
                payload: publicKey.encrypt(payload, 'base64')
            });
            const response = await fetch(`${this.appBaseUrl}/api/pay`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token.response.paymentToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body.toString()
            });
            return await response.json();
        };
        this.queryCheckPerson = async (phoneNumber, appName) => {
            const url = new URL(`${this.appBaseUrl}/checkPhone`);
            url.search = new URLSearchParams({
                phoneNumber,
                appName
            }).toString();
            const response = await fetch(url.toString(), {
                method: 'GET'
            });
            return await response.json();
        };
        this.queryCountryCode = async () => {
            const response = await fetch(`${this.appBaseUrl}/api/countryCodeListEnquiry`, {
                method: 'GET'
            });
            return await response.json();
        };
        this.verifyCb = async (opts) => {
            return JSON.parse(cryptolib.decrypt(this.cbkKey, opts.paymentResult));
        };
        this.queryAllNameSpace = async () => {
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
                { providerName: "MPU", methodName: "OTP", flow: "REDIRECT", logo: "" },
                { providerName: "CB Pay", methodName: "QR", flow: "REDIRECT", logo: "" },
                { providerName: "MAB Bank", methodName: "OTP", flow: "REDIRECT", logo: "" },
                { providerName: "MPT Pay", methodName: "PIN", flow: "REDIRECT", logo: "" },
                { providerName: "OK Dollar", methodName: "PIN", flow: "REDIRECT", logo: "" },
                { providerName: "UAB Pay", methodName: "PIN", flow: "NOTIFICATION", logo: "" },
                { providerName: "TrueMoney", methodName: "PIN", flow: "NOTIFICATION", logo: "" },
            ];
        };
        this.handleVendorResponse = async (opts, payResponse) => {
            const data = payResponse.response;
            let flowOperation = "REDIRECT";
            let redirectLink = `${this.appPortalUrl}/redirect?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
            let qrCode = "";
            if (opts.providerName === "MPU") {
                redirectLink = `${this.appPortalUrl}/mpu?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
            }
            if (opts.providerName === "MPitesan") {
                redirectLink = `${this.appPortalUrl}/mpitesan?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
            }
            if (opts.providerName === "CB Pay") {
                redirectLink = `${this.appPortalUrl}/cbpay?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
            }
            if (opts.providerName === "Visa" ||
                opts.providerName === "Master" ||
                opts.providerName === "JCB") {
                redirectLink = `${this.appCreditUrl}/?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
            }
            if (opts.providerName === "KBZ Pay" && opts.methodName === "QR") {
                qrCode = data.qrCode;
                flowOperation = "QR";
                redirectLink = null;
            }
            if (opts.providerName === "AYA Pay" && opts.methodName === "QR") {
                qrCode = data.qrCode;
                flowOperation = "QR";
                redirectLink = null;
            }
            if (opts.providerName === "AYA Pay" && opts.methodName === "PIN") {
                flowOperation = "NOTIFICATION";
                redirectLink = null;
            }
            if (opts.providerName === "Onepay") {
                flowOperation = "NOTIFICATION";
                redirectLink = null;
            }
            if (opts.providerName === "Sai Sai Pay") {
                flowOperation = "NOTIFICATION";
                redirectLink = null;
            }
            if (opts.providerName === "UAB Pay") {
                flowOperation = "NOTIFICATION";
                redirectLink = null;
            }
            return {
                flowOperation: flowOperation,
                redirectLink: redirectLink,
                qrCode: qrCode
            };
        };
        this.orderTransactionFee = async (amount, vender, digital = 'no') => {
            let tx = 0;
            switch (vender) {
                case "KBZ Direct Pay":
                    (digital === 'yes') ? tx = amount * 0.15 : tx = amount * 0.019;
                    break;
                case "KBZ Pay":
                    (digital === 'yes') ? tx = amount * 0.15 : tx = amount * 0.019;
                    break;
                case "Citizens Pay":
                    tx = amount * 0.019;
                    break;
                case "WAVE Pay":
                    tx = amount * 0.034;
                    break;
                case "TrueMoney":
                    tx = (amount * 0.004) + 200;
                    break;
                case "Mytel Pay":
                    tx = amount * 0.02;
                    break;
                case "AYA Pay":
                    tx = amount * 0.007;
                    break;
                case "MPU":
                    tx = (amount * 0.008) + 200;
                    break;
                case "UAB Pay":
                    tx = amount * 0.009;
                    break;
                case "Sai Sai Pay":
                    tx = amount * 0.009;
                    break;
                case "MPitesan":
                    tx = amount * 0.019;
                    break;
                case "Onepay":
                    tx = amount * 0.016;
                    break;
                case "Visa":
                    tx = amount * 0.039;
                    break;
                case "Master":
                    tx = amount * 0.039;
                    break;
                case "JCB":
                    tx = amount * 0.039;
                    break;
                case "CB Pay":
                    tx = amount * 0.015;
                    break;
                case "MAB Bank":
                    (amount < 200000) ? tx = 1200 : tx = amount * 0.01;
                    break;
                case "MPT Pay":
                    tx = amount * 0.015;
                    break;
                case "OK Dollar":
                    tx = amount * 0.004;
                    break;
            }
            return tx;
        };
        this.validatePayload = async (opts) => {
            let response = { pass: true, message: "" };
            if (!opts.providerName) {
                response.pass = false;
                response.message = "[providerName] is required";
            }
            if (!opts.methodName) {
                response.pass = false;
                response.message = "[methodName] is required";
            }
            if (!opts.totalAmount) {
                response.pass = false;
                response.message = "[totalAmount] is required";
            }
            if (!opts.orderId) {
                response.pass = false;
                response.message = "[orderId] is required";
            }
            if (!opts.customerPhone) {
                response.pass = false;
                response.message = "[customerPhone] is required";
            }
            if (!opts.customerName) {
                response.pass = false;
                response.message = "[customerName] is required";
            }
            if (!opts.items) {
                response.pass = false;
                response.message = "[items] is required";
            }
            let totalAmount = 0;
            const parsedItems = typeof opts.items === 'string' ? JSON.parse(opts.items) : opts.items;
            for (let item of parsedItems) {
                totalAmount += item.amount * item.quantity;
            }
            if (opts.totalAmount != totalAmount) {
                response.pass = false;
                response.message = "[totalAmount] not matched";
            }
            if (opts.providerName === "Visa" ||
                opts.providerName === "Master" ||
                opts.providerName === "JCB") {
                if (!opts.email) {
                    response.pass = false;
                    response.message = "[email] is required for Visa, Master, JCB";
                }
                if (!opts.state) {
                    response.pass = false;
                    response.message = "[state] is required for Visa, Master, JCB";
                }
                if (!opts.country) {
                    response.pass = false;
                    response.message = "[country] is required for Visa, Master, JCB";
                }
                if (!opts.postalCode) {
                    response.pass = false;
                    response.message = "[postalCode] is required for Visa, Master, JCB";
                }
                if (!opts.billAddress) {
                    response.pass = false;
                    response.message = "[billAddress] is required for Visa, Master, JCB";
                }
                if (!opts.billCity) {
                    response.pass = false;
                    response.message = "[billCity] is required for Visa, Master, JCB";
                }
            }
            if (opts.providerName === "Sai Sai Pay" ||
                opts.providerName === "UAB Pay") {
                const projectName = opts.projectName || this.projectName;
                let personResponse = await this.queryCheckPerson(opts.customerPhone, projectName);
                if (personResponse.response.Code !== "000") {
                    response.pass = false;
                    response.message = "[user] is not valid";
                }
            }
            return response;
        };
        this.projectName = projectName;
        this.merchantName = merchantName;
        this.apiKey = apiKey;
        this.pubKey = pubKey;
        this.cbkKey = cbkKey;
        this.environment = environment;
        if (this.environment === "PRODUCTION") {
            this.appBaseUrl = baseURL;
            this.appPortalUrl = portalUrl;
            this.appCreditUrl = creditUrl;
        }
        else {
            this.appBaseUrl = uatBaseURL;
            this.appPortalUrl = uatPortalUrl;
            this.appCreditUrl = uatCreditUrl;
        }
    }
}
