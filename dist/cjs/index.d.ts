import type { CallbackResponse, CheckPersonResponse, CountryCodeResponse, Environment, FlowResponse, PayOptions, PayResponse, TokenResponse, ValidationResponse, VendorNamespace } from "./types";
export interface IHttpClient {
    get<T>(url: string, headers?: Record<string, string>): Promise<T>;
    post<T>(url: string, body: string, headers?: Record<string, string>): Promise<T>;
}
export interface ICryptoProvider {
    encryptRSA(payload: string, publicKey: string): string;
    decryptAES(payload: string, callbackKey: string): string;
}
export declare class NativeHttpClient implements IHttpClient {
    get<T>(url: string, headers?: Record<string, string>): Promise<T>;
    post<T>(url: string, body: string, headers?: Record<string, string>): Promise<T>;
}
export declare class NativeCryptoProvider implements ICryptoProvider {
    encryptRSA(payload: string, publicKey: string): string;
    decryptAES(payload: string, callbackKey: string): string;
}
export declare class DingerPay {
    private readonly projectName;
    private readonly merchantName;
    private readonly apiKey;
    private readonly pubKey;
    private readonly cbkKey;
    readonly environment: Environment;
    private readonly http;
    private readonly crypto;
    private readonly appBaseUrl;
    private readonly appPortalUrl;
    private readonly appCreditUrl;
    constructor(projectName: string, merchantName: string, apiKey: string, pubKey: string, cbkKey: string, environment: Environment, http?: IHttpClient, crypto?: ICryptoProvider);
    queryBearerToken(): Promise<TokenResponse>;
    pay(opts: PayOptions): Promise<PayResponse>;
    queryCheckPerson(phoneNumber: string, appName: string): Promise<CheckPersonResponse>;
    queryCountryCode(): Promise<CountryCodeResponse>;
    verifyCb(opts: {
        paymentResult: string;
    }): Promise<CallbackResponse>;
    queryAllNameSpace(): Promise<VendorNamespace[]>;
    handleVendorResponse(opts: PayOptions, payResponse: PayResponse): Promise<FlowResponse>;
    orderTransactionFee(amount: number, vendor: string, digital?: "yes" | "no"): Promise<number>;
    validatePayload(opts: PayOptions): Promise<ValidationResponse>;
}
