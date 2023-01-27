import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaintBrush, faSquare, faSearchPlus, faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { SegmentedControl, Tooltip } from '@mantine/core';
import * as React from 'react';
import { EScatterSelectSettings } from '../interfaces';
export function BrushOptionButtons({ callback, dragMode }) {
    return (React.createElement(SegmentedControl, { value: dragMode, onChange: callback, data: [
            {
                label: (React.createElement(Tooltip, { withinPortal: true, withArrow: true, arrowSize: 6, label: "Rectangular brush" },
                    React.createElement(FontAwesomeIcon, { icon: faSquare }))),
                value: EScatterSelectSettings.RECTANGLE,
            },
            {
                label: (React.createElement(Tooltip, { withinPortal: true, withArrow: true, arrowSize: 6, label: "Lasso brush" },
                    React.createElement(FontAwesomeIcon, { icon: faPaintBrush }))),
                value: EScatterSelectSettings.LASSO,
            },
            {
                label: (React.createElement(Tooltip, { withinPortal: true, withArrow: true, arrowSize: 6, label: "Zoom/Pan" },
                    React.createElement(FontAwesomeIcon, { icon: faArrowsAlt }))),
                value: EScatterSelectSettings.PAN,
            },
            {
                label: (React.createElement(Tooltip, { withinPortal: true, withArrow: true, arrowSize: 6, label: "Rectangular zoom" },
                    React.createElement(FontAwesomeIcon, { icon: faSearchPlus }))),
                value: EScatterSelectSettings.ZOOM,
            },
        ] }));
}
//# sourceMappingURL=BrushOptionButtons.js.map