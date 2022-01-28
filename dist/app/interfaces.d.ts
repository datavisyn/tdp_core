/**
 * Options of a logout action.
 */
export interface ILogoutOptions {
    /**
     * Logout message.
     */
    msg: string;
    /**
     * Optional payload of the alb_security_store.
     */
    alb_security_store?: {
        /**
         * Redirect URL for the client to actually logout.
         */
        redirect?: string;
    };
}
//# sourceMappingURL=interfaces.d.ts.map