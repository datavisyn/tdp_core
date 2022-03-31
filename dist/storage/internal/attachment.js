import { RestStorageUtils } from '../rest';
export class AttachemntUtils {
    /**
     * checks whether the given object should be externalized
     * @param {Object} data
     * @returns {boolean}
     */
    static needToExternalize(data) {
        // use a JSON file size heuristics
        const size = JSON.stringify(data).length;
        return size >= AttachemntUtils.MAX_INPLACE_SIZE;
    }
    /**
     * externalizes the given object if needed
     * @param {Object} data
     * @returns {PromiseLike<string | Object>} the data to store
     */
    static externalize(data) {
        if (!AttachemntUtils.needToExternalize(data)) {
            return Promise.resolve(data);
        }
        return RestStorageUtils.addAttachment(data).then((id) => `${AttachemntUtils.ATTACHMENT_PREFIX}${id}`);
    }
    /**
     * inverse operation of @see externalize
     * @param {string | Object} attachment
     * @returns {PromiseLike<Object>}
     */
    static resolveExternalized(attachment) {
        if (typeof attachment !== 'string' || !attachment.startsWith(AttachemntUtils.ATTACHMENT_PREFIX)) {
            return Promise.resolve(attachment);
        }
        const id = attachment.substring(AttachemntUtils.ATTACHMENT_PREFIX.length);
        return RestStorageUtils.getAttachment(id);
    }
}
AttachemntUtils.ATTACHMENT_PREFIX = '@attachment:';
AttachemntUtils.MAX_INPLACE_SIZE = 10e3; // 10k
//# sourceMappingURL=attachment.js.map