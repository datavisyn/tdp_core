import * as React from 'react';
import { BSModal, BSTooltip } from '../hooks';
export function CDCFilterDialog({ show, setShow }) {
    return React.createElement("div", null,
        React.createElement("button", { type: "button", "data-toggle": "modal", "data-target": "#myModal" }, "Launch modal"),
        React.createElement(BSModal, { show: show, setShow: setShow },
            React.createElement("div", { className: "modal fade", tabIndex: -1 },
                React.createElement("div", { className: "modal-dialog" },
                    React.createElement("div", { className: "modal-content" },
                        React.createElement("div", { className: "modal-header" },
                            React.createElement("h5", { className: "modal-title" }, "Modal title"),
                            React.createElement("button", { type: "button", className: "btn-close", "data-bs-dismiss": "modal", "aria-label": "Close" })),
                        React.createElement("div", { className: "modal-body" },
                            React.createElement(BSTooltip, { title: "Hello" },
                                React.createElement("p", null, "Modal body text goes here."))),
                        React.createElement("div", { className: "modal-footer" },
                            React.createElement("button", { type: "button", className: "btn btn-secondary", "data-bs-dismiss": "modal" }, "Close"),
                            React.createElement("button", { type: "button", className: "btn btn-primary" }, "Save changes")))))));
}
//# sourceMappingURL=CDCFilterDialog.js.map