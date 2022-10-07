import { EngineRenderer, defaultOptions, isGroup, LocalDataProvider, deriveColors, TaggleRenderer, spaceFillingRule, updateLodRules, } from 'lineupjs';
import { merge } from 'lodash';
import { AView } from '../views/AView';
import { EViewMode } from '../base/interfaces';
import { LineupTrackingManager } from './internal/cmds';
import { RestStorageUtils } from '../storage';
import { ErrorAlertHandler } from '../base/ErrorAlertHandler';
import { LineUpSelectionHelper } from './internal/LineUpSelectionHelper';
import { ColumnDescUtils } from './desc';
import { ScoreUtils } from './internal/ScoreUtils';
import { LineUpColors } from './internal/LineUpColors';
import { LineUpPanelActions } from './internal/LineUpPanelActions';
import { LazyColumn } from './internal/column';
import { NotificationHandler } from '../base/NotificationHandler';
import { LineupUtils } from './utils';
import TDPLocalDataProvider from './provider/TDPLocalDataProvider';
import { ERenderAuthorizationStatus, InvalidTokenError, TDPTokenManager } from '../auth';
import { debounceAsync } from '../base';
import { I18nextManager } from '../i18n';
import { IDTypeManager } from '../idtype';
import { LineupVisWrapper } from '../vis';
import { WebpackEnv } from '../base/WebpackEnv';
/**
 * base class for views based on LineUp
 * There is also AEmbeddedRanking to display simple rankings with LineUp.
 */
