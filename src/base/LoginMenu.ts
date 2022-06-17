import { merge } from 'lodash';
import { EventHandler } from './event';
import { PluginRegistry } from '../app';
import { I18nextManager } from '../i18n';
import { EXTENSION_POINT_CUSTOMIZED_LOGIN_FORM, ICustomizedLoginFormPluginDesc, ICustomizedLoginFormPlugin } from './extensions';
import { LoginUtils } from './LoginUtils';
import { SessionWatcher } from './watcher';
import { AppHeader } from '../components';

// const DEFAULT_SESSION_TIMEOUT = 60 * 1000; // 10 min

export interface ILoginMenuOptions {
  /**
   * formular used for the login dialog
   */
  loginForm?: string;

  document?: Document;

  watch?: boolean;

  insertIntoHeader?: boolean;
}

/**
 * utility login menu that can be added to the Appheader for instance
 */
export class LoginMenu extends EventHandler {
  static readonly EVENT_LOGGED_IN = 'loggedIn';

  static readonly EVENT_LOGGED_OUT = 'loggedOut';

  readonly node: HTMLUListElement;

  private readonly options: ILoginMenuOptions = {
    loginForm: undefined,
    document,
    watch: false,
  };

  private readonly customizer: ICustomizedLoginFormPluginDesc[];

  constructor(private readonly header: AppHeader, options: ILoginMenuOptions = {}) {
    super();

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

  private init() {
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
              aria-expanded="false"><i class="fas fa-user" aria-hidden="true"></i> <span>${I18nextManager.getInstance().i18n.t(
                'phovea:security_flask.unknown',
              )}</span></a>
          <div class="dropdown-menu dropdown-menu-end" data-bs-popper="none" aria-labelledby="userMenuDropdown">
              <a class="dropdown-item" data-testid="logout-link" href="#" id="logout_link">${I18nextManager.getInstance().i18n.t(
                'phovea:security_flask.logoutButton',
              )}</a>
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

  private logout() {
    const doc = this.options.document;
    this.header.wait();
    LoginUtils.logout().then(() => {
      this.fire(LoginMenu.EVENT_LOGGED_OUT);
      const userMenu = <HTMLElement>doc.querySelector('#user_menu');
      if (userMenu) {
        userMenu.style.display = 'none';
      }
      (<HTMLElement>this.node.querySelector('#login_menu')).style.display = null;
      Array.from(doc.querySelectorAll('.login_required')).forEach((n: HTMLElement) => {
        n.classList.add('disabled');
      });
      this.header.ready();
    });
  }

  private runCustomizer(menu: HTMLElement, dialog: HTMLElement) {
    Promise.all(this.customizer.map((d) => d.load())).then((loaded: ICustomizedLoginFormPlugin[]) => {
      loaded.forEach((l) => l.factory(menu, dialog));
    });
  }

  forceShowDialog() {
    const doc = this.options.document;
    const loginDialog = <HTMLElement>doc.querySelector('#loginDialog');
    (<HTMLElement>loginDialog.querySelector('.modal-header .btn-close')).setAttribute('hidden', null); // disable closing the dialog
    this.header.showAndFocusOn('#loginDialog', '#login_username');
  }

  private initLoginDialog(body: HTMLElement) {
    let { loginForm } = this.options;
    if (!loginForm) {
      const t = this.customizer.find((d) => d.template != null);
      if (t) {
        loginForm = t.template;
      } else {
        loginForm = LoginUtils.defaultLoginForm();
      }
    }
    body.insertAdjacentHTML(
      'beforeend',
      `
      <!--login dialog-->
      <div class="modal fade" id="loginDialog" tabindex="-1" role="dialog" aria-labelledby="loginDialog" data-bs-keyboard="false" data-bs-backdrop="static">
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title">${I18nextManager.getInstance().i18n.t('phovea:security_flask.title')}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${I18nextManager.getInstance().i18n.t(
                'phovea:security_flask.closeButton',
              )}"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-warning" role="alert">${I18nextManager.getInstance().i18n.t('phovea:security_flask.alertOffline')}</div>
              <div class="alert alert-danger" role="alert">${I18nextManager.getInstance().i18n.t('phovea:security_flask.alertWrongCredentials')}</div>
              ${loginForm}
            </div>
          </div>
        </div>
      </div>`,
    );

    const dialog = <HTMLDivElement>body.querySelector('#loginDialog');
    const form = <HTMLFormElement>dialog.querySelector('form');
    LoginUtils.bindLoginForm(
      form,
      (error, user) => {
        const success = !error && user;
        if (!success) {
          this.header.ready();
          if (error === 'not_reachable') {
            dialog.classList.add('has-warning');
          } else {
            dialog.classList.remove('has-warning');
            dialog.classList.add('has-error');
          }
          return;
        }

        this.fire(LoginMenu.EVENT_LOGGED_IN);
        const doc = this.options.document;

        dialog.classList.remove('has-error', 'has-warning');

        const userMenu = <HTMLElement>doc.querySelector('#user_menu');
        if (userMenu) {
          userMenu.style.display = null;
          const userName = <HTMLElement>userMenu.querySelector('a:first-of-type span');
          if (userName) {
            userName.textContent = user.name;
          }
        }

        (<HTMLElement>doc.querySelector('#login_menu')).style.display = 'none';
        // remove all .login_required magic flags
        Array.from(doc.querySelectorAll('.login_required.disabled')).forEach((n: HTMLElement) => {
          n.classList.remove('disabled');
          n.setAttribute('disabled', null);
        });

        this.header.hideDialog('#loginDialog');
      },
      () => {
        // reset error
        dialog.classList.remove('has-error', 'has-warning');
      },
    );

    return dialog;
  }
}
