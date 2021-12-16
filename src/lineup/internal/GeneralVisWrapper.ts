import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {CategoricalColumn, Column, LocalDataProvider, NumberColumn, Ranking, ValueColumn} from 'lineupjs';
import {EventHandler, IRow} from '../../base';
import {IDTypeManager} from '../../idtype';
import {Range} from '../../range';
import {ARankingView} from '..';
import {Vis} from '../../vis/Vis';
import {EColumnTypes, ColumnInfo, VisColumn} from '../../vis/interfaces';
import {LineUpSelectionHelper} from './LineUpSelectionHelper';
import {IDType} from '../../idtype';

export class GeneralVisWrapper extends EventHandler {
    readonly node: HTMLElement; // wrapper node
    private viewable: boolean;
    private provider: LocalDataProvider;
    private selectionHelper: LineUpSelectionHelper;
    private idType: IDType;
    private view: ARankingView;
    private data: any[];

    constructor(provider: LocalDataProvider, view: ARankingView, selectionHelper: LineUpSelectionHelper, idType: IDType, doc = document) {
        super();

        this.view = view;
        this.provider = provider;
        this.selectionHelper = selectionHelper;
        this.node = doc.createElement('div');
        this.node.id = 'customVisDiv';
        this.node.classList.add('custom-vis-panel');
        this.idType = idType;
        this.viewable = false;
    }

    getSelectionMap() {
        const sel = this.provider.getSelection();
        const selectedMap: { [key: number]: boolean } = {};

        const allData = this.provider.data;

        for(const i of allData) {
            selectedMap[i._id] = false;
        }

        for(const i of sel) {
            selectedMap[allData[i]._id] = true;
        }

        return selectedMap;
    }

    selectCallback(selected: number[]) {
        const r = Range.list(selected);
        const id = IDTypeManager.getInstance().resolveIdType(this.view.itemIDType.id);
        this.view.selectionHelper.setGeneralVisSelection({idtype: id, range: r});
    }

    filterCallback(s: string) {
        const selectedIds = this.provider.getSelection();

        if(selectedIds.length === 0 && s !== 'Clear Filter') {
            return;
        }

        this.provider.setFilter((row) => {
            return s === 'Filter In' ? selectedIds.includes(row.i) : s === 'Filter Out' ? !selectedIds.includes(row.i) : true;
        });

        const id = IDTypeManager.getInstance().resolveIdType(this.view.itemIDType.id);

        //de select everything after filtering.
        this.view.selectionHelper.setGeneralVisSelection({idtype: id, range: Range.list([])});

        this.updateCustomVis();
    }

    updateCustomVis() {
        const ranking = this.provider.getFirstRanking();

        const data = this.provider.viewRawRows(ranking.getOrder());

        const cols: VisColumn[] = [];

        const selectedMap: { [key: number]: boolean } = this.getSelectionMap();

        const getColumnInfo = (column: Column): ColumnInfo => {
            return {
                name: column.getMetaData().label.replace(/(<([^>]+)>)/gi, ''),
                description: column.getMetaData().summary.replace(/(<([^>]+)>)/gi, ''),
                // TODO: What kind of id to use?
                id: column.fqid,
            }
        }


        // wait for 2 seconds

        const getColumnValue = async <T,>(column: ValueColumn<T>) => {

            if (column.isLoaded()) {
                return data.map((d, i) => ({id: (<IRow>d.v)._id, val: column.getValue(d)}));
            }

            return new Promise<{id: number, val: T}[]>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject('Timeout');
                }, 60000);

                column.on(ValueColumn.EVENT_DATA_LOADED, () => {
                    clearTimeout(timeout);
                    resolve(data.map((d, i) => ({id: (<IRow>d.v)._id, val: column.getValue(d)})))
                });
            });
        }

        for(const c of ranking.flatColumns) {
            if(c instanceof NumberColumn) {
                cols.push({
                    info: getColumnInfo(c),
                    values: () => getColumnValue(c),
                    type: EColumnTypes.NUMERICAL
                })
            }
            if(c instanceof CategoricalColumn) {
                cols.push({
                    info: getColumnInfo(c),
                    values: () => getColumnValue(c).then((res) => res.map((v) => v.val ? v : {...v, val: '--'})),
                    // TODO: This is required?
                    colors: null,
                    type: EColumnTypes.CATEGORICAL
                })
            }
        }

        ReactDOM.render(
            React.createElement(
                Vis,
                {
                    columns: cols,
                    selected: selectedMap,
                    selectionCallback: (s: number[]) => this.selectCallback(s),
                    filterCallback: (s: string) => this.filterCallback(s)
                }
            ),
            this.node
        );
    }

    toggleCustomVis() {
        this.viewable = !this.viewable;
        this.node.style.display = this.viewable ? 'flex' : 'none';

        this.provider.getFirstRanking().on(`${Ranking.EVENT_FILTER_CHANGED}.track`, () => {
            this.updateCustomVis();
        });

        this.provider.getFirstRanking().on(`${Ranking.EVENT_ADD_COLUMN}.track`, () => {
            this.updateCustomVis();
        });

        this.updateCustomVis();
    }

    hide() {
        ReactDOM.unmountComponentAtNode(this.node);
        this.viewable = false;
        this.node.style.display = 'none';
    }
}
