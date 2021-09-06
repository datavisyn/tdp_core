import {LocalDataProvider, Ranking} from "lineupjs";
import {EventHandler, IDTypeManager, ParseRangeUtils, Range} from "phovea_core";
import React from "react";
import ReactDOM from "react-dom";
import {ARankingView, IARankingViewOptions} from "..";
import {ISelection} from "../..";
import {CategoricalColumn, CustomVis, NumericalColumn} from "./customVis/CustomVis";

function asSelection(data: {idtype: string, selection: number}): ISelection {
    return {
        range: ParseRangeUtils.parseRangeLike(data.selection.toString()),
        idtype: IDTypeManager.getInstance().resolveIdType(data.idtype)
    };
}

export class GeneralVisWrapper extends EventHandler {
    readonly node: HTMLElement; // wrapper node
    private viewable: boolean
    private provider: LocalDataProvider
    private view: ARankingView

    constructor(provider: LocalDataProvider, view: ARankingView, doc = document) {
        super();
        
        this.view = view
        this.provider = provider
        this.node = doc.createElement('div')
        this.node.id = "customVisDiv"
        this.node.classList.add("custom-vis-panel")
        this.viewable = false
    }



    getAllData() : any[]{
        //make a real copy at some point
        let newData = this.provider.data.filter((d, i) => this.provider.getFirstRanking().filter(this.provider.getRow(i)));

        console.log(newData)
        let scoreColumns = this.provider.getColumns().filter(d => typeof (<any>d)._score === 'function')
    
        for(let j of newData)
        {
          for(let s of scoreColumns)
          {
            j[(<any> s).column] = (<any> s).accessor({v: {id: j.id}})
          }
        }

        return newData;
      }

    updateCustomVis() {
        let data = this.getAllData();
        let colDescriptions = this.provider.getColumns()
        let selectedIndeces = this.provider.getSelection();
        let cols: any[] = []

        console.log(selectedIndeces)

        for(let c of colDescriptions.filter(d => d.type === "number" || d.type === "categorical"))
        {
            cols.push({
                name: c.label,
                vals: data.map((d, i) => {
                    return {id: d.id, val: d[(<any> c).column] ? d[(<any> c).column] : "--", selected: selectedIndeces.includes(d._id)}
                }),
                type: c.type,
                selectedForMultiples: false
            })
        }

        let callback = (selected: string[]) => {
            let selectedIds = selected.map(s => data.filter(d => d.id === s)[0]._id)

            let r = Range.list(selectedIds);
            let id = IDTypeManager.getInstance().resolveIdType(this.view.idType.id)

            this.view.selectionHelper.setGeneralVisSelection({idtype: id, range: r})
        }

        let filterCallback = (selected: string[]) => {
            let selectedIds = selected.map(s => data.filter(d => d.id === s)[0]._id)
            console.log(selectedIds)

            if(selected.length == 0)
            {
                console.log("clearing filters")
                this.provider.setFilter(row => true);
                return;
            }

            this.provider.setFilter((row) => {
                return selectedIds.includes(row.i)
            })
        }

        ReactDOM.render(
            React.createElement(CustomVis, {columns: cols, 
                type: "Multiples", selectionCallback: filterCallback}), 
            this.node
        )

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
        this.viewable = !this.viewable
        this.node.style.display = this.viewable ? "flex" : "none"

        this.provider.getFirstRanking().on(`${Ranking.EVENT_FILTER_CHANGED}.track`, () => {
            this.updateCustomVis()
        })
    }
}