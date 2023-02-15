import { LocalDataProvider } from 'lineupjs';
import { IDTypeManager } from 'visyn_core/idtype';
import { PluginRegistry } from 'visyn_core/plugin';
import { ObjectRefUtils } from '../clue/provenance';
import { ARankingView } from '../lineup/ARankingView';
import { EXTENSION_POINT_TDP_SCORE_IMPL } from '../base/extensions';
export class AEmbeddedRanking {
    constructor(node) {
        this.node = node;
    }
    getInstance() {
        return this.ranking;
    }
    buildRanking(graph, refKey, options = {}) {
        const ref = graph.findOrAddObject(this, refKey, ObjectRefUtils.category.visual);
        const idtype = IDTypeManager.getInstance().resolveIdType('_dummy');
        const context = {
            graph,
            ref,
            desc: {
                idtype: idtype.id,
            },
        };
        const selection = {
            idtype,
            ids: [],
        };
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        class EmbeddedRankingView extends ARankingView {
            constructor() {
                super(...arguments);
                this.triggerScoreReload = false;
            }
            loadColumnDesc() {
                return Promise.resolve(that.loadColumnDescs()).then((columns) => ({ columns, idType: this.idType.name }));
            }
            getColumnDescs(columns) {
                // columns already in the right format
                return columns.map((c) => Object.assign(c, {
                    initialRanking: true,
                    width: -1,
                    selectedId: null,
                    selectedSubtype: undefined,
                    ...c,
                }));
            }
            loadRows() {
                return Promise.resolve(that.loadRows());
            }
            rebuildLineUp(mode = 'data') {
                switch (mode) {
                    case 'scores':
                        return this.reloadScores();
                    case 'data':
                        return this.reloadData();
                    case 'data+scores':
                        this.triggerScoreReload = true;
                        return this.reloadData();
                    case 'data+desc':
                        return this.rebuild();
                    case 'data+desc+scores':
                        this.triggerScoreReload = true;
                        return this.rebuild();
                    default:
                        return undefined;
                }
            }
            setLineUpData(rows) {
                super.setLineUpData(rows);
                // maybe trigger a score reload if needed
                if (this.triggerScoreReload) {
                    this.triggerScoreReload = false;
                    setTimeout(() => this.reloadScores(), 200); // HACK: wait until lineup has finished creating its new order before the score is reloaded
                }
            }
            createInitialRanking(lineup, opts = {}) {
                that.createInitialRanking(lineup);
                if (lineup.getRankings().length === 0) {
                    super.createInitialRanking(lineup, opts);
                }
            }
            runWithoutTracking(f) {
                return super.withoutTracking(f);
            }
            getParameterFormDescs() {
                const base = super.getParameterFormDescs();
                return [...base, ...that.getParameterFormDescs()];
            }
        }
        this.ranking = new EmbeddedRankingView(context, selection, this.node, options);
        // since set in the constructor it is safe
        // this.data is set by ARankingView's constructor (see hack where `this.context.ref.value.data` is set)
        // with `graph.findOrAddObject` above the reference of `this` (AEmbeddedRanking) is set to `this.context.ref.value` in ARankingView
        // therefore is this.data of AEmbeddedRanking === `this.context.ref.value` in ARankingView's constructor
        const lineup = this.data;
        lineup.on(`${LocalDataProvider.EVENT_SELECTION_CHANGED}.embedded`, (sel) => {
            const rows = sel.map((d) => lineup.data[d]);
            this.selectedRowsChanged(rows);
        });
        const form = this.node.ownerDocument.createElement('div');
        form.classList.add('parameters', 'container-fluid', 'ps-0', 'pe-0');
        this.node.insertAdjacentElement('afterbegin', form);
        return Promise.resolve(this.ranking.init(form, () => null)).then(() => {
            this.initialized();
            return lineup;
        });
    }
    selectedRowsChanged(_rows) {
        // hook
    }
    initialized() {
        // hook
    }
    setSelectedRows(rows) {
        const lineup = this.data;
        lineup.on(`${LocalDataProvider.EVENT_SELECTION_CHANGED}.embedded`, null);
        this.ranking.setItemSelection({
            idtype: this.ranking.itemIDType,
            ids: rows.map((d) => d.id),
        });
        lineup.on(`${LocalDataProvider.EVENT_SELECTION_CHANGED}.embedded`, (selection) => {
            const rs = selection.map((d) => lineup.data[d]);
            this.selectedRowsChanged(rs);
        });
    }
    async rebuild(mode = 'data') {
        if (this.ranking) {
            return this.ranking.rebuildLineUp(mode);
        }
        return undefined;
    }
    runWithoutTracking(f) {
        return this.ranking.runWithoutTracking(() => f(this.data));
    }
    addTrackedScoreColumn(score, scoreParams, position) {
        if (typeof score !== 'string') {
            return this.ranking.addTrackedScoreColumn(score, scoreParams); // aka scoreParams = position
        }
        const pluginDesc = PluginRegistry.getInstance().getPlugin(EXTENSION_POINT_TDP_SCORE_IMPL, score);
        return pluginDesc.load().then((plugin) => {
            const instance = plugin.factory(scoreParams, pluginDesc);
            const scores = Array.isArray(instance) ? instance : [instance];
            return Promise.all(scores.map((s) => this.ranking.addTrackedScoreColumn(s, position)));
        });
    }
    update() {
        if (this.ranking) {
            this.ranking.update();
        }
    }
    /**
     * return a list of FormBuilder element descriptions to build the parameter form
     * @returns {IFormElementDesc[]}
     */
    getParameterFormDescs() {
        // hook
        return [];
    }
}
//# sourceMappingURL=AEmbeddedRanking.js.map