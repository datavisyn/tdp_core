import React from 'react';
import { Vis } from '../LazyVis';
import { EAggregateTypes, EBarDirection, EBarDisplayType, EBarGroupingType, EColumnTypes, ENumericalColorScaleType, EScatterSelectSettings, ESupportedPlotlyVis, EViolinOverlay, } from '../interfaces';
export function fetchIrisData() {
    const dataPromise = import('./irisData').then((m) => m.iris);
    return [
        {
            info: {
                description: '',
                id: 'sepalLength',
                name: 'Sepal Length',
            },
            type: EColumnTypes.NUMERICAL,
            values: () => dataPromise.then((data) => data.map((r) => r.sepalLength).map((val, i) => ({ id: i.toString(), val }))),
        },
        {
            info: {
                description: '',
                id: 'sepalWidth',
                name: 'Sepal Width',
            },
            type: EColumnTypes.NUMERICAL,
            values: () => dataPromise.then((data) => data.map((r) => r.sepalWidth).map((val, i) => ({ id: i.toString(), val }))),
        },
        {
            info: {
                description: '',
                id: 'petalLength',
                name: 'Petal Length',
            },
            type: EColumnTypes.NUMERICAL,
            values: () => dataPromise.then((data) => data.map((r) => r.petalLength).map((val, i) => ({ id: i.toString(), val }))),
        },
        {
            info: {
                description: '',
                id: 'petalWidth',
                name: 'Petal Width',
            },
            type: EColumnTypes.NUMERICAL,
            values: () => dataPromise.then((data) => data.map((r) => r.petalWidth).map((val, i) => ({ id: i.toString(), val }))),
        },
        {
            info: {
                description: '',
                id: 'species',
                name: 'Species',
            },
            type: EColumnTypes.CATEGORICAL,
            values: () => dataPromise.then((data) => data.map((r) => r.species).map((val, i) => ({ id: i.toString(), val }))),
        },
    ];
}
// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Example/Vis/IrisData',
    component: Vis,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template = (args) => {
    const columns = React.useMemo(() => fetchIrisData(), []);
    return (React.createElement("div", { style: { height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' } },
        React.createElement("div", { style: { width: '70%', height: '80%' } },
            React.createElement(Vis, { ...args, columns: columns }))));
};
// More on args: https://storybook.js.org/docs/react/writing-stories/args
export const ScatterPlot = Template.bind({});
ScatterPlot.args = {
    externalConfig: {
        type: ESupportedPlotlyVis.SCATTER,
        numColumnsSelected: [
            {
                description: '',
                id: 'sepalLength',
                name: 'Sepal Length',
            },
            {
                description: '',
                id: 'sepalWidth',
                name: 'Sepal Width',
            },
        ],
        color: {
            description: '',
            id: 'species',
            name: 'Species',
        },
        numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
        shape: null,
        dragMode: EScatterSelectSettings.RECTANGLE,
        alphaSliderVal: 1,
    },
};
export const BarChart = Template.bind({});
BarChart.args = {
    externalConfig: {
        type: ESupportedPlotlyVis.BAR,
        multiples: null,
        group: null,
        direction: EBarDirection.VERTICAL,
        display: EBarDisplayType.ABSOLUTE,
        groupType: EBarGroupingType.GROUP,
        numColumnsSelected: [],
        catColumnSelected: {
            description: '',
            id: 'species',
            name: 'Species',
        },
        aggregateColumn: null,
        aggregateType: EAggregateTypes.COUNT,
    },
};
export const ViolinPlot = Template.bind({});
ViolinPlot.args = {
    externalConfig: {
        type: ESupportedPlotlyVis.VIOLIN,
        numColumnsSelected: [
            {
                description: '',
                id: 'sepalLength',
                name: 'Sepal Length',
            },
            {
                description: '',
                id: 'sepalWidth',
                name: 'Sepal Width',
            },
        ],
        catColumnsSelected: [
            {
                description: '',
                id: 'species',
                name: 'Species',
            },
        ],
        violinOverlay: EViolinOverlay.NONE,
    },
};
//# sourceMappingURL=Iris.stories.js.map