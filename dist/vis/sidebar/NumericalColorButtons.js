import { Group, SegmentedControl } from '@mantine/core';
import * as React from 'react';
import { ENumericalColorScaleType } from '../interfaces';
export function NumericalColorButtons({ callback, currentSelected }) {
    const sequentialColors = ['#002245', '#214066', '#3e618a', '#5c84af', '#83a8c9', '#a9cfe4', '#cff6ff'];
    const divergentColors = ['#337ab7', '#7496c1', '#a5b4ca', '#d3d3d3', '#e5b19d', '#ec8e6a', '#ec6836'];
    return (React.createElement(SegmentedControl, { value: currentSelected, onChange: callback, data: [
            {
                label: (React.createElement(Group, { spacing: 0, noWrap: true }, divergentColors.map((d) => {
                    return React.createElement("span", { key: `colorScale ${d}`, className: "w-100", style: { border: '1px solid lightgrey', background: `${d}`, height: '1rem' } });
                }))),
                value: ENumericalColorScaleType.DIVERGENT,
            },
            {
                label: (React.createElement(Group, { spacing: 0, noWrap: true }, sequentialColors.map((d) => {
                    return React.createElement("span", { key: `colorScale ${d}`, className: "w-100", style: { border: '1px solid lightgrey', background: `${d}`, height: '1rem' } });
                }))),
                value: ENumericalColorScaleType.SEQUENTIAL,
            },
        ] }));
}
//# sourceMappingURL=NumericalColorButtons.js.map