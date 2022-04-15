import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { EColumnTypes } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { NumericalColumnSelect } from '../sidebar';
import { SingleColumnSelect } from '../sidebar/SingleColumnSelect';
import { HexSizeSlider } from '../sidebar/HexSizeSlider';
import { HexSizeSwitch } from '../sidebar/HexSizeScaleSwitch';
import { HexOpacitySwitch } from '../sidebar/HexOpacityScaleSwitch';
import { HexbinOptionSelect } from '../sidebar/HexbinOptionSelect';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function DensityVisSidebar({ config, extensions, columns, setConfig, selectionCallback = () => null, selected = {}, width = '20rem', }) {
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    return (React.createElement("div", { className: "container pb-3 pt-2", style: { width } },
        React.createElement(WarningMessage, null),
        React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
        React.createElement("hr", null),
        React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => setConfig({ ...config, numColumnsSelected }), columns: columns, currentSelected: config.numColumnsSelected || [] }),
        React.createElement(SingleColumnSelect, { callback: (color) => setConfig({ ...config, color }), columns: columns, currentSelected: config.color, type: [EColumnTypes.CATEGORICAL], label: "Categorical Column" }),
        config.color ? (React.createElement(HexbinOptionSelect, { callback: (hexbinOptions) => setConfig({ ...config, hexbinOptions }), currentSelected: config.hexbinOptions })) : null,
        React.createElement("hr", null),
        React.createElement(HexSizeSlider, { currentValue: config.hexRadius, callback: (hexRadius) => setConfig({ ...config, hexRadius }) }),
        React.createElement(HexSizeSwitch, { currentValue: config.isSizeScale, callback: (isSizeScale) => setConfig({ ...config, isSizeScale }) }),
        React.createElement(HexOpacitySwitch, { currentValue: config.isOpacityScale, callback: (isOpacityScale) => setConfig({ ...config, isOpacityScale }) }),
        mergedExtensions.preSidebar,
        mergedExtensions.postSidebar));
}
//# sourceMappingURL=DensityVisSidebar.js.map