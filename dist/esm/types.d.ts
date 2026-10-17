export type Environment = 'PRODUCTION' | 'UAT';
export type FlowOperation = 'REDIRECT' | 'QR' | 'NOTIFICATION';
export interface OrderItem {
    name: string;
    amount: number;
    quantity: number;
}
export interface PayOptions {
    providerName: string;
    methodName: string;
    totalAmount: number;
    orderId: string;
    customerPhone: string;
    customerName: string;
    items: OrderItem[] | string;
    description?: string;
    customerAddress?: string;
    projectName?: string;
    email?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    billAddress?: string;
    billCity?: string;
}
export interface ValidationResponse {
    pass: boolean;
    message: string;
}
export interface FlowResponse {
    flowOperation: FlowOperation;
    redirectLink: string | null;
    qrCode: string;
}
export interface CountryCode {
    country: string;
    code: string;
}
export interface CountryCodeResponse {
    code: string;
    message: string;
    time: string;
    response: CountryCode[];
}
export interface CheckPersonResponse {
    code: string;
    message: string;
    time: string;
    response: {
        Code: string;
        Message: string;
    };
}
export interface VendorNamespace {
    providerName: string;
    methodName: string;
    flow: string;
    logo: string;
}
export interface CallbackResponse {
    transactionStatus: string;
    transactionNum: string;
    merchOrderId: string;
    amount: number;
    [key: string]: unknown;
}
export interface TokenResponse {
    code: string;
    message: string;
    response: {
        paymentToken: string;
        [key: string]: unknown;
    };
}
export interface PayResponse {
    code: string;
    message: string;
    response: {
        transactionNum: string;
        merchOrderId: string;
        formToken?: string;
        qrCode?: string;
        [key: string]: unknown;
    };
}
