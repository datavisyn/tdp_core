import * as React from 'react';
export declare class NotificationHandler {
    static DEFAULT_SUCCESS_AUTO_HIDE: number;
    static DEFAULT_ERROR_AUTO_HIDE: number;
    static pushNotification(level: 'success' | 'info' | 'warning' | 'danger' | 'error', content: React.ReactNode, autoHideInMs?: number): void;
    static successfullySaved(type: string, name: string): void;
    static successfullyDeleted(type: string, name: string): void;
}
//# sourceMappingURL=NotificationHandler.d.ts.map