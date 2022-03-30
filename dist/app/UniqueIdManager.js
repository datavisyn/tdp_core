export class UniqueIdManager {
    constructor() {
        /**
         * unique id container
         * @type {{}}
         */
        this.idCounter = new Map();
    }
    /**
     * returns a unique id for the given domain
     * @param domain
     * @return {number}
     */
    uniqueId(domain = '_default') {
        if (!UniqueIdManager.getInstance().idCounter.has(domain)) {
            UniqueIdManager.getInstance().idCounter.set(domain, 0);
        }
        const v = UniqueIdManager.getInstance().idCounter.get(domain);
        UniqueIdManager.getInstance().idCounter.set(domain, v + 1);
        return v;
    }
    flagId(domain, id) {
        if (Number.isNaN(id) || id < 0) {
            return id;
        }
        if (!UniqueIdManager.getInstance().idCounter.has(domain)) {
            UniqueIdManager.getInstance().idCounter.set(domain, id + 1);
        }
        else {
            UniqueIdManager.getInstance().idCounter.set(domain, Math.max(UniqueIdManager.getInstance().idCounter.get(domain), id + 1)); // use the next one afterwards
        }
        return id;
    }
    /**
     * returns a string, which is a unique id for the given domain
     * @param domain
     * @return {string}
     */
    uniqueString(domain = '_default') {
        return domain + UniqueIdManager.getInstance().uniqueId(domain);
    }
    static getInstance() {
        if (!UniqueIdManager.instance) {
            UniqueIdManager.instance = new UniqueIdManager();
        }
        return UniqueIdManager.instance;
    }
}
//# sourceMappingURL=UniqueIdManager.js.map