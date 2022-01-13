import { Session } from '../base/Session';
import { IUser, UserUtils, ISecureItem, Permission, EPermission, EEntity } from '../security';
import { GlobalEventHandler } from '../base/event';
import { PluginRegistry } from './PluginRegistry';
import { ILoginExtensionPointDesc, ILogoutEP, ILogoutEPDesc, ILoginExtensionPoint, EP_PHOVEA_CORE_LOGIN, EP_PHOVEA_CORE_LOGOUT } from './extensions';
import { ILogoutOptions } from './interfaces';

export class UserSession extends Session {
  public static GLOBAL_EVENT_USER_LOGGED_IN = 'USER_LOGGED_IN';

  public static GLOBAL_EVENT_USER_LOGGED_OUT = 'USER_LOGGED_OUT';

  /**
   * resets the stored session data that will be automatically filled during login
   */
  public reset() {
    UserSession.getInstance().remove('logged_in');
    UserSession.getInstance().remove('username');
    UserSession.getInstance().remove('user');
  }

  /**
   * whether the user is logged in
   * @returns {boolean}
   */
  public isLoggedIn() {
    return UserSession.getInstance().retrieve('logged_in') === true;
  }

  /**
   * stores the given user information
   * @param user
   */
  public login(user: IUser) {
    UserSession.getInstance().store('logged_in', true);
    UserSession.getInstance().store('username', user.name);
    UserSession.getInstance().store('user', user);

    PluginRegistry.getInstance()
      .listPlugins(EP_PHOVEA_CORE_LOGIN)
      .forEach((desc: ILoginExtensionPointDesc) => {
        desc.load().then((plugin: ILoginExtensionPoint) => plugin.factory(user));
      });

    GlobalEventHandler.getInstance().fire(UserSession.GLOBAL_EVENT_USER_LOGGED_IN, user);
  }

  /**
   * logs the current user out
   */
  public logout(options: ILogoutOptions) {
    const wasLoggedIn = UserSession.getInstance().isLoggedIn();
    UserSession.getInstance().reset();
    if (wasLoggedIn) {
      PluginRegistry.getInstance()
        .listPlugins(EP_PHOVEA_CORE_LOGOUT)
        .forEach((desc: ILogoutEPDesc) => {
          desc.load().then((plugin: ILogoutEP) => plugin.factory());
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
  public currentUser(): IUser | null {
    if (!UserSession.getInstance().isLoggedIn()) {
      return null;
    }
    return UserSession.getInstance().retrieve('user', UserUtils.ANONYMOUS_USER);
  }

  /**
   * returns the current user name else an anonymous user name
   */
  public currentUserNameOrAnonymous() {
    const u = UserSession.getInstance().currentUser();
    return u ? u.name : UserUtils.ANONYMOUS_USER.name;
  }

  public can(item: ISecureItem, permission: EPermission, user = UserSession.getInstance().currentUser()): boolean {
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
  public canRead(item: ISecureItem, user = UserSession.getInstance().currentUser()) {
    return UserSession.getInstance().can(item, EPermission.READ, user);
  }

  /**
   * check whether the given user can write the given item
   * @param item the item to check
   * @param user the user by default the current user
   * @returns {boolean}
   */
  public canWrite(item: ISecureItem, user = UserSession.getInstance().currentUser()) {
    return UserSession.getInstance().can(item, EPermission.WRITE, user);
  }

  /**
   * check whether the given user can execute the given item
   * @param item the item to check
   * @param user the user by default the current user
   * @returns {boolean}
   */
  public canExecute(item: ISecureItem, user = UserSession.getInstance().currentUser()) {
    return UserSession.getInstance().can(item, EPermission.EXECUTE, user);
  }

  public hasPermission(item: ISecureItem, entity: EEntity = EEntity.USER, permission: EPermission = EPermission.READ) {
    const permissions = Permission.decode(item.permissions);
    return permissions.hasPermission(entity, permission);
  }

  private isEqual(a: string, b: string) {
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

  private includes(items: string[], item: string) {
    if (!item) {
      return false;
    }
    return items.some((r) => UserSession.getInstance().isEqual(item, r));
  }

  private static instance: UserSession;

  public static getInstance(): UserSession {
    if (!UserSession.instance) {
      UserSession.instance = new UserSession();
    }

    return UserSession.instance;
  }
}
