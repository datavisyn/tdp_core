import {ResolveNow} from '../../base';
import {RestStorageUtils} from '../rest';

export class AttachemntUtils {

  public static readonly ATTACHMENT_PREFIX = '@attachment:';
  public static readonly MAX_INPLACE_SIZE = 10e3; // 10k

  /**
   * checks whether the given object should be externalized
   * @param {Object} data
   * @returns {boolean}
   */
  static needToExternalize(data: object) {
    //use a JSON file size heuristics
    const size = JSON.stringify(data).length;
    return size >= AttachemntUtils.MAX_INPLACE_SIZE;
  }

  /**
   * externalizes the given object if needed
   * @param {Object} data
   * @returns {PromiseLike<string | Object>} the data to store
   */
  static externalize(data: object): PromiseLike<string | object> {
    if (!AttachemntUtils.needToExternalize(data)) {
      return ResolveNow.resolveImmediately(data);
    }
    return RestStorageUtils.addAttachment(data).then((id) => `${AttachemntUtils.ATTACHMENT_PREFIX}${id}`);
  }

  /**
   * inverse operation of @see externalize
   * @param {string | Object} attachment
   * @returns {PromiseLike<Object>}
   */
  static resolveExternalized(attachment: string | object): PromiseLike<object> {
    if (typeof attachment !== 'string' || !attachment.startsWith(AttachemntUtils.ATTACHMENT_PREFIX)) {
      return ResolveNow.resolveImmediately(<object>attachment);
    }
    const id = attachment.substring(AttachemntUtils.ATTACHMENT_PREFIX.length);
    return RestStorageUtils.getAttachment(id);
  }
}
