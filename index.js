'use strict';

const rp = require("request-promise");
const NodeRSA = require('node-rsa');
const cryptolib = require("aes-ecb");
const baseURL = 'https://api.dinger.asia';
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
     * verifyCb
     * @param {*} opts 
     * @param {*} paymentResult 
     * @returns 
     */
    verifyCb = async (opts) => {
        return JSON.parse(cryptolib.decrypt(this.cbkKey, opts.paymentResult))
    }
}