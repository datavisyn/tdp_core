import { UserSession, AppContext } from '../app';
import { I18nextManager } from '../i18n';
import { Ajax } from './ajax';
export class LoginUtils {
    /**
     * try to login the given user
     * @param {string} username username
     * @param {string} password password
     * @param {boolean} remember whether to set a long term cookie
     * @return {Promise<never | any>} the result in case of a reject it was an invalid request
     */
    static login(username, password) {
        UserSession.getInstance().reset();
        const r = Ajax.send('/login', { username, password }, 'post').then((user) => {
            UserSession.getInstance().login(user);
            return user;
        });
        // separate for multiple catch clauses
        r.catch(() => {
            UserSession.getInstance().logout({
                msg: 'Error logging in.',
            });
        });
        return r;
    }
    /**
     * logs the user out
     * @return {Promise<any>} when done also from the server side
     */
    static logout() {
        if (!AppContext.getInstance().offline) {
            return Ajax.send('/logout', {}, 'post')
                .then((r) => {
                UserSession.getInstance().logout(r);
            })
                .catch(() => {
                UserSession.getInstance().logout({
                    msg: 'Error logging out via server. Logging out manually.',
                });
            });
        }
        UserSession.getInstance().logout({
            msg: 'Logging out in offline mode',
        });
        return Promise.resolve(true);
    }
    static loggedInAs() {
        return Ajax.send('/loggedinas', {}, 'POST').then((user) => {
            if (user !== 'not_yet_logged_in' && user.name) {
                return user;
            }
            return Promise.reject('invalid');
        });
    }
    /**
     * helper to bind to a login form, assuming that fields `login_username`, `login_password` exists
     * @param {HTMLFormElement} form
     * @param {(error: any, user: IUser) => any} callback
     */
    static bindLoginForm(form, callback, onSubmit) {
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
    }
}
LoginUtils.defaultLoginForm = () => `<form class="form-signin" action="/login" method="post">
    <div class="mb-3">
      <label class="form-label" for="login_username">${I18nextManager.getInstance().i18n.t('phovea:security_flask.username')}</label>
      <input type="text" class="form-control" id="login_username" placeholder="${I18nextManager.getInstance().i18n.t('phovea:security_flask.username')}" required="required" autofocus="autofocus" autocomplete="username">
    </div>
    <div class="mb-3">
      <label class="form-label" for="login_password"> ${I18nextManager.getInstance().i18n.t('phovea:security_flask.password')}</label>
      <input type="password" class="form-control" id="login_password" placeholder="${I18nextManager.getInstance().i18n.t('phovea:security_flask.password')}" required="required" autocomplete="current-password">
    </div>
    <button type="submit" class="btn btn-primary"> ${I18nextManager.getInstance().i18n.t('phovea:security_flask.submit')}</button>
    </form>
    `;
//# sourceMappingURL=LoginUtils.js.map