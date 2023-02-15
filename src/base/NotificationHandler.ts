import { I18nextManager } from 'visyn_core/i18n';

export class NotificationHandler {
  public static DEFAULT_SUCCESS_AUTO_HIDE = 5000;

  public static DEFAULT_ERROR_AUTO_HIDE = -1; // not

  static pushNotification(level: 'success' | 'info' | 'warning' | 'danger' | 'error', msg: string, autoHideInMs = -1) {
    let parent = <HTMLElement>document.body.querySelector('div.toast-container-custom');
    if (!parent) {
      document.body.insertAdjacentHTML('beforeend', `<div class="toast-container-custom"></div>`);
      parent = <HTMLElement>document.body.lastElementChild!;
    }

    parent.classList.add('push');
    parent.insertAdjacentHTML(
      'afterbegin',
      `<div class="alert alert-${level === 'error' ? 'danger' : level} alert-dismissible" role="alert">
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    ${msg}</div>`,
    );

    const alert = parent.firstElementChild!;
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

  static successfullySaved(type: string, name: string) {
    NotificationHandler.pushNotification(
      'success',
      I18nextManager.getInstance().i18n.t('tdp:core.savedNotification', { type, name }),
      NotificationHandler.DEFAULT_SUCCESS_AUTO_HIDE,
    );
  }

  static successfullyDeleted(type: string, name: string) {
    NotificationHandler.pushNotification(
      'success',
      I18nextManager.getInstance().i18n.t('tdp:core.deletedNotification', { type, name }),
      NotificationHandler.DEFAULT_SUCCESS_AUTO_HIDE,
    );
  }
}
