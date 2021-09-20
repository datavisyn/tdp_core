import { Ranking } from 'lineupjs';
import { EventHandler, IDTypeManager, Range } from 'phovea_core';
import React from 'react';
import ReactDOM from 'react-dom';
import { GeneralHome } from '../../generalVis/components/GeneralHome';
import { EColumnTypes } from '../../generalVis/types/generalTypes';
export class GeneralVisWrapper extends EventHandler {
    constructor(provider, view, doc = document) {
        super();
        this.view = view;
        this.provider = provider;
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
        console.log(newData);
        const scoreColumns = this.provider.getColumns().filter((d) => typeof d._score === 'function');
        for (const j of newData) {
            for (const s of scoreColumns) {
                j[s.column] = s.accessor({ v: { id: j.id } });
            }
        }
        return newData;
    }
    selectCallback(selected) {
        const data = this.getAllData();
        const selectedIds = selected.map((s) => data.filter((d) => d.id === s)[0]._id);
        const r = Range.list(selectedIds);
        const id = IDTypeManager.getInstance().resolveIdType(this.view.idType.id);
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
        const selectedIndeces = this.provider.getSelection();
        const cols = [];
        for (const c of colDescriptions.filter((d) => d.type === 'number' || d.type === 'categorical')) {
            cols.push({
                info: {
                    name: c.label,
                    description: c.description,
                    id: c.label + c.description
                },
                vals: data.map((d, i) => {
                    return { id: d.id, val: d[c.column] ? d[c.column] : '--', selected: selectedIndeces.includes(d._id) };
                }),
                type: c.type === 'number' ? EColumnTypes.NUMERICAL : EColumnTypes.CATEGORICAL,
                selectedForMultiples: false
            });
        }
        ReactDOM.render(React.createElement(GeneralHome, {
            columns: cols,
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
}
//# sourceMappingURL=GeneralVisWrapper.js.map