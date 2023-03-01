import { PluginRegistry } from 'visyn_core';
import { ObjectNode, ObjectRefUtils } from './ObjectNode';
import { StateNode } from './StateNode';
import { ActionNode } from './ActionNode';
import { SlideNode } from './SlideNode';
import { GraphEdge } from '../graph/graph';
import { ActionMetaData } from './ActionMeta';
export class ProvenanceGraphUtils {
    static removeNoops(path) {
        return path.filter((a) => a.f_id !== 'noop');
    }
    static compositeCompressor(cs) {
        return (path) => {
            path = ProvenanceGraphUtils.removeNoops(path);
            let before;
            do {
                before = path.length;
                // eslint-disable-next-line @typescript-eslint/no-loop-func
                cs.forEach((c) => (path = c(path)));
            } while (before > path.length);
            return path;
        };
    }
    static async createCompressor(path) {
        const toload = PluginRegistry.getInstance()
            .listPlugins('actionCompressor')
            .filter((plugin) => {
            return path.some((action) => action.f_id.match(plugin.matches) != null);
        });
        return ProvenanceGraphUtils.compositeCompressor((await PluginRegistry.getInstance().loadPlugin(toload)).map((l) => l.factory));
    }
    /**
     * returns a compressed version of the paths where just the last selection operation remains
     * @param path
     */
    static async compressGraph(path) {
        if (path.length <= 1) {
            return path; // can't compress single one
        }
        // return resolveImmediately(path);
        // TODO find a strategy how to compress but also invert skipped actions
        const compressor = await ProvenanceGraphUtils.createCompressor(path);
        // return path;
        // console.log('before', path.map((path) => path.toString()));
        let before;
        do {
            before = path.length;
            path = compressor(path);
        } while (before > path.length);
        // console.log('after', path.map((path) => path.toString()));
        return path;
    }
    /**
     * find common element in the list of two elements returning the indices of the first same item
     * @param a
     * @param b
     * @returns {any}
     */
    static findCommon(a, b) {
        let c = 0;
        while (c < a.length && c < b.length && a[c] === b[c]) {
            // go to next till a difference
            c++;
        }
        if (c === 0) {
            // not even the root common
            return null;
        }
        return {
            i: c - 1,
            j: c - 1,
        };
    }
    static asFunction(i) {
        if (typeof i !== 'function') {
            // make a function
            return () => i;
        }
        return i;
    }
    static noop(inputs, parameter) {
        return {
            inverse: ProvenanceGraphUtils.createNoop(),
        };
    }
    static createNoop() {
        return {
            meta: ActionMetaData.actionMeta('noop', ObjectRefUtils.category.custom),
            id: 'noop',
            f: ProvenanceGraphUtils.noop,
            inputs: [],
            parameter: {},
        };
    }
    static createLazyCmdFunctionFactory() {
        const facts = PluginRegistry.getInstance().listPlugins('actionFactory');
        const singles = PluginRegistry.getInstance().listPlugins('actionFunction');
        function resolveFun(id) {
            if (id === 'noop') {
                return Promise.resolve(ProvenanceGraphUtils.noop);
            }
            const single = singles.find((f) => f.id === id);
            if (single) {
                return single.load().then((f) => f.factory);
            }
            const factory = facts.find((f) => id.match(f.creates) != null);
            if (factory) {
                return factory.load().then((f) => f.factory(id));
            }
            return Promise.reject(`no factory found for ${id}`);
        }
        const lazyFunction = (id) => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            let _resolved = null;
            return async function (inputs, parameters) {
                // ObjectRef value might not be defined when replayed -> therefore
                // waiting until it is defined
                let counter = 0;
                while (!inputs.every((o) => o.v) && counter < 10) {
                    // eslint-disable-next-line no-await-in-loop
                    await new Promise((resolve) => {
                        setTimeout(resolve, 500);
                    });
                    counter++;
                }
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const that = this;
                // eslint-disable-next-line prefer-rest-params
                const args = Array.from(arguments);
                if (_resolved == null) {
                    _resolved = resolveFun(id);
                }
                return _resolved.then((f) => f.apply(that, args));
            };
        };
        return (id) => lazyFunction(id);
    }
    static provenanceGraphFactory() {
        const factory = ProvenanceGraphUtils.createLazyCmdFunctionFactory();
        const types = {
            action: ActionNode,
            state: StateNode,
            object: ObjectNode,
            story: SlideNode,
        };
        return {
            makeNode: (n) => types[n.type].restore(n, factory),
            makeEdge: (n, lookup) => new GraphEdge().restore(n, lookup),
        };
    }
    static findMetaObject(find) {
        return (obj) => find === obj || ((obj.value === null || obj.value === find.value) && find.hash === obj.hash);
    }
}
//# sourceMappingURL=ProvenanceGraphUtils.js.map