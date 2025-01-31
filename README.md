# Binance Merchant Pay API 

* If you have any questions, always refer back to the API documentation
* https://developers.binance.com/docs/binance-pay/introduction

### Installation
```shell
npm install binance-merchant-pay-api
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
const BinancePay = new DingerMerchantPayApi(
  DINGER_PROJECT_NAME,
  DINGER_MERCHANT_NAME,
  DINGER_API_KEY,
  DINGER_PUBLIC_KEY,
  DINGER_CALLBACK_KEY,
)
```


#### 2. Creating Order
```node
DingerMerchantPayApi
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
| terminalType      | string    | true          | 'APP', 'WEB', 'WAP', 'MINI_PROGRAM', 'OTHERS'  |
| merchantId        | string    | true          |   |
| merchantTradeNo   | string    | true          |   |
| orderAmount       | number    | false          |   |
| currency          | string    | false          |   |
| fiatAmount        | string    | false          |   |
| fiatCurrency      | string    | false          |   |
| returnUrl         | string    | false          |   |
| cancelUrl         | string    | false          |   |
| orderExpireTime   | string    | false          |   |
| supportPayCurrency    | string    | false          |   |
| appId                 | string    | false          |   |
| universalUrlAttach    | string    | false          |   |
| passThroughInfo       | string    | false          |   |
| webhookUrl            | string    | false          |   |=


###### Good Details
| Param                     | Type      | Required      | Description |
| :---:                     | :---:     | :---:         | :---: |
| goodsType                 | string    | true          | '01', '02'  |
| goodsCategory             | string    | true          | 0000: Electronics & Computers, 1000: Books, Music & Movies, 2000: Home, Garden & Tools, 3000: Clothes, Shoes & Bags, 4000: Toys, Kids & Baby, 5000: Automotive & Accessories, 6000: Game & Recharge, 7000: Entertainament & Collection, 8000: Jewelry, 9000: Domestic service, A000: Beauty care, B000: Pharmacy, C000: Sports & Outdoors, D000: Food, Grocery & Health products, E000: Pet supplies, F000: Industry & Science, Z000: Others |
| referenceGoodsId          | string    | true          |  |
| goodsName                 | string    | true          |  |
| goodsDetail               | string    | true          |  |
| goodsUnitAmount           | object    | false         |  |
| goodsUnitAmount.currency  | string    | true          |  |
| goodsUnitAmount.amount    | number    | true          |  |




### Callback Handling
```node
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json()); 
// Binance Merchant API callback endpoint
app.post("/binance-webhook", (req, res) => {

    res.status(200).json({ message: "Success" });
});
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
```


### Summary
* If there are any issue, please feel free to contribute and contact me nawingngan@gmail.com
* If you find this package useful, please buy me a coffee. 

<img src="https://i.imgur.com/xx04ANu.png" width="180">