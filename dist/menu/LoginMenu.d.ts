import { AppHeader } from '../components';
import { PHOVEA_SECURITY_FLASK_LoginMenu as BaseLoginMenu, PHOVEA_SECURITY_FLASK_ILoginMenuOptions as IBaseLoginMenuOptions } from '../base';
export interface ILoginMenuOptions extends IBaseLoginMenuOptions {
    insertIntoHeader?: boolean;
}
export declare class LoginMenu extends BaseLoginMenu {
    private readonly header;
    constructor(header: AppHeader, options?: ILoginMenuOptions);
}
//# sourceMappingURL=LoginMenu.d.ts.map