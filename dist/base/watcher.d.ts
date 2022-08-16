export declare class SessionWatcher {
    private readonly logout;
    private timeout;
    private lastChecked;
    constructor(logout?: () => any);
    private checkSession;
    private loggedOut;
    private stop;
    private reset;
    private pause;
    private start;
    /**
     * watches for session auto log out scenarios
     */
    static startWatching(logout?: () => any): void;
}
//# sourceMappingURL=watcher.d.ts.map