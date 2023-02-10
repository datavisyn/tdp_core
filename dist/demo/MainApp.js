import { Text } from '@mantine/core';
import * as React from 'react';
import { Vis, VisynHeader, VisynApp, useVisynAppContext, ESupportedPlotlyVis, ENumericalColorScaleType, EScatterSelectSettings, } from '..';
import { fetchIrisData } from '../vis/stories/Iris.stories';
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
                aboutAppModal: {
                    content: React.createElement(Text, null, "This is the demo app for tdp core."),
                },
            } }), appShellProps: {} }, user ? React.createElement(Vis, { columns: irisData, showSidebarDefault: true, externalConfig: visConfig, setExternalConfig: setVisConfig }) : null));
}
//# sourceMappingURL=MainApp.js.map