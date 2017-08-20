/**
 * Created by sam on 03.03.2017.
 */

import {IObjectRef, ProvenanceGraph, action, meta, op, cat, ActionNode} from 'phovea_core/src/provenance';
import * as session from 'phovea_core/src/session';
import {lastOnly} from 'phovea_clue/src/compress';

//old name
export const CMD_INIT_SESSION = 'tdpInitSession';
export const CMD_SET_PARAMETER = 'tdpSetParameter';

export interface IParameterAble {
  getParameter(name: string): any;

  setParameterImpl(name: string, value: any);
}

export function initSessionImpl(_inputs: IObjectRef<any>[], parameters: object) {
  const old = {};
  Object.keys(parameters).forEach((key) => {
    old[key] = session.retrieve(key, null);
    const value = parameters[key];
    if (value !== null) {
      session.store(key, parameters[key]);
    }
  });
  return {
    inverse: initSession(old)
  };
}

export function initSession(map: object) {
  return action(meta('Initialize Session', cat.custom, op.update), CMD_INIT_SESSION, initSessionImpl, [], map);
}

export async function setParameterImpl(inputs: IObjectRef<any>[], parameter, graph: ProvenanceGraph) {
  const view: IParameterAble = await inputs[0].v;
  const name = parameter.name;
  const value = parameter.value;

  const bak = view.getParameter(name);
  view.setParameterImpl(name, value);
  return {
    inverse: setParameter(inputs[0], name, bak)
  };
}

export function setParameter(view: IObjectRef<IParameterAble>, name: string, value: any) {
  //assert view
  return action(meta(`Set Parameter "${name}"`, cat.visual, op.update), CMD_SET_PARAMETER, setParameterImpl, [view], {
    name,
    value
  });
}

export function compressSetParameter(path: ActionNode[]) {
  return lastOnly(path, CMD_SET_PARAMETER, (p: ActionNode) => `${p.requires[0].id}_${p.parameter.name}`);
}

/**
 * @deprecated
 */
export function compressSetParameterOld(path: ActionNode[]) {
  return lastOnly(path, 'targidSetParameter', (p: ActionNode) => `${p.requires[0].id}_${p.parameter.name}`);
}
