'use strict';

const rp = require("request-promise");
const NodeRSA = require('node-rsa');
const cryptolib = require("aes-ecb");
const baseURL = 'https://api.dinger.asia';
const basePortalUrl = 'https://portal.dinger.asia/gateway';
const creditPortalUrl = 'https://creditcard-portal.dinger.asia';
/** */
module.exports = class DingerPay {
    constructor(
        projectName,
        merchantName,
        apiKey,
        pubKey,
        cbkKey,
    ) {
        this.projectName = projectName;
        this.merchantName = merchantName;
        this.apiKey = apiKey;
        this.pubKey = pubKey;
        this.cbkKey = cbkKey;
    }
    /**
     * tokenize
     * @returns 
     */
    tokenize = async () => {
        let reqOpts = {
            method: 'GET',
            uri: `${baseURL}/api/token`,
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
        let token = await this.tokenize();
        let reqOpts = {
            method: 'POST',
            uri: `${baseURL}/api/pay`,
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
     * handleVendorResponse
     * @param {string} providerName 
     * @param {string} methodName 
     * @param {*} payResponse 
     */
    handleVendorResponse = async (providerName, methodName, payResponse) => {
        let data = payResponse.response;
        // Default Redirect
        // Default Redirect
        // Default Redirect
        let flowOperation = "REDIRECT";
        let redirectLink = `${basePortalUrl}/redirect?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
        let qrCode = "";
        // MPU Portal Redirect 
        if (providerName === "MPU") {
            redirectLink = `${basePortalUrl}/mpu?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
        }
        // Mpitesan Portal Redirect 
        if (providerName === "MPitesan") {
            redirectLink = `${basePortalUrl}/mpitesan?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
        }
        // CP Pay Portal Redirect 
        if (providerName === "CB Pay") {
            redirectLink = `${basePortalUrl}/cbpay?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
        }
        // Credit Card
        if (
            providerName === "Visa" ||
            providerName === "Master" ||
            providerName === "JCB"
        ) {
            redirectLink = `${creditPortalUrl}/?transactionNo=${data.transactionNum}&formToken=${data.formToken}&merchantOrderId=${data.merchOrderId}`;
        }
        // KBZ QR Code Base64
        if (providerName === "KBZ Pay" && methodName === "QR") {
            qrCode = data.qrCode;
            flowOperation = "QR";
            redirectLink = null;
        }
        // AYA Pay QR Code Base64
        if (providerName === "AYA Pay" && methodName === "QR") {
            qrCode = data.qrCode;
            flowOperation = "QR";
            redirectLink = null;
        }
        // AYA Pay App Push Notification
        if (providerName === "AYA Pay" && methodName === "Pin") {
            flowOperation = "NOTIFICATION";
            redirectLink = null;
        }
        // One Pay App Push Notification
        if (providerName === "Onepay") {
            flowOperation = "NOTIFICATION";
            redirectLink = null;
        }
        // Sai Sai Pay App Push Notification
        if (providerName === "Sai Sai Pay") {
            flowOperation = "NOTIFICATION";
            redirectLink = null;
        }
        // UAP Pay App Push Notification
        if (providerName === "UAB Pay") {
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
     * verifyCb
     * @param {*} opts 
     * @param {*} paymentResult 
     * @returns 
     */
    verifyCb = async (opts) => {
        return JSON.parse(cryptolib.decrypt(this.cbkKey, opts.paymentResult))
    }
}