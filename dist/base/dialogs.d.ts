/**
 * Created by Holger Stitz on 18.08.2016.
 */
import { CLUEGraphManager } from 'phovea_clue';
import { IAreYouSureOptions, Dialog, FormDialog } from 'phovea_ui';
export interface IDialogModule {
    generateDialog(title: string, primaryBtnText?: string, additionalCSSClasses?: string): Dialog;
    areyousure(msg?: string, options?: IAreYouSureOptions | string): Promise<boolean>;
    FormDialog: {
        new (title: string, primaryBtnText?: string, formId?: string, additionalCSSClasses?: string): FormDialog;
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
