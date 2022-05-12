import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { v4 as uuidv4 } from 'uuid';
import { I18nextManager } from '../i18n';
export class NotificationHandler {
    static pushNotification(level, content, autoHideInMs = -1) {
        const uuid = `push-notification-${uuidv4()}`;
        let parent = document.body.querySelector(`div.toast-container-custom`);
        if (!parent) {
            document.body.insertAdjacentHTML('beforeend', `<div class="toast-container-custom"></div>`);
            parent = document.body.lastElementChild;
        }
        parent.classList.add('push');
        parent.insertAdjacentHTML('afterbegin', `<div class="alert alert-${level === 'error' ? 'danger' : level} alert-dismissible ${uuid}" role="alert">
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`);
        const alert = parent.firstElementChild;
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
        ReactDOM.render(React.createElement(React.Fragment, null,
            React.createElement("button", { type: "button", className: "btn-close", "data-bs-dismiss": "alert", "aria-label": "Close" }),
            content), document.getElementsByClassName(uuid)[0]);
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