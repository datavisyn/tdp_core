import {ActionNode} from '../provenance';


export class Compression {

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
