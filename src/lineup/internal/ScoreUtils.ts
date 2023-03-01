import { I18nextManager } from 'visyn_core';
import { PluginRegistry } from 'visyn_core';
import { WebpackEnv } from 'visyn_core';
import { IScore } from '../../base/interfaces';
import { EXTENSION_POINT_TDP_SCORE_IMPL } from '../../base/extensions';
import { AttachemntUtils } from '../../storage/internal/attachment';
import { IViewProvider } from '../IViewProvider';
import { IObjectRef, ActionUtils, ActionMetaData, ObjectRefUtils, ProvenanceGraph, ActionNode } from '../../clue/provenance';

export class ScoreUtils {
  public static readonly CMD_ADD_SCORE = 'tdpAddScore';

  public static readonly CMD_REMOVE_SCORE = 'tdpRemoveScore';

  private static async addScoreLogic(waitForScore: boolean, inputs: IObjectRef<IViewProvider>[], parameter: any) {
    const scoreId: string = parameter.id;
    const pluginDesc = PluginRegistry.getInstance().getPlugin(EXTENSION_POINT_TDP_SCORE_IMPL, scoreId);
    const plugin = await pluginDesc.load();
    let view;
    let params;
    if (WebpackEnv.ENABLE_EXPERIMENTAL_REPROVISYN_FEATURES) {
      view = await inputs[0].v;
      // disable eslint because it is unclear how to avoid the eslint warning and destructure `params` from the `parameter` object with `let` variable `params` in this case
      // eslint-disable-next-line prefer-destructuring
      params = parameter.params;
    } else {
      view = await inputs[0].v.then((vi) => vi.getInstance());
      params = await AttachemntUtils.resolveExternalized(parameter.params);
    }
    const score: IScore<any> | IScore<any>[] = plugin.factory(params, pluginDesc);
    const scores = Array.isArray(score) ? score : [score];

    const results = await Promise.all(scores.map((s) => view.addTrackedScoreColumn(s)));
    const col = waitForScore ? await Promise.all(results.map((r) => r.loaded)) : results.map((r) => r.col);

    return {
      inverse: ScoreUtils.removeScore(
        inputs[0],
        I18nextManager.getInstance().i18n.t('tdp:core.lineup.scorecmds.score'),
        scoreId,
        parameter.storedParams ? parameter.storedParams : parameter.params,
        col.map((c) => c.id),
      ),
    };
  }

  static addScoreImpl(inputs: IObjectRef<IViewProvider>[], parameter: any) {
    return ScoreUtils.addScoreLogic(true, inputs, parameter);
  }

  static async addScoreAsync(inputs: IObjectRef<IViewProvider>[], parameter: any) {
    return ScoreUtils.addScoreLogic(false, inputs, parameter);
  }

  static async removeScoreImpl(inputs: IObjectRef<IViewProvider>[], parameter: any) {
    const view = await inputs[0].v.then((vi) => vi.getInstance());
    const { columnId } = parameter;
    const columnIds = Array.isArray(columnId) ? columnId : [columnId];

    columnIds.forEach((id) => view.removeTrackedScoreColumn(id));

    return {
      inverse: ScoreUtils.addScore(inputs[0], I18nextManager.getInstance().i18n.t('tdp:core.lineup.scorecmds.score'), parameter.id, parameter.params),
    };
  }

  static addScore(provider: IObjectRef<IViewProvider>, scoreName: string, scoreId: string, params: any) {
    return ActionUtils.action(
      ActionMetaData.actionMeta(
        I18nextManager.getInstance().i18n.t('tdp:core.lineup.scorecmds.add', { scoreName }),
        ObjectRefUtils.category.data,
        ObjectRefUtils.operation.create,
      ),
      ScoreUtils.CMD_ADD_SCORE,
      ScoreUtils.addScoreImpl,
      [provider],
      {
        id: scoreId,
        params,
      },
    );
  }

  static async pushScoreAsync(graph: ProvenanceGraph, provider: IObjectRef<IViewProvider>, scoreName: string, scoreId: string, params: any) {
    // skip attachment utils + provenance impl and add score directly when feature flag is enabled
    if (WebpackEnv.ENABLE_EXPERIMENTAL_REPROVISYN_FEATURES) {
      return ScoreUtils.addScoreImpl([provider], { id: scoreId, params });
    }
    const storedParams = await AttachemntUtils.externalize(params);
    const currentParams = { id: scoreId, params, storedParams };
    const result = await ScoreUtils.addScoreAsync([provider], currentParams);
    const toStoreParams = { id: scoreId, params: storedParams };
    return graph.pushWithResult(
      ActionUtils.action(
        ActionMetaData.actionMeta(
          I18nextManager.getInstance().i18n.t('tdp:core.lineup.scorecmds.add', { scoreName }),
          ObjectRefUtils.category.data,
          ObjectRefUtils.operation.create,
        ),
        ScoreUtils.CMD_ADD_SCORE,
        ScoreUtils.addScoreImpl,
        [provider],
        toStoreParams,
      ),
      result,
    );
  }

  static removeScore(provider: IObjectRef<IViewProvider>, scoreName: string, scoreId: string, params: any, columnId: string | string[]) {
    return ActionUtils.action(
      ActionMetaData.actionMeta(
        I18nextManager.getInstance().i18n.t('tdp:core.lineup.scorecmds.remove', { scoreName }),
        ObjectRefUtils.category.data,
        ObjectRefUtils.operation.remove,
      ),
      ScoreUtils.CMD_REMOVE_SCORE,
      ScoreUtils.removeScoreImpl,
      [provider],
      {
        id: scoreId,
        params,
        columnId,
      },
    );
  }

  private static shallowEqualObjects(a: any, b: any) {
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
  static compress(path: ActionNode[]) {
    return ScoreUtils.compressImpl(path, ScoreUtils.CMD_ADD_SCORE, ScoreUtils.CMD_REMOVE_SCORE);
  }

  private static compressImpl(path: ActionNode[], addCmd: string, remCmd: string) {
    const manipulate = path.slice();
    const r: ActionNode[] = [];
    // eslint-disable-next-line no-labels
    outer: for (let i = 0; i < manipulate.length; ++i) {
      const act = manipulate[i];
      if (act.f_id === addCmd) {
        // try to find its removal
        for (let j = i + 1; j < manipulate.length; ++j) {
          const next = manipulate[j];
          if (next.f_id === remCmd && ScoreUtils.shallowEqualObjects(act.parameter, next.parameter)) {
            // TODO remove lineup actions that uses this score -> how to identify?
            // found match, delete both
            manipulate.slice(j, 1); // delete remove cmd
            // eslint-disable-next-line no-labels
            continue outer; // skip adding of add cmd
          }
        }
      }
      r.push(act);
    }
    return r;
  }

  static compressComp(path: ActionNode[]) {
    return ScoreUtils.compressImpl(path, 'ordinoAddScore', 'ordinoRemoveScore');
  }
}
