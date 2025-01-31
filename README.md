# Dinger Merchant Pay API 

* If you have any questions, always refer back to the API documentation
* https://dinger.asia/developers/eng
* Purpose of this package is because the callback implementation are not very clear 

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


#### 3. Handling Create Order Response 

* Please Note: that implementation of different method has different responses. 
* QR, PIN, OTP, PWA are different .. 
* PWA responds redirect link, 
* QR responds base64 images, some responds redirect
* OTP also responds redirect link 
* MPU, Visa, Master responds >>[portal] redirect link (weird behaviour)

```node
// I created a clean way to handle a lot of responses
let payResponse = await DingerMerchantPay
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
    });

let flowResponse = await DingerMerchantPay
    .handleVendorResponse(
        opts.providerName,
        opts.methodName,
        payResponse,
    )
console.log(flowResponse)

// {
//      flowOperation: '', << String 'REDIRECT' | 'QR' | 'NOTIFICATION'
//      redirectLink: '', << Redirect Link
//      qrCode: '' << Base 64 String
// }

// you can respond directly to Front End
res.json(flowResponse)


// To sum up there is 3 types of operations you need to implement on your front-end 
// 1. Redirect to link
// 2. Show QR code to scan on your application 
// 3. Do nothing. just wait for notification from the payment prodicder application 


if (flowResponse.flowOperation === "REDIRECT") {
    // Do A Redriect 
    window.open(flowResponse.redirectLink)
}

if (flowResponse.flowOperation === "QR") {
    // This is base64 string of QR Code
    // Show this on your application
    console.log(flowResponse.qrCode)
}   

if (flowResponse.flowOperation === "NOTIFICATION") {
    // Do Nothing 
    // Show Pop Up In your front end Order Created & Wait For Nofication 
}


```


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
app.post("/dinger-webhook", async (req, res) => {
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