export class ARankingView extends AView {
    /**
     * Creates a RankingView with the given selection.
     * Can be wrapped with a ViewWrapper.
     *
     * @remarks You need to call init() to actually display the Ranking View.
     *
     * @param context with provenance graph to store the executed operations
     * @param selection The Ids and IdType of the selection
     * @param parent where to put the ranking view
     * @param options to configure the ranking view
     */
    constructor(context, selection, parent, options = {}) {
        super(context, selection, parent);
        /**
         * Stores the ranking data when collapsing columns on modeChange()
         * @type {any}
         */
        this.dump = null;
        this.naturalSize = [800, 500];
        /**
         * clears and rebuilds this lineup instance from scratch
         * @returns {Promise<void>} promise when done
         */
        this.rebuild = debounceAsync(() => this.rebuildImpl(), 100);
        /**
         * similar to rebuild but just loads new data and keep the columns
         * @returns {Promise<void>} promise when done
         */
        this.reloadData = debounceAsync(() => this.reloadDataImpl(), 100);
        /**
         * updates the list of available columns in the side panel
         */
        this.updatePanelChooser = debounceAsync(() => this.panel.updateChooser(this.itemIDType, this.provider.getColumns()), 100);
        /**
         * promise resolved when everything is built
         * @type {any}
         */
        this.built = null;
        this.colors = new LineUpColors();
        this.options = {
            itemName: 'item',
            itemNamePlural: 'items',
            itemRowHeight: null,
            itemIDType: null,
            additionalScoreParameter: null,
            additionalComputeScoreParameter: null,
            subType: { key: '', value: '' },
            clueifyRanking: true,
            enableOverviewMode: true,
            enableZoom: true,
            enableVisPanel: true,
            enableDownload: true,
            enableSaveRanking: true,
            enableAddingColumns: true,
            enableAddingColumnGrouping: false,
            enableAddingSupportColumns: true,
            enableAddingCombiningColumns: true,
            enableAddingScoreColumns: true,
            enableAddingPreviousColumns: true,
            enableAddingDatabaseColumns: true,
            databaseColumnGroups: {},
            enableAddingMetaDataColumns: true,
            enableSidePanelCollapsing: true,
            enableSidePanel: 'collapsed',
            enableHeaderSummary: true,
            enableStripedBackground: false,
            enableHeaderRotation: false,
            customOptions: {},
            customProviderOptions: {
                maxNestedSortingCriteria: Infinity,
                maxGroupColumns: Infinity,
                filterGlobally: true,
                propagateAggregationState: false,
                /**
                 * Specify the task executor to use `direct` = no delay, `scheduled` = run when idle
                 * `scheduled` also improve scalability and performance by using web workers
                 */
                taskExecutor: 'scheduled',
            },
            showInContextMode: (col) => col.desc.column === 'id',
            formatSearchBoxItem: (item, node) => {
                // TypeScript type guard function
                function hasColumnDesc(i) {
                    return i.desc != null;
                }
                if (node.parentElement && hasColumnDesc(item)) {
                    node.dataset.type = item.desc.type;
                    const summary = item.desc.summary || item.desc.description;
                    node.classList.toggle('lu-searchbox-summary-entry', Boolean(summary));
                    if (summary) {
                        const label = node.ownerDocument.createElement('span');
                        label.innerHTML = item.desc.label;
                        node.appendChild(label);
                        const desc = node.ownerDocument.createElement('span');
                        desc.innerHTML = summary;
                        node.appendChild(desc);
                        return undefined;
                    }
                }
                node.innerHTML = item.text;
                return item.text;
            },
            panelAddColumnBtnOptions: {},
        };
        // variants for deriving the item name
        const idTypeNames = options.itemIDType
            ? {
                itemName: IDTypeManager.getInstance().resolveIdType(options.itemIDType).name,
                itemNamePlural: IDTypeManager.getInstance().resolveIdType(options.itemIDType).name,
            }
            : {};
        const names = options.itemName
            ? { itemNamePlural: typeof options.itemName === 'function' ? () => `${options.itemName()}s` : `${options.itemName}s` }
            : {};
        merge(this.options, idTypeNames, names, options);
        this.node.classList.add('lineup', 'lu-taggle', 'lu');
        this.node.insertAdjacentHTML('beforeend', `<div></div>`);
        this.stats = this.node.ownerDocument.createElement('div');
        this.stats.classList.add('mt-2', 'mb-2');
        this.provider = new TDPLocalDataProvider([], [], this.options.customProviderOptions);
        // hack in for providing the data provider within the graph
        // the reason for `this.context.ref.value.data` is that from the sub-class the `this` context (reference) is set to `this.context.ref.value` through the provenance graph
        // so by setting `.data` on the reference it is actually set by the sub-class (e.g. by the `AEmbeddedRanking` view)
        this.context.ref.value.data = this.provider;
        this.provider.on(LocalDataProvider.EVENT_ORDER_CHANGED, () => this.updateLineUpStats());
        const taggleOptions = merge(defaultOptions(), this.options.customOptions, {
            summaryHeader: this.options.enableHeaderSummary,
            labelRotation: this.options.enableHeaderRotation ? 45 : 0,
        }, options.customOptions);
        if (typeof this.options.itemRowHeight === 'number' && this.options.itemRowHeight > 0) {
            taggleOptions.rowHeight = this.options.itemRowHeight;
        }
        else if (typeof this.options.itemRowHeight === 'function') {
            const f = this.options.itemRowHeight;
            taggleOptions.dynamicHeight = () => ({
                defaultHeight: taggleOptions.rowHeight,
                padding: () => 0,
                height: (item) => {
                    return f(item) ?? (isGroup(item) ? taggleOptions.groupHeight : taggleOptions.rowHeight);
                },
            });
        }
        const lineupParent = this.node.firstElementChild;
        this.taggle = !this.options.enableOverviewMode
            ? new EngineRenderer(this.provider, lineupParent, taggleOptions)
            : new TaggleRenderer(this.provider, lineupParent, Object.assign(taggleOptions, {
                violationChanged: (_, violation) => this.panel.setViolation(violation),
            }));
        // LineUp creates an element with class `lu-backdrop` that fades out all content when a dialog is opened.
        // Append `lu-backdrop` one level higher so fading effect can be applied also to the sidePanel when a dialog is opened.
        const luBackdrop = this.node.querySelector('.lu-backdrop');
        this.node.appendChild(luBackdrop);
        this.selectionHelper = new LineUpSelectionHelper(this.provider, () => this.itemIDType);
        this.panel = new LineUpPanelActions(this.provider, this.taggle.ctx, this.options, this.node.ownerDocument);
        if (this.options.enableVisPanel) {
            this.generalVis = new LineupVisWrapper({
                provider: this.provider,
                selectionCallback: (ids) => {
                    // The incoming selection is already working with row.v.id instead of row.v._id, so we have to convert first.
                    this.selectionHelper.setGeneralVisSelection({ idtype: IDTypeManager.getInstance().resolveIdType(this.itemIDType.id), ids });
                },
                doc: this.node.ownerDocument,
            });
            this.panel.on(LineUpPanelActions.EVENT_OPEN_VIS, () => {
                this.generalVis.toggleCustomVis();
            });
        }
        // When a new column desc is added to the provider, update the panel chooser
        this.provider.on(LocalDataProvider.EVENT_ADD_DESC, () => this.updatePanelChooser());
        // TODO: Include this when the remove event is included: https://github.com/lineupjs/lineupjs/issues/338
        // this.provider.on(LocalDataProvider.EVENT_REMOVE_DESC, () => this.updatePanelChooser());
        this.panel.on(LineUpPanelActions.EVENT_SAVE_NAMED_SET, (_event, order, name, description, sec) => {
            this.saveNamedSet(order, name, description, sec);
        });
        this.panel.on(LineUpPanelActions.EVENT_ADD_SCORE_COLUMN, (_event, scoreImpl) => {
            this.addScoreColumn(scoreImpl);
        });
        this.panel.on(LineUpPanelActions.EVENT_ADD_TRACKED_SCORE_COLUMN, (_event, scoreName, scoreId, params) => {
            this.pushTrackedScoreColumn(scoreName, scoreId, params);
        });
        this.panel.on(LineUpPanelActions.EVENT_ZOOM_OUT, () => {
            this.taggle.zoomOut();
        });
        this.panel.on(LineUpPanelActions.EVENT_ZOOM_IN, () => {
            this.taggle.zoomIn();
        });
        if (this.options.enableOverviewMode) {
            const rule = spaceFillingRule(taggleOptions);
            this.panel.on(LineUpPanelActions.EVENT_TOGGLE_OVERVIEW, (_event, isOverviewActive) => {
                updateLodRules(this.taggle.style, isOverviewActive, taggleOptions);
                this.taggle.switchRule(isOverviewActive ? rule : null);
            });
            if (this.options.enableOverviewMode === 'active') {
                this.panel.fire(LineUpPanelActions.EVENT_TOGGLE_OVERVIEW, true);
            }
        }
        if (this.options.enableSidePanel) {
            this.node.appendChild(this.panel.node);
            if (options.enableVisPanel) {
                this.node.appendChild(this.generalVis.node);
            }
            if (this.options.enableSidePanel !== 'top') {
                this.taggle.pushUpdateAble((ctx) => this.panel.panel.update(ctx));
            }
        }
        this.selectionHelper.on(LineUpSelectionHelper.EVENT_SET_ITEM_SELECTION, (_event, sel) => {
            this.setItemSelection(sel);
            if (options.enableVisPanel) {
                this.generalVis.updateCustomVis();
            }
        });
        this.selectionAdapter = this.createSelectionAdapter();
    }
    /**
     * @param params Seperate element that displays the "Showing x of y ..." message
     * @param onParameterChange eventlistener for content changes
     */
    init(params, onParameterChange) {
        return super.init(params, onParameterChange).then(() => {
            if (!WebpackEnv.ENABLE_EXPERIMENTAL_REPROVISYN_FEATURES) {
                // inject stats
                const base = params.querySelector('form') || params;
                base.insertAdjacentHTML('beforeend', `<div class=col-sm-auto></div>`);
                const container = base.lastElementChild;
                container.appendChild(this.stats);
                if (this.options.enableSidePanel === 'top') {
                    container.classList.add('d-flex', 'flex-row', 'align-items-center', 'gap-3');
                    container.insertAdjacentElement('afterbegin', this.panel.node);
                }
            }
        });
    }
    update() {
        this.taggle.update();
    }
    /**
     * Returns the LineUp/Taggle instance of this ranking
     */
    getTaggle() {
        return this.taggle;
    }
    /**
     * create the selection adapter used to map input selections to LineUp columns
     * @default no columns are created
     * @returns {ISelectionAdapter}
     */
    createSelectionAdapter() {
        return null;
    }
    /**
     * custom initialization function at the build will be called
     */
    initImpl() {
        super.initImpl();
        this.built = this.build();
        return this.built;
    }
    /**
     * return the idType of the shown items in LineUp
     * @returns {IDType}
     */
    get itemIDType() {
        return this.options.itemIDType ? IDTypeManager.getInstance().resolveIdType(this.options.itemIDType) : null;
    }
    /**
     * The parameter of this (ranking) view has changed and this ranking needs to adapt to the change.
     * For example, depending on the set `selectionAdapter` additional dynamic columns can be added or
     * removed for the paramter.
     * @param name Name of the changed parameter
     * @returns A promise to wait for until the ranking has been updated by the selection adapter.
     */
    async parameterChanged(name) {
        super.parameterChanged(name);
        if (this.selectionAdapter) {
            await this.built;
            return this.selectionAdapter.parameterChanged(this.createSelectionAdapterContext());
        }
        return Promise.resolve();
    }
    /**
     * Selection of the current LineUp ranking has changed
     */
    itemSelectionChanged() {
        this.selectionHelper.setItemSelection(this.getItemSelection());
        this.updateLineUpStats();
        super.itemSelectionChanged();
    }
    /**
     * Incoming selection from another view has changed and this ranking needs to adapt to the change.
     * For example, depending on the set `selectionAdapter` additional dynamic columns can be added or
     * removed for the incoming selected items.
     * @returns A promise to wait for until the ranking has been updated by the selection adapter.
     */
    async selectionChanged() {
        if (this.selectionAdapter) {
            await this.built;
            return this.selectionAdapter.selectionChanged(this.createSelectionAdapterContext());
        }
        return Promise.resolve();
    }
    /**
     * Creates a selection adapter context
     * @returns selection adapter context
     */
    createSelectionAdapterContext() {
        const ranking = this.provider.getLastRanking();
        const columns = ranking ? ranking.flatColumns : [];
        return {
            columns,
            selection: this.selection,
            freeColor: (id) => this.colors.freeColumnColor(id),
            add: (c) => this.withoutTracking(() => {
                c.forEach((col) => this.addColumn(col.desc, col.data, col.id, col.position));
            }),
            remove: (c) => this.withoutTracking(() => {
                c.forEach((col) => col.removeMe());
            }),
        };
    }
    /**
     * Expand/collapse certain columns on mode change.
     * Expand = focus view
     * Collapse = context view
     * @param mode
     */
    modeChanged(mode) {
        super.modeChanged(mode);
        if (this.provider.getRankings().length <= 0) {
            return;
        }
        const ranking = this.provider.getRankings()[0];
        if (mode === EViewMode.FOCUS) {
            this.panel.show();
            if (this.dump) {
                ranking.children.forEach((c) => {
                    if (!this.dump.has(c.id)) {
                        return;
                    }
                    c.setVisible(true);
                });
            }
            this.dump = null;
            this.update();
            return;
        }
        this.panel.hide();
        if (this.options.enableVisPanel) {
            this.generalVis.hide();
        }
        if (this.dump !== null) {
            return;
        }
        const s = ranking.getPrimarySortCriteria();
        const labelColumn = ranking.children.filter((c) => c.desc.type === 'string')[0];
        this.dump = new Set();
        ranking.children.forEach((c) => {
            if (c === labelColumn || (s && c === s.col) || c.desc.type === 'rank' || c.desc.type === 'selection' || this.options.showInContextMode(c)) {
                // keep these columns
            }
            else {
                c.setVisible(false);
                this.dump.add(c.id);
            }
        });
    }
    async saveNamedSet(order, name, description, sec) {
        const ids = this.selectionHelper.rowIdsAsSet(order);
        const namedSet = await RestStorageUtils.saveNamedSet(name, this.itemIDType, ids, this.options.subType, description, sec);
        NotificationHandler.successfullySaved(I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.successfullySaved'), name);
        this.fire(AView.EVENT_UPDATE_ENTRY_POINT, namedSet);
    }
    addColumn(colDesc, data, id = null, position) {
        // use `colorMapping` as default; otherwise use `color`, which is deprecated; else get a new color
        colDesc.colorMapping = colDesc.colorMapping ? colDesc.colorMapping : colDesc.color ? colDesc.color : this.colors.getColumnColor(id);
        return LazyColumn.addLazyColumn(colDesc, data, this.provider, position, () => {
            this.taggle.update();
        });
    }
    addScoreColumn(score, position) {
        const args = typeof this.options.additionalComputeScoreParameter === 'function'
            ? this.options.additionalComputeScoreParameter()
            : this.options.additionalComputeScoreParameter;
        const colDesc = score.createDesc(args);
        // flag that it is a score but it also a reload function
        colDesc._score = true;
        const rawOrder = this.provider.getRankings()[0].getOrder(); // `getOrder()` can return an Uint8Array, Uint16Array, or Uint32Array
        const order = rawOrder instanceof Uint8Array || rawOrder instanceof Uint16Array || rawOrder instanceof Uint32Array ? Array.from(rawOrder) : rawOrder; // convert UIntTypedArray if necessary -> TODO: https://github.com/datavisyn/tdp_core/issues/412
        const ids = this.selectionHelper.rowIdsAsSet(order);
        let columnResolve = null;
        const columnPromise = new Promise((resolve) => {
            columnResolve = resolve;
        });
        const data = new Promise((resolve) => {
            (async () => {
                // Wait for the column to be initialized
                const col = await columnPromise;
                /**
                 * An error can occur either when the authorization fails, or the request using the token fails.
                 */
                let outsideError = null;
                // TODO: Add a button which allows the user to stop this process?
                let done = false;
                while (!done) {
                    // eslint-disable-next-line no-await-in-loop
                    await TDPTokenManager.runAuthorizations(await score.getAuthorizationConfiguration?.(), {
                        // eslint-disable-next-line @typescript-eslint/no-loop-func
                        render: ({ authConfiguration, status, error, trigger }) => {
                            const e = error || outsideError;
                            // Select the header of the score column
                            const headerNode = this.node.querySelector(`.lu-header[data-id=${col.id}]`);
                            if (!col.findMyRanker() || !headerNode) {
                                // The column was removed.
                                done = true;
                                return;
                            }
                            // Fetch or create the authorization overlay
                            let overlay = headerNode.querySelector('.tdp-authorization-overlay');
                            if (!overlay) {
                                overlay = headerNode.ownerDocument.createElement('div');
                                overlay.className = 'tdp-authorization-overlay';
                                // Add element at the very bottom to avoid using z-index
                                headerNode.appendChild(overlay);
                            }
                            if (status === ERenderAuthorizationStatus.SUCCESS) {
                                overlay.remove();
                            }
                            else {
                                overlay.innerHTML = `${e
                                    ? `<i class="fas fa-exclamation"></i>`
                                    : status === ERenderAuthorizationStatus.PENDING
                                        ? `<i class="fas fa-spinner fa-pulse"></i>`
                                        : `<i class="fas fa-lock"></i>`}<span class="text-truncate" style="max-width: 100%">${e ? e.toString() : I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.scoreAuthorizationRequired')}</span>`;
                                overlay.title = e
                                    ? e.toString()
                                    : I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.scoreAuthorizationRequiredTitle', { name: authConfiguration.name });
                                overlay.style.cursor = 'pointer';
                                overlay.onclick = () => trigger();
                            }
                        },
                    });
                    try {
                        outsideError = null;
                        // eslint-disable-next-line no-await-in-loop
                        resolve(await score.compute(ids, this.itemIDType, args));
                        return;
                    }
                    catch (e) {
                        if (e instanceof InvalidTokenError) {
                            console.error(`Score computation failed because of invalid token:`, e.message);
                            outsideError = e;
                            if (col.findMyRanker()) {
                                // Only invalidate authorizations if the column was not removed yet.
                                // TODO: When we invalidate it here, it also "disables" already open detail views for example
                                TDPTokenManager.invalidateToken(e.ids);
                            }
                            else {
                                // We are done if the column was removed
                                done = true;
                                continue;
                            }
                            continue;
                        }
                        else {
                            throw e;
                        }
                    }
                }
            })();
        });
        const r = this.addColumn(colDesc, data, null, position);
        columnResolve(r.col);
        // use _score function to reload the score
        colDesc._score = () => {
            const rawOrd = this.provider.getRankings()[0].getOrder(); // `getOrder()` can return an Uint8Array, Uint16Array, or Uint32Array
            const ord = rawOrd instanceof Uint8Array || rawOrd instanceof Uint16Array || rawOrd instanceof Uint32Array ? Array.from(rawOrd) : rawOrd; // convert UIntTypedArray if necessary -> TODO: https://github.com/datavisyn/tdp_core/issues/412
            const is = this.selectionHelper.rowIdsAsSet(ord);
            const d = score.compute(is, this.itemIDType, args);
            return r.reload(d);
        };
        return r;
    }
    reloadScores(visibleOnly = false) {
        let scores = this.provider.getColumns().filter((d) => typeof d._score === 'function');
        if (visibleOnly) {
            // check if part of any ranking
            const usedDescs = new Set([].concat(...this.provider.getRankings().map((d) => d.flatColumns.map((a) => a.desc))));
            scores = scores.filter((d) => usedDescs.has(d));
        }
        return Promise.all(scores.map((d) => d._score()));
    }
    async withoutTracking(f) {
        return LineupTrackingManager.getInstance().withoutTracking(this.context.ref, f);
    }
    /**
     * used by commands to trigger adding a tracked score
     * @param {IScore<any>} score
     * @returns {Promise<{col: Column; loaded: Promise<Column>}>}
     */
    async addTrackedScoreColumn(score, position) {
        if (WebpackEnv.ENABLE_EXPERIMENTAL_REPROVISYN_FEATURES) {
            return this.addScoreColumn(score, position);
        }
        return this.withoutTracking(() => this.addScoreColumn(score, position));
    }
    pushTrackedScoreColumn(scoreName, scoreId, params) {
        return ScoreUtils.pushScoreAsync(this.context.graph, this.context.ref, scoreName, scoreId, params);
    }
    /**
     * used by commands to remove a tracked score again
     * @param {string} columnId
     * @returns {Promise<boolean>}
     */
    async removeTrackedScoreColumn(columnId) {
        if (WebpackEnv.ENABLE_EXPERIMENTAL_REPROVISYN_FEATURES) {
            const column = this.provider.find(columnId);
            return column.removeMe();
        }
        return this.withoutTracking(() => {
            const column = this.provider.find(columnId);
            return column.removeMe();
        });
    }
    /**
     * generates the column descriptions based on the given server columns by default they are mapped
     * @param {IServerColumn[]} columns
     * @returns {IAdditionalColumnDesc[]}
     */
    getColumnDescs(columns) {
        return ColumnDescUtils.deriveColumns(columns);
    }
    getColumns() {
        return this.loadColumnDesc().then(({ columns }) => {
            const cols = this.getColumnDescs(columns);
            // compatibility since visible is now a supported feature, so rename ones
            for (const col of cols) {
                if (col.visible != null) {
                    col.initialColumn = col.visible;
                    delete col.visible;
                }
            }
            deriveColors(cols);
            return cols;
        });
    }
    build() {
        this.setBusy(true);
        return Promise.all([this.getColumns(), this.loadRows()])
            .then((r) => {
            const columns = r[0];
            columns.forEach((c) => this.provider.pushDesc(c));
            const rows = r[1];
            this.setLineUpData(rows);
            this.createInitialRanking(this.provider);
            const ranking = this.provider.getLastRanking();
            this.customizeRanking(LineupUtils.wrapRanking(this.provider, ranking));
        })
            .then(() => {
            if (this.selectionAdapter) {
                // init first time
                return this.selectionAdapter.selectionChanged(this.createSelectionAdapterContext());
            }
            return undefined;
        })
            .then(() => {
            this.builtLineUp(this.provider);
            if (this.options.clueifyRanking) {
                // record after the initial one
                LineupTrackingManager.getInstance().clueify(this.taggle, this.context.ref, this.context.graph);
            }
            this.setBusy(false);
            this.update();
        })
            .catch(ErrorAlertHandler.getInstance().errorAlert)
            .catch((error) => {
            console.error(error);
            this.setBusy(false);
        });
    }
    builtLineUp(lineup) {
        // hook
    }
    createInitialRanking(lineup, options = {}) {
        ColumnDescUtils.createInitialRanking(lineup, options);
    }
    customizeRanking(ranking) {
        // hook
    }
    setLineUpData(rows) {
        this.setHint(rows.length === 0, I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.notFoundHint'));
        this.provider.setData(rows);
        this.selectionHelper.rows = rows;
        this.selectionHelper.setItemSelection(this.getItemSelection());
    }
    reloadDataImpl() {
        return (this.built = Promise.all([this.built, this.loadRows()]).then((r) => {
            const rows = r[1];
            this.setLineUpData(rows);
        }));
    }
    rebuildImpl() {
        return (this.built = this.built.then(() => this.clear().then(() => this.build())));
    }
    /**
     * Writes the number of total, selected and shown items in the parameter area
     */
    updateLineUpStats() {
        const showStats = (total, selected = 0, shown = 0) => {
            const name = shown === 1 ? this.options.itemName : this.options.itemNamePlural;
            return `${I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.showing')} ${shown} ${total > 0 ? `${I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.of')} ${total}` : ''} ${typeof name === 'function' ? name() : name}${selected > 0 ? `; ${selected} ${I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.selected')}` : ''}`;
        };
        const selected = this.provider.getSelection().length;
        const total = this.provider.data.length;
        const r = this.provider.getRankings()[0];
        const shown = r && r.getOrder() ? r.getOrder().length : 0;
        this.stats.textContent = showStats(total, selected, shown);
    }
    /**
     * removes alls data from lineup and resets it
     */
    clear() {
        // reset
        return LineupTrackingManager.getInstance()
            .untrack(this.context.ref)
            .then(() => {
            this.provider.clearSelection();
            this.provider.clearRankings();
            this.provider.clearData();
            this.provider.clearColumns();
        });
    }
}
//# sourceMappingURL=ARankingView.js.map