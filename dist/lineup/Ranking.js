/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-shadow */
import { LocalDataProvider, EngineRenderer, TaggleRenderer, createLocalDataProvider, defaultOptions, isGroup, spaceFillingRule, updateLodRules, Ranking as LineUpRanking, } from 'lineupjs';
import React, { useMemo, useRef } from 'react';
import { ColumnDescUtils, LineupUtils } from '.';
import { BaseUtils, AView, IDTypeManager, useSyncedRef, TDPTokenManager, ERenderAuthorizationStatus, I18nextManager, RestStorageUtils, NotificationHandler, ViewUtils, SelectionUtils, TokenManager, ErrorAlertHandler, EViewMode, useAsync, EXTENSION_POINT_TDP_SCORE_IMPL, PluginRegistry, InvalidTokenError, } from '..';
import { LazyColumn } from './internal/column';
import { LineUpColors } from './internal/LineUpColors';
import { LineUpPanelActions } from './internal/LineUpPanelActions';
import { LineUpSelectionHelper } from './internal/LineUpSelectionHelper';
import { AttachemntUtils } from '../storage/internal/internal';
const defaults = {
    itemName: 'item',
    itemNamePlural: 'items',
    itemRowHeight: null,
    itemIDType: null,
    additionalScoreParameter: null,
    additionalComputeScoreParameter: null,
    subType: { key: '', value: '' },
    enableOverviewMode: true,
    enableZoom: true,
    enableCustomVis: true,
    enableDownload: true,
    enableVisPanel: true,
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
    },
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
                label.textContent = item.desc.label;
                node.appendChild(label);
                const desc = node.ownerDocument.createElement('span');
                desc.textContent = summary;
                node.appendChild(desc);
                return undefined;
            }
        }
        return item.text;
    },
    panelAddColumnBtnOptions: {},
    mode: null,
};
export function Ranking({ data = [], selection: inputSelection, itemSelection = { idtype: null, ids: [] }, columnDesc = [], parameters = false, selectionAdapter = null, options: opts = {}, authorization = null, onUpdateEntryPoint, onItemSelect, onItemSelectionChanged, onFilterChanged, onParameterChanged, onCustomizeRanking, onBuiltLineUp, onStatsChanged, }) {
    const isMounted = useRef(false);
    const [busy, setBusy] = React.useState(false);
    const [built, setBuilt] = React.useState(false);
    const options = BaseUtils.mixin({}, defaults, opts);
    const itemSelections = new Map();
    const selections = new Map();
    const itemIDType = options.itemIDType ? IDTypeManager.getInstance().resolveIdType(options.itemIDType) : null;
    const [selection, setSelection] = React.useState(inputSelection);
    const viewRef = React.useRef(null);
    // Stores the ranking data when collapsing columns when mode changes
    const dump = React.useRef(null);
    const colorsRef = useSyncedRef(new LineUpColors());
    const providerRef = React.useRef(null);
    const taggleRef = React.useRef(null);
    const selectionHelperRef = React.useRef(null);
    const panelRef = React.useRef(null);
    const generalVisRef = React.useRef(null);
    React.useEffect(() => {
        selections.set(AView.DEFAULT_SELECTION_NAME, inputSelection);
        const sel = (itemSelection === null || itemSelection === void 0 ? void 0 : itemSelection.ids) ? itemSelection : { idtype: null, ids: [] };
        itemSelections.set(AView.DEFAULT_SELECTION_NAME, sel);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const addColumn = (colDesc, d, id = null, position) => {
        // use `colorMapping` as default; otherwise use `color`, which is deprecated; else get a new color
        colDesc.colorMapping = colDesc.colorMapping ? colDesc.colorMapping : colDesc.color ? colDesc.color : colorsRef.current.getColumnColor(id);
        return LazyColumn.addLazyColumn(colDesc, d, providerRef.current, position, () => {
            taggleRef.current.update();
        });
    };
    const addScoreColumn = (score) => {
        const args = typeof options.additionalComputeScoreParameter === 'function' ? options.additionalComputeScoreParameter() : options.additionalComputeScoreParameter;
        const colDesc = score.createDesc(args);
        // flag that it is a score but it also a reload function
        colDesc._score = true;
        const rawOrder = providerRef.current.getRankings()[0].getOrder(); // `getOrder()` can return an Uint8Array, Uint16Array, or Uint32Array
        const order = rawOrder instanceof Uint8Array || rawOrder instanceof Uint16Array || rawOrder instanceof Uint32Array ? Array.from(rawOrder) : rawOrder; // convert UIntTypedArray if necessary -> TODO: https://github.com/datavisyn/tdp_core/issues/412
        const ids = selectionHelperRef.current.rowIdsAsSet(order);
        let columnResolve = null;
        const columnPromise = new Promise((resolve) => {
            columnResolve = resolve;
        });
        const data = new Promise((resolve) => {
            (async () => {
                var _a;
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
                    await TDPTokenManager.runAuthorizations(await ((_a = score.getAuthorizationConfiguration) === null || _a === void 0 ? void 0 : _a.call(score)), {
                        // eslint-disable-next-line @typescript-eslint/no-loop-func
                        render: ({ authConfiguration, status, error, trigger }) => {
                            const e = error || outsideError;
                            // Select the header of the score column
                            const headerNode = viewRef.current.querySelector(`.lu-header[data-id=${col.id}]`);
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
                        resolve(await score.compute(ids, itemIDType, args));
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
        const r = addColumn(colDesc, data, null);
        columnResolve(r.col);
        // use _score function to reload the score
        colDesc._score = () => {
            const rawOrder = providerRef.current.getRankings()[0].getOrder(); // `getOrder()` can return an Uint8Array, Uint16Array, or Uint32Array
            const order = rawOrder instanceof Uint8Array || rawOrder instanceof Uint16Array || rawOrder instanceof Uint32Array ? Array.from(rawOrder) : rawOrder; // convert UIntTypedArray if necessary -> TODO: https://github.com/datavisyn/tdp_core/issues/412
            const ids = selectionHelperRef.current.rowIdsAsSet(order);
            const data = score.compute(ids, itemIDType, args);
            return r.reload(data);
        };
        return r;
    };
    const createContext = (sel) => {
        const ranking = providerRef.current.getLastRanking();
        const columns = ranking ? ranking.flatColumns : [];
        return {
            columns,
            selection: sel,
            freeColor: (id) => colorsRef.current.freeColumnColor(id),
            add: (columns) => columns.forEach((col) => addColumn(col.desc, col.data, col.id, col.position)),
            remove: (columns) => columns.forEach((c) => c.removeMe()),
        };
    };
    const updatePanelChooser = BaseUtils.debounce(() => panelRef.current.updateChooser(itemIDType, providerRef.current.getColumns()), 100);
    const runAuthorizations = async () => {
        await TDPTokenManager.runAuthorizations(authorization, {
            render: ({ authConfiguration, status, error, trigger }) => {
                // Fetch or create the authorization overlay
                let overlay = viewRef.current.querySelector('.tdp-authorization-overlay');
                if (!overlay) {
                    overlay = viewRef.current.ownerDocument.createElement('div');
                    overlay.className = 'tdp-authorization-overlay';
                    // Add element at the very bottom to avoid using z-index
                    viewRef.current.appendChild(overlay);
                }
                if (status === ERenderAuthorizationStatus.SUCCESS) {
                    overlay.remove();
                }
                else {
                    overlay.innerHTML = `
                ${error
                        ? `<div class="alert alert-info" role="alert">${I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationFailed')} ${error.toString()}</div>`
                        : ''}
                  <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                      <p class="lead">${I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationRequired', { name: authConfiguration.name })}</p>
                      <button class="btn btn-primary" ${status === 'pending' ? `disabled` : ''}>${status === 'pending'
                        ? I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationButtonLoading')
                        : I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationButton')}</button>
                  </div>`;
                    overlay.querySelector('button').onclick = async () => {
                        trigger();
                    };
                }
            },
        });
    };
    React.useEffect(() => {
        const initialized = taggleRef.current != null;
        if (!initialized) {
            providerRef.current = createLocalDataProvider([], [], options.customProviderOptions);
            providerRef.current.on(LocalDataProvider.EVENT_ORDER_CHANGED, () => null);
            const taggleOptions = BaseUtils.mixin(defaultOptions(), options.customOptions, {
                summaryHeader: options.enableHeaderSummary,
                labelRotation: options.enableHeaderRotation ? 45 : 0,
            }, options.customOptions);
            if (typeof options.itemRowHeight === 'number' && options.itemRowHeight > 0) {
                taggleOptions.rowHeight = options.itemRowHeight;
            }
            else if (typeof options.itemRowHeight === 'function') {
                const f = options.itemRowHeight;
                taggleOptions.dynamicHeight = () => ({
                    defaultHeight: taggleOptions.rowHeight,
                    padding: () => 0,
                    height: (item) => {
                        var _a;
                        return (_a = f(item)) !== null && _a !== void 0 ? _a : (isGroup(item) ? taggleOptions.groupHeight : taggleOptions.rowHeight);
                    },
                });
            }
            const lineupContainer = viewRef.current.firstElementChild;
            taggleRef.current = !options.enableOverviewMode
                ? new EngineRenderer(providerRef.current, lineupContainer, taggleOptions)
                : new TaggleRenderer(providerRef.current, lineupContainer, Object.assign(taggleOptions, {
                    violationChanged: (_, violation) => panelRef.current.setViolation(violation),
                }));
            if (viewRef.current && taggleRef.current) {
                const luBackdrop = viewRef.current.querySelector('.lu-backdrop');
                viewRef.current.appendChild(luBackdrop);
            }
            selectionHelperRef.current = new LineUpSelectionHelper(providerRef.current, () => itemIDType);
            panelRef.current = new LineUpPanelActions(providerRef.current, taggleRef.current.ctx, options, lineupContainer.ownerDocument);
            // TODO: should we hardcode the generalVis since it is a separate view
            // generalVisRef=new GeneralVisWrapper(providerRef.current, this, this.selectionHelper, this.node.ownerDocument);
            // When a new column desc is added to the provider, update the panel chooser
            providerRef.current.on(LocalDataProvider.EVENT_ADD_DESC, updatePanelChooser);
            // TODO: Include this when the remove event is included: https://github.com/lineupjs/lineupjs/issues/338
            // providerRef.current.on(LocalDataProvider.EVENT_REMOVE_DESC, updatePanelChooser);
            panelRef.current.on(LineUpPanelActions.EVENT_SAVE_NAMED_SET, async (_event, order, name, description, sec) => {
                const ids = selectionHelperRef.current.rowIdsAsSet(order);
                const namedSet = await RestStorageUtils.saveNamedSet(name, itemIDType, ids, options.subType, description, sec);
                NotificationHandler.successfullySaved(I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.successfullySaved'), name);
                onUpdateEntryPoint === null || onUpdateEntryPoint === void 0 ? void 0 : onUpdateEntryPoint(namedSet);
            });
            panelRef.current.on(LineUpPanelActions.EVENT_ADD_SCORE_COLUMN, (_event, scoreImpl) => { });
            panelRef.current.on(LineUpPanelActions.EVENT_ADD_TRACKED_SCORE_COLUMN, async (_event, scoreName, scoreId, p) => {
                const storedParams = await AttachemntUtils.externalize(p); // TODO: do we need this?
                const pluginDesc = PluginRegistry.getInstance().getPlugin(EXTENSION_POINT_TDP_SCORE_IMPL, scoreId);
                const plugin = await pluginDesc.load();
                const params = await AttachemntUtils.resolveExternalized(storedParams);
                const score = plugin.factory(params, pluginDesc);
                const scores = Array.isArray(score) ? score : [score];
                const results = await Promise.all(scores.map((s) => addScoreColumn(s)));
                await Promise.all(results.map((r) => r.loaded));
            });
            panelRef.current.on(LineUpPanelActions.EVENT_ZOOM_OUT, () => {
                taggleRef.current.zoomOut();
            });
            panelRef.current.on(LineUpPanelActions.EVENT_ZOOM_IN, () => {
                taggleRef.current.zoomIn();
            });
            // TODO: panelRef.current.on(LineUpPanelActions.EVENT_OPEN_VIS, () => {
            //     this.generalVis.toggleCustomVis();
            // });
            if (options.enableOverviewMode) {
                const rule = spaceFillingRule(taggleOptions);
                panelRef.current.on(LineUpPanelActions.EVENT_TOGGLE_OVERVIEW, (_event, isOverviewActive) => {
                    updateLodRules(taggleRef.current.style, isOverviewActive, taggleOptions);
                    taggleRef.current.switchRule(isOverviewActive ? rule : null);
                });
                if (options.enableOverviewMode === 'active') {
                    panelRef.current.fire(LineUpPanelActions.EVENT_TOGGLE_OVERVIEW, true);
                }
            }
            if (options.enableSidePanel) {
                viewRef.current.appendChild(panelRef.current.node);
                // TODO:    viewRef.current.appendChild(this.generalVis.node);
                if (options.enableSidePanel !== 'top') {
                    taggleRef.current.pushUpdateAble((ctx) => panelRef.current.panel.update(ctx));
                }
            }
            selectionHelperRef.current.on(LineUpSelectionHelper.EVENT_SET_ITEM_SELECTION, (_event, selection) => {
                const name = AView.DEFAULT_SELECTION_NAME;
                const current = itemSelections.get(name) || { idtype: null, ids: [] };
                if (current && ViewUtils.isSameSelection(current, selection)) {
                    return;
                }
                const wasEmpty = current == null || current.idtype == null || current.ids.length === 0;
                itemSelections.set(name, selection);
                // propagate
                if (selection.idtype) {
                    if (name === AView.DEFAULT_SELECTION_NAME) {
                        if (selection.ids.length === 0) {
                            selection.idtype.clear(SelectionUtils.defaultSelectionType);
                        }
                        else {
                            selection.idtype.select(selection.ids);
                        }
                    }
                    else if (selection.ids.length === 0) {
                        selection.idtype.clear(name);
                    }
                    else {
                        selection.idtype.select(name, selection.ids);
                    }
                }
                const isEmpty = selection == null || selection.idtype == null || selection.ids.length === 0;
                if (!(wasEmpty && isEmpty)) {
                    // the selection has changed when we really have some new values not just another empty one
                    onItemSelectionChanged === null || onItemSelectionChanged === void 0 ? void 0 : onItemSelectionChanged();
                }
                onItemSelect === null || onItemSelect === void 0 ? void 0 : onItemSelect(current, selection, name);
            });
        }
    }, []);
    const build = React.useMemo(() => async () => {
        TDPTokenManager.on(TokenManager.EVENT_AUTHORIZATION_REMOVED, async () => {
            // If a authorization is removed, rerun the registered authorizations
            await runAuthorizations();
        });
        // First, run all required authorizations
        await runAuthorizations();
        // Register listener after the authorizations are run to avoid double-initializations
        TDPTokenManager.on(TokenManager.EVENT_AUTHORIZATION_STORED, async (_, id, token) => {
            // TODO: Enabling this leads to the taggle view being loaded twice
            // await this.initImpl();
        });
        setBusy(true);
        columnDesc.forEach((c) => providerRef.current.pushDesc({ ...c }));
        // TODO: set hint
        providerRef.current.setData(data);
        selectionHelperRef.current.rows = data;
        selectionHelperRef.current.setItemSelection(itemSelections.get(AView.DEFAULT_SELECTION_NAME));
        ColumnDescUtils.createInitialRanking(providerRef.current, {});
        const ranking = providerRef.current.getLastRanking();
        onCustomizeRanking === null || onCustomizeRanking === void 0 ? void 0 : onCustomizeRanking(LineupUtils.wrapRanking(providerRef.current, ranking));
        return Promise.resolve()
            .then(async () => {
            return selectionAdapter === null || selectionAdapter === void 0 ? void 0 : selectionAdapter.selectionChanged(null, () => createContext(selection));
        })
            .then(() => {
            onBuiltLineUp === null || onBuiltLineUp === void 0 ? void 0 : onBuiltLineUp(providerRef.current);
            setBusy(false);
            taggleRef.current.update();
            setBuilt(true);
        })
            .catch(ErrorAlertHandler.getInstance().errorAlert)
            .catch((error) => {
            console.error(error);
            setBusy(false);
        });
    }, []);
    React.useEffect(() => {
        if (providerRef.current.getRankings().length <= 0 || options.mode == null || !built) {
            return;
        }
        const ranking = providerRef.current.getRankings()[0];
        if (options.mode === EViewMode.FOCUS) {
            setTimeout(() => panelRef.current.show(), 3000);
            if (dump.current) {
                ranking.children.forEach((c) => {
                    if (!dump.current.has(c.id)) {
                        return;
                    }
                    c.setVisible(true);
                });
            }
            dump.current = null;
            taggleRef.current.update();
            return;
        }
        panelRef.current.hide();
        // TODO:  this.generalVis.hide();
        if (dump.current !== null) {
            return;
        }
        const s = ranking.getPrimarySortCriteria();
        const labelColumn = ranking.children.filter((c) => c.desc.type === 'string')[0];
        dump.current = new Set();
        ranking.children.forEach((c) => {
            if (c === labelColumn ||
                (s && c === s.col) ||
                c.desc.type === 'rank' ||
                c.desc.type === 'selection' ||
                c.desc.column === 'id' // = Ensembl column
            ) {
                // keep these columns
            }
            else {
                c.setVisible(false);
                dump.current.add(c.id);
            }
        });
    }, [options.mode, built]);
    const { status } = useAsync(build, []);
    /**
     * TODO: what should the ranking do with the stats
     * For now just let the parents know when there is a change
     */
    const updateLineUpStats = useMemo(() => () => {
        const selected = providerRef.current.getSelection().length;
        const total = providerRef.current.data.length;
        const r = providerRef.current.getRankings()[0];
        const shown = r && r.getOrder() ? r.getOrder().length : 0;
        onStatsChanged === null || onStatsChanged === void 0 ? void 0 : onStatsChanged(total, shown, selected);
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
    React.useEffect(() => {
        if (selectionHelperRef.current && !busy) {
            selectionHelperRef.current.setItemSelection(itemSelection);
            updateLineUpStats();
        }
    }, [busy, itemSelection, updateLineUpStats]);
    React.useEffect(() => {
        if (!busy) {
            const name = AView.DEFAULT_SELECTION_NAME;
            const current = selections.get(name);
            if (current && ViewUtils.isSameSelection(current, inputSelection)) {
                return;
            }
            selections.set(name, inputSelection);
            if (name === AView.DEFAULT_SELECTION_NAME) {
                setSelection(inputSelection);
                if (selectionAdapter) {
                    selectionAdapter.selectionChanged(null, () => createContext(inputSelection));
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busy, inputSelection]);
    React.useEffect(() => {
        // ignore first time parameter are passed since there is no change
        if (!busy && parameters && isMounted.current) {
            if (selectionAdapter) {
                selectionAdapter.parameterChanged(null, () => createContext(inputSelection));
            }
        }
        isMounted.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busy, parameters]);
    React.useEffect(() => {
        if (providerRef.current) {
            providerRef.current.on(`${LocalDataProvider.EVENT_ADD_RANKING}`, (ranking, index) => {
                ranking.on(LineUpRanking.EVENT_FILTER_CHANGED, () => {
                    onFilterChanged === null || onFilterChanged === void 0 ? void 0 : onFilterChanged(providerRef.current, ranking);
                });
            });
        }
        return () => {
            if (providerRef.current) {
                providerRef.current.on(`${LocalDataProvider.EVENT_REMOVE_RANKING}`, (ranking, index) => { });
            }
        };
    }, [providerRef]);
    return (React.createElement("div", { ref: viewRef, className: `tdp-view lineup lu-taggle lu ${busy || status !== 'success' ? 'tdp-busy' : 'not busy'}` },
        React.createElement("div", { className: "lineup-container" })));
}
//# sourceMappingURL=Ranking.js.map