import merge from 'lodash/merge';
import { AppContext, EventHandler } from 'visyn_core/base';
import { I18nextManager } from 'visyn_core/i18n';
import { PluginRegistry } from 'visyn_core/plugin';
import { LoginUtils, SessionWatcher, UserSession } from 'visyn_core/security';
import { EXTENSION_POINT_CUSTOMIZED_LOGIN_FORM } from './extensions';
/**
 * utility login menu that can be added to the Appheader for instance
 */
export class LoginMenu extends EventHandler {
    constructor(header, options = {}) {
        super();
        this.header = header;
        this.options = {
            loginForm: undefined,
            document,
            watch: false,
        };
        merge(this.options, { document: header.rightMenu.ownerDocument }, options);
        this.customizer = PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_CUSTOMIZED_LOGIN_FORM);
        this.node = this.init();
        if (this.options.watch) {
            SessionWatcher.startWatching(() => this.logout());
        }
        if (this.options.insertIntoHeader) {
            this.header.insertCustomRightMenu(this.node);
        }
    }
    init() {
        const doc = this.options.document;
        const ul = doc.createElement('ul');
        ul.classList.add('navbar-nav', 'navbar-right');
        ul.innerHTML = `
      <li class="nav-item" id="login_menu">
        <a class="nav-link" data-bs-toggle="modal" data-bs-target="#loginDialog" href="#">
          <i class="fas fa-user fa-fw" aria-hidden="true"></i>
        </a>
      </li>
      <li style="display: none" class="nav-item dropdown" id="user_menu">
          <a href="#" class="nav-link dropdown-toggle" data-testid="user-menu" data-bs-toggle="dropdown" role="button" aria-haspopup="true" id="userMenuDropdown"
              aria-expanded="false"><i class="fas fa-user" aria-hidden="true"></i> <span>${I18nextManager.getInstance().i18n.t('phovea:security_flask.unknown')}</span></a>
          <div class="dropdown-menu dropdown-menu-end" data-bs-popper="none" aria-labelledby="userMenuDropdown">
              <a class="dropdown-item" data-testid="logout-link" href="#" id="logout_link">${I18nextManager.getInstance().i18n.t('phovea:security_flask.logoutButton')}</a>
          </div>
      </li>`;
        ul.querySelector('#logout_link').addEventListener('click', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            this.logout();
        });
        const dialog = this.initLoginDialog(ul.ownerDocument.body);
        this.runCustomizer(ul, dialog);
        return ul;
    }
    logout() {
        const doc = this.options.document;
        this.header.wait();
        LoginUtils.logout().then(() => {
            this.fire(LoginMenu.EVENT_LOGGED_OUT);
            const userMenu = doc.querySelector('#user_menu');
            if (userMenu) {
                userMenu.style.display = 'none';
            }
            this.node.querySelector('#login_menu').style.display = null;
            Array.from(doc.querySelectorAll('.login_required')).forEach((n) => {
                n.classList.add('disabled');
            });
            this.header.ready();
        });
    }
    runCustomizer(menu, dialog) {
        Promise.all(this.customizer.map((d) => d.load())).then((loaded) => {
            loaded.forEach((l) => l.factory(menu, dialog));
        });
    }
    forceShowDialog() {
        const doc = this.options.document;
        const loginDialog = doc.querySelector('#loginDialog');
        loginDialog.querySelector('.modal-header .btn-close').setAttribute('hidden', null); // disable closing the dialog
        this.header.showAndFocusOn('#loginDialog', '#login_username');
    }
    initLoginDialog(body) {
        let { loginForm } = this.options;
        if (!loginForm) {
            const t = this.customizer.find((d) => d.template != null);
            if (t) {
                loginForm = t.template;
            }
            else {
                loginForm = `<form class="form-signin" action="/login" method="post" data-testid="security_flask-form-signin">
        <div class="mb-3">
          <label class="form-label" for="login_username">${I18nextManager.getInstance().i18n.t('phovea:security_flask.username')}</label>
          <input type="text" class="form-control" id="login_username" data-testid="input-login-username" placeholder="${I18nextManager.getInstance().i18n.t('phovea:security_flask.username')}" required="required" autofocus="autofocus" autocomplete="username">
        </div>
        <div class="mb-3">
          <label class="form-label" for="login_password"> ${I18nextManager.getInstance().i18n.t('phovea:security_flask.password')}</label>
          <input type="password" class="form-control" id="login_password" data-testid="input-login-password" placeholder="${I18nextManager.getInstance().i18n.t('phovea:security_flask.password')}" required="required" autocomplete="current-password">
        </div>
        <button type="submit" class="btn btn-primary" data-testid="login-button"> ${I18nextManager.getInstance().i18n.t('phovea:security_flask.submit')}</button>
        </form>
        `;
            }
        }
        body.insertAdjacentHTML('beforeend', `
      <!--login dialog-->
      <div class="modal fade" id="loginDialog" tabindex="-1" role="dialog" aria-labelledby="loginDialog" data-bs-keyboard="false" data-bs-backdrop="static">
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title">${I18nextManager.getInstance().i18n.t('phovea:security_flask.title')}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${I18nextManager.getInstance().i18n.t('phovea:security_flask.closeButton')}"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-warning" role="alert">${I18nextManager.getInstance().i18n.t('phovea:security_flask.alertOffline')}</div>
              <div class="alert alert-danger" role="alert">${I18nextManager.getInstance().i18n.t('phovea:security_flask.alertWrongCredentials')}</div>
              ${loginForm}
            </div>
          </div>
        </div>
      </div>`);
        const dialog = body.querySelector('#loginDialog');
        const form = dialog.querySelector('form');
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const bindLoginForm = (form, callback, onSubmit) => {
            UserSession.getInstance().reset();
            if (!AppContext.getInstance().offline) {
                LoginUtils.loggedInAs()
                    .then((user) => {
                    UserSession.getInstance().login(user);
                    callback(null, user);
                })
                    .catch(() => {
                    // ignore not yet logged in
                });
            }
            form.onsubmit = (event) => {
                if (onSubmit) {
                    onSubmit();
                }
                const username = form.login_username.value;
                const password = form.login_password.value;
                LoginUtils.login(username, password)
                    .then((user) => callback(null, user))
                    .catch((error) => {
                    if (error.response && error.response.status !== 401) {
                        // 401 = Unauthorized
                        // server error
                        callback('not_reachable', null);
                    }
                    else {
                        callback(error, null);
                    }
                });
                event.stopPropagation();
                event.preventDefault();
            };
        };
        bindLoginForm(form, (error, user) => {
            const success = !error && user;
            if (!success) {
                this.header.ready();
                if (error === 'not_reachable') {
                    dialog.classList.add('has-warning');
                }
                else {
                    dialog.classList.remove('has-warning');
                    dialog.classList.add('has-error');
                }
                return;
            }
            this.fire(LoginMenu.EVENT_LOGGED_IN);
            const doc = this.options.document;
            dialog.classList.remove('has-error', 'has-warning');
            const userMenu = doc.querySelector('#user_menu');
            if (userMenu) {
                userMenu.style.display = null;
                const userName = userMenu.querySelector('a:first-of-type span');
                if (userName) {
                    userName.textContent = user.name;
                }
            }
            doc.querySelector('#login_menu').style.display = 'none';
            // remove all .login_required magic flags
            Array.from(doc.querySelectorAll('.login_required.disabled')).forEach((n) => {
                n.classList.remove('disabled');
                n.setAttribute('disabled', null);
            });
            this.header.hideDialog('#loginDialog');
        }, () => {
            // reset error
            dialog.classList.remove('has-error', 'has-warning');
        });
        return dialog;
    }
}
LoginMenu.EVENT_LOGGED_IN = 'loggedIn';
LoginMenu.EVENT_LOGGED_OUT = 'loggedOut';
//# sourceMappingURL=LoginMenu.js.map