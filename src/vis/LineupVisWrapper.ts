import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {CategoricalColumn, Column, IDataRow, LocalDataProvider, NumberColumn, Ranking, ValueColumn} from 'lineupjs';
import {Vis} from './Vis';
import {EColumnTypes, ColumnInfo, VisColumn, EFilterOptions} from './interfaces';

export interface ILineupVisWrapperProps {
    provider: LocalDataProvider;
    selectionCallback: (selected: number[]) => void;
    doc: Document;
}

export class LineupVisWrapper {
    /**
     * This string is assigned if a categorical value is missing and rendered by Plotly.
     */
    private static PLOTLY_CATEGORICAL_MISSING_VALUE: string = '--';

    readonly node: HTMLElement;
    private viewable: boolean;

    // tslint:disable-next-line:variable-name
    constructor(protected readonly props: ILineupVisWrapperProps) {
        this.node = props.doc.createElement('div');
        this.node.id = 'customVisDiv';
        this.node.classList.add('custom-vis-panel');
        this.viewable = false;
    }

    getSelectionMap = () => {
        const sel = this.props.provider.getSelection();
        const selectedMap: { [key: number]: boolean } = {};

        const allData = this.props.provider.data;

        for(const i of allData) {
            selectedMap[i._id] = false;
        }

        for(const i of sel) {
            selectedMap[allData[i]._id] = true;
        }

        return selectedMap;
    }

    filterCallback = (s: string) => {
        const selectedIds = this.props.provider.getSelection();

        if(selectedIds.length === 0 && s !== EFilterOptions.CLEAR) {
            return;
        }

        this.props.provider.setFilter((row) => {
            return s === EFilterOptions.IN ? selectedIds.includes(row.i) : s === EFilterOptions.OUT ? !selectedIds.includes(row.i) : true;
        });

        this.props.selectionCallback([]);
        this.updateCustomVis();
    }

    updateCustomVis = () => {
        const ranking = this.props.provider.getFirstRanking();
        const data = this.props.provider.viewRawRows(ranking.getOrder());

        const cols: VisColumn[] = [];

        const selectedMap: { [key: number]: boolean } = this.getSelectionMap();

        const getColumnInfo = (column: Column): ColumnInfo => {
            return {
                // This regex strips any html off of the label and summary, leaving only the center text. For example, <div><span>Hello</span></div> would be hello.
                name: column.getMetaData().label.replace(/(<([^>]+)>)/gi, ''),
                description: column.getMetaData().summary.replace(/(<([^>]+)>)/gi, ''),
                id: column.fqid,
            };
        };

        const mapData = <T extends ValueColumn<any>,>(data: IDataRow[], column: T) => {
            // TODO: Refactor to use _visyn_id instead.
            return data.map((d, i) => ({id: d.v._id, val: column.getRaw(d)}));
        };

        const getColumnValue = async <T extends ValueColumn<any>,>(column: T) => {
            if (column.isLoaded()) {
                return mapData(data, column);
            }

            return new Promise<{id: number, val: T}[]>((resolve, reject) => {
                //times out if we take longer than 60 seconds to load the columns.
                const timeout = setTimeout(() => {
                    reject('Timeout');
                }, 60000);

                column.on(ValueColumn.EVENT_DATA_LOADED, () => {
                    clearTimeout(timeout);
                    resolve(mapData(data, column));
                });
            });
        };

        for(const c of ranking.flatColumns) {
            if(c instanceof NumberColumn) {
                cols.push({
                    info: getColumnInfo(c),
                    values: () => getColumnValue(c),
                    type: EColumnTypes.NUMERICAL
                });

            } else if(c instanceof CategoricalColumn) {
                cols.push({
                    info: getColumnInfo(c),
                    values: () => getColumnValue(c).then((res) => res.map((v) => v.val ? v : {...v, val: LineupVisWrapper.PLOTLY_CATEGORICAL_MISSING_VALUE})),
                    type: EColumnTypes.CATEGORICAL
                });
            }
        }

        ReactDOM.render(
            React.createElement(
                Vis,
                {
                    columns: cols,
                    selected: selectedMap,
                    selectionCallback: (s: number[]) => this.props.selectionCallback(s),
                    filterCallback: (s: string) => this.filterCallback(s)
                }
            ),
            this.node
        );
    }

    toggleCustomVis = () => {
        this.viewable = !this.viewable;
        this.node.style.display = this.viewable ? 'flex' : 'none';

        this.props.provider.getFirstRanking().on(`${Ranking.EVENT_FILTER_CHANGED}.track`, this.updateCustomVis);
        this.props.provider.getFirstRanking().on(`${Ranking.EVENT_ADD_COLUMN}.track`, this.updateCustomVis);

        this.updateCustomVis();
    }

    hide = () => {
        ReactDOM.unmountComponentAtNode(this.node);
        this.viewable = false;
        this.node.style.display = 'none';
    }
}
