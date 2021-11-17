import { BaseUtils } from '../base';
import { PHOVEA_SECURITY_FLASK_LoginMenu as BaseLoginMenu } from '../base';
export class LoginMenu extends BaseLoginMenu {
    constructor(header, options = {}) {
        super(header, BaseUtils.mixin({
            document: header.rightMenu.ownerDocument
        }, options));
        this.header = header;
        if (options.insertIntoHeader) {
            this.header.insertCustomRightMenu(this.node);
        }
    }
}
//# sourceMappingURL=LoginMenu.js.map