import * as React from 'react';
export function CloseButton({ closeCallback }) {
    return (React.createElement("div", { className: "position-absolute end-0 top-0" },
        React.createElement("button", { onClick: () => closeCallback(), className: "btn btn-primary-outline", type: "button" },
            React.createElement("i", { className: "fas fa-times" }))));
}
//# sourceMappingURL=CloseButton.js.map