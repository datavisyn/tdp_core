export interface IUser {
  /**
   * user name
   */
  readonly name: string;
  /**
   * list of roles the user is associated with
   */
  readonly roles: string[];
}

export class UserUtils {
  static ANONYMOUS_USER: IUser = {name: 'anonymous', roles: ['anonymous']};
}
