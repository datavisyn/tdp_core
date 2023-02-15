import { IUser, IUserStore } from 'visyn_core/security';
export declare class LoginUtils {
    static defaultLoginForm: () => string;
    /**
     * try to login the given user
     * @param {string} username username
     * @param {string} password password
     * @param {boolean} remember whether to set a long term cookie
     * @return {Promise<never | any>} the result in case of a reject it was an invalid request
     */
    static login(username: string, password: string): Promise<any>;
    /**
     * logs the user out
     * @return {Promise<any>} when done also from the server side
     */
    static logout(): Promise<any>;
    static loggedInAs(): Promise<IUser>;
    static getStores(): Promise<IUserStore[]>;
    /**
     * helper to bind to a login form, assuming that fields `login_username`, `login_password` exists
     * @param {HTMLFormElement} form
     * @param {(error: any, user: IUser) => any} callback
     */
    static bindLoginForm(form: HTMLFormElement, callback: (error: any, user: IUser) => any, onSubmit?: () => void): void;
}
//# sourceMappingURL=LoginUtils.d.ts.map