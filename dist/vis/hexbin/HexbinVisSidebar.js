import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { EColumnTypes } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar';
import { SingleColumnSelect } from '../sidebar/SingleColumnSelect';
import { HexSizeSlider } from '../sidebar/HexSizeSlider';
import { HexbinOptionSelect } from '../sidebar/HexbinOptionSelect';
import { HexSizeSwitch } from '../sidebar/HexSizeSwitch';
import { HexOpacitySwitch } from '../sidebar/HexOpacitySwitch';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function HexbinVisSidebar({ config, extensions, columns, setConfig, selectionCallback = () => null, selected = {}, width = '20rem', }) {
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    return (React.createElement("div", { className: "container pb-3 pt-2", style: { width } },
        React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
        React.createElement("hr", null),
        React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => setConfig({ ...config, numColumnsSelected }), columns: columns, currentSelected: config.numColumnsSelected || [] }),
        React.createElement(SingleColumnSelect, { type: [EColumnTypes.CATEGORICAL], label: "Categorical column", callback: (color) => setConfig({ ...config, color }), columns: columns, currentSelected: config.color }),
        config.color ? (React.createElement(HexbinOptionSelect, { callback: (hexbinOptions) => setConfig({ ...config, hexbinOptions }), currentSelected: config.hexbinOptions })) : null,
        React.createElement("hr", null),
        React.createElement(HexSizeSlider, { currentValue: config.hexRadius, callback: (hexRadius) => setConfig({ ...config, hexRadius }) }),
        React.createElement(HexSizeSwitch, { currentValue: config.isSizeScale, callback: (isSizeScale) => setConfig({ ...config, isSizeScale }) }),
        React.createElement(HexOpacitySwitch, { currentValue: config.isOpacityScale, callback: (isOpacityScale) => setConfig({ ...config, isOpacityScale }) }),
        mergedExtensions.preSidebar,
        mergedExtensions.postSidebar));
}
//# sourceMappingURL=HexbinVisSidebar.js.map