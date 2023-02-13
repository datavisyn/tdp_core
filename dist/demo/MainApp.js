import { Menu } from '@mantine/core';
import * as React from 'react';
import { Vis, LoginUtils, VisynHeader, VisynApp, useVisynAppContext, ESupportedPlotlyVis, ENumericalColorScaleType, EScatterSelectSettings, } from '..';
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