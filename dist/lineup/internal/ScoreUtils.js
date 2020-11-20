/**
 * Created by Samuel Gratzl on 18.05.2016.
 */
import { ObjectRefUtils, I18nextManager, ActionMetaData, PluginRegistry, ActionUtils } from 'phovea_core';
import { EXTENSION_POINT_TDP_SCORE_IMPL } from '../../base/extensions';
import { AttachemntUtils } from '../../storage/internal/attachment';
export class ScoreUtils {
    static async addScoreLogic(waitForScore, inputs, parameter) {
        const scoreId = parameter.id;
        const pluginDesc = PluginRegistry.getInstance().getPlugin(EXTENSION_POINT_TDP_SCORE_IMPL, scoreId);
        const plugin = await pluginDesc.load();
        const view = await inputs[0].v.then((vi) => vi.getInstance());
        const params = await AttachemntUtils.resolveExternalized(parameter.params);
        const score = plugin.factory(params, pluginDesc);
        const scores = Array.isArray(score) ? score : [score];
        const results = await Promise.all(scores.map((s) => view.addTrackedScoreColumn(s)));
        const col = waitForScore ? await Promise.all(results.map((r) => r.loaded)) : results.map((r) => r.col);
        return {
            inverse: ScoreUtils.removeScore(inputs[0], I18nextManager.getInstance().i18n.t('tdp:core.lineup.scorecmds.score'), scoreId, parameter.storedParams ? parameter.storedParams : parameter.params, col.map((c) => c.id))
        };
    }
    static addScoreImpl(inputs, parameter) {
        return ScoreUtils.addScoreLogic(true, inputs, parameter);
    }
    static async addScoreAsync(inputs, parameter) {
        return ScoreUtils.addScoreLogic(false, inputs, parameter);
    }
    static async removeScoreImpl(inputs, parameter) {
        const view = await inputs[0].v.then((vi) => vi.getInstance());
        const columnId = parameter.columnId;
        const columnIds = Array.isArray(columnId) ? columnId : [columnId];
        columnIds.forEach((id) => view.removeTrackedScoreColumn(id));
        return {
            inverse: ScoreUtils.addScore(inputs[0], I18nextManager.getInstance().i18n.t('tdp:core.lineup.scorecmds.score'), parameter.id, parameter.params)
        };
    }
    static addScore(provider, scoreName, scoreId, params) {
        return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.scorecmds.add', { scoreName }), ObjectRefUtils.category.data, ObjectRefUtils.operation.create), ScoreUtils.CMD_ADD_SCORE, ScoreUtils.addScoreImpl, [provider], {
            id: scoreId,
            params
        });
    }
    static async pushScoreAsync(graph, provider, scoreName, scoreId, params) {
        const storedParams = await AttachemntUtils.externalize(params);
        const currentParams = { id: scoreId, params, storedParams };
        const result = await ScoreUtils.addScoreAsync([provider], currentParams);
        const toStoreParams = { id: scoreId, params: storedParams };
        return graph.pushWithResult(ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.scorecmds.add', { scoreName }), ObjectRefUtils.category.data, ObjectRefUtils.operation.create), ScoreUtils.CMD_ADD_SCORE, ScoreUtils.addScoreImpl, [provider], toStoreParams), result);
    }
    static removeScore(provider, scoreName, scoreId, params, columnId) {
        return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.scorecmds.remove', { scoreName }), ObjectRefUtils.category.data, ObjectRefUtils.operation.remove), ScoreUtils.CMD_REMOVE_SCORE, ScoreUtils.removeScoreImpl, [provider], {
            id: scoreId,
            params,
            columnId
        });
    }
    static shallowEqualObjects(a, b) {
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
    static compress(path) {
        return ScoreUtils.compressImpl(path, ScoreUtils.CMD_ADD_SCORE, ScoreUtils.CMD_REMOVE_SCORE);
    }
    static compressImpl(path, addCmd, remCmd) {
        const manipulate = path.slice();
        const r = [];
        outer: for (let i = 0; i < manipulate.length; ++i) {
            const act = manipulate[i];
            if (act.f_id === addCmd) {
                // try to find its removal
                for (let j = i + 1; j < manipulate.length; ++j) {
                    const next = manipulate[j];
                    if (next.f_id === remCmd && ScoreUtils.shallowEqualObjects(act.parameter, next.parameter)) {
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
    static compressComp(path) {
        return ScoreUtils.compressImpl(path, 'ordinoAddScore', 'ordinoRemoveScore');
    }
}
ScoreUtils.CMD_ADD_SCORE = 'tdpAddScore';
ScoreUtils.CMD_REMOVE_SCORE = 'tdpRemoveScore';
//# sourceMappingURL=ScoreUtils.js.map