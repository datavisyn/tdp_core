import {ActionNode} from '../provenance';


export class Compression {

  /**
   * Removes all ActionNodes from the given path that matches the given function id and key.
   * Only the very last item is kept and all previous ones are removed,
   * independent of intermediate, non-matching items.
   *
   * @param path Array of ActionNodes
   * @param functionId Apply removal only on ActionNodes with the given function id
   * @param toKey Unique key to check the consecutive duplicates
   * @returns A copy of the path which can be mutated in the number of items
   */
  static lastOnly(path: ActionNode[], functionId: string, toKey: (action: ActionNode) => string) {
    const lastOnes = new Map<string, ActionNode>();
    path.forEach((p) => {
      if (p.f_id === functionId) {
        lastOnes.set(toKey(p), p);
      }
    });
    return path.filter((p) => {
      if (p.f_id !== functionId) {
        return true;
      }
      const key = toKey(p);
      //last one remains
      return lastOnes.get(key) === p;
    });
  }

  /**
   * Remove consecutive items from a path array.
   * The removal is only applied on nodes with the given function id
   * and checks the key with the given key function.
   *
   * @param path Array of ActionNodes
   * @param functionId Apply removal only on ActionNodes with the given function id
   * @param toKey Unique key to check the consecutive duplicates
   * @returns A copy of the path which can be mutated in the number of items
   */
  static removeConsecutiveNodes(path: ActionNode[], functionId: string, toKey: (action: ActionNode) => string) {
    // recursive function that mutates the input array
    const compress = (arr: ActionNode[], len: number = 0, deletable: boolean = false) => {
      if(len < arr.length) {
        if(deletable) {
          arr.splice(len, 1);
          len--;
        }
        const canDelete = arr[len+1] && (arr[len].f_id === functionId) && (arr[len+1].f_id === functionId) && toKey(arr[len]) === toKey(arr[len]);
        return compress(arr, len+1, canDelete);
      };
      return;
    };

    const pathCopy = path.slice(0); // copy path because path is mutated
    pathCopy.reverse(); // reverse array to keep the last consecutive item and remove the first ones
    compress(pathCopy);
    pathCopy.reverse(); // reverse array to return the original order
    return pathCopy;
  }

  static createRemove(path: ActionNode[], createFunctionId: string, removeFunctionId: string) {
    const r: ActionNode[] = [];
    outer: for (const act of path) {
      if (act.f_id === removeFunctionId) {
        const removed = act.removes[0];
        //removed view delete intermediate change and optional creation
        for(let j = r.length - 1; j >= 0; --j) { //back to forth for better removal
          const previous = r[j];
          const requires = previous.requires;
          const usesView =  requires.indexOf(removed) >= 0;
          if (usesView) {
            r.splice(j, 1);
          } else if (previous.f_id === createFunctionId && previous.creates[0] === removed) {
            //found adding remove both
            r.splice(j, 1);
            continue outer;
          }
        }
      }
      r.push(act);
    }
    return r;
  }
}
