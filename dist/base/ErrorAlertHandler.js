import { I18nextManager } from '../i18n';
import { Ajax, isAjaxError } from './ajax';
import { NotificationHandler } from './NotificationHandler';
export class ErrorAlertHandler {
    constructor() {
        this.errorAlertHandler = (error) => {
            if (error instanceof Response || isAjaxError(error)) {
                const xhr = error instanceof Response ? error : error.response;
                return Promise.resolve(isAjaxError(error) ? error.message : Ajax.getErrorMessageFromResponse(xhr)).then((body) => {
                    if (xhr.status === 408) {
                        body = I18nextManager.getInstance().i18n.t('tdp:core.timeoutMessage');
                    }
                    if (xhr.status !== 400) {
                        body = `${body}<hr>
          ${I18nextManager.getInstance().i18n.t('tdp:core.requestedUrl')}<br><a href="${xhr.url}" target="_blank" rel="noopener" class="alert-link">${xhr.url.length > 100 ? `${xhr.url.substring(0, 100)}...` : xhr.url}</a>`;
                    }
                    NotificationHandler.pushNotification('danger', I18nextManager.getInstance().i18n.t('tdp:core.errorNotification', { status: xhr.status, statusText: xhr.statusText, body }), NotificationHandler.DEFAULT_ERROR_AUTO_HIDE);
                    return Promise.reject(error);
                });
            }
            NotificationHandler.pushNotification('danger', ErrorAlertHandler.getInstance().errorMessage(error), NotificationHandler.DEFAULT_ERROR_AUTO_HIDE);
            return Promise.reject(error);
        };
    }
    setErrorAlertHandler(f) {
        ErrorAlertHandler.getInstance().errorAlertHandler = f;
    }
    errorAlert(error) {
        return ErrorAlertHandler.getInstance().errorAlertHandler(error);
    }
    errorMessage(error) {
        if (error instanceof Response || isAjaxError(error)) {
            const xhr = error instanceof Response ? error : error.response;
            return `<strong>${(isAjaxError(error) ? error.message : error.statusText).replace('\n', '<br>')}</strong><br><small>${xhr.status} (${xhr.statusText})</small>`;
        }
        if (error instanceof Error) {
            return `<strong>${error.name}</strong>: ${error.message.replace('\n', '<br>')}`;
        }
        return `<strong>Unknown Error</strong>: ${error.toString().replace('\n', '<br>')}`;
    }
    static getInstance() {
        if (!ErrorAlertHandler.instance) {
            ErrorAlertHandler.instance = new ErrorAlertHandler();
        }
        return ErrorAlertHandler.instance;
    }
}
//# sourceMappingURL=ErrorAlertHandler.js.map