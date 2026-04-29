export interface PayOptions {
    providerName: string;
    methodName: string;
    totalAmount: number;
    orderId: string;
    customerPhone: string;
    customerName: string;
    description?: string;
    customerAddress?: string;
    email?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    billAddress?: string;
    billCity?: string;
    items: string | {
        name: string;
        amount: number;
        quantity: number;
    }[];
    projectName?: string;
}
export declare class DingerPay {
    private projectName;
    private merchantName;
    private apiKey;
    private pubKey;
    private cbkKey;
    private environment;
    private appBaseUrl;
    private appPortalUrl;
    private appCreditUrl;
    constructor(projectName: string, merchantName: string, apiKey: string, pubKey: string, cbkKey: string, environment: "PRODUCTION" | "UAT");
    queryBearerToken: () => Promise<any>;
    pay: (opts: PayOptions) => Promise<any>;
    queryCheckPerson: (phoneNumber: string, appName: string) => Promise<any>;
    queryCountryCode: () => Promise<any>;
    verifyCb: (opts: {
        paymentResult: string;
    }) => Promise<any>;
    queryAllNameSpace: () => Promise<any[]>;
    handleVendorResponse: (opts: PayOptions, payResponse: any) => Promise<any>;
    orderTransactionFee: (amount: number, vender: string, digital?: string) => Promise<number>;
    validatePayload: (opts: PayOptions) => Promise<{
        pass: boolean;
        message: string;
    }>;
}
