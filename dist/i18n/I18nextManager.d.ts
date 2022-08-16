export declare class I18nextManager {
    static DEFAULT_LANGUAGE: string;
    static DEFAULT_NAMESPACE: string;
    /**
     * Create a unique i18next instance
     * Thus allowing the existence of multiple i18next instances with different configurations
     * without one overwriting the other
     */
    i18n: import("i18next").i18n;
    /**
     *  Awaits the translation files registered at the EP_PHOVEA_CORE_LOCALE extension point
     *  Initialize I18next with the translation files
     */
    initI18n(): Promise<void>;
    private static instance;
    static getInstance(): I18nextManager;
}
export declare const i18n: I18nextManager;
//# sourceMappingURL=I18nextManager.d.ts.map