import { Ranking } from 'lineupjs';
import { EventHandler, IDTypeManager, Range } from '../..';
import React from 'react';
import ReactDOM from 'react-dom';
import { Vis } from '../../vis/Vis';
import { EColumnTypes } from '../../vis/interfaces';
export class GeneralVisWrapper extends EventHandler {
    constructor(provider, view, selectionHelper, doc = document) {
        super();
        this.view = view;
        this.provider = provider;
        this.selectionHelper = selectionHelper;
        this.node = doc.createElement('div');
        this.node.id = 'customVisDiv';
        this.node.classList.add('custom-vis-panel');
        this.viewable = false;
    }
    getAllData() {
        //make a real copy at some point
        const globalFilter = this.provider.getFilter();
        let newData = [];
        if (globalFilter) {
            newData = this.provider.data.filter((d, i) => this.provider.getFirstRanking().filter(this.provider.getRow(i)) && globalFilter(this.provider.getRow(i)));
        }
        else {
            newData = this.provider.data.filter((d, i) => this.provider.getFirstRanking().filter(this.provider.getRow(i)));
        }
        const scoreColumns = this.provider.getColumns().filter((d) => typeof d.accessor === 'function' && d.selectedId !== -1);
        for (const j of newData) {
            for (const s of scoreColumns) {
                j[s.column] = s.accessor({ v: { id: j.id } });
            }
        }
        return newData;
    }
    selectCallback(selected) {
        const data = this.getAllData();
        const r = Range.list(selected);
        //???
        const id = IDTypeManager.getInstance().resolveIdType(this.view.itemIDType.id);
        this.view.selectionHelper.setGeneralVisSelection({ idtype: id, range: r });
    }
    filterCallback(s) {
        const selectedIds = this.provider.getSelection();
        if (selectedIds.length === 0) {
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
        const cols = [];
        const selectedMap = {};
        for (const i of data) {
            selectedMap[i._id] = false;
        }
        for (const i of selectedIndeces) {
            selectedMap[i] = true;
        }
        for (const c of colDescriptions.filter((d) => d.type === 'number' || d.type === 'categorical')) {
            cols.push({
                info: {
                    name: c.label,
                    description: c.summary,
                    id: c.label + c._id
                },
                values: data.map((d, i) => {
                    return { id: d._id, val: d[c.column] ? d[c.column] : c.type === 'number' ? null : '--' };
                }),
                type: c.type === 'number' ? EColumnTypes.NUMERICAL : EColumnTypes.CATEGORICAL
            });
        }
        ReactDOM.render(React.createElement(Vis, {
            columns: cols,
            selected: selectedMap,
            selectionCallback: (s) => this.selectCallback(s),
            filterCallback: (s) => this.filterCallback(s)
        }), this.node);
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
//# sourceMappingURL=GeneralVisWrapper.js.map