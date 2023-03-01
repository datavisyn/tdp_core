import { UserSession } from 'visyn_core';
import { ObjectRefUtils } from './ObjectNode';
/**
 * additional data about a performed action
 */
export class ActionMetaData {
    constructor(category, operation, name, timestamp = Date.now(), user = UserSession.getInstance().currentUserNameOrAnonymous()) {
        this.category = category;
        this.operation = operation;
        this.name = name;
        this.timestamp = timestamp;
        this.user = user;
    }
    static restore(p) {
        return new ActionMetaData(p.category, p.operation, p.name, p.timestamp, p.user);
    }
    eq(that) {
        return this.category === that.category && this.operation === that.operation && this.name === that.name;
    }
    /**
     * checks whether this metadata are the inverse of the given one in terms of category and operation
     * @param that
     * @returns {boolean}
     */
    inv(that) {
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
    static actionMeta(name, category = ObjectRefUtils.category.data, operation = ObjectRefUtils.operation.update, timestamp = Date.now(), user = UserSession.getInstance().currentUserNameOrAnonymous()) {
        return new ActionMetaData(category, operation, name, timestamp, user);
    }
}
//# sourceMappingURL=ActionMeta.js.map