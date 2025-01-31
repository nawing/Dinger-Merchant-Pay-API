# Dinger Merchant Pay API 

* If you have any questions, always refer back to the API documentation
* https://dinger.asia/developers/eng

### Installation
```shell
npm install dinger-merchant-pay-api
```

### Basic Operations

#### 1. Creating Instance
```node
const DingerMerchantPayApi = require("dinger-merchant-pay");
const DINGER_PROJECT_NAME = "";
const DINGER_MERCHANT_NAME = "";
const DINGER_API_KEY = "";
const DINGER_PUBLIC_KEY = "";
const DINGER_CALLBACK_KEY = "";
const DingerMerchantPay = new DingerMerchantPayApi(
  DINGER_PROJECT_NAME,
  DINGER_MERCHANT_NAME,
  DINGER_API_KEY,
  DINGER_PUBLIC_KEY,
  DINGER_CALLBACK_KEY,
)
```


#### 2. Creating Order
```node
DingerMerchantPay
    .pay({
        'providerName': opts.providerName,
        'methodName': this.methodName,
        'totalAmount': opts.totalAmount,
        'orderId': opts.orderId,
        'customerPhone': opts.customerPhone,
        "customerName": opts.customerName,
        "description": opts.description,
        "customerAddress": opts.customerAddress,
        "items": opts.items,
    }).then((response) => {
        console.log(response)
    }).catch((error) => {
        console.log(error)
    })
```
| Param             | Type      | Required      | Description |
| :---:             | :---:     | :---:         | :---: |
| providerName      | string    | true          | 'KBZ Pay', 'WAVE PAY', 'MPU', 'KBZ Direct Pay', 'Citizens Pay', 'MAB Bank', 'Mytel', 'TrueMoney', 'CB Pay', 'AYA Pay', 'MPitesan', 'Onepay', 'Sai Sai Pay', 'Visa', 'Master', 'MPT Pay' |
| methodName        | string    | true          | 'PWA', 'QR', 'PIN', 'OTP' |
| totalAmount       | number    | true          |   |
| orderId           | string    | true          |   |
| customerPhone     | string    | true          |   |
| customerName      | string    | true          |   |
| description       | string    | false         |   |
| customerAddress   | string    | false         |   |
| item              | Array     | true          |   |


###### Item Details [MUST_BE_STRINGIFIED]
| Param     | Type      | Required      | Description |
| :---:     | :---:     | :---:         | :---: |
| name      | string    | true          |  |
| amount    | string    | true          |  |
| quantity  | string    | true          |  |



### Callback Handling
```node
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 3000;
const DingerMerchantPayApi = require("dinger-merchant-pay");
const DINGER_PROJECT_NAME = "";
const DINGER_MERCHANT_NAME = "";
const DINGER_API_KEY = "";
const DINGER_PUBLIC_KEY = "";
const DINGER_CALLBACK_KEY = "";
const DingerMerchantPay = new DingerMerchantPayApi(
  DINGER_PROJECT_NAME,
  DINGER_MERCHANT_NAME,
  DINGER_API_KEY,
  DINGER_PUBLIC_KEY,
  DINGER_CALLBACK_KEY,
)
app.use(bodyParser.json()); 
// Dinger Merchant API callback endpoint
app.post("/dinger-webhook", (req, res) => {
    DingerMerchantPay
        .verifyCb(req.body)
        .then(( response ) => {
            if (response.transactionStatus === "SUCCESS") { 
                // Do your stuffs
            }
        })
        .catch(( error ) => {
            return res.status(403).json({ message: "Unauthorized" });
        })
    res.status(200).json({ message: "Success" });
});
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
```


### Summary
* If there are any issue, please feel free to contribute and contact me nawingngan@gmail.com
* If you find this package useful, please buy me a coffee. 

<img src="https://i.imgur.com/xx04ANu.png" width="180">