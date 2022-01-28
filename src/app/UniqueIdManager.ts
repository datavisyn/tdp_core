export class UniqueIdManager {
  /**
   * unique id container
   * @type {{}}
   */
  private idCounter = new Map<string, number>();

  /**
   * returns a unique id for the given domain
   * @param domain
   * @return {number}
   */
  public uniqueId(domain = '_default') {
    if (!UniqueIdManager.getInstance().idCounter.has(domain)) {
      UniqueIdManager.getInstance().idCounter.set(domain, 0);
    }
    const v = UniqueIdManager.getInstance().idCounter.get(domain);
    UniqueIdManager.getInstance().idCounter.set(domain, v + 1);
    return v;
  }

  public flagId(domain: string, id: number) {
    if (Number.isNaN(id) || id < 0) {
      return id;
    }
    if (!UniqueIdManager.getInstance().idCounter.has(domain)) {
      UniqueIdManager.getInstance().idCounter.set(domain, id + 1);
    } else {
      UniqueIdManager.getInstance().idCounter.set(domain, Math.max(UniqueIdManager.getInstance().idCounter.get(domain), id + 1)); // use the next one afterwards
    }
    return id;
  }

  /**
   * returns a string, which is a unique id for the given domain
   * @param domain
   * @return {string}
   */
  public uniqueString(domain = '_default') {
    return domain + UniqueIdManager.getInstance().uniqueId(domain);
  }

  private static instance: UniqueIdManager;

  public static getInstance(): UniqueIdManager {
    if (!UniqueIdManager.instance) {
      UniqueIdManager.instance = new UniqueIdManager();
    }
    return UniqueIdManager.instance;
  }
}
