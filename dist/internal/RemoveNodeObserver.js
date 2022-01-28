/**
 * the parents of the given node (including itself) from root to leaf
 * @param node
 * @return {Node[]}
 */
function parentList(node) {
    const result = [];
    let parent = node;
    while (parent) {
        result.push(parent);
        parent = parent.parentNode;
    }
    // from top to bottom
    return result.reverse();
}
class RemoveParentObserver {
    constructor(parent) {
        this.parent = parent;
        this.observer = new MutationObserver((events) => this.onChange(events));
        this.observed = new Map();
        this.enabled = false;
    }
    enable() {
        this.enabled = true;
        this.observer.observe(this.parent, { childList: true, subtree: true });
    }
    disable() {
        this.enabled = false;
        this.observer.disconnect();
    }
    onChange(mutations) {
        // just remove events
        const events = mutations.filter((mutation) => mutation.type === 'childList' && mutation.removedNodes.length > 0);
        if (events.length === 0 || this.observed.size === 0) {
            return;
        }
        // build cache - create the list of parents all the time new to consider moving nodes?
        const toCheck = Array.from(this.observed.entries()).map(([node, callback]) => {
            return { node, callback, parents: parentList(node) };
        });
        const cleanUp = (found) => {
            if (toCheck.length === found.length) {
                // did we disable all? then we can stop early
                this.observed.clear();
                this.disable();
                return true;
            }
            // delete found ones and remove from toCheck list for the remaining events
            found.forEach((fi) => {
                const entry = toCheck.splice(fi, 1)[0];
                this.observed.delete(entry.node);
            });
            return false;
        };
        // optimization if the parents of any child doesn't contain the parent anymore it was already removed
        {
            // mark already found entries
            const found = [];
            toCheck.forEach(({ node, parents, callback }, i) => {
                if (parents.indexOf(this.parent) < 0) {
                    // doesn't contain my parent anymore -> will never be found -> deleted
                    callback(node);
                    found.unshift(i); // mark for removal - reverse order for simpler splicing
                }
            });
            if (cleanUp(found)) {
                return;
            }
        }
        for (const mutation of events) {
            const { target } = mutation;
            const removed = new Set(Array.from(mutation.removedNodes));
            // mark already found entries
            const found = [];
            toCheck.forEach(({ node, callback, parents }, i) => {
                const index = parents.indexOf(target);
                if (index < 0) {
                    // none of my parents were changed
                    return;
                }
                // child to watch for removing
                const child = parents[index + 1];
                if (removed.has(child)) {
                    // me or one of my parents were removed
                    callback(node);
                    found.unshift(i); // mark for removal - reverse order for simpler splicing
                }
            });
            if (cleanUp(found)) {
                return;
            }
        }
    }
    observe(node, callback, thisArg) {
        this.observed.set(node, callback.bind(thisArg));
        if (!this.enabled) {
            this.enable();
        }
    }
}
export class RemoveNodeObserver {
    constructor() {
        // weak since if the root is gone anyhow, we don't care about its listener
        this.documents = new WeakMap();
    }
    observe(node, callback, thisArg) {
        // use body as root element
        const document = node.ownerDocument.body;
        let observer = this.documents.get(document);
        if (!observer) {
            observer = new RemoveParentObserver(document);
            this.documents.set(document, observer);
        }
        observer.observe(node, callback, thisArg);
    }
}
//# sourceMappingURL=RemoveNodeObserver.js.map