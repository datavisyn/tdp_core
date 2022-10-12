/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-shadow */
import { LocalDataProvider, EngineRenderer, TaggleRenderer, Column, defaultOptions, isGroup, spaceFillingRule, updateLodRules, toolbar, dialogContext, } from 'lineupjs';
import React, { useCallback, useEffect, useMemo } from 'react';
import { merge } from 'lodash';
import { LazyColumn } from './internal/column';
import { LineUpColors } from './internal/LineUpColors';
import { LineUpPanelActions } from './internal/LineUpPanelActions';
import { LineUpSelectionHelper } from './internal/LineUpSelectionHelper';
import { AttachemntUtils } from '../storage/internal/internal';
import { EViewMode } from '../base/interfaces';
import { ColumnDescUtils, LineupUtils } from '.';
import { BaseUtils } from '../base/BaseUtils';
import { IDTypeManager } from '../idtype/IDTypeManager';
import { AView } from '../views/AView';
import { InvalidTokenError, TDPTokenManager } from '../auth/TokenManager';
import { ERenderAuthorizationStatus } from '../auth/interfaces';
import { I18nextManager } from '../i18n/I18nextManager';
import { RestStorageUtils } from '../storage/rest';
import { NotificationHandler } from '../base/NotificationHandler';
import { EXTENSION_POINT_TDP_SCORE_IMPL } from '../base/extensions';
import { PluginRegistry } from '../app/PluginRegistry';
import { ViewUtils } from '../views/ViewUtils';
import { SelectionUtils } from '../idtype/SelectionUtils';
import { ErrorAlertHandler } from '../base/ErrorAlertHandler';
import { useAsync } from '../hooks/useAsync';
import { StructureImageColumn, StructureImageFilterDialog, StructureImageRenderer } from './structureImage';
import TDPLocalDataProvider from './provider/TDPLocalDataProvider';
const defaults = {
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
    mode: null,
    showInContextMode: (col) => col.desc.column === 'id',
};
function suffix(name) {
    return `${name}.visynView`;
}
export function Ranking({ data = [], itemSelection = { idtype: null, ids: [] }, columnDesc = [], options: opts = {}, onContextChanged, onUpdateEntryPoint, onItemSelect, onItemSelectionChanged, onCustomizeRanking, onBuiltLineUp, 
/**
 * Maybe refactor this when using the native lineup implementation of scores
 */
onAddScoreColumn, }) {
    const [busy, setBusy] = React.useState(false);
    const [built, setBuilt] = React.useState(false);
    const options = merge({}, defaults, opts);
    const itemSelections = new Map();
    const itemIDType = options.itemIDType ? IDTypeManager.getInstance().resolveIdType(options.itemIDType) : null;
    const lineupContainerRef = React.useRef(null);
    // Stores the ranking data when collapsing columns when mode changes
    const dump = React.useRef(null);
    const colorsRef = React.useRef(new LineUpColors());
    const providerRef = React.useRef(null);
    const taggleRef = React.useRef(null);
    const selectionHelperRef = React.useRef(null);
    const panelRef = React.useRef(null);
    React.useEffect(() => {
        const sel = itemSelection?.ids ? itemSelection : { idtype: null, ids: [] };
        itemSelections.set(AView.DEFAULT_SELECTION_NAME, sel);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const addColumn = useCallback((colDesc, d, id = null, position) => {
        // use `colorMapping` as default; otherwise use `color`, which is deprecated; else get a new color
        colDesc.colorMapping = colDesc.colorMapping ? colDesc.colorMapping : colDesc.color ? colDesc.color : colorsRef.current.getColumnColor(id);
        return LazyColumn.addLazyColumn(colDesc, d, providerRef.current, position, () => {
            taggleRef.current.update();
        });
    }, [colorsRef]);
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
                            const headerNode = lineupContainerRef.current.querySelector(`.lu-header[data-id=${col.id}]`);
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
        return { instance: r, colDesc, data };
    };
    const updatePanelChooser = BaseUtils.debounce(() => panelRef.current.updateChooser(itemIDType, providerRef.current.getColumns()), 100);
    React.useEffect(() => {
        const initialized = taggleRef.current != null;
        if (!initialized) {
            // register custom column types
            options.customProviderOptions.columnTypes = { ...options.customProviderOptions.columnTypes, smiles: StructureImageColumn };
            // register custom filter dialogs for custom column types
            toolbar('filterStructureImage', 'rename')(StructureImageColumn);
            providerRef.current = new TDPLocalDataProvider([], [], options.customProviderOptions);
            providerRef.current.on(suffix(LocalDataProvider.EVENT_ORDER_CHANGED), () => null);
            // add width changed listener for smiles columns in ranking
            providerRef.current.on(suffix(LocalDataProvider.EVENT_ADD_COLUMN), (col) => {
                if (col instanceof StructureImageColumn) {
                    col.on(suffix(Column.EVENT_WIDTH_CHANGED), () => {
                        // trigger a re-render of LineUp using the new calculated row height in `dynamicHeight()`
                        taggleRef.current.update();
                    });
                }
            });
            providerRef.current.on(suffix(LocalDataProvider.EVENT_REMOVE_COLUMN), (col) => {
                if (col instanceof StructureImageColumn) {
                    col.on(suffix(Column.EVENT_WIDTH_CHANGED), null); // remove event listener when column is removed
                }
            });
            const taggleOptions = merge(defaultOptions(), options.customOptions, {
                summaryHeader: options.enableHeaderSummary,
                labelRotation: options.enableHeaderRotation ? 45 : 0,
                renderers: {
                    smiles: new StructureImageRenderer(),
                },
                toolbarActions: {
                    // TODO remove default string filter; use `filterString` as key would override the default string filter, but also for string columns
                    filterStructureImage: {
                        title: 'Filter …',
                        onClick: (col, evt, ctx, level, viaShortcut) => {
                            const dialog = new StructureImageFilterDialog(col, dialogContext(ctx, level, evt), ctx);
                            dialog.open();
                        },
                        options: {
                            mode: 'menu+shortcut',
                            featureCategory: 'ranking',
                            featureLevel: 'basic',
                        },
                    },
                },
            }, options.customOptions);
            // FIXME simplify the `itemRowHeight` option to have less options and conditions
            if (typeof options.itemRowHeight === 'number' && options.itemRowHeight > 0) {
                taggleOptions.rowHeight = options.itemRowHeight;
            }
            else if (typeof options.itemRowHeight === 'function') {
                const f = options.itemRowHeight;
                taggleOptions.dynamicHeight = () => ({
                    defaultHeight: taggleOptions.rowHeight,
                    padding: () => 0,
                    height: (item) => {
                        return f(item) ?? (isGroup(item) ? taggleOptions.groupHeight : taggleOptions.rowHeight);
                    },
                });
            }
            else {
                /**
                 * Calculate the row height for a group or row. If smiles columns are added to the ranking,
                 * the width of the widest column is taken as row height. If no smiles column is added to the ranking
                 * the default width is used.
                 * @param data data of the group or row
                 * @param ranking current ranking
                 * @returns dynamic height object for LineUp
                 */
                taggleOptions.dynamicHeight = function dynamicRowHeight(data, ranking) {
                    const DEFAULT_ROW_HEIGHT = defaultOptions().rowHeight; // LineUp default rowHeight = 18
                    // get list of smiles columns from the current ranking
                    const smilesColumns = ranking.children.filter((col) => col instanceof StructureImageColumn);
                    if (smilesColumns.length === 0) {
                        return { defaultHeight: DEFAULT_ROW_HEIGHT, height: () => DEFAULT_ROW_HEIGHT, padding: () => 0 };
                    }
                    const maxColumnHeight = Math.max(DEFAULT_ROW_HEIGHT, ...smilesColumns.map((col) => col.getWidth())); // squared image -> use col width as height
                    return {
                        defaultHeight: maxColumnHeight,
                        height: () => maxColumnHeight,
                        padding: () => 0,
                    };
                };
            }
            taggleRef.current = !options.enableOverviewMode
                ? new EngineRenderer(providerRef.current, lineupContainerRef.current, taggleOptions)
                : new TaggleRenderer(providerRef.current, lineupContainerRef.current, Object.assign(taggleOptions, {
                    violationChanged: (_, violation) => panelRef.current.setViolation(violation),
                }));
            if (lineupContainerRef.current && taggleRef.current) {
                const luBackdrop = lineupContainerRef.current.querySelector('.lu-backdrop');
                lineupContainerRef.current.parentElement.appendChild(luBackdrop);
            }
            selectionHelperRef.current = new LineUpSelectionHelper(providerRef.current, () => itemIDType);
            panelRef.current = new LineUpPanelActions(providerRef.current, taggleRef.current.ctx, options, lineupContainerRef.current.ownerDocument);
            // TODO: should we hardcode the generalVis since it is a separate view
            // generalVisRef=new GeneralVisWrapper(providerRef.current, this, this.selectionHelper, this.node.ownerDocument);
            // When a new column desc is added to the provider, update the panel chooser
            providerRef.current.on(suffix(LocalDataProvider.EVENT_ADD_DESC), updatePanelChooser);
            // TODO: Include this when the remove event is included: https://github.com/lineupjs/lineupjs/issues/338
            // providerRef.current.on(suffix(LocalDataProvider.EVENT_REMOVE_DESC), updatePanelChooser);
            panelRef.current.on(LineUpPanelActions.EVENT_SAVE_NAMED_SET, async (_event, order, name, description, sec) => {
                const ids = selectionHelperRef.current.rowIdsAsSet(order);
                const namedSet = await RestStorageUtils.saveNamedSet(name, itemIDType, ids, options.subType, description, sec);
                NotificationHandler.successfullySaved(I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.successfullySaved'), name);
                onUpdateEntryPoint?.(namedSet);
            });
            panelRef.current.on(LineUpPanelActions.EVENT_ADD_TRACKED_SCORE_COLUMN, async (_event, scoreName, scoreId, p) => {
                const storedParams = await AttachemntUtils.externalize(p); // TODO: do we need this?
                const pluginDesc = PluginRegistry.getInstance().getPlugin(EXTENSION_POINT_TDP_SCORE_IMPL, scoreId);
                const plugin = await pluginDesc.load();
                const params = await AttachemntUtils.resolveExternalized(storedParams);
                const score = plugin.factory(params, pluginDesc);
                const scores = Array.isArray(score) ? score : [score];
                const results = await Promise.all(scores.map((s) => addScoreColumn(s)));
                const loadedResults = await Promise.all(results.map(async (r) => {
                    await r.instance.loaded;
                    // data already loaded use await to get value
                    return { ...r, ...{ data: await r.data } };
                }));
                onAddScoreColumn?.(loadedResults);
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
                lineupContainerRef.current.parentElement.appendChild(panelRef.current.node);
                if (options.enableSidePanel !== 'top') {
                    taggleRef.current.pushUpdateAble((ctx) => panelRef.current.panel.update(ctx));
                }
            }
            selectionHelperRef.current.on(LineUpSelectionHelper.EVENT_SET_ITEM_SELECTION, (_event, currentSelection) => {
                const name = AView.DEFAULT_SELECTION_NAME;
                const current = itemSelections.get(name) || { idtype: null, ids: [] };
                if (current && ViewUtils.isSameSelection(current, currentSelection)) {
                    return;
                }
                const wasEmpty = current == null || current.idtype == null || current.ids.length === 0;
                itemSelections.set(name, currentSelection);
                // propagate
                if (currentSelection.idtype) {
                    if (name === AView.DEFAULT_SELECTION_NAME) {
                        if (currentSelection.ids.length === 0) {
                            currentSelection.idtype.clear(SelectionUtils.defaultSelectionType);
                        }
                        else {
                            currentSelection.idtype.select(currentSelection.ids);
                        }
                    }
                    else if (currentSelection.ids.length === 0) {
                        currentSelection.idtype.clear(name);
                    }
                    else {
                        currentSelection.idtype.select(name, currentSelection.ids);
                    }
                }
                const isEmpty = currentSelection == null || currentSelection.idtype == null || currentSelection.ids.length === 0;
                if (!(wasEmpty && isEmpty)) {
                    // the selection has changed when we really have some new values not just another empty one
                    onItemSelectionChanged?.();
                }
                onItemSelect?.(current, currentSelection, name);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const stringCols = providerRef.current?.getLastRanking()?.flatColumns.toString();
    const columns = useMemo(() => {
        const ranking = providerRef.current?.getLastRanking();
        return ranking ? ranking.flatColumns : [];
        // This dep is needed because the columns are not part of a normal variable, only part of a ref. Probably should think of a better way.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stringCols]);
    useEffect(() => {
        const context = {
            columns,
            freeColor: (id) => colorsRef.current.freeColumnColor(id),
            add: (columns) => Promise.resolve(columns.forEach((col) => addColumn(col.desc, col.data, col.id, col.position))),
            remove: (columns) => Promise.resolve(columns.forEach((c) => c.removeMe())),
        };
        onContextChanged?.(context);
    }, [addColumn, columns, onContextChanged, colorsRef]);
    const build = React.useMemo(() => async () => {
        setBusy(true);
        columnDesc.forEach((c) => providerRef.current.pushDesc({ ...c }));
        providerRef.current.setData(data);
        selectionHelperRef.current.rows = data;
        selectionHelperRef.current.setItemSelection(itemSelections.get(AView.DEFAULT_SELECTION_NAME));
        ColumnDescUtils.createInitialRanking(providerRef.current, {});
        const ranking = providerRef.current.getLastRanking();
        const columns = ranking ? ranking.flatColumns : [];
        const selectionAdapterContext = {
            columns,
            freeColor: (id) => colorsRef.current.freeColumnColor(id),
            // TODO The promise as return value can be removed once `ARankingView` and CLUE are gone; the promise as return value was required by CLUE
            add: (columns) => Promise.resolve(columns.forEach((col) => addColumn(col.desc, col.data, col.id, col.position))),
            // TODO The promise as return value can be removed once `ARankingView` and CLUE are gone; the promise as return value was required by CLUE
            remove: (columns) => Promise.resolve(columns.forEach((c) => c.removeMe())),
        };
        onContextChanged?.(selectionAdapterContext);
        onCustomizeRanking?.(LineupUtils.wrapRanking(providerRef.current, ranking));
        return (Promise.resolve()
            // TODO: check if this is needed
            // .then(async () => {
            //   return selectionAdapter?.selectionChanged(createContext(selection));
            // })
            .then(() => {
            onBuiltLineUp?.(providerRef.current, taggleRef.current);
            setBusy(false);
            taggleRef.current.update();
            setBuilt(true);
        })
            .catch(ErrorAlertHandler.getInstance().errorAlert)
            .catch((error) => {
            console.error(error);
            setBusy(false);
        }));
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
    /**
     * modeChanged
     */
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
    React.useEffect(() => {
        if (selectionHelperRef.current && !busy) {
            selectionHelperRef.current.setItemSelection(itemSelection);
        }
    }, [busy, itemSelection]);
    return (React.createElement("div", { className: "d-flex h-100 w-100 tdp-view lineup lu-taggle lu" },
        React.createElement("div", { ref: lineupContainerRef, className: "lineup-container flex-grow-1" })));
}
//# sourceMappingURL=Ranking.js.map