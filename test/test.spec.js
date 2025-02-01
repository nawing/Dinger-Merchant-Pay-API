const DingerMerchantPayApi = require("..");

const baseURL = 'https://api.dinger.asia';
const portalUrl = 'https://portal.dinger.asia/gateway';
const creditUrl = 'https://creditcard-portal.dinger.asia';

const uatBaseURL = 'https://staging.dinger.asia/payment-gateway-uat';
const uatPortalUrl = 'https://staging.dinger.asia/gateway';
const uatCreditUrl = 'https://staging-creditcard-portal.dinger.asia/gateway';

// var mocha = require('mocha')
// var describe = mocha.describe
// var it = mocha.it
// var assert = mocha.assert
// var assert = require('chai').assert
const expect = require("chai").expect;





describe('UAT Env Setting Checking', () => {
    const DingerMerchantPay = new DingerMerchantPayApi(
        "apiKey",
        "merchantName",
        "apiKey",
        "pubKey",
        "cbkKey",
        "UAT",
    )

    it('should return UAT [appBaseUrl]', (done) => {
        expect(DingerMerchantPay.appBaseUrl).to.equal(uatBaseURL);
        done()
    });

    it('should return UAT [appPortalUrl]', (done) => {
        expect(DingerMerchantPay.appPortalUrl).to.equal(uatPortalUrl);
        done()
    });

    it('should return UAT [appCreditUrl]', (done) => {
        expect(DingerMerchantPay.appCreditUrl).to.equal(uatCreditUrl);
        done()
    });
});



describe('Production Env Setting Checking', () => {
    let DingerMerchantPay = new DingerMerchantPayApi(
        "projectName",
        "merchantName",
        "apiKey",
        "pubKey",
        "cbkKey",
        "PRODUCTION",
    )

    it('should return [projectName]', () => {
        expect(DingerMerchantPay.projectName).to.equal('projectName');
    });

    it('should return [merchantName]', () => {
        expect(DingerMerchantPay.merchantName).to.equal('merchantName');
    });

    it('should return [apiKey]', () => {
        expect(DingerMerchantPay.apiKey).to.equal('apiKey');
    });

    it('should return [pubKey]', () => {
        expect(DingerMerchantPay.pubKey).to.equal('pubKey');
    });

    it('should return [cbkKey]', () => {
        expect(DingerMerchantPay.cbkKey).to.equal('cbkKey');
    });

    it('should return [environment]', () => {
        expect(DingerMerchantPay.environment).to.equal('PRODUCTION');
    });

    it('should return production [appBaseUrl]', () => {
        expect(DingerMerchantPay.appBaseUrl).to.equal(baseURL);
    });

    it('should return production [appPortalUrl]', () => {
        expect(DingerMerchantPay.appPortalUrl).to.equal(portalUrl);
    });

    it('should return production [appCreditUrl]', () => {
        expect(DingerMerchantPay.appCreditUrl).to.equal(creditUrl);
    });

});



describe('Vender Response Test', async () => {
    let DingerMerchantPay = new DingerMerchantPayApi(
        "projectName",
        "merchantName",
        "apiKey",
        "pubKey",
        "cbkKey",
        "PRODUCTION",
    )

    let redirectResponse = {
        code: "000",
        response: { transactionNum: 'YYYYYY', formToken: 'XXXXXX', merchOrderId: 'ZZZZZZ' }
    }

    let qrResponse = {
        code: "000",
        response: { transactionNum: 'YYYYYY', qrCode: 'XXXXXX', merchOrderId: 'ZZZZZZ' }
    }

    let notiResponse = {
        code: "000",
        response: { transactionNum: 'YYYYYY', merchOrderId: 'ZZZZZZ' }
    }

    it('CASE :: KBZ Pay | PWA', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('KBZ Pay', 'PWA', redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: KBZ Pay | OR', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('KBZ Pay', 'QR', qrResponse)
        expect(response.qrCode).to.contain(qrResponse.response.qrCode);
        expect(response.flowOperation).to.equal("QR");
    });

    it('CASE :: KBZ Direct Pay | PWA', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('KBZ Direct Pay', 'PWA', qrResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: AYA Pay | PIN', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('AYA Pay', 'PIN', redirectResponse)
        expect(response.redirectLink).to.equal(null);
        expect(response.flowOperation).to.equal("NOTIFICATION");
    });

    it('CASE :: AYA Pay | OR', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('AYA Pay', 'QR', qrResponse)
        expect(response.qrCode).to.contain(qrResponse.response.qrCode);
        expect(response.flowOperation).to.equal("QR");
    });

    it('CASE :: Onepay | PIN', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('Onepay', 'PIN', redirectResponse)
        expect(response.redirectLink).to.equal(null);
        expect(response.flowOperation).to.equal("NOTIFICATION");
    });

    it('CASE :: Sai Sai Pay | PIN', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('Sai Sai Pay', 'PIN', redirectResponse)
        expect(response.redirectLink).to.equal(null);
        expect(response.flowOperation).to.equal("NOTIFICATION");
    });

    it('CASE :: UAB Pay | PIN', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('UAB Pay', 'PIN', redirectResponse)
        expect(response.redirectLink).to.equal(null);
        expect(response.flowOperation).to.equal("NOTIFICATION");
    });


    it('CASE :: Visa | OTP', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('Visa', 'OTP', redirectResponse)
        expect(response.redirectLink).to.contain(creditUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: Master | OTP', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('Master', 'OTP', redirectResponse)
        expect(response.redirectLink).to.contain(creditUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: JCB | OTP', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('JCB', 'OTP', redirectResponse)
        expect(response.redirectLink).to.contain(creditUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: MPU | OTP', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('MPU', 'OTP', redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.redirectLink).to.contain('mpu');
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: MPitesan | OTP', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('MPitesan', 'PIN', redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.redirectLink).to.contain('mpitesan');
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: CB Pay | QR', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('CB Pay', 'QR', redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.redirectLink).to.contain('cbpay');
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: Citizens Pay | PIN', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('Citizens Pay', 'PIN', redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: Wave Pay | PIN', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('Wave Pay', 'PIN', redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: MPT Pay | PWA', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('MPT Pay', 'PWA', redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: MAB Bank | OTP', async () => {
        let response = await DingerMerchantPay.handleVendorResponse('MAB Bank', 'OTP', redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });
})

