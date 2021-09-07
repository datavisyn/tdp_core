import { Ranking } from 'lineupjs';
import { EventHandler, IDTypeManager, ParseRangeUtils, Range } from 'phovea_core';
import React from 'react';
import ReactDOM from 'react-dom';
import { CustomVis } from './customVis/CustomVis';
function asSelection(data) {
    return {
        range: ParseRangeUtils.parseRangeLike(data.selection.toString()),
        idtype: IDTypeManager.getInstance().resolveIdType(data.idtype)
    };
}
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
    updateCustomVis() {
        const data = this.getAllData();
        const colDescriptions = this.provider.getColumns();
        const selectedIndeces = this.provider.getSelection();
        const cols = [];
        for (const c of colDescriptions.filter((d) => d.type === 'number' || d.type === 'categorical')) {
            cols.push({
                name: c.label,
                vals: data.map((d, i) => {
                    return { id: d.id, val: d[c.column] ? d[c.column] : '--', selected: selectedIndeces.includes(d._id) };
                }),
                type: c.type,
                selectedForMultiples: false
            });
        }
        const selectCallback = (selected) => {
            const selectedIds = selected.map((s) => data.filter((d) => d.id === s)[0]._id);
            const r = Range.list(selectedIds);
            const id = IDTypeManager.getInstance().resolveIdType(this.view.idType.id);
            this.view.selectionHelper.setGeneralVisSelection({ idtype: id, range: r });
        };
        const filterCallback = (s) => {
            const selectedIds = this.provider.getSelection();
            if (selectedIds.length === 0) {
                return;
            }
            this.provider.setFilter((row) => {
                return s === 'in' ? selectedIds.includes(row.i) : s === 'out' ? !selectedIds.includes(row.i) : true;
            });
            this.updateCustomVis();
        };
        ReactDOM.render(React.createElement(CustomVis, { columns: cols,
            type: 'Multiples', selectionCallback: selectCallback, filterCallback }), this.node);
        // let irisSepalLengthData = [5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 5.5, 4.9, 5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1];
        // let irisSepalWidthData = [3.5, 3.0, 3.2, 3.1, 3.6, 3.9, 3.4, 3.4, 2.9, 3.1, 3.7, 3.4, 3.0, 3.0, 4.0, 4.4, 3.9, 3.5, 3.8, 3.8];
        // let irisPetalLengthData = [1.4, 1.4, 1.3, 1.5, 1.4, 1.7, 1.4, 1.5, 1.4, 1.5, 1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5];
        // let irisPetalWidthData = [0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.4, 0.4, 0.3, 0.3, 0.3];
        // let irisSpecies = ["Setosa", "Setosa", "Setosa", "Setosa", "Setosa", "Setosa", "Versicolor", "Versicolor","Versicolor", "Versicolor","Versicolor", "Versicolor",
        // "Virginica", "Virginica", "Virginica", "Virginica", "Virginica", "Virginica", "Virginica", "Virginica"]
        // ReactDOM.render(
        // React.createElement(CustomVis, {columns: [
        //     {name: "Sepal Length", vals: [...Array(20).keys()].map(c => {return {id: c.toString(), val: irisSepalLengthData[c]}}), type: "number", selectedForMultiples: false},
        //     {name: "Sepal Width", vals: [...Array(20).keys()].map(c => {return {id: c.toString(), val: irisSepalWidthData[c]}}), type: "number", selectedForMultiples: false},
        //     {name: "Petal Length", vals: [...Array(20).keys()].map(c => {return {id: c.toString(), val: irisPetalLengthData[c]}}), type: "number", selectedForMultiples: true},
        //     {name: "Petal Width", vals: [...Array(20).keys()].map(c => {return {id: c.toString(), val: irisPetalWidthData[c]}}), type: "number", selectedForMultiples: true},
        //     {name: "Species", vals: [...Array(20).keys()].map(c => {return {id: c.toString(), val: irisSpecies[c]}}), type: "categorical", selectedForMultiples: false},
        //     {name: "Species Again For Fun", vals: [...Array(20).keys()].map(c => {return {id: c.toString(), val: irisSpecies[c]}}), type: "categorical", selectedForMultiples: false}], type: "Multiples"}),
        // this.node
        // )
    }
    toggleCustomVis() {
        this.viewable = !this.viewable;
        this.node.style.display = this.viewable ? 'flex' : 'none';
        this.provider.getFirstRanking().on(`${Ranking.EVENT_FILTER_CHANGED}.track`, () => {
            this.updateCustomVis();
        });
    }
}
//# sourceMappingURL=GeneralVisWrapper.js.map