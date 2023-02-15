import { AppContext, GlobalEventHandler } from 'visyn_core/base';
import { UserSession } from 'visyn_core/security';
import { LoginUtils } from './LoginUtils';
import { Ajax } from './ajax';
const DEFAULT_SESSION_TIMEOUT = 10 * 60 * 1000; // 10 min
export class SessionWatcher {
    constructor(logout = LoginUtils.logout) {
        this.logout = logout;
        this.timeout = -1;
        this.lastChecked = 0;
        GlobalEventHandler.getInstance().on(UserSession.GLOBAL_EVENT_USER_LOGGED_IN, () => this.reset());
        if (UserSession.getInstance().isLoggedIn()) {
            this.reset();
        }
        GlobalEventHandler.getInstance().on(UserSession.GLOBAL_EVENT_USER_LOGGED_OUT, () => this.stop());
        GlobalEventHandler.getInstance().on(Ajax.GLOBAL_EVENT_AJAX_POST_SEND, () => this.reset());
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.start();
                this.checkSession();
            }
            else {
                this.pause();
            }
        });
    }
    checkSession() {
        const now = Date.now();
        if (now - this.lastChecked < DEFAULT_SESSION_TIMEOUT) {
            // too early assume good
            return;
        }
        LoginUtils.loggedInAs()
            .then(() => this.reset())
            .catch(() => this.loggedOut());
    }
    loggedOut() {
        if (!UserSession.getInstance().isLoggedIn()) {
            return;
        }
        // force log out
        this.logout();
    }
    stop() {
        this.pause();
        this.lastChecked = 0;
    }
    reset() {
        this.lastChecked = Date.now();
        this.start();
    }
    pause() {
        if (this.timeout >= 0) {
            clearTimeout(this.timeout);
            this.timeout = -1;
        }
    }
    start() {
        this.pause();
        if (UserSession.getInstance().isLoggedIn()) {
            this.timeout = window.setTimeout(() => this.checkSession(), DEFAULT_SESSION_TIMEOUT + 100);
        }
    }
    /**
     * watches for session auto log out scenarios
     */
    static startWatching(logout = LoginUtils.logout) {
        if (AppContext.getInstance().offline) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const _ = new SessionWatcher(logout);
    }
}
//# sourceMappingURL=watcher.js.map