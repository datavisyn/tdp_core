import { EventHandler } from 'visyn_core/base';
import { AppHeader } from '../components/header';
export interface ILoginMenuOptions {
    /**
     * formular used for the login dialog
     */
    loginForm?: string;
    document?: Document;
    watch?: boolean;
    insertIntoHeader?: boolean;
}
/**
 * utility login menu that can be added to the Appheader for instance
 */
export declare class LoginMenu extends EventHandler {
    private readonly header;
    static readonly EVENT_LOGGED_IN = "loggedIn";
    static readonly EVENT_LOGGED_OUT = "loggedOut";
    readonly node: HTMLUListElement;
    private readonly options;
    private readonly customizer;
    constructor(header: AppHeader, options?: ILoginMenuOptions);
    private init;
    private logout;
    private runCustomizer;
    forceShowDialog(): void;
    private initLoginDialog;
}
//# sourceMappingURL=LoginMenu.d.ts.map