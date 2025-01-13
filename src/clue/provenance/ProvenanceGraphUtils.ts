import { PluginRegistry } from 'visyn_core/plugin';

import { ActionMetaData } from './ActionMeta';
import { ActionNode, IActionCompressor } from './ActionNode';
import type { ICmdFunctionFactory, ICmdResult } from './ICmd';
import { IObjectRef, ObjectNode, ObjectRefUtils } from './ObjectNode';
import { SlideNode } from './SlideNode';
import { StateNode } from './StateNode';
import type { IGraphFactory } from '../graph/GraphBase';
import { GraphEdge } from '../graph/graph';

export class ProvenanceGraphUtils {
  private static removeNoops(path: ActionNode[]) {
    return path.filter((a) => a.f_id !== 'noop');
  }

  private static compositeCompressor(cs: IActionCompressor[]) {
    return (path: ActionNode[]) => {
      path = ProvenanceGraphUtils.removeNoops(path);
      let before: number;
      do {
        before = path.length;
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        cs.forEach((c) => (path = c(path)));
      } while (before > path.length);
      return path;
    };
  }

  private static async createCompressor(path: ActionNode[]) {
    const toload = PluginRegistry.getInstance()
      .listPlugins('actionCompressor')
      .filter((plugin: any) => {
        return path.some((action) => action.f_id.match(plugin.matches) != null);
      });
    return ProvenanceGraphUtils.compositeCompressor((await PluginRegistry.getInstance().loadPlugin(toload)).map((l) => <IActionCompressor>l.factory));
  }

  /**
   * returns a compressed version of the paths where just the last selection operation remains
   * @param path
   */
  static async compressGraph(path: ActionNode[]) {
    if (path.length <= 1) {
      return path; // can't compress single one
    }
    // return resolveImmediately(path);
    // TODO find a strategy how to compress but also invert skipped actions
    const compressor = await ProvenanceGraphUtils.createCompressor(path);
    // return path;
    // console.log('before', path.map((path) => path.toString()));
    let before: number;
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
  static findCommon<T>(a: T[], b: T[]) {
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

  static asFunction(i: any) {
    if (typeof i !== 'function') {
      // make a function
      return () => i;
    }
    return i;
  }

  private static noop(inputs: IObjectRef<any>[], parameter: any): ICmdResult {
    return {
      inverse: ProvenanceGraphUtils.createNoop(),
    };
  }

  private static createNoop() {
    return {
      meta: ActionMetaData.actionMeta('noop', ObjectRefUtils.category.custom),
      id: 'noop',
      f: ProvenanceGraphUtils.noop,
      inputs: <IObjectRef<any>[]>[],
      parameter: {},
    };
  }

  private static createLazyCmdFunctionFactory(): ICmdFunctionFactory {
    const facts = PluginRegistry.getInstance().listPlugins('actionFactory');
    const singles = PluginRegistry.getInstance().listPlugins('actionFunction');

    function resolveFun(id: string) {
      if (id === 'noop') {
        return Promise.resolve(ProvenanceGraphUtils.noop);
      }
      const single = singles.find((f) => f.id === id);
      if (single) {
        return single.load().then((f) => f.factory);
      }
      const factory = facts.find((f: any) => id.match(f.creates) != null);
      if (factory) {
        return factory.load().then((f) => f.factory(id));
      }
      return Promise.reject(`no factory found for ${id}`);
    }

    const lazyFunction = (id: string) => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      let _resolved: PromiseLike<any> = null;
      return async function (this: any, inputs: IObjectRef<any>[], parameters: any) {
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

  public static provenanceGraphFactory(): IGraphFactory {
    const factory = ProvenanceGraphUtils.createLazyCmdFunctionFactory();
    const types: any = {
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

  static findMetaObject<T>(find: IObjectRef<T>) {
    return (obj: ObjectNode<any>) => find === obj || ((obj.value === null || obj.value === find.value) && find.hash === obj.hash);
  }
}
