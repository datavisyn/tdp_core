export declare class ErrorAlertHandler {
    private errorAlertHandler;
    setErrorAlertHandler(f: (error: any) => Promise<never>): void;
    errorAlert(error: any): Promise<never>;
    errorMessage(error: any): string;
    private static instance;
    static getInstance(): ErrorAlertHandler;
}
//# sourceMappingURL=ErrorAlertHandler.d.ts.map