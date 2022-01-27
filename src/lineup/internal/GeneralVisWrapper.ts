import {LocalDataProvider, Ranking} from 'lineupjs';
import {EventHandler, IDTypeManager} from '../..';
import React from 'react';
import ReactDOM from 'react-dom';
import {ARankingView} from '..';
import {Vis} from '../../vis/Vis';
import {EColumnTypes} from '../../vis/interfaces';
import {LineUpSelectionHelper} from './LineUpSelectionHelper';

export class GeneralVisWrapper extends EventHandler {
    readonly node: HTMLElement; // wrapper node
    private viewable: boolean;
    private provider: LocalDataProvider;
    private selectionHelper: LineUpSelectionHelper;
    private view: ARankingView;
    private data: any[];

    constructor(provider: LocalDataProvider, view: ARankingView, selectionHelper: LineUpSelectionHelper, doc = document) {
        super();

        this.view = view;
        this.provider = provider;
        this.selectionHelper = selectionHelper;
        this.node = doc.createElement('div');
        this.node.id = 'customVisDiv';
        this.node.classList.add('custom-vis-panel');
        this.viewable = false;
    }

    getAllData(): any[] {
        //make a real copy at some point
        const globalFilter = this.provider.getFilter();

        // TODO: Think about using this.provider.getFirstRanking().flatColumns instead of the descriptions.

        /* TODO: This is an untested way of resolving the values of all possible ValueColumn variants (could be lazy for example).
        this.provider.getFirstRanking().flatColumns.forEach((v) => {
            if(v instanceof ValueColumn) {
                if(v.isLoaded()) {
                    return () => this.provider._dataRows.map((row) => v.getValue(row));
                } else {
                    let resolve = null;
                    const promise = new Promise((resolve2) => {
                        resolve = resolve2;
                    });

                    v.on(ValueColumn.EVENT_DATA_LOADED, () => {
                        resolve(this.provider._dataRows.map((row) => v.getValue(row)))
                    })

                    return () => promise;
                }
            }
        })
        */

        let newData = [];

        if(globalFilter) {
            newData = this.provider.data.filter((d, i) => this.provider.getFirstRanking().filter(this.provider.getRow(i)) && globalFilter(this.provider.getRow(i)));
        } else {
            newData = this.provider.data.filter((d, i) => this.provider.getFirstRanking().filter(this.provider.getRow(i)));
        }

        console.log(this.provider.getColumns());

        const scoreColumns = this.provider.getColumns().filter((d) => typeof (<any>d).accessor === 'function' && (<any>d).selectedId !== -1);

        for(const j of newData) {
          for(const s of scoreColumns) {
            j[(<any> s).column] = (<any> s).accessor({v: {id: j.id}}, s);
          }
        }

        return newData;
    }

    selectCallback(selected: string[]) {
        //???
        const id = IDTypeManager.getInstance().resolveIdType(this.view.itemIDType.id);

        this.view.selectionHelper.setGeneralVisSelection({idtype: id, selectionIds: selected});
    }

    filterCallback(s: string) {
        const selectedIds = this.provider.getSelection();

        if(selectedIds.length === 0) {
            return;
        }

        this.provider.setFilter((row) => {
            return s === 'Filter In' ? selectedIds.includes(row.i) : s === 'Filter Out' ? !selectedIds.includes(row.i) : true;
        });

        this.updateCustomVis();
    }

    updateCustomVis() {
        const data = this.getAllData();
        const colDescriptions = this.provider.getColumns();
        //need some way to convert these to _ids.
        const selectedIndeces = this.selectionHelper.getSelection();
        const cols: any[] = [];

        const selectedMap: { [key: number]: boolean } = {};

        for(const i of data) {
            selectedMap[i._id] = false;
        }

        for(const i of selectedIndeces) {
            selectedMap[i] = true;
        }

        console.log(data);

        for(const c of colDescriptions.filter((d) => d.type === 'number' || d.type === 'categorical')) {
            cols.push({
                info: {
                    name: c.label.replace(/(<([^>]+)>)/gi, ''),
                    description: c.summary ? c.summary.replace(/(<([^>]+)>)/gi, '') : '',
                    id: c.label + (<any> c)._id
                },
                values: data.map((d, i) => {
                    return {id: d._id, val: d[(<any> c).column] ? d[(<any> c).column] : c.type === 'number' ? null : '--'};
                }),
                type: c.type === 'number' ? EColumnTypes.NUMERICAL : EColumnTypes.CATEGORICAL
            });
        }

        ReactDOM.render(
            React.createElement(
                Vis,
                {
                    columns: cols,
                    selected: selectedMap,
                    selectionCallback: (s: string[]) => this.selectCallback(s),
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
