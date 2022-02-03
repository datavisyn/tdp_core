export declare class NotificationHandler {
    static DEFAULT_SUCCESS_AUTO_HIDE: number;
    static DEFAULT_ERROR_AUTO_HIDE: number;
    static pushNotification(level: 'success' | 'info' | 'warning' | 'danger' | 'error', msg: string, autoHideInMs?: number): void;
    static successfullySaved(type: string, name: string): void;
    static successfullyDeleted(type: string, name: string): void;
}
//# sourceMappingURL=NotificationHandler.d.ts.map