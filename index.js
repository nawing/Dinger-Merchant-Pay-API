'use strict';
/**
 * 
 */
const rp = require("request-promise");
const NodeRSA = require('node-rsa');
const cryptolib = require("aes-ecb");

const baseURL = 'https://api.dinger.asia';
const portalUrl = 'https://portal.dinger.asia/gateway';
const creditUrl = 'https://creditcard-portal.dinger.asia';

const uatBaseURL = 'https://staging.dinger.asia/payment-gateway-uat';
const uatPortalUrl = 'https://staging.dinger.asia/gateway';
const uatCreditUrl = 'https://staging-creditcard-portal.dinger.asia/gateway';
/**
 * 
 */
module.exports = class DingerPay {
    constructor(
        projectName,
        merchantName,
        apiKey,
        pubKey,
        cbkKey,
        environment,
    ) {
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
        if (this.environment === "UAT") {
            this.appBaseUrl = uatBaseURL;
            this.appPortalUrl = uatPortalUrl;
            this.appCreditUrl = uatCreditUrl;
        }
    }
    /**
     * queryBearerToken
     * @returns 
     */
    queryBearerToken = async () => {
        let reqOpts = {
            method: 'GET',
            uri: `${this.appBaseUrl}/api/token`,
            qs: {
                projectName: this.projectName,
                merchantName: this.merchantName,
                apiKey: this.apiKey,
            }
        };
        return JSON.parse(await rp(reqOpts))
    }
    /**
     * pay
     * @param {*} opts 
     * @param {string} providerName
     * @param {string} methodName
     * @param {number} totalAmount
     * @param {string} orderId
     * @param {string} customerPhone
     * @param {string} customerName
     * @param {string} description | optional 
     * @param {string} customerAddress \ optional
     * @param {Array} items
     * @param {string} items[].name
     * @param {string} items[].amount
     * @param {string} items[].quantity
     * @returns 
     */
    pay = async (opts) => {
        let payload = JSON.stringify(opts);
        let publicKey = new NodeRSA();
        publicKey.importKey(this.pubKey, 'pkcs8-public')
        publicKey.setOptions({ encryptionScheme: 'pkcs1' });
        let token = await this.queryBearerToken();
        let reqOpts = {
            method: 'POST',
            uri: `${this.appBaseUrl}/api/pay`,
            headers: {
                Authorization: `Bearer ${token.response.paymentToken}`
            },
            form: {
                payload: publicKey.encrypt(payload, 'base64')
            }
        };
        return JSON.parse(await rp(reqOpts))
    }
    /**
     * charge
     * @param {*} opts 
     * @param {string} providerName
     * @param {string} methodName
     * @param {number} totalAmount
     * @param {string} orderId
     * @param {string} customerPhone
     * @param {string} customerName
     * @param {string} description | optional 
     * @param {string} customerAddress \ optional
     * @param {Array} items
     * @param {string} items[].name
     * @param {string} items[].amount
     * @param {string} items[].quantity
     * @returns 
     */
    charge = async (opts) => {
        let payload = JSON.stringify(opts);
        let publicKey = new NodeRSA();
        publicKey.importKey(this.pubKey, 'pkcs8-public')
        publicKey.setOptions({ encryptionScheme: 'pkcs1' });
        let token = await this.queryBearerToken();
        let reqOpts = {
            method: 'POST',
            uri: `${this.appBaseUrl}/api/pay`,
            headers: {
                Authorization: `Bearer ${token.response.paymentToken}`
            },
            form: {
                payload: publicKey.encrypt(payload, 'base64')
            }
        };
        return JSON.parse(await rp(reqOpts))
    }
    /**
     * queryCheckPerson
     * @param {string} phoneNumber 
     * @param {string} appName 
     * @returns 
     */
    queryCheckPerson = async (phoneNumber, appName) => {
        let reqOpts = {
            method: 'GET',
            uri: `${this.appBaseUrl}/checkPhone`,
            qs: {
                phoneNumber: phoneNumber,
                appName: appName,
            }
        };
        return JSON.parse(await rp(reqOpts))
    }
    /**
     * queryCountryCode
     * @returns 
     */
    queryCountryCode = async () => {
        let reqOpts = {
            method: 'GET',
            uri: `${this.appBaseUrl}/api/countryCodeListEnquiry`,
        };
        return JSON.parse(await rp(reqOpts))
    }
    /**
     * verifyCb
     * @param {*} opts 
     * @param {*} paymentResult 
     * @returns 
     */
    verifyCb = async (opts) => {
        return JSON.parse(cryptolib.decrypt(this.cbkKey, opts.paymentResult))
    }
    /**
     * @UNOFFICIAL 
     * @UNOFFICIAL 
     * @UNOFFICIAL 
     * Below this part are my additional contribution to official DINGER API 
     * These are all very useful functions
     * 
     */
    /**
     * queryAllNameSpace
     * @returns 
     */
    queryAllNameSpace = async () => {
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
        ]
    }
    /**
     * handleVendorResponse
     * @param {*} opts 
     * @param {string} opts.methodName 
     * @param {string} opts.providerName 
     * @param {*} payResponse 
     * @returns 
     */
    handleVendorResponse = async (opts, payResponse) => {
        let data = payResponse.response;
        // Default Redirect
        // Default Redirect
        // Default Redirect
        let flowOperation = "REDIRECT";
        let redirectLink = `${this.appPortalUrl}/redirect?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
        let qrCode = "";
        // MPU Portal Redirect 
        if (opts.providerName === "MPU") {
            redirectLink = `${this.appPortalUrl}/mpu?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
        }
        // Mpitesan Portal Redirect 
        if (opts.providerName === "MPitesan") {
            redirectLink = `${this.appPortalUrl}/mpitesan?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
        }
        // CP Pay Portal Redirect 
        if (opts.providerName === "CB Pay") {
            redirectLink = `${this.appPortalUrl}/cbpay?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
        }
        // Credit Card
        if (
            opts.providerName === "Visa" ||
            opts.providerName === "Master" ||
            opts.providerName === "JCB"
        ) {
            redirectLink = `${this.appCreditUrl}/?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
        }
        // KBZ QR Code Base64
        if (opts.providerName === "KBZ Pay" && opts.methodName === "QR") {
            qrCode = data.qrCode;
            flowOperation = "QR";
            redirectLink = null;
        }
        // AYA Pay QR Code Base64
        if (opts.providerName === "AYA Pay" && opts.methodName === "QR") {
            qrCode = data.qrCode;
            flowOperation = "QR";
            redirectLink = null;
        }
        // AYA Pay App Push Notification
        if (opts.providerName === "AYA Pay" && opts.methodName === "PIN") {
            flowOperation = "NOTIFICATION";
            redirectLink = null;
        }
        // One Pay App Push Notification
        if (opts.providerName === "Onepay") {
            flowOperation = "NOTIFICATION";
            redirectLink = null;
        }
        // Sai Sai Pay App Push Notification
        if (opts.providerName === "Sai Sai Pay") {
            flowOperation = "NOTIFICATION";
            redirectLink = null;
        }
        // UAP Pay App Push Notification
        if (opts.providerName === "UAB Pay") {
            flowOperation = "NOTIFICATION";
            redirectLink = null;
        }
        return {
            flowOperation: flowOperation,
            redirectLink: redirectLink,
            qrCode: qrCode
        }
    }
    /**
     * orderTransactionFee
     * @param {number} amount 
     * @param {string} vender 
     * @param {string} digital 
     * @returns 
     */
    orderTransactionFee = async (amount, vender, digital = 'no') => {
        let tx = 0;
        switch (vender) {
            case "KBZ Direct Pay": (digital === 'yes') ? tx = amount * 0.15 : tx = amount * 0.019; break;
            case "KBZ Pay": (digital === 'yes') ? tx = amount * 0.15 : tx = amount * 0.019; break;
            case "Citizens Pay": tx = amount * 0.019; break;
            case "WAVE Pay": tx = amount * 0.034; break;
            case "TrueMoney": tx = (amount * 0.004) + 200; break;
            case "Mytel Pay": tx = amount * 0.02; break;
            case "AYA Pay": tx = amount * 0.007; break
            case "MPU": tx = (amount * 0.008) + 200; break;
            case "UAB Pay": tx = amount * 0.009; break;
            case "Sai Sai Pay": tx = amount * 0.009; break;
            case "MPitesan": tx = amount * 0.019; break;
            case "Onepay": tx = amount * 0.016; break;
            case "Visa": tx = amount * 0.039; break;
            case "Master": tx = amount * 0.039; break;
            case "JCB": tx = amount * 0.039; break;
            case "CB Pay": tx = amount * 0.015; break;
            case "MAB Bank": (amount < 200000) ? tx = 1200 : tx = amount * 0.01; break;
            case "MPT Pay": tx = amount * 0.015; break;
            case "OK Dollar": tx = amount * 0.004; break;
        }
        return tx;
    }
    /**
     * pay
     * @param {*} opts 
     * @param {string} providerName
     * @param {string} methodName
     * @param {number} totalAmount
     * @param {string} orderId
     * @param {string} customerPhone
     * @param {string} customerName
     * @param {string} description 
     * @param {string} customerAddress
     * @param {string} email
     * @param {string} state
     * @param {string} country
     * @param {string} postalCode
     * @param {string} billAddress
     * @param {string} billCity
     * @param {Array} items
     * @param {string} items[].name
     * @param {string} items[].amount
     * @param {string} items[].quantity
     * @returns 
     */
    validatePayload = async (opts) => {
        let response = { pass: true, message: "" }
        // Madatory Fields
        // Madatory Fields
        // Madatory Fields
        if (!opts.providerName) { response.pass = false; response.message = "[providerName] is required" }
        if (!opts.methodName) { response.pass = false; response.message = "[methodName] is required" }
        if (!opts.totalAmount) { response.pass = false; response.message = "[totalAmount] is required" }
        if (!opts.orderId) { response.pass = false; response.message = "[orderId] is required" }
        if (!opts.customerPhone) { response.pass = false; response.message = "[customerPhone] is required" }
        if (!opts.customerName) { response.pass = false; response.message = "[customerName] is required" }
        if (!opts.items) { response.pass = false; response.message = "[items] is required" }
        // Total Amount Matching
        // Total Amount Matching
        // Total Amount Matching
        let totalAmount = 0;
        for (let item of JSON.parse(opts.items)) {
            totalAmount += item.amount * item.quantity;
        }
        if (opts.totalAmount != totalAmount) {
            response.pass = false; response.message = "[totalAmount] not matched";
        }
        // Cases 1
        // Cases 1
        // Cases 1
        if (
            opts.providerName === "Visa" ||
            opts.providerName === "Master" ||
            opts.providerName === "JCB"
        ) {
            if (!opts.email) { response.pass = false; response.message = "[email] is required for Visa, Master, JCB" }
            if (!opts.state) { response.pass = false; response.message = "[state] is required for Visa, Master, JCB" }
            if (!opts.country) { response.pass = false; response.message = "[country] is required for Visa, Master, JCB" }
            if (!opts.postalCode) { response.pass = false; response.message = "[postalCode] is required for Visa, Master, JCB" }
            if (!opts.billAddress) { response.pass = false; response.message = "[billAddress] is required for Visa, Master, JCB" }
            if (!opts.billCity) { response.pass = false; response.message = "[billCity] is required for Visa, Master, JCB" }
        }
        // Cases 2
        // Cases 2
        // Cases 2
        if (
            opts.providerName === "Sai Sai Pay" ||
            opts.providerName === "UAB Pay"
        ) {
            let personResponse = await this.queryCheckPerson(opts.customerPhone, opts.projectName);
            if (personResponse.response.Code !== "000") {
                response.pass = false; response.message = "[user] is not valid"
            }
        }
        return response
    }
}