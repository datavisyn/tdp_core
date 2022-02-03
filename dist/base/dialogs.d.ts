import { IAreYouSureOptions, Dialog, PHOVEA_UI_FormDialog } from '../components';
import { CLUEGraphManager } from './CLUEGraphManager';
export interface IDialogModule {
    generateDialog(title: string, primaryBtnText?: string, additionalCSSClasses?: string): Dialog;
    areyousure(msg?: string, options?: IAreYouSureOptions | string): Promise<boolean>;
    FormDialog: {
        new (title: string, primaryBtnText?: string, formId?: string, additionalCSSClasses?: string): PHOVEA_UI_FormDialog;
    };
}
export declare class DialogUtils {
    /**
     * utility dialog when a session was not found
     * @param {CLUEGraphManager} manager
     * @param {string} id session id
     */
    static showProveanceGraphNotFoundDialog(manager: CLUEGraphManager, id: string, additionalCSSClasses?: string): void;
}
//# sourceMappingURL=dialogs.d.ts.map