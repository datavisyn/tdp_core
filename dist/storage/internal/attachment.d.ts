export declare class AttachemntUtils {
    static readonly ATTACHMENT_PREFIX = "@attachment:";
    static readonly MAX_INPLACE_SIZE = 10000;
    /**
     * checks whether the given object should be externalized
     * @param {Object} data
     * @returns {boolean}
     */
    static needToExternalize(data: object): boolean;
    /**
     * externalizes the given object if needed
     * @param {Object} data
     * @returns {PromiseLike<string | Object>} the data to store
     */
    static externalize(data: object): PromiseLike<string | object>;
    /**
     * inverse operation of @see externalize
     * @param {string | Object} attachment
     * @returns {PromiseLike<Object>}
     */
    static resolveExternalized(attachment: string | object): PromiseLike<object>;
}
//# sourceMappingURL=attachment.d.ts.map