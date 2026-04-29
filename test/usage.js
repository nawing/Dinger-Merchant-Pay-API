const DingerMerchantPayApi = require("../dist/cjs");
const DingerMerchantPay = new DingerMerchantPayApi(
  process.env.DINGER_PROJECT_NAME,
  process.env.DINGER_MERCHANT_NAME,
  process.env.DINGER_API_KEY,
  process.env.DINGER_PUBLIC_KEY,
  process.env.DINGER_CALLBACK_KEY,
  process.env.DINGER_ENVIRONMENT
)

