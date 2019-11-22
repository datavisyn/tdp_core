/**
 * Created by Samuel Gratzl on 18.05.2016.
 */


import {IObjectRef, action, meta, cat, op, ProvenanceGraph, ActionNode} from 'phovea_core/src/provenance';
import {get as getPlugin} from 'phovea_core/src/plugin';
import {Column} from 'lineupjs';
import {IScore} from '../';
import {EXTENSION_POINT_TDP_SCORE_IMPL} from '../../extensions';
import {externalize, resolveExternalized} from '../../storage';
import i18next from 'phovea_core/src/i18n';

export const CMD_ADD_SCORE = 'tdpAddScore';
export const CMD_REMOVE_SCORE = 'tdpRemoveScore';


export interface IViewProvider {
  getInstance(): {
    addTrackedScoreColumn(score: IScore<any>): Promise<{col: Column, loaded: Promise<Column>}>;
    removeTrackedScoreColumn(columnId: string);
  };
}

async function addScoreLogic(waitForScore: boolean, inputs: IObjectRef<IViewProvider>[], parameter: any) {
  const scoreId: string = parameter.id;
  const pluginDesc = getPlugin(EXTENSION_POINT_TDP_SCORE_IMPL, scoreId);
  const plugin = await pluginDesc.load();
  const view = await inputs[0].v.then((vi) => vi.getInstance());
  const params = await resolveExternalized(parameter.params);
  const score: IScore<any> | IScore<any>[] = plugin.factory(params, pluginDesc);
  const scores = Array.isArray(score) ? score : [score];

  const results = await Promise.all(scores.map((s) => view.addTrackedScoreColumn(s)));
  const col = waitForScore ? await Promise.all(results.map((r) => r.loaded)) : results.map((r) => r.col);

  return {
    inverse: removeScore(inputs[0], i18next.t('tdp:core.lineup.scorecmds.score'), scoreId, parameter.storedParams ? parameter.storedParams : parameter.params, col.map((c) => c.id))
  };
}

export function addScoreImpl(inputs: IObjectRef<IViewProvider>[], parameter: any) {
  return addScoreLogic(true, inputs, parameter);
}

async function addScoreAsync(inputs: IObjectRef<IViewProvider>[], parameter: any) {
  return addScoreLogic(false, inputs, parameter);
}

export async function removeScoreImpl(inputs: IObjectRef<IViewProvider>[], parameter: any) {
  const view = await inputs[0].v.then((vi) => vi.getInstance());
  const columnId: string | string[] = parameter.columnId;
  const columnIds = Array.isArray(columnId) ? columnId : [columnId];

  columnIds.forEach((id) => view.removeTrackedScoreColumn(id));

  return {
    inverse: addScore(inputs[0], i18next.t('tdp:core.lineup.scorecmds.score'), parameter.id, parameter.params)
  };
}

export function addScore(provider: IObjectRef<IViewProvider>, scoreName: string, scoreId: string, params: any) {
  return action(meta(`${i18next.t('tdp:core.lineup.scorecmds.add')} ${scoreName}`, cat.data, op.create), CMD_ADD_SCORE, addScoreImpl, [provider], {
    id: scoreId,
    params
  });
}

export async function pushScoreAsync(graph: ProvenanceGraph, provider: IObjectRef<IViewProvider>, scoreName: string, scoreId: string, params: any) {
  const storedParams = await externalize(params);
  const currentParams = {id: scoreId, params, storedParams};
  const result = await addScoreAsync([provider], currentParams);
  const toStoreParams = {id: scoreId, params: storedParams};
  return graph.pushWithResult(action(meta(`${i18next.t('tdp:core.lineup.scorecmds.add')} ${scoreName}`, cat.data, op.create), CMD_ADD_SCORE, addScoreImpl, [provider], toStoreParams), result);
}

export function removeScore(provider: IObjectRef<IViewProvider>, scoreName: string, scoreId: string, params: any, columnId: string | string[]) {
  return action(meta(`${i18next.t('tdp:core.lineup.scorecmds.remove')} ${scoreName}`, cat.data, op.remove), CMD_REMOVE_SCORE, removeScoreImpl, [provider], {
    id: scoreId,
    params,
    columnId
  });
}

function shallowEqualObjects(a: any, b: any) {
  if (a === b) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  if (keysA.some((k) => keysB.indexOf(k) < 0)) {
    return false;
  }
  return keysA.every((k) => {
    const va = a[k];
    const vb = b[k];
    return va === vb;
  });
}

/**
 * compresses score creation and removal
 */
export function compress(path: ActionNode[]) {
  return compressImpl(path, CMD_ADD_SCORE, CMD_REMOVE_SCORE);
}

function compressImpl(path: ActionNode[], addCmd: string, remCmd: string) {
  const manipulate = path.slice();
  const r: ActionNode[] = [];
  outer: for (let i = 0; i < manipulate.length; ++i) {
    const act = manipulate[i];
    if (act.f_id === addCmd) {
      // try to find its removal
      for (let j = i + 1; j < manipulate.length; ++j) {
        const next = manipulate[j];
        if (next.f_id === remCmd && shallowEqualObjects(act.parameter, next.parameter)) {
          //TODO remove lineup actions that uses this score -> how to identify?
          //found match, delete both
          manipulate.slice(j, 1); //delete remove cmd
          continue outer; //skip adding of add cmd
        }
      }
    }
    r.push(act);
  }
  return r;
}

export function compressComp(path: ActionNode[]) {
  return compressImpl(path, 'ordinoAddScore', 'ordinoRemoveScore');
}
