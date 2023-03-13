import { Menu } from '@mantine/core';
import * as React from 'react';
import { useVisynAppContext, VisynApp, VisynHeader } from 'visyn_core';
import { LoginUtils } from 'visyn_core';
import { Vis, ESupportedPlotlyVis, ENumericalColorScaleType, EScatterSelectSettings, EColumnTypes } from 'visyn_core';
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
const irisData = fetchIrisData();
export function MainApp() {
    const { user } = useVisynAppContext();
    const [visConfig, setVisConfig] = React.useState({
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
    });
    return (React.createElement(VisynApp, { header: React.createElement(VisynHeader, { components: {
                userMenu: user ? (React.createElement(React.Fragment, null,
                    React.createElement(Menu.Label, null,
                        "Logged in as ",
                        user.name),
                    React.createElement(Menu.Item, { onClick: () => {
                            LoginUtils.logout();
                        } }, "Logout"))) : null,
            }, backgroundColor: "dark" }), appShellProps: {} }, user ? React.createElement(Vis, { columns: irisData, showSidebarDefault: true, externalConfig: visConfig, setExternalConfig: setVisConfig }) : null));
}
//# sourceMappingURL=MainApp.js.map