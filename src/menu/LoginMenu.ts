import {BaseUtils} from '../base';
import {AppHeader} from '../components';
import { PHOVEA_SECURITY_FLASK_LoginMenu as BaseLoginMenu,
  PHOVEA_SECURITY_FLASK_ILoginMenuOptions as IBaseLoginMenuOptions
} from '../base';


export interface ILoginMenuOptions extends IBaseLoginMenuOptions {
  insertIntoHeader?: boolean;
}

export class LoginMenu extends BaseLoginMenu {
  constructor(private readonly header: AppHeader, options: ILoginMenuOptions = {}) {
    super(header, BaseUtils.mixin({
      document: header.rightMenu.ownerDocument
    }, options));
    if (options.insertIntoHeader) {
      this.header.insertCustomRightMenu(this.node);
    }
  }
}
