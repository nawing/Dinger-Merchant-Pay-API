# Dinger Merchant Pay API 

* If you have any questions, always refer back to the API documentation
* https://dinger.asia/developers/eng
* Purpose of this package is 
* after creating order, the implemation flow could become very messy because of different payment providers has many different ways 
* and not waste a lot of time for the callback implementation

### Installation
```shell
npm install dinger-merchant-pay-api --save
```


#### 1. Creating Instance
```node
const DingerMerchantPayApi = require("dinger-merchant-pay");
const DINGER_PROJECT_NAME = "";
const DINGER_MERCHANT_NAME = "";
const DINGER_API_KEY = "";
const DINGER_PUBLIC_KEY = "";
const DINGER_CALLBACK_KEY = "";
const DINGER_ENVIRONMENT = "";
const DingerMerchantPay = new DingerMerchantPayApi(
  DINGER_PROJECT_NAME,
  DINGER_MERCHANT_NAME,
  DINGER_API_KEY,
  DINGER_PUBLIC_KEY,
  DINGER_CALLBACK_KEY,
  DINGER_ENVIRONMENT
)
```

#### 2. Switching Environment 
```node
// Please Note: Dinger does not provide UAT environment for credit cards 
// MPU / Visa / Master 
// There is also no posible way to handle callback in UAT environment
const DingerMerchantPayApi = require("dinger-merchant-pay");
const DINGER_PROJECT_NAME = "";
const DINGER_MERCHANT_NAME = "";
const DINGER_API_KEY = "";
const DINGER_PUBLIC_KEY = "";
const DINGER_CALLBACK_KEY = "";
const DINGER_ENVIRONMENT = ""; // 'PRODUCTION' | 'UAT'
const DingerMerchantPay = new DingerMerchantPayApi(
  DINGER_PROJECT_NAME,
  DINGER_MERCHANT_NAME,
  DINGER_API_KEY,
  DINGER_PUBLIC_KEY,
  DINGER_CALLBACK_KEY,
  DINGER_ENVIRONMENT
)
```


#### 3. Creating Order
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

#### 4. Handling Create Order Response 

* Please Note: that implementation of different method has different responses. 
* QR, PIN, OTP, PWA are different .. 
* PWA responds redirect link, 
* QR responds base64 images, some responds redirect
* OTP also responds redirect link 
* MPU, Visa, Master responds >>[portal] redirect link (weird behaviour)

```node
// I created a clean way to handle many different type of responses in 3 simple way.

let payResponse = await DingerMerchantPay
    .pay({
        'providerName': opts.providerName,
        'methodName': this.methodName,
        'totalAmount': opts.totalAmount,
        'orderId': opts.orderId,
        'customerPhone': opts.customerPhone,
        'customerName': opts.customerName,
        'description': opts.description,
        'customerAddress': opts.customerAddress,
        'items': opts.items,
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
```

| flowOperation     | Key           | Description |
| :---:             | :---:         |  :---: |
| 'REDIRECT'        | redirectLink  | open the link on your UI |
| 'QR'              | qrCode        | show QR code in your application |
| 'NOTIFICATION'    |               | Do nothing |


* To sum up there is 3 types of operations you need to implement on your front-end. 
* Redirect to link
* Show QR code to scan on your application 
* Do nothing. just wait for notification from the payment provider application

```node
// Front End Example
// Hopefully this make sense
import axios from 'axios';
//const axios = require('axios'); // legacy way
axios
    .post('/createOrder', { 
        'providerName': opts.providerName,
        'methodName': this.methodName,
        'totalAmount': opts.totalAmount,
        'orderId': opts.orderId,
        'customerPhone': opts.customerPhone,
        'customerName': opts.customerName,
        'description': opts.description,
        'customerAddress': opts.customerAddress,
        'items': opts.items,
    })
    .then( (flowResponse) => {
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
    })
```

#### 5. Query Contry Code [Visa / Master / JCB] 
```node
let countryResponse = await DingerMerchantPay.queryCountryCode();
// For Visa, Master & JCB, there are additional fields that needs to add
let payResponse = await DingerMerchantPay
    .pay({
        "providerName": "Visa", 
        "methodName": "OTP", 
        "totalAmount" : 2200, 
        "orderId":  "11111", 
        "email": "info@gmail.com",
        "customerPhone" : "09787747310", 
        "customerName" : "test user name", 
        "state" : "customer state",
        "country" : "customer country", // Must add 'code' value from Country Code List Enquiry API(/countryCodeListEnquiry) from Dinger **
        "postalCode" : "customer postal code",
        "billAddress" : "customer address",
        "billCity" : "customer city",
        "items" : "[{‘name':'Mac','amount':'1100','quantity':'2'}]" 
    });
```
###### [Response] Country Code
```json
{
  "code": "000",
  "message": "Request Success",
  "time": "20250201 084550",
  "response": [
    {
      "country": "Afghanistan",
      "code": "AF"
    },
    {
      "country": "Aland Islands",
      "code": "AX"
    },
  ]
}
```

#### 6. Check If Users Is Available [Sai Sai Pay & UAB Pay]
```node
DingerMerchantPay
    .queryCheckPerson('092400000', 'UAB Pay')
    .then((response) => {
        console.log(response)
    })
    .catch((error) => {
        console.log(error)
    })
```

###### [Response] Valid User Found
```json
{
    "code": "000",
    "message": "Request Success",
    "time": "20221227 165655",
    "response": {
        "Code": "000",
        "Message": "Success"
    }
}
```
###### [Response] Valid User Not Found
```json
{
    "code": "000",
    "message": "Request Success",
    "time": "20221227 165755",
    "response": {
        "Code": "021",
        "Message": "Invalid Wallet User"
    }
}
```

#### 7. Get All Namespaces
```node
// This is not offical. I created in this package because this list is very useful.
DingerMerchantPay
    .queryAllNameSpace()
    .then((response) => {
        console.log(response)
    })
    .catch((error) => {
        console.log(error)
    })
```



#### 8. Callback Handling
```node
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 3000;
const DINGER_PROJECT_NAME = "";
const DINGER_MERCHANT_NAME = "";
const DINGER_API_KEY = "";
const DINGER_PUBLIC_KEY = "";
const DINGER_CALLBACK_KEY = "";
const DINGER_ENVIRONMENT = ""; // 'PRODUCTION' | 'UAT'

const DingerMerchantPayApi = require("dinger-merchant-pay");
const DingerMerchantPay = new DingerMerchantPayApi(
  DINGER_PROJECT_NAME,
  DINGER_MERCHANT_NAME,
  DINGER_API_KEY,
  DINGER_PUBLIC_KEY,
  DINGER_CALLBACK_KEY,
  DINGER_ENVIRONMENT
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
* If you find this package useful, please buy me a cup of coffee. 

<img src="https://i.imgur.com/xx04ANu.png" width="180">