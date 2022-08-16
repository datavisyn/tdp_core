import { IPluginDesc, IPlugin } from '../base/plugin';
import { IUser } from '../security';
export declare const EP_PHOVEA_CORE_LOGIN = "epPhoveaCoreLogin";
export declare const EP_PHOVEA_CORE_LOGOUT = "epPhoveaCoreLogout";
export declare const EP_PHOVEA_CORE_LOCALE = "epPhoveaCoreLocale";
export interface ILoginExtensionPoint {
    /**
     * @param user {IUser} The user object that was logged in
     */
    factory(user: IUser): void;
}
export interface ILoginExtensionPointDesc extends IPluginDesc {
    load(): Promise<IPlugin & ILoginExtensionPoint>;
}
export interface ILogoutEP {
    factory(): void;
}
export interface ILogoutEPDesc extends IPluginDesc {
    load(): Promise<IPlugin & ILogoutEP>;
}
export interface ILocaleEPDesc extends IPluginDesc {
    /**
     * Locale namespace that usually matches the resource filename (e.g., `phovea` and `phovea.json`)
     */
    ns?: string;
    /**
     * Language following the [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) (e.g., `en` or `en-US`)
     * Default value is `en`.
     */
    lng?: string;
    /**
     * Order of the locales, if two locales with the same namespace and language are found.
     * Locales with a higher the order number override the locales with lower order numbers.
     * Default value is  `0`.
     */
    order?: number;
}
//# sourceMappingURL=extensions.d.ts.map