import { Session } from '../base/Session';
import { IUser, ISecureItem, EPermission, EEntity } from '../security';
import { ILogoutOptions } from './interfaces';
export declare class UserSession extends Session {
    static GLOBAL_EVENT_USER_LOGGED_IN: string;
    static GLOBAL_EVENT_USER_LOGGED_OUT: string;
    /**
     * resets the stored session data that will be automatically filled during login
     */
    reset(): void;
    /**
     * whether the user is logged in
     * @returns {boolean}
     */
    isLoggedIn(): boolean;
    /**
     * stores the given user information
     * @param user
     */
    login(user: IUser): void;
    /**
     * logs the current user out
     */
    logout(options: ILogoutOptions): void;
    /**
     * returns the current user or null
     * @returns {any}
     */
    currentUser(): IUser | null;
    /**
     * returns the current user name else an anonymous user name
     */
    currentUserNameOrAnonymous(): string;
    can(item: ISecureItem, permission: EPermission, user?: IUser): boolean;
    /**
     * check whether the given user can read the given item
     * @param item the item to check
     * @param user the user by default the current user
     * @returns {boolean}
     */
    canRead(item: ISecureItem, user?: IUser): boolean;
    /**
     * check whether the given user can write the given item
     * @param item the item to check
     * @param user the user by default the current user
     * @returns {boolean}
     */
    canWrite(item: ISecureItem, user?: IUser): boolean;
    /**
     * check whether the given user can execute the given item
     * @param item the item to check
     * @param user the user by default the current user
     * @returns {boolean}
     */
    canExecute(item: ISecureItem, user?: IUser): boolean;
    hasPermission(item: ISecureItem, entity?: EEntity, permission?: EPermission): boolean;
    private isEqual;
    private includes;
    private static instance;
    static getInstance(): UserSession;
}
//# sourceMappingURL=UserSession.d.ts.map