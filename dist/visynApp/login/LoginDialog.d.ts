/// <reference types="react" />
/**
 * Basic login dialog
 */
export declare function LoginDialog({ show, hasWarning, hasError, setError, appName, }: {
    /**
     * Open dialog by default
     */
    show?: boolean;
    /**
     * Adds has-warning css class
     */
    hasWarning?: boolean;
    /**
     * Adds the `has-error` css class
     */
    hasError?: boolean;
    setError: (s: string) => void;
    appName: string;
}): JSX.Element;
//# sourceMappingURL=LoginDialog.d.ts.map