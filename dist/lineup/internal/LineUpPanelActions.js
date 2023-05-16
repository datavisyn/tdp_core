import { createStackDesc, createScriptDesc, createSelectionDesc, createAggregateDesc, createGroupDesc, createImpositionDesc, createNestedDesc, createReduceDesc, } from 'lineupjs';
import { I18nextManager } from 'visyn_core/i18n';
import { IDTypeManager } from 'visyn_core/idtype';
import { PluginRegistry } from 'visyn_core/plugin';
import { EventHandler } from 'visyn_core/base';
import { EXTENSION_POINT_TDP_SCORE_LOADER, EXTENSION_POINT_TDP_SCORE, EXTENSION_POINT_TDP_RANKING_BUTTON, EP_TDP_CORE_LINEUP_PANEL_TAB, } from '../../base/extensions';
import { PanelButton } from '../panel/PanelButton';
import { PanelTabContainer, NullTabContainer } from '../panel/PanelTabContainer';
import { PanelTab, SidePanelTab } from '../panel/PanelTab';
import { SearchBoxProvider } from '../panel/SearchBoxProvider';
import { EPanelHeaderToolbar, PanelHeader } from '../panel/PanelHeader';
import { PanelRankingButton } from '../panel/PanelRankingButton';
import { PanelAddColumnButton } from '../panel/PanelAddColumnButton';
import { PanelDownloadButton } from '../panel/PanelDownloadButton';
import { isAdditionalColumnDesc, } from '../../base/interfaces';
import { LineupUtils } from '../utils';
import { FormElementType } from '../../form/interfaces';
import { FormDialog } from '../../form';
import { PanelSaveNamedSetButton } from '../panel/PanelSaveNamedSetButton';
import { LineUpOrderedRowIndicies } from '../panel/LineUpOrderedRowIndicies';
export function findMappablePlugins(target, all) {
    if (!target) {
        return [];
    }
    const idTypes = Array.from(new Set(all.map((d) => d.idtype)));
    function canBeMappedTo(idtype) {
        if (idtype === target.id) {
            return true;
        }
        // lookup the targets and check if our target is part of it
        return IDTypeManager.getInstance()
            .getCanBeMappedTo(IDTypeManager.getInstance().resolveIdType(idtype))
            .then((mappables) => mappables.some((d) => d.id === target.id));
    }
    // check which idTypes can be mapped to the target one
    return Promise.all(idTypes.map(canBeMappedTo)).then((mappable) => {
        const valid = idTypes.filter((d, i) => mappable[i]);
        return all.filter((d) => valid.indexOf(d.idtype) >= 0);
    });
}
class LineUpPanelActions extends EventHandler {
    constructor(provider, ctx, options, doc = document) {
        super();
        this.provider = provider;
        this.options = options;
        this.idType = null;
        this.wasCollapsed = false;
        this.node = doc.createElement('aside');
        this.node.classList.add('lu-side-panel-wrapper');
        this.node.setAttribute('data-testid', 'side-panel-wrapper');
        this.header = new PanelHeader(this.node);
        this.searchBoxProvider = new SearchBoxProvider();
        if (this.options.enableSidePanel === 'top') {
            this.node.classList.add('lu-side-panel-top');
            this.tabContainer = new NullTabContainer(); // tab container without functionality
        }
        else {
            const sidePanel = new SidePanelTab(this.node, this.searchBoxProvider.createSearchBox({ formatItem: this.options.formatSearchBoxItem }), ctx, doc);
            this.panel = sidePanel.panel;
            this.tabContainer = new PanelTabContainer(this.node);
            this.tabContainer.addTab(sidePanel);
            this.tabContainer.showTab(sidePanel);
        }
        this.init();
        this.collapse = options.enableSidePanel === 'top' || options.enableSidePanel === 'collapsed';
    }
    forceCollapse() {
        this.wasCollapsed = this.collapse;
        this.collapse = true;
    }
    releaseForce() {
        if (!this.wasCollapsed) {
            this.collapse = false;
        }
        if (this.wasHidden) {
            this.show();
        }
    }
    get collapse() {
        return this.node.classList.contains('collapsed');
    }
    set collapse(value) {
        this.node.classList.toggle('collapsed', value);
        if (value) {
            this.tabContainer.hideCurrentTab(); // Hide the active PanelTab and inform its content to stop updating
        }
        else {
            this.tabContainer.showCurrentTab(); // Show the last active PanelTab and inform its content to start updating again
        }
    }
    hide() {
        this.node.style.display = 'none';
        // Hide the active PanelTab and inform its content to stop updating
        this.tabContainer.hideCurrentTab();
    }
    show() {
        this.node.style.display = 'flex';
        // Show the last active PanelTab and inform its content to start updating again
        this.tabContainer.showCurrentTab();
    }
    get isTopMode() {
        return this.options.enableSidePanel === 'top';
    }
    get wasHidden() {
        return this.node.style.display === 'none';
    }
    init() {
        const buttons = this.header.node;
        if (!this.isTopMode && this.options.enableSidePanelCollapsing) {
            // top mode doesn't need collapse feature
            const collapseButton = new PanelButton(buttons, {
                title: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.collapseButton'),
                faIcon: 'fas fa-arrow-right',
                cssClass: 'collapse-button',
                onClick: () => {
                    this.collapse = !this.collapse;
                },
            });
            this.header.addButton(collapseButton, EPanelHeaderToolbar.NAV);
        }
        if (this.options.enableAddingColumns) {
            const addColumnButton = new PanelAddColumnButton(buttons, this.searchBoxProvider.createSearchBox({ formatItem: this.options.formatSearchBoxItem }), this.options.panelAddColumnBtnOptions);
            this.header.addButton(addColumnButton, EPanelHeaderToolbar.START);
        }
        this.appendExtraButtons(buttons);
        const lineupOrderRowIndices = new LineUpOrderedRowIndicies(this.provider); // save state of all, selected, and filtered rows
        if (this.options.enableSaveRanking) {
            const saveRankingButtonContainer = new PanelSaveNamedSetButton(buttons, lineupOrderRowIndices, this.isTopMode);
            saveRankingButtonContainer.on(PanelSaveNamedSetButton.EVENT_SAVE_NAMED_SET, (_event, order, name, description, sec) => {
                this.fire(LineUpPanelActions.EVENT_SAVE_NAMED_SET, order, name, description, sec); // forward event
            });
            this.header.addButton(saveRankingButtonContainer, EPanelHeaderToolbar.START);
        }
        if (this.options.enableDownload) {
            const downloadButtonContainer = new PanelDownloadButton(buttons, this.provider, lineupOrderRowIndices, this.isTopMode);
            this.header.addButton(downloadButtonContainer, EPanelHeaderToolbar.START);
        }
        if (this.options.enableZoom) {
            const zoomInButton = new PanelButton(buttons, {
                title: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.zoomIn'),
                cssClass: 'zoom-in-button',
                faIcon: 'fas fa-search-plus',
                onClick: () => this.fire(LineUpPanelActions.EVENT_ZOOM_IN),
            });
            this.header.addButton(zoomInButton, EPanelHeaderToolbar.CENTER);
            const zoomOutButton = new PanelButton(buttons, {
                title: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.zoomOut'),
                cssClass: 'zoom-out-button',
                faIcon: 'fas fa-search-minus',
                onClick: () => this.fire(LineUpPanelActions.EVENT_ZOOM_OUT),
            });
            this.header.addButton(zoomOutButton, EPanelHeaderToolbar.CENTER);
        }
        if (this.options.enableVisPanel) {
            const customVis = new PanelButton(buttons, {
                title: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.openVis'),
                faIcon: 'fas fa-chart-bar',
                onClick: () => this.fire(LineUpPanelActions.EVENT_OPEN_VIS),
            });
            this.header.addButton(customVis, EPanelHeaderToolbar.END);
        }
        if (this.options.enableOverviewMode) {
            const overviewButton = new PanelButton(buttons, {
                title: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.toggleOverview'),
                cssClass: 'toggle-overview-button',
                faIcon: 'fas fa-list',
                onClick: () => {
                    const selected = this.overview.classList.toggle('active');
                    this.fire(LineUpPanelActions.EVENT_TOGGLE_OVERVIEW, selected);
                },
            });
            this.overview = overviewButton.node; // TODO might be removed
            if (this.options.enableOverviewMode === 'active') {
                overviewButton.node.classList.toggle('active');
            }
            this.header.addButton(overviewButton, EPanelHeaderToolbar.CENTER);
        }
        if (!this.isTopMode) {
            this.appendExtraTabs();
        }
    }
    setViolation(violation) {
        if (violation) {
            this.overview.dataset.violation = violation;
        }
        else {
            delete this.overview.dataset.violation;
        }
    }
    appendExtraButtons(parent) {
        const buttons = PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_RANKING_BUTTON);
        return buttons.forEach((button) => {
            const listener = () => {
                button.load().then((p) => this.scoreColumnDialog(p));
            };
            const luButton = new PanelRankingButton(parent, this.provider, button.title, button.cssClass, button.faIcon, listener);
            this.header.addButton(luButton, EPanelHeaderToolbar.START);
        });
    }
    appendExtraTabs() {
        const plugins = PluginRegistry.getInstance()
            .listPlugins(EP_TDP_CORE_LINEUP_PANEL_TAB)
            .sort((a, b) => a.order - b.order);
        plugins.forEach((plugin) => {
            let isLoaded = false;
            const tab = new PanelTab(this.tabContainer.node, plugin);
            const onClick = () => {
                if (isLoaded) {
                    if (this.collapse) {
                        this.collapse = false; // expand side panel
                    }
                    this.tabContainer.showTab(tab);
                }
                else {
                    plugin.load().then((p) => {
                        p.factory(p.desc, tab, this.provider);
                        this.collapse = false; // expand side panel
                        this.tabContainer.showTab(tab);
                        isLoaded = true;
                    });
                }
            };
            if (plugin.shortcut) {
                this.header.addButton(tab.getShortcutButton(), EPanelHeaderToolbar.END);
            }
            this.tabContainer.addTab(tab, onClick);
        });
    }
    resolveArgs() {
        return typeof this.options.additionalScoreParameter === 'function' ? this.options.additionalScoreParameter() : this.options.additionalScoreParameter;
    }
    getColumnDescription(descs, addScores) {
        return descs
            .filter((d) => Boolean(d._score) === addScores)
            .map((d) => {
            return {
                desc: d,
                text: d.label,
                id: d.column.toString(),
                action: () => this.addColumn(d),
                chooserGroup: isAdditionalColumnDesc(d) ? d.chooserGroup : null,
            };
        })
            .sort((a, b) => a.text.localeCompare(b.text));
    }
    addColumn(desc) {
        const ranking = this.provider.getLastRanking();
        ranking.push(this.provider.create(desc));
    }
    async resolveScores(idType) {
        // load plugins, which need to be checked if the IDTypes are mappable
        const ordinoScores = await findMappablePlugins(idType, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_SCORE));
        const metaDataPluginDescs = (await findMappablePlugins(idType, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_SCORE_LOADER)));
        const metaDataPluginPromises = metaDataPluginDescs.map((plugin) => plugin
            .load()
            .then((loadedPlugin) => loadedPlugin.factory(plugin))
            .then((scores) => {
            return this.buildMetaDataDescriptions(plugin, scores.sort((a, b) => a.text.localeCompare(b.text)));
        }));
        // Load meta data plugins
        const metaDataOptions = await Promise.all(metaDataPluginPromises);
        const loadedScorePlugins = ordinoScores.map((desc) => LineupUtils.wrap(desc));
        return { metaDataOptions, loadedScorePlugins };
    }
    async updateChooser(idType, descs) {
        this.idType = idType;
        if (this.searchBoxProvider.length === 0) {
            return;
        }
        const { metaDataOptions, loadedScorePlugins } = await this.resolveScores(this.idType);
        const items = [];
        if (this.options.enableAddingDatabaseColumns) {
            const columnDesc = this.getColumnDescription(descs, false);
            // Group the columns
            const [groupedItems, ungroupedItems] = this.groupColumnDescs(columnDesc);
            // First, add all the ungrouped columns
            items.push(this.groupedDialog(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.databaseColumns'), ungroupedItems));
            const sortOrder = (a, b) => {
                // Return the group with the higher order
                return a === b ? 0 : a != null && b != null ? a - b : a != null ? -1 : 1;
            };
            // Then, add the grouped columns with the ordered group and ordered columns
            Array.from(groupedItems.entries())
                .sort(([aKey, aVal], [bKey, bVal]) => {
                // Sort the groups first
                const { databaseColumnGroups } = this.options;
                // If both groups have the same order, sort alphabetically
                return sortOrder(databaseColumnGroups?.[aKey]?.order, databaseColumnGroups?.[bKey]?.order) || aKey.localeCompare(bKey);
            })
                .forEach(([key, value]) => items.push(this.groupedDialog(key, value.sort((a, b) => sortOrder(a.chooserGroup?.order, b.chooserGroup?.order)))));
        }
        if (this.options.enableAddingScoreColumns && loadedScorePlugins.length > 0) {
            items.push({
                text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.parameterizedScores'),
                children: loadedScorePlugins.map((score) => {
                    return {
                        text: score.text,
                        id: score.id,
                        action: () => {
                            // number of rows of the last ranking
                            const amountOfRows = this.provider.getLastRanking().getOrder().length;
                            // the factory function call executes the score's implementation
                            score
                                .factory(this.resolveArgs(), amountOfRows)
                                .then((params) => this.fire(LineUpPanelActions.EVENT_ADD_TRACKED_SCORE_COLUMN, score.text, score.id, params));
                        },
                    };
                }),
            });
        }
        if (this.options.enableAddingPreviousColumns) {
            const scoreDescs = this.getColumnDescription(descs, true);
            if (scoreDescs.length > 0) {
                items.push({
                    text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.previouslyAddedColumns'),
                    children: scoreDescs,
                });
            }
        }
        const specialColumnsOption = {
            text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.specialColumns'),
            children: [],
        };
        if (this.options.enableAddingCombiningColumns) {
            const combiningColumns = this.groupedDialog(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.combiningColumns'), [
                {
                    text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.weightedSum'),
                    id: 'weightedSum',
                    action: () => this.addColumn(createStackDesc(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.weightedSum'))),
                },
                {
                    text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.scriptedCombination'),
                    id: 'scriptedCombination',
                    action: () => this.addColumn(createScriptDesc(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.scriptedCombination'))),
                },
                {
                    text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.nested'),
                    id: 'nested',
                    action: () => this.addColumn(createNestedDesc(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.nested'))),
                },
                {
                    text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.reduce'),
                    id: 'reduce',
                    action: () => this.addColumn(createReduceDesc()),
                },
                {
                    text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.imposition'),
                    id: 'imposition',
                    action: () => this.addColumn(createImpositionDesc()),
                },
            ]);
            specialColumnsOption.children.push(combiningColumns);
        }
        if (this.options.enableAddingSupportColumns) {
            const supportColumns = this.groupedDialog(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.supportColumns'), [
                {
                    text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.groupInformation'),
                    id: 'group',
                    action: () => this.addColumn(createGroupDesc(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.group'))),
                },
                {
                    text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.selectionCheckbox'),
                    id: 'selection',
                    action: () => this.addColumn(createSelectionDesc()),
                },
                {
                    text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.aggregateGroup'),
                    id: 'aggregate',
                    action: () => this.addColumn(createAggregateDesc()),
                },
            ]);
            specialColumnsOption.children.push(supportColumns);
        }
        if (this.options.enableAddingMetaDataColumns) {
            specialColumnsOption.children.push(...metaDataOptions);
        }
        // Only add special columns option if there are any items available
        if (specialColumnsOption.children.length > 0) {
            items.push(specialColumnsOption);
        }
        this.searchBoxProvider.update(items);
    }
    groupColumnDescs(columnDesc) {
        const groupedItems = new Map();
        const ungroupedItems = [];
        columnDesc.forEach((item) => {
            if (item.chooserGroup) {
                if (groupedItems.has(item.chooserGroup.parent)) {
                    groupedItems.set(item.chooserGroup.parent, [...groupedItems.get(item.chooserGroup.parent), item]);
                }
                else {
                    groupedItems.set(item.chooserGroup.parent, [item]);
                }
            }
            else {
                ungroupedItems.push(item);
            }
        });
        return [groupedItems, ungroupedItems];
    }
    groupedDialog(text, children) {
        const viaDialog = this.options.enableAddingColumnGrouping;
        if (!viaDialog) {
            return { text, children };
        }
        return {
            text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.columnTitle', { text }),
            id: `group_${text}`,
            action: () => {
                // choooser dialog
                const dialogTitle = I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.addText', { text });
                const dialogButton = I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.addButton');
                const dialog = new FormDialog(dialogTitle, dialogButton);
                const CHOOSER_COLUMNS = 'chooser_columns';
                const formDesc = {
                    type: FormElementType.SELECT2_MULTIPLE,
                    label: 'Columns',
                    id: CHOOSER_COLUMNS,
                    required: true,
                    options: {
                        placeholder: 'Start typing...',
                        data: children,
                    },
                };
                dialog.append(formDesc);
                dialog.showAsPromise((form) => {
                    const data = form.getElementData();
                    const columns = data[CHOOSER_COLUMNS];
                    columns.forEach((column) => {
                        const child = children.find((c) => c.id === column.id);
                        child.action();
                    });
                });
            },
        };
    }
    buildMetaDataDescriptions(desc, columns) {
        return {
            text: desc.name,
            children: columns.map((plugin) => {
                return {
                    text: plugin.text,
                    id: plugin.text,
                    action: () => {
                        // number of rows of the last ranking
                        const amountOfRows = this.provider.getLastRanking().getOrder().length;
                        const params = plugin.factory(this.resolveArgs(), amountOfRows);
                        this.fire(LineUpPanelActions.EVENT_ADD_TRACKED_SCORE_COLUMN, plugin.scoreId, params);
                    },
                };
            }),
        };
    }
    scoreColumnDialog(scorePlugin) {
        // pass dataSource into InvertedAggregatedScore factory method
        Promise.resolve(scorePlugin.factory(scorePlugin.desc, this.idType, this.resolveArgs())) // open modal dialog
            .then((params) => {
            // modal dialog is closed and score created
            if (Array.isArray(params)) {
                params.forEach((param) => this.fire(LineUpPanelActions.EVENT_ADD_TRACKED_SCORE_COLUMN, scorePlugin.desc.name, scorePlugin.desc.id, param));
            }
            else {
                this.fire(LineUpPanelActions.EVENT_ADD_TRACKED_SCORE_COLUMN, scorePlugin.desc.id, params);
            }
        });
    }
}
LineUpPanelActions.EVENT_ZOOM_OUT = 'zoomOut';
LineUpPanelActions.EVENT_ZOOM_IN = 'zoomIn';
LineUpPanelActions.EVENT_OPEN_VIS = 'openVis';
LineUpPanelActions.EVENT_TOGGLE_OVERVIEW = 'toggleOverview';
LineUpPanelActions.EVENT_SAVE_NAMED_SET = 'saveNamedSet';
/**
 * @deprecated
 */
LineUpPanelActions.EVENT_ADD_SCORE_COLUMN = 'addScoreColumn';
/**
 * (scoreName: string, scoreId: string, params: object) => void
 * @type {string}
 */
LineUpPanelActions.EVENT_ADD_TRACKED_SCORE_COLUMN = 'addTrackedScoreColumn';
export { LineUpPanelActions };
//# sourceMappingURL=LineUpPanelActions.js.map