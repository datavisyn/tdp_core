import * as React from 'react';
import { EViolinOverlay } from '../interfaces';
export function ViolinOverlayButtons({ callback, currentSelected }) {
    const options = [EViolinOverlay.NONE, EViolinOverlay.BOX, EViolinOverlay.STRIP];
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "px-2 pt-3 pb-1" }, "Overlay"),
        React.createElement("div", { key: "buttonGroupFilter", className: "btn-group w-100 px-2 pt-0", role: "group", "aria-label": "Basic outlined example" }, options.map((opt) => {
            return (React.createElement(React.Fragment, { key: `radioButtonsFilter${opt}` },
                React.createElement("input", { checked: currentSelected === opt, onChange: (e) => callback(e.currentTarget.value), value: opt, type: "checkbox", className: "btn-check", id: `formButton${opt}`, autoComplete: "off" }),
                React.createElement("label", { style: { zIndex: 0 }, className: "btn btn-outline-primary w-100", htmlFor: `formButton${opt}` }, opt)));
        }))));
}
//# sourceMappingURL=ViolinOverlayButtons.js.map