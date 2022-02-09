export interface IUser {
    /**
     * user name
     */
    readonly name: string;
    /**
     * list of roles the user is associated with
     */
    readonly roles: string[];
}
export declare class UserUtils {
    static ANONYMOUS_USER: IUser;
}
//# sourceMappingURL=IUser.d.ts.map