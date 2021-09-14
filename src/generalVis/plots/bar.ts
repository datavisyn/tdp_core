import {AllDropdownOptions, CategoricalColumn, EColumnTypes} from '../types/generalTypes';
import {GeneralPlot} from '../types/generalPlotInterface';
import {PlotlyInfo, PlotlyData, GeneralHomeProps} from '../types/generalTypes';

export enum EBarDisplayType {
    DEFAULT = 'Default',
    NORMALIZED = 'Normalized',
}

export enum EBarDirection {
    VERTICAL = 'Vertical',
    HORIZONTAL = 'Horizontal',
}

export enum EViolinOverlay {
    NONE = 'None',
    STRIP = 'Strip',
    BOX = 'Box'
}

export enum EBarGroupingType {
    STACK = 'Stacked',
    GROUP = 'Grouped',
}

export class PlotlyBar implements GeneralPlot {
    startingHeuristic(props: GeneralHomeProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void) {
        const catCols = props.columns.filter((c) => EColumnTypes.CATEGORICAL);

        if (selectedCatCols.length === 0 && catCols.length >= 1) {
            updateSelectedCatCols([catCols[0].name]);
        }
    }

    createTraces(props: GeneralHomeProps, dropdownOptions: AllDropdownOptions, selectedCatCols: string[], selectedNumCols: string[]): PlotlyInfo {
        let counter = 1;
        const catCols: CategoricalColumn[] = props.columns.filter((c) => selectedCatCols.includes(c.name) && EColumnTypes.CATEGORICAL) as CategoricalColumn[];
        const vertFlag = dropdownOptions.barDirection.currentSelected === EBarDirection.VERTICAL;
        const normalizedFlag = dropdownOptions.barNormalized.currentSelected === EBarDisplayType.NORMALIZED;
        const plots: PlotlyData[] = [];

        if(catCols.length > 0) {
            const catCurr = catCols[0];
            if(dropdownOptions.groupBy.currentColumn && dropdownOptions.barMultiplesBy.currentColumn) {

                const currGroupColumn = dropdownOptions.groupBy.currentColumn as CategoricalColumn;
                const currMultiplesColumn = dropdownOptions.barMultiplesBy.currentColumn as CategoricalColumn;


                const uniqueGroupVals = [...new Set(currGroupColumn.vals.map((v) => v.val))];
                const uniqueMultiplesVals = [...new Set(currMultiplesColumn.vals.map((v) => v.val))];

                const uniqueColVals = [...new Set(catCurr.vals.map((v) => v.val))];

                uniqueMultiplesVals.forEach((uniqueMultiples) => {
                    uniqueGroupVals.forEach((uniqueGroup) => {

                        const groupedLength = uniqueColVals.map((v) => {
                            const allObjs = catCurr.vals.filter((c) => c.val === v).map((c) => c.id);
                            const allGroupObjs = currGroupColumn.vals.filter((c) => c.val === uniqueGroup).map((c) => c.id);
                            const allMultiplesObjs = currMultiplesColumn.vals.filter((c) => c.val === uniqueMultiples).map((c) => c.id);

                            const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c) && allMultiplesObjs.includes(c));

                            return normalizedFlag ? joinedObjs.length / allObjs.length * 100 : joinedObjs.length;
                        });

                        plots.push({
                            data: {
                                x: vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                                y: !vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                                orientation: vertFlag ? 'v' : 'h',
                                xaxis: counter === 1 ? 'x' : 'x' + counter,
                                yaxis: counter === 1 ? 'y' : 'y' + counter,
                                showlegend: counter === 1 ? true : false,
                                type: 'bar',
                                name: uniqueGroup,
                                marker: {
                                    color: dropdownOptions.color.scale(uniqueGroup),
                                }
                            },
                            xLabel: catCurr.name,
                            yLabel: normalizedFlag ? 'Percent of Total' : 'Count'
                        });
                    });
                    counter += 1;
                });


            } else if(dropdownOptions.groupBy.currentColumn) {

                const currColumn = dropdownOptions.groupBy.currentColumn as CategoricalColumn;

                const uniqueGroupVals = [...new Set(currColumn.vals.map((v) => v.val))];
                const uniqueColVals = [...new Set(catCurr.vals.map((v) => v.val))];

                uniqueGroupVals.forEach((uniqueVal) => {

                    const groupedLength = uniqueColVals.map((v) => {
                        const allObjs = catCurr.vals.filter((c) => c.val === v).map((c) => c.id);
                        const allGroupObjs = currColumn.vals.filter((c) => c.val === uniqueVal).map((c) => c.id);
                        const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c));

                        return normalizedFlag ? joinedObjs.length / allObjs.length * 100 : joinedObjs.length;
                    });

                    plots.push({
                        data: {
                            x: vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                            y: !vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                            orientation: vertFlag ? 'v' : 'h',
                            xaxis: counter === 1 ? 'x' : 'x' + counter,
                            yaxis: counter === 1 ? 'y' : 'y' + counter,
                            showlegend: counter === 1 ? true : false,
                            type: 'bar',
                            name: uniqueVal,
                            marker: {
                                color: dropdownOptions.color.scale(uniqueVal),
                            }
                        },
                        xLabel: catCurr.name,
                        yLabel: normalizedFlag ? 'Percent of Total' : 'Count'
                    });
                });

            } else if(dropdownOptions.barMultiplesBy.currentColumn) {

                const currColumn = dropdownOptions.barMultiplesBy.currentColumn as CategoricalColumn;

                const uniqueGroupVals = [...new Set(currColumn.vals.map((v) => v.val))];
                const uniqueColVals = [...new Set(catCurr.vals.map((v) => v.val))];

                uniqueGroupVals.forEach((uniqueVal) => {

                    const groupedLength = uniqueColVals.map((v) => {
                        const allObjs = catCurr.vals.filter((c) => c.val === v).map((c) => c.id);
                        const allGroupObjs = currColumn.vals.filter((c) => c.val === uniqueVal).map((c) => c.id);
                        const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c));

                        return normalizedFlag ? joinedObjs.length / allObjs.length * 100 : joinedObjs.length;
                    });

                    plots.push({
                        data: {
                            x: vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                            y: !vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                            orientation: vertFlag ? 'v' : 'h',
                            xaxis: counter === 1 ? 'x' : 'x' + counter,
                            yaxis: counter === 1 ? 'y' : 'y' + counter,
                            showlegend: counter === 1 ? true : false,
                            type: 'bar',
                            name: uniqueVal,
                        },
                        xLabel: catCurr.name,
                        yLabel: normalizedFlag ? 'Percent of Total' : 'Count'
                    });
                    counter += 1;
                });

            } else {
                const count = [...new Set(catCurr.vals.map((v) => v.val))].map((curr) => catCurr.vals.filter((c) => c.val === curr).length);
                const valArr = [...new Set(catCurr.vals.map((v) => v.val))];
                plots.push({
                    data: {
                        x: vertFlag ? valArr : count,
                        y: !vertFlag ? valArr : count,
                        orientation: vertFlag ? 'v' : 'h',
                        xaxis: counter === 1 ? 'x' : 'x' + counter,
                        yaxis: counter === 1 ? 'y' : 'y' + counter,
                        type: 'bar',
                        name: catCurr.name
                    },
                    xLabel: catCurr.name,
                    yLabel: normalizedFlag ? 'Percent of Total' : 'Count'
                });
            }
            counter += 1;
        }

        return {
            plots,
            legendPlots: [],
            rows: Math.ceil(Math.sqrt(plots.length)),
            cols: Math.ceil(Math.sqrt(plots.length)),
            errorMessage: 'To create a Strip plot, please select at least 1 categorical column and at least 1 numerical column.',
            formList: ['groupBy', 'barMultiplesBy', 'barDirection', 'barGroupType', 'barNormalized']
        };
    }
}
