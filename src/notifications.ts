import i18n from 'phovea_core/src/i18n';

/**
 * Created by Samuel Gratzl
 */

export {setGlobalErrorTemplate, showErrorModalDialog} from 'phovea_ui/src/errors';

export const DEFAULT_SUCCESS_AUTO_HIDE = 5000;
export const DEFAULT_ERROR_AUTO_HIDE = -1; // not

export function pushNotification(level: 'success' | 'info' | 'warning' | 'danger' | 'error', msg: string, autoHideInMs = -1) {
  let parent = <HTMLElement>document.body.querySelector('div.toast-container');
  if (!parent) {
    document.body.insertAdjacentHTML('beforeend', `<div class="toast-container"></div>`);
    parent = <HTMLElement>document.body.lastElementChild!;
  }

  parent.classList.add('push');
  parent.insertAdjacentHTML('afterbegin', `<div class="alert alert-${level === 'error' ? 'danger' : level} alert-dismissible" role="alert">
  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
  ${msg}</div>`);

  const alert = parent.lastElementChild!;
  // fix link color
  Array.from(alert.querySelectorAll('a')).forEach((a: HTMLElement) => a.classList.add('alert-link'));
  // try creating a slide down animation
  parent.style.top = `-${alert.clientHeight}px`;
  setTimeout(() => {
    parent.classList.remove('push');
    parent.style.top = null;

    if (autoHideInMs > 0) {
      setTimeout(() => alert.querySelector('button').click(), autoHideInMs);
    }
  }, 10); // wait dom rendered
}

export function successfullySaved(type: string, name: string) {
  pushNotification('success', i18n.t('tdp:core.savedNotification', {type, name}), DEFAULT_SUCCESS_AUTO_HIDE);
}

export function successfullyDeleted(type: string, name: string) {
  pushNotification('success', i18n.t('tdp:core.deletedNotification', {type, name}), DEFAULT_SUCCESS_AUTO_HIDE);
}

let errorAlertHandler = (error: any) => {
  if (error instanceof Response || error.response instanceof Response) {
    const xhr: Response = error instanceof Response ? error : error.response;
    return xhr.text().then((body: string) => {
      if (xhr.status === 408) {
        body = i18n.t('tdp:core.timeoutMessage');
      }
      if (xhr.status !== 400) {
        body = `${body}<hr>
        ${i18n.t('tdp:core.requestedUrl')}<br><a href="${xhr.url}" target="_blank" rel="noopener" class="alert-link">${(xhr.url.length > 100) ? xhr.url.substring(0, 100) + '...' : xhr.url}</a>`;
      }
      pushNotification('danger', i18n.t('tdp:core.errorNotification', {status: xhr.status, statusText: xhr.statusText, body}), DEFAULT_ERROR_AUTO_HIDE);
      return Promise.reject(error);
    });
  }
  pushNotification('danger', errorMessage(error), DEFAULT_ERROR_AUTO_HIDE);
  return Promise.reject(error);
};

export function setErrorAlertHandler(f: (error: any) => Promise<never>) {
  errorAlertHandler = f;
}

export function errorAlert(error: any) {
  return errorAlertHandler(error);
}

export function errorMessage(error: any) {
  if (error instanceof Response || error.response instanceof Response) {
    const xhr: Response = error instanceof Response ? error : error.response;
    return `<strong>${error.message.replace('\n', '<br>')}</strong><br><small>${xhr.status} (${xhr.statusText})</small>`;
  } else if (error instanceof Error) {
    return `<strong>${error.name}</strong>: ${error.message.replace('\n', '<br>')}`;
  }
  return `<strong>Unknown Error</strong>: ${error.toString().replace('\n', '<br>')}`;
}
