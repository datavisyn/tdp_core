import {I18nextManager} from 'phovea_core';
import {NotificationHandler} from './NotificationHandler';


export class ErrorAlertHandler {

  private errorAlertHandler = (error: any) => {
    if (error instanceof Response || error.response instanceof Response) {
      const xhr: Response = error instanceof Response ? error : error.response;
      return xhr.text().then((body: string) => {
        if (xhr.status === 408) {
          body = I18nextManager.getInstance().i18n.t('tdp:core.timeoutMessage');
        }
        if (xhr.status !== 400) {
          body = `${body}<hr>
          ${I18nextManager.getInstance().i18n.t('tdp:core.requestedUrl')}<br><a href="${xhr.url}" target="_blank" rel="noopener" class="alert-link">${(xhr.url.length > 100) ? xhr.url.substring(0, 100) + '...' : xhr.url}</a>`;
        }
        NotificationHandler.pushNotification('danger', I18nextManager.getInstance().i18n.t('tdp:core.errorNotification', {status: xhr.status, statusText: xhr.statusText, body}), NotificationHandler.DEFAULT_ERROR_AUTO_HIDE);
        return Promise.reject(error);
      });
    }
    NotificationHandler.pushNotification('danger', ErrorAlertHandler.getInstance().errorMessage(error), NotificationHandler.DEFAULT_ERROR_AUTO_HIDE);
    return Promise.reject(error);
  }

  public setErrorAlertHandler(f: (error: any) => Promise<never>) {
    ErrorAlertHandler.getInstance().errorAlertHandler = f;
  }

  public errorAlert(error: any) {
    return ErrorAlertHandler.getInstance().errorAlertHandler(error);
  }

  public errorMessage(error: any) {
    if (error instanceof Response || error.response instanceof Response) {
      const xhr: Response = error instanceof Response ? error : error.response;
      return `<strong>${error.message.replace('\n', '<br>')}</strong><br><small>${xhr.status} (${xhr.statusText})</small>`;
    } else if (error instanceof Error) {
      return `<strong>${error.name}</strong>: ${error.message.replace('\n', '<br>')}`;
    }
    return `<strong>Unknown Error</strong>: ${error.toString().replace('\n', '<br>')}`;
  }

  private static instance: ErrorAlertHandler;

  public static getInstance(): ErrorAlertHandler {
    if (!ErrorAlertHandler.instance) {
      ErrorAlertHandler.instance = new ErrorAlertHandler();
    }
    return ErrorAlertHandler.instance;
  }
}
