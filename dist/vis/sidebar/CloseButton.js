import * as React from 'react';
export function CloseButton({ closeCallback }) {
    return (React.createElement("div", { className: "position-absolute start-0 top-0" },
        React.createElement("button", { onClick: () => closeCallback(), type: "button", className: "btn-close m-1", "aria-label": "Close" })));
}
//# sourceMappingURL=CloseButton.js.map