import {resolveImmediately} from 'phovea_core/src';
import {getAttachment, addAttachment} from '../rest';

const ATTACHMENT_PREFIX = '@attachment:';
const MAX_INPLACE_SIZE = 10e3; // 10k

/**
 * checks whether the given object should be externalized
 * @param {Object} data
 * @returns {boolean}
 */
export function needToExternalize(data: object) {
  //use a JSON file size heuristics
  const size = JSON.stringify(data).length;
  return size >= MAX_INPLACE_SIZE;
}

/**
 * externalizes the given object if needed
 * @param {Object} data
 * @returns {PromiseLike<string | Object>} the data to store
 */
export function externalize(data: object): PromiseLike<string | object> {
  if (!needToExternalize(data)) {
    return resolveImmediately(data);
  }
  return addAttachment(data).then((id) => `${ATTACHMENT_PREFIX}${id}`);
}

/**
 * inverse operation of @see externalize
 * @param {string | Object} attachment
 * @returns {PromiseLike<Object>}
 */
export function resolveExternalized(attachment: string | object): PromiseLike<object> {
  if (typeof attachment !== 'string' || !attachment.startsWith(ATTACHMENT_PREFIX)) {
    return resolveImmediately(<object>attachment);
  }
  const id = attachment.substring(ATTACHMENT_PREFIX.length);
  return getAttachment(id);
}
