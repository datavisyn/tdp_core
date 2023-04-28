import { UserSession } from 'visyn_core/security';
import { ObjectRefUtils } from './ObjectNode';

/**
 * additional data about a performed action
 */
export class ActionMetaData {
  constructor(
    public readonly category: string,
    public readonly operation: string,
    public readonly name: string,
    public readonly timestamp: number = Date.now(),
    public readonly user: string = UserSession.getInstance().currentUserNameOrAnonymous(),
  ) {}

  static restore(p: any) {
    return new ActionMetaData(p.category, p.operation, p.name, p.timestamp, p.user);
  }

  eq(that: ActionMetaData) {
    return this.category === that.category && this.operation === that.operation && this.name === that.name;
  }

  /**
   * checks whether this metadata are the inverse of the given one in terms of category and operation
   * @param that
   * @returns {boolean}
   */
  inv(that: ActionMetaData) {
    if (this.category !== that.category) {
      return false;
    }
    if (this.operation === ObjectRefUtils.operation.update) {
      return that.operation === ObjectRefUtils.operation.update;
    }
    return this.operation === ObjectRefUtils.operation.create
      ? that.operation === ObjectRefUtils.operation.remove
      : that.operation === ObjectRefUtils.operation.create;
  }

  toString() {
    return `${this.category}:${this.operation} ${this.name}`;
  }

  static actionMeta(
    name: string,
    category: string = ObjectRefUtils.category.data,
    operation: string = ObjectRefUtils.operation.update,
    timestamp: number = Date.now(),
    user: string = UserSession.getInstance().currentUserNameOrAnonymous(),
  ) {
    return new ActionMetaData(category, operation, name, timestamp, user);
  }
}
