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



describe('[Venders] Order Response Test', async () => {
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
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'KBZ Pay', methodName: 'PWA' }, redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: KBZ Pay | OR', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'KBZ Pay', methodName: 'QR' }, qrResponse)
        expect(response.qrCode).to.contain(qrResponse.response.qrCode);
        expect(response.flowOperation).to.equal("QR");
    });

    it('CASE :: KBZ Direct Pay | PWA', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'KBZ Direct Pay', methodName: 'PWA' }, qrResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: AYA Pay | PIN', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'AYA Pay', methodName: 'PIN' }, redirectResponse)
        expect(response.redirectLink).to.equal(null);
        expect(response.flowOperation).to.equal("NOTIFICATION");
    });

    it('CASE :: AYA Pay | OR', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'AYA Pay', methodName: 'QR' }, qrResponse)
        expect(response.qrCode).to.contain(qrResponse.response.qrCode);
        expect(response.flowOperation).to.equal("QR");
    });

    it('CASE :: Onepay | PIN', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'Onepay', methodName: 'PIN' }, redirectResponse)
        expect(response.redirectLink).to.equal(null);
        expect(response.flowOperation).to.equal("NOTIFICATION");
    });

    it('CASE :: Sai Sai Pay | PIN', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'Sai Sai Pay', methodName: 'PIN' }, redirectResponse)
        expect(response.redirectLink).to.equal(null);
        expect(response.flowOperation).to.equal("NOTIFICATION");
    });

    it('CASE :: UAB Pay | PIN', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'UAB Pay', methodName: 'PIN' }, redirectResponse)
        expect(response.redirectLink).to.equal(null);
        expect(response.flowOperation).to.equal("NOTIFICATION");
    });


    it('CASE :: Visa | OTP', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'Visa', methodName: 'OTP' }, redirectResponse)
        expect(response.redirectLink).to.contain(creditUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: Master | OTP', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'Master', methodName: 'OTP' }, redirectResponse)
        expect(response.redirectLink).to.contain(creditUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: JCB | OTP', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'JCB', methodName: 'OTP' }, redirectResponse)
        expect(response.redirectLink).to.contain(creditUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: MPU | OTP', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'MPU', methodName: 'OTP' }, redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.redirectLink).to.contain('mpu');
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: MPitesan | OTP', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'MPitesan', methodName: 'PIN' }, redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.redirectLink).to.contain('mpitesan');
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: CB Pay | QR', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'CB Pay', methodName: 'QR' }, redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.redirectLink).to.contain('cbpay');
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: Citizens Pay | PIN', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'Citizens Pay', methodName: 'PIN' }, redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: Wave Pay | PIN', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'Wave Pay', methodName: 'PIN' }, redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: MPT Pay | PWA', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'MPT Pay', methodName: 'PWA' }, redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });

    it('CASE :: MAB Bank | OTP', async () => {
        let response = await DingerMerchantPay.handleVendorResponse({ providerName: 'MAB Bank', methodName: 'OTP' }, redirectResponse)
        expect(response.redirectLink).to.contain(portalUrl);
        expect(response.flowOperation).to.equal("REDIRECT");
    });
})



describe('[Venders] Tx Fee Test', async () => {
    let DingerMerchantPay = new DingerMerchantPayApi(
        "projectName",
        "merchantName",
        "apiKey",
        "pubKey",
        "cbkKey",
        "PRODUCTION",
    )
    let inputAmount = 10000;
    it('CASE :: KBZ Direct Pay [Virtual]', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'KBZ Direct Pay', 'yes')
        expect(tx).to.equal(inputAmount * 0.15);
    });
    it('CASE :: KBZ Direct Pay [Non Virtual]', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'KBZ Direct Pay', 'no')
        expect(tx).to.equal(inputAmount * 0.019);
    });

    it('CASE :: KBZ Pay [Virtual]', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'KBZ Pay', 'yes')
        expect(tx).to.equal(inputAmount * 0.15);
    });
    it('CASE :: KBZ Pay [Non Virtual]', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'KBZ Pay', 'no')
        expect(tx).to.equal(inputAmount * 0.019);
    });
    it('CASE :: Citizens Pay', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'Citizens Pay')
        expect(tx).to.equal(inputAmount * 0.019);
    });
    it('CASE :: WAVE Pay', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'WAVE Pay')
        expect(tx).to.equal(inputAmount * 0.034);
    });
    it('CASE :: TrueMoney', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'TrueMoney')
        expect(tx).to.equal((inputAmount * 0.004) + 200);
    });
    it('CASE :: Mytel Pay', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'Mytel Pay')
        expect(tx).to.equal(inputAmount * 0.02);
    });
    it('CASE :: AYA Pay', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'AYA Pay')
        expect(tx).to.equal(inputAmount * 0.007);
    });
    it('CASE :: MPU', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'MPU')
        expect(tx).to.equal((inputAmount * 0.008) + 200);
    });
    it('CASE :: UAB Pay', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'UAB Pay')
        expect(tx).to.equal(inputAmount * 0.009);
    });
    it('CASE :: Sai Sai Pay', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'Sai Sai Pay')
        expect(tx).to.equal(inputAmount * 0.009);
    })
    it('CASE :: MPitesan', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'MPitesan')
        expect(tx).to.equal(inputAmount * 0.019);
    });
    it('CASE :: Onepay', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'Onepay')
        expect(tx).to.equal(inputAmount * 0.016);
    });
    it('CASE :: Visa', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'Visa')
        expect(tx).to.equal(inputAmount * 0.039);
    });
    it('CASE :: Master', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'Master')
        expect(tx).to.equal(inputAmount * 0.039);
    });
    it('CASE :: JCB', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'JCB')
        expect(tx).to.equal(inputAmount * 0.039);
    });
    it('CASE :: CB Pay', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'CB Pay')
        expect(tx).to.equal(inputAmount * 0.015);
    });
    it('CASE :: MAB Bank < 200000', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'MAB Bank')
        expect(tx).to.equal(1200);
    });
    it('CASE :: MAB Bank > 200000', async () => {
        inputAmount = 200000;
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'MAB Bank')
        expect(tx).to.equal(inputAmount * 0.01);
    });
    it('CASE :: MPT Pay', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'MPT Pay')
        expect(tx).to.equal(inputAmount * 0.015);
    });
    it('CASE :: OK Dollar', async () => {
        let tx = await DingerMerchantPay.orderTransactionFee(inputAmount, 'OK Dollar')
        expect(tx).to.equal(inputAmount * 0.004);
    });
})