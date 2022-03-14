import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CategoricalColumn, LocalDataProvider, NumberColumn, Ranking, ValueColumn } from 'lineupjs';
import { Vis } from './Vis';
import { EColumnTypes, EFilterOptions } from './interfaces';
export class LineupVisWrapper {
    constructor(props) {
        this.props = props;
        this.getSelectedList = () => {
            const selectedRows = this.props.provider.viewRaw(this.props.provider.getSelection());
            return selectedRows.map((r) => r._id.toString());
        };
        this.filterCallback = (s) => {
            const selectedIds = this.props.provider.getSelection();
            if (selectedIds.length === 0 && s !== EFilterOptions.CLEAR) {
                return;
            }
            this.props.provider.setFilter((row) => {
                return s === EFilterOptions.IN ? selectedIds.includes(row.i) : s === EFilterOptions.OUT ? !selectedIds.includes(row.i) : true;
            });
            this.props.selectionCallback([]);
            this.updateCustomVis();
        };
        this.updateCustomVis = () => {
            const ranking = this.props.provider.getFirstRanking();
            const data = this.props.provider.viewRawRows(ranking.getOrder());
            const cols = [];
            const selectedList = this.getSelectedList();
            const getColumnInfo = (column) => {
                return {
                    // This regex strips any html off of the label and summary, leaving only the center text. For example, <div><span>Hello</span></div> would be Hello.
                    name: column.getMetaData().label.replace(/(<([^>]+)>)/gi, ''),
                    description: column.getMetaData().summary.replace(/(<([^>]+)>)/gi, ''),
                    id: column.fqid,
                };
            };
            const mapData = (innerData, column) => {
                return innerData.map((d) => ({ id: d.v.id, val: column.getRaw(d) }));
            };
            const getColumnValue = async (column) => {
                if (column.isLoaded()) {
                    return mapData(data, column);
                }
                return new Promise((resolve, reject) => {
                    // times out if we take longer than 60 seconds to load the columns.
                    const timeout = setTimeout(() => {
                        reject('Timeout');
                    }, 60000);
                    column.on(ValueColumn.EVENT_DATA_LOADED, () => {
                        clearTimeout(timeout);
                        resolve(mapData(data, column));
                    });
                });
            };
            for (const c of ranking.flatColumns) {
                if (c instanceof NumberColumn) {
                    cols.push({
                        info: getColumnInfo(c),
                        values: () => getColumnValue(c),
                        type: EColumnTypes.NUMERICAL,
                    });
                }
                else if (c instanceof CategoricalColumn) {
                    cols.push({
                        info: getColumnInfo(c),
                        values: () => getColumnValue(c).then((res) => res.map((v) => (v.val ? v : { ...v, val: LineupVisWrapper.PLOTLY_CATEGORICAL_MISSING_VALUE }))),
                        type: EColumnTypes.CATEGORICAL,
                    });
                }
            }
            ReactDOM.render(React.createElement(Vis, {
                columns: cols,
                selected: selectedList,
                selectionCallback: (ids) => this.props.selectionCallback(ids),
                filterCallback: (s) => this.filterCallback(s),
            }), this.node);
        };
        this.toggleCustomVis = () => {
            this.viewable = !this.viewable;
            this.node.style.display = this.viewable ? 'flex' : 'none';
            this.props.provider.getFirstRanking().on(`${Ranking.EVENT_ORDER_CHANGED}.track`, this.updateCustomVis);
            this.props.provider.getFirstRanking().on(`${Ranking.EVENT_ADD_COLUMN}.track`, this.updateCustomVis);
            this.props.provider.on(`${LocalDataProvider.EVENT_SELECTION_CHANGED}.track`, this.updateCustomVis);
            this.updateCustomVis();
        };
        this.hide = () => {
            ReactDOM.unmountComponentAtNode(this.node);
            this.viewable = false;
            this.node.style.display = 'none';
        };
        this.node = props.doc.createElement('div');
        this.node.id = 'customVisDiv';
        this.node.classList.add('custom-vis-panel');
        this.viewable = false;
    }
}
/**
 * This string is assigned if a categorical value is missing and rendered by Plotly.
 */
LineupVisWrapper.PLOTLY_CATEGORICAL_MISSING_VALUE = '--';
//# sourceMappingURL=LineupVisWrapper.js.map