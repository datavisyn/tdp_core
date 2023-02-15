import { I18nextManager } from 'visyn_core/i18n';
import { Ajax, isAjaxError } from '../base/ajax';
let globalErrorTemplate = (details) => details;
export class Errors {
    /**
     * sets the template function for generating the error details in a error dialog
     * @param {(details: string) => string} template
     */
    static setGlobalErrorTemplate(template) {
        globalErrorTemplate = template;
    }
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
    static showErrorModalDialog(error, additionalCSSClasses = '') {
        function commonDialog(title, body) {
            return import('./dialogs.js').then(() => ({ generateDialog }) => new Promise((resolve, reject) => {
                const dialog = generateDialog(title, I18nextManager.getInstance().i18n.t('phovea:ui.dismiss'), additionalCSSClasses);
                dialog.body.innerHTML = globalErrorTemplate(body);
                dialog.onSubmit(() => {
                    dialog.hide();
                    return false;
                });
                dialog.onHide(() => {
                    reject(error);
                    dialog.destroy();
                });
                dialog.show();
            }));
        }
        if (error instanceof Response || isAjaxError(error)) {
            const xhr = error instanceof Response ? error : error.response;
            return Promise.resolve(isAjaxError(error) ? error.message : Ajax.getErrorMessageFromResponse(xhr)).then((body) => {
                const title = I18nextManager.getInstance().i18n.t('phovea:ui.errorHeader', { status: xhr.status, statusText: xhr.statusText });
                if (xhr.status !== 400) {
                    body = `${body}<hr>
          ${I18nextManager.getInstance().i18n.t('phovea:ui.errorBody')}<br><a href="${xhr.url}" target="_blank">${xhr.url.length > 100 ? `${xhr.url.substring(0, 100)}...` : xhr.url}</a>`;
                }
                return commonDialog(title, body);
            });
        }
        if (error instanceof Error) {
            return commonDialog(error.name, error.message);
        }
        return commonDialog(I18nextManager.getInstance().i18n.t('phovea:ui.unknownError'), error.toString());
    }
}
//# sourceMappingURL=Errors.js.map