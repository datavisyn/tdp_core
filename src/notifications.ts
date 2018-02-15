/**
 * Created by Holger Stitz on 18.08.2016.
 */

export {setGlobalErrorTemplate, showErrorModalDialog} from 'phovea_ui/src/errors';

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
  pushNotification('success', `${type} "${name}" successfully saved`, 5000);
}

export function successfullyDeleted(type: string, name: string) {
  pushNotification('success', `${type} "${name}" successfully deleted`, 3000);
}

export function errorAlert(error: any) {
  if (error instanceof Response || error.response instanceof Response) {
    const xhr: Response = error instanceof Response ? error : error.response;
    return xhr.text().then((body: string) => {
      if (xhr.status !== 400) {
        body = `${body}<hr>
          The requested URL was:<br><a href="${xhr.url}" target="_blank" class="alert-link">${(xhr.url.length > 100) ? xhr.url.substring(0, 100) + '...' : xhr.url}</a>`;
      }
      pushNotification('danger', `<strong>Error ${xhr.status} (${xhr.statusText})</strong>: ${body}`);
      return error;
    });
  } else if (error instanceof Error) {
    pushNotification('danger', `<string>${error.name}</strong>: ${error.message}`);
  }
  pushNotification('danger', `<string>Unknown Error</strong>: ${error.toString()}`);
  return error;
}
