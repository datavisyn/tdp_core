import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { I18nextManager } from '../i18n';
export class NotificationHandler {
    static pushNotification(level, content, autoHideInMs = -1) {
        let parent = document.body.querySelector(`div.toast-container-custom`);
        if (!parent) {
            document.body.insertAdjacentHTML('beforeend', `<div class="toast-container-custom"></div>`);
            parent = document.body.lastElementChild;
        }
        parent.classList.add('push');
        parent.insertAdjacentHTML('afterbegin', `<div class="alert alert-${level === 'error' ? 'danger' : level} alert-dismissible" role="alert"></div>`);
        const alert = parent.firstElementChild;
        ReactDOM.render(React.createElement(React.Fragment, null,
            React.createElement("button", { ref: (ref) => {
                    if (ref) {
                        // fix link color
                        Array.from(alert.querySelectorAll('a')).forEach((a) => a.classList.add('alert-link'));
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
                }, type: "button", className: "btn-close", "data-bs-dismiss": "alert", "aria-label": "Close" }),
            content), alert);
    }
    static successfullySaved(type, name) {
        NotificationHandler.pushNotification('success', I18nextManager.getInstance().i18n.t('tdp:core.savedNotification', { type, name }), NotificationHandler.DEFAULT_SUCCESS_AUTO_HIDE);
    }
    static successfullyDeleted(type, name) {
        NotificationHandler.pushNotification('success', I18nextManager.getInstance().i18n.t('tdp:core.deletedNotification', { type, name }), NotificationHandler.DEFAULT_SUCCESS_AUTO_HIDE);
    }
}
NotificationHandler.DEFAULT_SUCCESS_AUTO_HIDE = 5000;
NotificationHandler.DEFAULT_ERROR_AUTO_HIDE = -1; // not
//# sourceMappingURL=NotificationHandler.js.map