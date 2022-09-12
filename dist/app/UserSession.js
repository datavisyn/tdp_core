import { Session } from '../base/Session';
import { UserUtils, Permission, EPermission, EEntity } from '../security';
import { GlobalEventHandler } from '../base/event';
import { PluginRegistry } from './PluginRegistry';
import { EP_PHOVEA_CORE_LOGIN, EP_PHOVEA_CORE_LOGOUT } from './extensions';
export class UserSession extends Session {
    /**
     * resets the stored session data that will be automatically filled during login
     */
    reset() {
        UserSession.getInstance().remove('logged_in');
        UserSession.getInstance().remove('username');
        UserSession.getInstance().remove('user');
    }
    /**
     * whether the user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return UserSession.getInstance().retrieve('logged_in') === true;
    }
    /**
     * stores the given user information
     * @param user
     */
    login(user) {
        UserSession.getInstance().store('logged_in', true);
        UserSession.getInstance().store('username', user.name);
        UserSession.getInstance().store('user', user);
        PluginRegistry.getInstance()
            .listPlugins(EP_PHOVEA_CORE_LOGIN)
            .forEach((desc) => {
            desc.load().then((plugin) => plugin.factory(user));
        });
        GlobalEventHandler.getInstance().fire(UserSession.GLOBAL_EVENT_USER_LOGGED_IN, user);
    }
    /**
     * logs the current user out
     */
    logout(options) {
        const wasLoggedIn = UserSession.getInstance().isLoggedIn();
        UserSession.getInstance().reset();
        if (wasLoggedIn) {
            PluginRegistry.getInstance()
                .listPlugins(EP_PHOVEA_CORE_LOGOUT)
                .forEach((desc) => {
                desc.load().then((plugin) => plugin.factory());
            });
            // Notify all listeners
            GlobalEventHandler.getInstance().fire(UserSession.GLOBAL_EVENT_USER_LOGGED_OUT, options);
            // Handle different logout options
            // TODO: Maybe extract them to extension points later?
            if (options.alb_security_store?.redirect) {
                window.location.href = options.alb_security_store?.redirect;
            }
        }
    }
    /**
     * returns the current user or null
     * @returns {any}
     */
    currentUser() {
        if (!UserSession.getInstance().isLoggedIn()) {
            return null;
        }
        return UserSession.getInstance().retrieve('user', UserUtils.ANONYMOUS_USER);
    }
    /**
     * returns the current user name else an anonymous user name
     */
    currentUserNameOrAnonymous() {
        const u = UserSession.getInstance().currentUser();
        return u ? u.name : UserUtils.ANONYMOUS_USER.name;
    }
    can(item, permission, user = UserSession.getInstance().currentUser()) {
        if (!user) {
            user = UserUtils.ANONYMOUS_USER;
        }
        const permissions = Permission.decode(item.permissions);
        // I'm the creator and have the right
        if (UserSession.getInstance().isEqual(user.name, item.creator) && permissions.user.has(permission)) {
            return true;
        }
        // check if I'm in the group and have the right
        if (item.group && UserSession.getInstance().includes(user.roles, item.group) && permissions.group.has(permission)) {
            return true;
        }
        // check if I'm a buddy having the right
        if (item.buddies && Array.isArray(item.buddies) && UserSession.getInstance().includes(item.buddies, user.name) && permissions.buddies.has(permission)) {
            return true;
        }
        // check others
        return permissions.others.has(permission);
    }
    /**
     * check whether the given user can read the given item
     * @param item the item to check
     * @param user the user by default the current user
     * @returns {boolean}
     */
    canRead(item, user = UserSession.getInstance().currentUser()) {
        return UserSession.getInstance().can(item, EPermission.READ, user);
    }
    /**
     * check whether the given user can write the given item
     * @param item the item to check
     * @param user the user by default the current user
     * @returns {boolean}
     */
    canWrite(item, user = UserSession.getInstance().currentUser()) {
        return UserSession.getInstance().can(item, EPermission.WRITE, user);
    }
    /**
     * check whether the given user can execute the given item
     * @param item the item to check
     * @param user the user by default the current user
     * @returns {boolean}
     */
    canExecute(item, user = UserSession.getInstance().currentUser()) {
        return UserSession.getInstance().can(item, EPermission.EXECUTE, user);
    }
    hasPermission(item, entity = EEntity.USER, permission = EPermission.READ) {
        const permissions = Permission.decode(item.permissions);
        return permissions.hasPermission(entity, permission);
    }
    isEqual(a, b) {
        if (a === b) {
            return true;
        }
        if (a === null || b === null) {
            return false;
        }
        a = a.toLowerCase();
        b = b.toLowerCase();
        return a.localeCompare(b) === 0;
    }
    includes(items, item) {
        if (!item) {
            return false;
        }
        return items.some((r) => UserSession.getInstance().isEqual(item, r));
    }
    static getInstance() {
        if (!UserSession.instance) {
            UserSession.instance = new UserSession();
        }
        return UserSession.instance;
    }
}
UserSession.GLOBAL_EVENT_USER_LOGGED_IN = 'USER_LOGGED_IN';
UserSession.GLOBAL_EVENT_USER_LOGGED_OUT = 'USER_LOGGED_OUT';
//# sourceMappingURL=UserSession.js.map