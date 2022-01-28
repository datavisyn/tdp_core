import { Dialog } from './dialogs';
export declare class Errors {
    /**
     * sets the template function for generating the error details in a error dialog
     * @param {(details: string) => string} template
     */
    static setGlobalErrorTemplate(template: (details: string) => string): void;
    /**
     * Use this modal dialog to show errors that were catched when an XHR request in a promise fails.
     * The dialog returns a promise that is resolved when the dialog is closed.
     * You can use that to clean up things in an error case.
     *
     * Usage:
     * ```
     * Promise(...)
     * .then(() => { ... }) //success
     * .catch(showErrorModalDialog) // open error dialog
     * .then((xhr) => { ... }); // do something after the error dialog has been closed
     * ```
     *
     * @param error
     * @returns {Promise<any>|Promise}
     */
    static showErrorModalDialog(error: any, additionalCSSClasses?: string): Promise<({ generateDialog }: {
        generateDialog(title: string, primaryBtnText: string, additionalCSSClasses?: string): Dialog;
    }) => Promise<unknown>>;
}
//# sourceMappingURL=Errors.d.ts.map