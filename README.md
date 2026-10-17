# @mmpay/dinger

**This is an unofficial Dinger library for NodeJS and Bun developers.** We used Dinger's service before we created mmpay and we love it. We hope to collaborate with Dinger in the future.

- If you have any questions, always refer back to the official API documentation: [https://dinger.asia/developers/eng](https://dinger.asia/developers/eng)
- The purpose of this package is to simplify the implementation flow. Creating orders can become messy because different payment providers require different handling methods (QR, PWA, OTP, PIN). This package provides a unified, strictly-typed interface with built-in Dependency Injection (DI) to help you save time on callback and response implementation.

## Features
- 🚀 **Strictly Typed:** Written in TypeScript with full interfaces for payloads and responses.
- 💉 **Dependency Injection (DI):** Easily swap out the underlying HTTP client or Crypto provider for easy mocking and unit testing.
- ⚡ **Modern & Native:** Uses native Node.js/Bun `crypto` and `fetch` APIs. No bloated third-party dependencies.
- 🧹 **Unified Flow:** Standardizes vendor responses into three simple actions: `REDIRECT`, `QR`, or `NOTIFICATION`.

---

## Installation

```bash
npm install @mmpay/dinger --save
# or using bun
bun add @mmpay/dinger
```

---

## Quick Start (Express Example)

```typescript
import express from "express";
import { DingerPay } from "@mmpay/dinger";

const app = express();
app.use(express.json());

const dinger = new DingerPay(
    process.env.DINGER_PROJECT_NAME,
    process.env.DINGER_MERCHANT_NAME,
    process.env.DINGER_API_KEY,
    process.env.DINGER_PUBLIC_KEY,
    process.env.DINGER_CALLBACK_KEY,
    process.env.DINGER_ENVIRONMENT // 'PRODUCTION' | 'UAT'
);

// Create Order Endpoint
app.post("/create-order", async (req, res) => {
    const payload = {
        providerName: req.body.providerName,
        methodName: req.body.methodName,
        totalAmount: req.body.totalAmount,
        orderId: req.body.orderId,
        customerPhone: req.body.customerPhone,
        customerName: req.body.customerName,
        items: req.body.items,
    };

    const validation = await dinger.validatePayload(payload);

    if (validation.pass) {
        const payResponse = await dinger.pay(payload);
        const flowResponse = await dinger.handleVendorResponse(payload, payResponse);

        // Returns { flowOperation: 'REDIRECT'|'QR'|'NOTIFICATION', redirectLink, qrCode }
        return res.json(flowResponse);
    }

    return res.status(400).json({ message: validation.message });
});

// Callback Endpoint
app.post("/dinger-webhook", async (req, res) => {
    try {
        const cbResponse = await dinger.verifyCb(req.body);
        if (cbResponse.transactionStatus === "SUCCESS") {
            // Fulfill the order in your database
            console.log("Payment Success for Order:", cbResponse.merchOrderId);
        }
        res.status(200).json({ message: "Success" });
    } catch (error) {
        return res.status(403).json({ message: "Unauthorized Signature" });
    }
});

app.listen(3000, () => console.log(`Server running on port 3000`));
```

---

## Advanced Usage & API Details

### 1. Initializing the Instance
The class supports Dependency Injection for advanced use cases (e.g., testing).

```typescript
import { DingerPay, NativeHttpClient, NativeCryptoProvider } from "@mmpay/dinger";

// Standard initialization
const dinger = new DingerPay(
  "PROJECT_NAME", "MERCHANT_NAME", "API_KEY", "PUB_KEY", "CBK_KEY",
  "PRODUCTION" // or 'UAT'
);

// Initialization with custom DI Providers (Optional)
const customDinger = new DingerPay(
  "PROJECT_NAME", "MERCHANT_NAME", "API_KEY", "PUB_KEY", "CBK_KEY", "PRODUCTION",
  new MyCustomHttpClient(),
  new MyCustomCryptoProvider()
);
```
> **Note:** Dinger does not provide a UAT environment for credit cards (MPU / Visa / Master). Callbacks cannot be fully tested in the UAT environment.

### 2. Creating an Order (`pay`)
```typescript
const response = await dinger.pay({
    providerName: 'KBZ Pay',
    methodName: 'QR',
    totalAmount: 5000,
    orderId: 'ORD-12345',
    customerPhone: '09123456789',
    customerName: 'Aung Aung',
    items: [
        { name: 'Coffee', amount: 2500, quantity: 2 }
    ]
});
```

### 3. Handling the Vendor Response (`handleVendorResponse`)
Different payment methods return different response structures. `handleVendorResponse` cleans this up into exactly three actionable states for your front-end.

```typescript
const flowResponse = await dinger.handleVendorResponse(payload, payResponse);
// Output:
// {
//      flowOperation: 'REDIRECT' | 'QR' | 'NOTIFICATION',
//      redirectLink: 'https://...', // URL or null
//      qrCode: 'base64_string...' // String or empty
// }
```

**How to handle this on the Front-End:**
```javascript
if (flowResponse.flowOperation === "REDIRECT") {
    window.location.href = flowResponse.redirectLink;
} else if (flowResponse.flowOperation === "QR") {
    displayQRCodeOnScreen(flowResponse.qrCode);
} else if (flowResponse.flowOperation === "NOTIFICATION") {
    showPopup("Please check your wallet app to approve the payment.");
}
```

### 4. Credit Cards (Visa / Master / JCB)
When using credit cards, additional fields are required. You must pass a standard 2-letter country code.

```typescript
const countryList = await dinger.queryCountryCode();

const payResponse = await dinger.pay({
    providerName: "Visa",
    methodName: "OTP",
    totalAmount: 2200,
    orderId: "11111",
    customerPhone: "09787747310",
    customerName: "Test User",
    email: "info@gmail.com",
    state: "Yangon",
    country: "MM", // Must use standard 2-letter code
    postalCode: "11111",
    billAddress: "No.1 Road",
    billCity: "Yangon",
    items: [{ name: 'Mac', amount: 1100, quantity: 2 }]
});
```

### 5. Validate User Existence (Sai Sai Pay / UAB Pay)
For specific wallets, you can check if a phone number is registered before attempting payment.

```typescript
const isUserValid = await dinger.queryCheckPerson('09123456789', 'UAB Pay');
if (isUserValid.response.Code === "000") {
    console.log("User exists!");
}
```

### 6. Transaction Fee Calculator
Helper method to calculate standard transaction fees based on the current rates.
> Note: Rates for KBZ Pay digital goods is **15%**, while non-virtual goods is **1.9%**.

```typescript
// orderTransactionFee(amount, vendorName, isDigitalGoods)
const fee = await dinger.orderTransactionFee(5000, 'KBZ Pay', 'yes');
console.log("Transaction Fee:", fee); // 750
```

### 7. View All Namespaces
```typescript
// Helper to get all supported providers, methods, and flows
const namespaces = await dinger.queryAllNameSpace();
console.dir(namespaces);
